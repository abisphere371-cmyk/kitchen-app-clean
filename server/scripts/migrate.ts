// server/scripts/migrate.ts
import { pool } from '../db.js';

/**
 * Strip JS-style comments from SQL blocks (safety for copy/paste),
 * then run as a single query.
 */
async function run(sql: string) {
  const cleaned = sql
    .replace(/^\s*\/\/.*$/gm, '')        // remove // line comments just in case
    .replace(/\/\*[\s\S]*?\*\//g, '');   // remove /* ... */ comments
  await pool.query(cleaned);
}

export async function runMigrations() {
  // 1) Extensions
  await run(`
    -- keep for gen_random_uuid()
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `);

  // 2) Core tables
  await run(`
    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email         text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      role          text NOT NULL DEFAULT 'admin',
      name          text,
      created_at    timestamptz NOT NULL DEFAULT now(),
      updated_at    timestamptz NOT NULL DEFAULT now()
    );

    -- Suppliers
    CREATE TABLE IF NOT EXISTS suppliers (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name       text NOT NULL,
      phone      text,
      email      text,
      address    text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- Inventory Items
    CREATE TABLE IF NOT EXISTS inventory_items (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name            text NOT NULL,
      unit            text NOT NULL DEFAULT 'unit',
      -- some deploys created this table without these cols; add them below too
      created_at      timestamptz NOT NULL DEFAULT now(),
      updated_at      timestamptz NOT NULL DEFAULT now()
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      status     text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now()
    );

    -- Stock Movements
    CREATE TABLE IF NOT EXISTS stock_movements (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      reason     text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  // 3) Bring schemas up-to-date (columns that routes expect)
  await run(`
    -- inventory_items columns expected by API/UI
    ALTER TABLE inventory_items
      ADD COLUMN IF NOT EXISTS quantity        integer        NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS min_stock       integer        NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS max_stock       integer        NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cost_per_unit   numeric(12,2)  NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_restocked  timestamptz,
      ADD COLUMN IF NOT EXISTS expiry_date     date,
      ADD COLUMN IF NOT EXISTS supplier_id     uuid REFERENCES suppliers(id);

    -- orders columns expected by API/UI
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS order_number text UNIQUE;

    -- stock_movements columns expected by API/UI
    ALTER TABLE stock_movements
      ADD COLUMN IF NOT EXISTS item_id  uuid    REFERENCES inventory_items(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS delta    integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS order_id uuid    REFERENCES orders(id),
      ADD COLUMN IF NOT EXISTS user_id  uuid    REFERENCES users(id);
  `);

  // 4) Indexes (only after columns exist)
  await run(`
    CREATE INDEX IF NOT EXISTS idx_inventory_items_name      ON inventory_items (name);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id   ON stock_movements (item_id);
    CREATE INDEX IF NOT EXISTS idx_orders_order_number       ON orders (order_number);
  `);

  // 5) Seed admin user (same hash you already used on Railway UI screenshots)
  await run(`
    INSERT INTO users (email, password_hash, role, name)
    SELECT 'admin@example.com',
           '$2a$10$Qb3Tx3vRzL8a3w3w3d7bXu2r4Ck0e8J5y3mV6dQ61Q0g7Q1yR4l.S'::text,  // << keep your existing bcrypt hash here
           'admin',
           'Admin'
    WHERE NOT EXISTS (
      SELECT 1 FROM users WHERE email = 'admin@example.com'
    );
  `);

  // 6) (Optional) Seed some minimal inventory rows so pages don't look empty
  await run(`
    INSERT INTO suppliers (name)
    SELECT 'Default Supplier'
    WHERE NOT EXISTS (SELECT 1 FROM suppliers);

    INSERT INTO inventory_items (name, unit, quantity, min_stock, max_stock, cost_per_unit, supplier_id)
    SELECT 'Rice', 'kg', 50, 10, 200, 45, (SELECT id FROM suppliers LIMIT 1)
    WHERE NOT EXISTS (SELECT 1 FROM inventory_items);
  `);
}
