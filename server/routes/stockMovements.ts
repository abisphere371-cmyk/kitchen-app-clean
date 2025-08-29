import { Router } from 'express';
import { pool, query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.post("/", requireAuth, async (req: any, res: any) => {
  const { inventoryId, quantity, type, note } = req.body;
  if (!inventoryId || !quantity || !type) {
    return res.status(400).json({ error: "inventoryId, quantity, type are required" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // record the movement
    await client.query(
      `
      INSERT INTO stock_movements (inventory_id, quantity, type, note)
      VALUES ($1, $2, $3, $4)
      `,
      [inventoryId, quantity, type, note || null]
    );

    // adjust inventory.quantity
    const delta = type === "in" ? +quantity : -quantity;
    const { rows } = await client.query(
      `
      UPDATE inventory
      SET quantity = GREATEST(0, quantity + $2),
          last_restocked = CASE WHEN $3 THEN NOW() ELSE last_restocked END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, sku, quantity AS "currentStock", unit, reorder_level AS "minStock";
      `,
      [inventoryId, delta, type === "in"]
    );

    await client.query("COMMIT");
    res.status(201).json({ movementSaved: true, item: rows[0] });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Stock movement failed" });
  } finally {
    client.release();
  }
});

// Get all stock movements
router.get('/', requireAuth, async (req: any, res: any) => {
  try {
    const result = await query(`
      SELECT * FROM stock_movements
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
