import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

function makeOrderNumber() {
  const d = new Date();
  const date = d.toISOString().slice(0,10).replace(/-/g,"");
  const rand = Math.random().toString().slice(2,8);
  return `ORD-${date}-${rand}`;
}

router.post("/", requireAuth, async (req: any, res: any) => {
  const { customerId = null, status = "pending", total = 0 } = req.body;
  const orderNumber = makeOrderNumber();
  const { rows } = await query(
    `
    INSERT INTO orders (customer_id, status, total, order_number)
    VALUES ($1,$2,$3,$4)
    RETURNING id, customer_id, status, total, order_number, created_at, updated_at
    `,
    [customerId, status, total, orderNumber]
  );
  res.status(201).json(rows[0]);
});

router.get("/", requireAuth, async (_req: any, res: any) => {
  const { rows } = await query(`
    SELECT id, customer_id, status, total, order_number, created_at, updated_at
    FROM orders ORDER BY created_at DESC
  `);
  res.json(rows);
});

// Update order status
router.put('/:id/status', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status, assigned_staff } = req.body;
    
    const result = await query(`
      UPDATE orders
      SET status = $1, assigned_staff = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, assigned_staff, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
