import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const deliveryConfirmationSchema = z.object({
  orderId: z.string().uuid(),
  deliveredQuantity: z.number(),
  orderedQuantity: z.number(),
  deliveryNotes: z.string().optional().nullable(),
  deliveredBy: z.string(),
  deliveryDate: z.string().datetime().optional(),
  customerSignature: z.string().optional().nullable(),
  deliveryStatus: z.enum(['completed', 'partial', 'failed']),
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    const result = await query(`SELECT * FROM delivery_confirmations ORDER BY delivery_date DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Get delivery confirmations error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/order/:orderId', requireAuth, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM delivery_confirmations WHERE order_id = $1`, [req.params.orderId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Get delivery confirmation by order ID error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const data = deliveryConfirmationSchema.parse(req.body);
    const result = await query(
      `INSERT INTO delivery_confirmations (order_id, delivered_quantity, ordered_quantity, delivery_notes, delivered_by, delivery_date, customer_signature, delivery_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.orderId,
        data.deliveredQuantity,
        data.orderedQuantity,
        data.deliveryNotes ?? null,
        data.deliveredBy,
        data.deliveryDate ?? new Date().toISOString(),
        data.customerSignature ?? null,
        data.deliveryStatus
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Create delivery confirmation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;