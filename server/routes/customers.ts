import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  addresses: z.array(z.object({
    label: z.string().optional().nullable(),
    line1: z.string(),
    line2: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
  })).optional().default([]),
  preferences: z.record(z.any()).optional().default({}),
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    const result = await query(`SELECT * FROM customers ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const data = customerSchema.parse(req.body);
    const result = await query(
      `INSERT INTO customers (name, email, phone, addresses, preferences)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.email ?? null, data.phone ?? null, JSON.stringify(data.addresses), JSON.stringify(data.preferences)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Create customer error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const data = customerSchema.partial().parse(req.body);
    const { rows } = await query(
      `UPDATE customers
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           addresses = COALESCE($5, addresses),
           preferences = COALESCE($6, preferences),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        req.params.id,
        data.name ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.addresses ? JSON.stringify(data.addresses) : null,
        data.preferences ? JSON.stringify(data.preferences) : null,
      ]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Update customer error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
