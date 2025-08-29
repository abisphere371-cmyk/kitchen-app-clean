import { Router } from 'express';
import { requireAuth } from '../auth';
import { query } from '../db';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  try {
    const { rows } = await query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json({ suppliers: rows });
  } catch (err: any) {
    console.error('Get suppliers error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, contact_name, phone, email, address } = req.body ?? {};
    if (!name) return res.status(400).json({ error: 'name_required' });

    const { rows } = await query(
      `INSERT INTO suppliers (name, contact_name, phone, email, address)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [name, contact_name || null, phone || null, email || null, address || null]
    );

    res.status(201).json({ supplier: rows[0] });
  } catch (err: any) {
    console.error('Create supplier error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

export default router;
