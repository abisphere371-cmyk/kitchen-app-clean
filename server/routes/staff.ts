import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth, hashPassword } from '../auth.js';

const router = Router();

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
router.get('/', requireAuth, async (_req: any, res: any) => {
  try {
    const result = await query(`
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

// CREATE staff (transaction)
router.post('/', requireAuth, async (req, res) => {
  const client = await (await import('pg')).Pool.prototype.connect.call((await import('../db.js')).pool).catch(() => null);
  try {
    const data = createStaffSchema.parse(req.body);
    if (!client) throw new Error('No DB client');

    await client.query('BEGIN');

    const passHash = await hashPassword(data.password);

    const userIns = await client.query(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
         SET role = EXCLUDED.role,
             name = COALESCE(users.name, EXCLUDED.name)
       RETURNING id, email, role, name`,
      [data.email.toLowerCase(), passHash, data.role, data.name]
    );

    const user = userIns.rows[0];

    const staffIns = await client.query(
      `INSERT INTO staff_members (id, name, email, phone, role, department, salary, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, TRUE))
       ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name,
             email = EXCLUDED.email,
             phone = EXCLUDED.phone,
             role = EXCLUDED.role,
             department = EXCLUDED.department,
             salary = EXCLUDED.salary,
             active = EXCLUDED.active,
             updated_at = NOW()
       RETURNING phone, department, salary, active, created_at, updated_at`,
      [user.id, data.name, data.email.toLowerCase(), data.phone ?? null, data.role, data.department ?? null, data.salary ?? null, data.active]
    );

    await client.query('COMMIT');

    res.status(201).json({ ...user, ...staffIns.rows[0] });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Create staff error:', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client?.release();
  }
});

// UPDATE staff (update users + staff_members)
router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const schema = createStaffSchema.partial().omit({ password: true });
  const client = await (await import('pg')).Pool.prototype.connect.call((await import('../db.js')).pool).catch(() => null);

  try {
    const data = schema.parse(req.body);
    if (!client) throw new Error('No DB client');

    await client.query('BEGIN');

    if (data.email || data.role || data.name) {
      await client.query(
        `UPDATE users
         SET email = COALESCE($2, email),
             role = COALESCE($3, role),
             name = COALESCE($4, name),
             updated_at = NOW()
         WHERE id = $1`,
        [id, data.email?.toLowerCase() ?? null, data.role ?? null, data.name ?? null]
      );
    }

    await client.query(
      `UPDATE staff_members
       SET phone = COALESCE($2, phone),
           department = COALESCE($3, department),
           salary = COALESCE($4, salary),
           active = COALESCE($5, active),
           updated_at = NOW()
       WHERE id = $1`,
      [id, data.phone ?? null, data.department ?? null, data.salary ?? null, data.active ?? null]
    );

    await client.query('COMMIT');

    const { rows } = await query(
      `SELECT u.id, u.email, u.role, u.name,
              sm.phone, sm.department, sm.salary, sm.active, sm.created_at, sm.updated_at
       FROM users u
       LEFT JOIN staff_members sm ON sm.id = u.id
       WHERE u.id = $1`, [id]
    );

    res.json(rows[0]);
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Update staff error:', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client?.release();
  }
});

// DELETE staff (soft delete staff_members.active = false)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query(`UPDATE staff_members SET active = FALSE, updated_at = NOW() WHERE id = $1`, [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error('Delete staff error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
