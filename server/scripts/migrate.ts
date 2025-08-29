import { pool, query } from '../db.js';

async function run(sql: string) {
  console.log(`Running: ${sql}`);
  try {
    await query(sql);
    console.log('Success');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function main() {
  console.log('Starting database migrations...');

  // USERS – allow wider set of roles + optional name
  await run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;`);
  await run(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;`);
  await run(`
    ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('admin','staff','kitchen_staff','inventory_staff','delivery_staff','manager'))
  `);

  // INVENTORY – ensure columns your routes/FE need
  await run(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS sku TEXT;`);
  await run(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit TEXT;`);
  await run(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_level NUMERIC DEFAULT 0;`);
  // optional: if your FE expects these names, keep them null-safe
  await run(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS cost_per_unit NUMERIC;`);
  await run(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMPTZ;`);
  await run(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiry_date DATE;`);

  // ORDERS – add order_number if missing
  await run(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;`);

  // STOCK MOVEMENTS – ensure FK points to inventory
  await run(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name='stock_movements' AND constraint_name='stock_movements_inventory_id_fkey'
      ) THEN
        ALTER TABLE stock_movements
        ADD CONSTRAINT stock_movements_inventory_id_fkey
        FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE;
      END IF;
    END$$;
  `);

  console.log('All migrations completed successfully!');
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
