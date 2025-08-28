import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// Validation schema for stock movement
const stockMovementSchema = z.object({
  inventory_item_id: z.string().uuid(),
  movement_type: z.enum(['in', 'out']),
  quantity: z.number().positive(),
  reason: z.string().min(1),
  reference_number: z.string().optional().nullable(),
  unit_cost: z.number().min(0),
  total_cost: z.number().min(0),
  performed_by: z.string().min(1),
  notes: z.string().optional().nullable(),
  movement_date: z.string().datetime()
});

// Get all stock movements
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM stock_movements 
      ORDER BY movement_date DESC, created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new stock movement
router.post('/', requireAuth, async (req, res) => {
  try {
    // Validate request body
    const validatedData = stockMovementSchema.parse(req.body);
    
    // Start transaction
    await query('BEGIN');
    
    // Insert stock movement
    const result = await query(`
      INSERT INTO stock_movements (
        inventory_item_id, movement_type, quantity, reason, reference_number,
        unit_cost, total_cost, performed_by, notes, movement_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      validatedData.inventory_item_id,
      validatedData.movement_type,
      validatedData.quantity,
      validatedData.reason,
      validatedData.reference_number,
      validatedData.unit_cost,
      validatedData.total_cost,
      validatedData.performed_by,
      validatedData.notes,
      validatedData.movement_date
    ]);
    
    // Update inventory item stock level
    if (validatedData.movement_type === 'in') {
      await query(`
        UPDATE inventory_items 
        SET current_stock = current_stock + $1,
            last_restocked = $2,
            updated_at = NOW()
        WHERE id = $3
      `, [validatedData.quantity, validatedData.movement_date, validatedData.inventory_item_id]);
    } else {
      await query(`
        UPDATE inventory_items 
        SET current_stock = current_stock - $1,
            updated_at = NOW()
        WHERE id = $2
      `, [validatedData.quantity, validatedData.inventory_item_id]);
    }
    
    // Commit transaction
    await query('COMMIT');
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Rollback transaction
    await query('ROLLBACK');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create stock movement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
