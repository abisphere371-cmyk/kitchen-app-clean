import bcrypt from "bcryptjs";
import { Router } from "express";
import type { Request, Response } from "express";
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
const SALT_ROUNDS = 10;

const createStaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5).optional().nullable(),
  role: z.enum(['admin', 'kitchen_staff', 'inventory_manager', 'delivery_staff']).default('kitchen_staff'),
  department: z.string().optional().nullable(),
  salary: z.number().optional().nullable(),
  password: z.string().min(1),      // for users.password_hash
  active: z.boolean().optional(),   // maps to staff_members.active
});

// GET all staff
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.role, u.name,
             sm.phone, sm.department, sm.salary, sm.active AS "isActive", sm.created_at, sm.updated_at
      FROM users u
      LEFT JOIN staff_members sm ON sm.id = u.id
      WHERE u.role IN ('admin', 'kitchen_staff', 'inventory_manager', 'delivery_staff')
      ORDER BY u.name NULLS LAST, u.email
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get staff error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// CREATE staff member
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = createStaffSchema.parse(req.body);

    // 1) create user row first (users table)
    const passwordHash = await bcrypt.hash(data.password ?? "", SALT_ROUNDS);

    const userInsert = await pool.query(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [data.email.toLowerCase(), passwordHash, data.role ?? "kitchen_staff", data.name ?? null]
    );
    const userId = userInsert.rows[0].id;

    // 2) create staff_members row (FK = users.id)
    await pool.query(
      `INSERT INTO staff_members
         (id, name, email, phone, role, department, salary, active)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, data.name ?? null, data.email.toLowerCase() ?? null, data.phone ?? null, data.role ?? null, data.department ?? null, data.salary ?? null, data.active ?? true]
    );

    res.status(201).json({ id: userId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Create staff error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// UPDATE staff member (incl. optional password change)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schema = createStaffSchema.partial();
    const data = schema.parse(req.body);

    // update basic user fields
    if (data.email || data.role || data.name) {
      await pool.query(
        `UPDATE users
         SET email = COALESCE($2, email),
             role  = COALESCE($3, role),
             name  = COALESCE($4, name),
             updated_at = NOW()
         WHERE id = $1`,
        [id, data.email?.toLowerCase() ?? null, data.role ?? null, data.name ?? null]
      );
    }

    // update password if provided
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
      await pool.query(
        `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`,
        [id, passwordHash]
      );
    }

    // update staff_members
    await pool.query(
      `UPDATE staff_members
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           role = COALESCE($5, role),
           department = COALESCE($6, department),
           salary = COALESCE($7, salary),
           active = COALESCE($8, active),
           updated_at = NOW()
       WHERE id = $1`,
      [id, data.name ?? null, data.email?.toLowerCase() ?? null, data.phone ?? null, data.role ?? null, data.department ?? null, data.salary ?? null, data.active ?? null]
    );

    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.role, u.name,
              sm.phone, sm.department, sm.salary, sm.active, sm.created_at, sm.updated_at
       FROM users u
       LEFT JOIN staff_members sm ON sm.id = u.id
       WHERE u.id = $1`, [id]
    );

    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Update staff error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE staff (soft delete staff_members.active = false)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await pool.query(`UPDATE staff_members SET active = FALSE, updated_at = NOW() WHERE id = $1`, [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error('Delete staff error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
