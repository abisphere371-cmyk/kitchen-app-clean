import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// Validation schema for order creation
const orderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  deliveryAddress: z.string().min(1),
  items: z.array(z.object({
    recipeId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })),
  totalAmount: z.number().min(0),
  estimatedDelivery: z.string().datetime()
});

// Get all orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM orders 
      ORDER BY order_time DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new order
router.post('/', requireAuth, async (req, res) => {
  try {
    // Validate request body
    const validatedData = orderSchema.parse(req.body);
    
    // Generate order number
    const orderNumberResult = await query('SELECT generate_order_number() as order_number');
    const orderNumber = orderNumberResult.rows[0].order_number;
    
    // Insert order
    const result = await query(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, delivery_address, 
        items, status, order_time, estimated_delivery, total_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)
      RETURNING *
    `, [
      orderNumber,
      validatedData.customerName,
      validatedData.customerPhone,
      validatedData.deliveryAddress,
      JSON.stringify(validatedData.items),
      'pending',
      validatedData.estimatedDelivery,
      validatedData.totalAmount
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update order status
router.put('/:id/status', requireAuth, async (req, res) => {
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
