// server/scripts/migrate.ts
import { pool } from '../db.js';

async function exec(sql: string, params?: any[]) {
  // Absolutely no JS- or SQL-style comments in these SQL strings.
  // Keep each statement syntactically valid on its own line.
  await pool.query(sql, params ?? []);
}

export async function runMigrations() {
  // 1) Extensions
  await exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // 2) Base tables (existence only)
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

  // 3) Bring schemas up-to-date (columns your routes expect)
  await exec(`
    ALTER TABLE inventory_items
      ADD COLUMN IF NOT EXISTS quantity       integer       NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS min_stock      integer       NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS max_stock      integer       NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cost_per_unit  numeric(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_restocked timestamptz,
      ADD COLUMN IF NOT EXISTS expiry_date    date,
      ADD COLUMN IF NOT EXISTS supplier_id    uuid REFERENCES suppliers(id);
  `);

  await exec(`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS order_number text UNIQUE;
  `);

  await exec(`
    ALTER TABLE stock_movements
      ADD COLUMN IF NOT EXISTS item_id  uuid    REFERENCES inventory_items(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS delta    integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS order_id uuid    REFERENCES orders(id),
      ADD COLUMN IF NOT EXISTS user_id  uuid    REFERENCES users(id);
  `);

  // 4) Indexes (after columns exist)
  await exec(`CREATE INDEX IF NOT EXISTS idx_inventory_items_name    ON inventory_items (name);`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements (item_id);`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_orders_order_number     ON orders (order_number);`);

  // 5) Seed admin user (parameterized; no inline comments)
  const ADMIN_EMAIL = 'admin@example.com';
  // paste your real bcrypt hash here (same one you used previously)
  const ADMIN_HASH  = '$2a$10$Qb3Tx3vRzL8a3w3w3d7bXu2r4Ck0e8J5y3mV6dQ61Q0g7Q1yR4l.S';
  await exec(
    `INSERT INTO users (email, password_hash, role, name)
     SELECT $1, $2, 'admin', 'Admin'
     WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = $1);`,
    [ADMIN_EMAIL, ADMIN_HASH]
  );

  // 6) Minimal seed data so UI isn't empty
  await exec(`
    INSERT INTO suppliers (name)
    SELECT 'Default Supplier'
    WHERE NOT EXISTS (SELECT 1 FROM suppliers);
  `);

  await exec(`
    INSERT INTO inventory_items (name, unit, quantity, min_stock, max_stock, cost_per_unit, supplier_id)
    SELECT 'Rice', 'kg', 50, 10, 200, 45,
           (SELECT id FROM suppliers ORDER BY created_at ASC LIMIT 1)
    WHERE NOT EXISTS (SELECT 1 FROM inventory_items);
  `);
}
