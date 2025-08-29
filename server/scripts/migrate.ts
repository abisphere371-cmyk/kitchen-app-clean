// server/scripts/migrate.ts
import { pool } from '../db.js';

async function exec(sql: string, params?: any[]) {
  await pool.query(sql, params ?? []);
}

export async function runMigrations() {
  // Extensions
  await exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // --- Base tables (existence only) ---

  await exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email         text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      role          text NOT NULL DEFAULT 'admin',
      name          text,
      created_at    timestamptz NOT NULL DEFAULT now(),
      updated_at    timestamptz NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name       text NOT NULL,
      phone      text,
      email      text,
      address    text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name       text NOT NULL,
      unit       text NOT NULL DEFAULT 'unit',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      status     text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      reason     text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name       text NOT NULL,
      email      text UNIQUE,
      role       text NOT NULL DEFAULT 'staff',
      active     boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name       text NOT NULL,
      phone      text,
      email      text,
      address    text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name       text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS recipe_items (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      recipe_id     uuid REFERENCES recipes(id) ON DELETE CASCADE,
      item_id       uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
      qty_required  numeric(12,3) NOT NULL DEFAULT 0
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS delivery_confirmations (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id    uuid REFERENCES orders(id) ON DELETE CASCADE,
      delivered_by uuid REFERENCES staff(id),
      delivered_at timestamptz DEFAULT now(),
      notes       text
    );
  `);

  // --- Bring schemas up to date (columns your routes / UI expect) ---

  await exec(`
    ALTER TABLE inventory_items
      ADD COLUMN IF NOT EXISTS quantity        integer       NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS min_stock       integer       NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS max_stock       integer       NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reorder_level   integer       NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cost_per_unit   numeric(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_restocked  timestamptz,
      ADD COLUMN IF NOT EXISTS expiry_date     date,
      ADD COLUMN IF NOT EXISTS supplier_id     uuid REFERENCES suppliers(id);
  `);

  await exec(`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS order_number text UNIQUE,
      ADD COLUMN IF NOT EXISTS customer_id  uuid REFERENCES customers(id);
  `);

  await exec(`
    ALTER TABLE stock_movements
      ADD COLUMN IF NOT EXISTS item_id  uuid    REFERENCES inventory_items(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS delta    integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS order_id uuid    REFERENCES orders(id),
      ADD COLUMN IF NOT EXISTS user_id  uuid    REFERENCES users(id);
  `);

  // --- Indexes (safe to re-run) ---
  await exec(`CREATE INDEX IF NOT EXISTS idx_inventory_items_name      ON inventory_items (name);`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier  ON inventory_items (supplier_id);`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id   ON stock_movements (item_id);`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_orders_order_number       ON orders (order_number);`);

  // --- Seed admin user (replace hash with your real bcrypt hash) ---
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_HASH  = '$2a$10$Qb3Tx3vRzL8a3w3w3d7bXu2r4Ck0e8J5y3mV6dQ61Q0g7Q1yR4l.S';
  await exec(
    `INSERT INTO users (email, password_hash, role, name)
     SELECT $1, $2, 'admin', 'Admin'
     WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = $1);`,
    [ADMIN_EMAIL, ADMIN_HASH]
  );

  // --- Minimal seed so UI has data ---
  await exec(`
    INSERT INTO suppliers (name)
    SELECT 'Default Supplier'
    WHERE NOT EXISTS (SELECT 1 FROM suppliers);
  `);

  await exec(`
    INSERT INTO inventory_items (name, unit, quantity, min_stock, max_stock, reorder_level, cost_per_unit, supplier_id)
    SELECT 'Rice', 'kg', 50, 10, 200, 20, 45,
           (SELECT id FROM suppliers ORDER BY created_at ASC LIMIT 1)
    WHERE NOT EXISTS (SELECT 1 FROM inventory_items);
  `);
}
