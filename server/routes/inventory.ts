import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// Get all inventory items
router.get("/", requireAuth, async (_req: any, res: any) => {
  const { rows } = await query(`
    SELECT
      id,
      name,
      sku,
      qty            AS "currentStock",
      unit,
      reorder_level       AS "minStock",
      cost_per_unit       AS "costPerUnit",
      NULL::NUMERIC       AS "maxStock",
      last_restocked      AS "lastRestocked",
      expiry_date         AS "expiryDate",
      created_at,
      updated_at
    FROM inventory_items
    ORDER BY name ASC;
  `);
  res.json(rows);
});

// Validation schema for inventory item
const inventoryItemSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().optional().nullable(),
  unit: z.string().min(1).optional(),
  currentStock: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  costPerUnit: z.number().min(0).optional().nullable(),
  lastRestocked: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable()
});

router.post("/", requireAuth, async (req: any, res: any) => {
  const {
    name, sku, unit,
    currentStock = 0,
    minStock = 0,
    costPerUnit = null,
    lastRestocked = null,
    expiryDate = null
  } = req.body;

  const { rows } = await query(
    `
    INSERT INTO inventory_items
      (name, sku, unit, qty, reorder_level, cost_per_unit, last_restocked, expiry_date)
    VALUES
      ($1,   $2,  $3,  $4,       $5,            $6,            $7,             $8)
    RETURNING
      id, name, sku,
      qty AS "currentStock",
      unit,
      reorder_level AS "minStock",
      cost_per_unit AS "costPerUnit",
      last_restocked AS "lastRestocked",
      expiry_date AS "expiryDate",
      created_at, updated_at
    `,
    [name, sku, unit, currentStock, minStock, costPerUnit, lastRestocked, expiryDate]
  );

  res.status(201).json(rows[0]);
});

router.put("/:id", requireAuth, async (req: any, res: any) => {
  const id = req.params.id;
  const {
    name, sku, unit,
    currentStock,
    minStock,
    costPerUnit,
    lastRestocked,
    expiryDate
  } = req.body;

  const { rows } = await query(
    `
    UPDATE inventory_items SET
      name = COALESCE($2, name),
      sku = COALESCE($3, sku),
      unit = COALESCE($4, unit),
      qty = COALESCE($5, qty),
      reorder_level = COALESCE($6, reorder_level),
      cost_per_unit = COALESCE($7, cost_per_unit),
      last_restocked = COALESCE($8, last_restocked),
      expiry_date = COALESCE($9, expiry_date),
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id, name, sku,
      qty AS "currentStock",
      unit,
      reorder_level AS "minStock",
      cost_per_unit AS "costPerUnit",
      last_restocked AS "lastRestocked",
      expiry_date AS "expiryDate",
      created_at, updated_at
    `,
    [id, name, sku, unit, currentStock, minStock, costPerUnit, lastRestocked, expiryDate]
  );

  res.json(rows[0]);
});

// Delete inventory item
router.delete('/:id', requireAuth, async (req: any, res: any) => {
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
