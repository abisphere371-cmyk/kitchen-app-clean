import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const purchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'ordered', 'received']).optional().default('pending'),
  orderDate: z.string().datetime().optional(),
  expectedDelivery: z.string().date(),
  totalAmount: z.number().optional().default(0),
  notes: z.string().optional().nullable(),
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    const result = await query(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.order_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get purchase orders error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get purchase order error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const data = purchaseOrderSchema.parse(req.body);
    const result = await query(
      `INSERT INTO purchase_orders (supplier_id, status, order_date, expected_delivery, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.supplierId,
        data.status,
        data.orderDate ?? new Date().toISOString(),
        data.expectedDelivery,
        data.totalAmount ?? 0,
        data.notes ?? null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Create purchase order error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const data = purchaseOrderSchema.partial().parse(req.body);
    const { rows } = await query(
      `UPDATE purchase_orders
       SET supplier_id = COALESCE($2, supplier_id),
           status = COALESCE($3, status),
           order_date = COALESCE($4, order_date),
           expected_delivery = COALESCE($5, expected_delivery),
           total_amount = COALESCE($6, total_amount),
           notes = COALESCE($7, notes),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        req.params.id,
        data.supplierId ?? null,
        data.status ?? null,
        data.orderDate ?? null,
        data.expectedDelivery ?? null,
        data.totalAmount ?? null,
        data.notes ?? null
      ]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Update purchase order error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(`DELETE FROM purchase_orders WHERE id = $1 RETURNING *`, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Purchase order items
router.get('/:id/items', requireAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT poi.*, i.name as item_name
      FROM purchase_order_items poi
      LEFT JOIN inventory i ON poi.item_id = i.id
      WHERE poi.purchase_order_id = $1
      ORDER BY i.name
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get purchase order items error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/items', requireAuth, async (req, res) => {
  try {
    const itemSchema = z.object({
      itemId: z.string().uuid(),
      quantity: z.number(),
      unitPrice: z.number(),
    });
    
    const data = itemSchema.parse(req.body);
    const result = await query(
      `INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, data.itemId, data.quantity, data.unitPrice]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Create purchase order item error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;