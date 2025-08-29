import { Router } from 'express';
import { requireAuth } from '../auth';
import { query } from '../db';

const router = Router();

// List customers (any authenticated role)
router.get('/', requireAuth, async (_req, res) => {
  try {
    const { rows } = await query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json({ customers: rows });
  } catch (err: any) {
    console.error('Get customers error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

// Create customer (any authenticated user)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body ?? {};
    if (!name) return res.status(400).json({ error: 'name_required' });

    const { rows } = await query(
      `INSERT INTO customers (name, phone, email, address)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [name || '', phone || null, email || null, address || null]
    );

    res.status(201).json({ customer: rows[0] });
  } catch (err: any) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

export default router;
