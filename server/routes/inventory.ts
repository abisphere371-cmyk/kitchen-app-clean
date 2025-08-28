import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// Validation schema for inventory item
const inventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  current_stock: z.number().min(0),
  unit: z.string().min(1),
  min_stock: z.number().min(0),
  max_stock: z.number().min(0),
  cost_per_unit: z.number().min(0),
  supplier: z.string().optional().nullable(),
  last_restocked: z.string().datetime().optional().nullable(),
  expiry_date: z.string().datetime().optional().nullable()
});

// Get all inventory items
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM inventory_items 
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new inventory item
router.post('/', requireAuth, async (req, res) => {
  try {
    // Validate request body
    const validatedData = inventoryItemSchema.parse(req.body);
    
    const result = await query(`
      INSERT INTO inventory_items (
        name, category, current_stock, unit, min_stock, max_stock, 
        cost_per_unit, supplier, last_restocked, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      validatedData.name,
      validatedData.category,
      validatedData.current_stock,
      validatedData.unit,
      validatedData.min_stock,
      validatedData.max_stock,
      validatedData.cost_per_unit,
      validatedData.supplier,
      validatedData.last_restocked,
      validatedData.expiry_date
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create inventory item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update inventory item
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validatedData = inventoryItemSchema.parse(req.body);
    
    const result = await query(`
      UPDATE inventory_items 
      SET name = $1, category = $2, current_stock = $3, unit = $4, 
          min_stock = $5, max_stock = $6, cost_per_unit = $7, supplier = $8, 
          last_restocked = $9, expiry_date = $10, updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [
      validatedData.name,
      validatedData.category,
      validatedData.current_stock,
      validatedData.unit,
      validatedData.min_stock,
      validatedData.max_stock,
      validatedData.cost_per_unit,
      validatedData.supplier,
      validatedData.last_restocked,
      validatedData.expiry_date,
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete inventory item
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      DELETE FROM inventory_items 
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
