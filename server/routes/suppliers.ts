import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const supplierSchema = z.object({
  name: z.string().min(1),
  contact: z.string().min(1),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  categories: z.array(z.string()).optional().default([]), // TEXT[]
  rating: z.number().min(0).max(5).optional().nullable(),
  is_active: z.boolean().optional(), // boolean column exists in SQL
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    const result = await query(`SELECT * FROM suppliers ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    console.error('Get suppliers error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const d = supplierSchema.parse(req.body);
    const result = await query(
      `INSERT INTO suppliers (name, contact, email, address, categories, rating, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, TRUE))
       RETURNING *`,
      [d.name, d.contact, d.email ?? null, d.address ?? null, d.categories ?? [], d.rating ?? null, d.is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Create supplier error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const d = supplierSchema.partial().parse(req.body);
    const { rows } = await query(
      `UPDATE suppliers
       SET name = COALESCE($2, name),
           contact = COALESCE($3, contact),
           email = COALESCE($4, email),
           address = COALESCE($5, address),
           categories = COALESCE($6, categories),
           rating = COALESCE($7, rating),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, d.name ?? null, d.contact ?? null, d.email ?? null, d.address ?? null, d.categories ?? null, d.rating ?? null, d.is_active ?? null]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Update supplier error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
