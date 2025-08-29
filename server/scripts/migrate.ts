// server/scripts/migrate.ts
import { pool } from "../db.js";

async function run(sql: string, params: any[] = []) {
  try {
    await pool.query(sql, params);
  } catch (err) {
    console.error("❌ Migration step failed:\n", sql, "\n---\n", err);
    throw err;
  }
}

export async function runMigrations() {
  console.log("Starting database migrations...");

  // Extensions for gen_random_uuid() and crypt()
  await run(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // USERS
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);

  // STAFF MEMBERS (optional, used by /api/staff)
  await run(`
    CREATE TABLE IF NOT EXISTS staff_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      name TEXT,
      email TEXT,
      phone TEXT,
      role TEXT,
      department TEXT,
      salary NUMERIC,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);

  // SUPPLIERS (used by /api/suppliers)
  await run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      contact TEXT,
      email TEXT,
      address TEXT,
      categories TEXT[] NOT NULL DEFAULT '{}',
      rating NUMERIC,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);

  // INVENTORY ITEMS (NOTE: this is the name your routes expect)
  await run(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      sku TEXT,
      supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
      current_stock NUMERIC NOT NULL DEFAULT 0,
      unit TEXT,
      cost_per_unit NUMERIC,
      min_stock NUMERIC DEFAULT 0,
      max_stock NUMERIC,
      last_restocked TIMESTAMPTZ,
      expiry_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);

  // ORDERS
  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID,
      status TEXT NOT NULL DEFAULT 'pending',
      total NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);

  // STOCK MOVEMENTS (references inventory_items)
  await run(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      quantity NUMERIC NOT NULL,
      type TEXT NOT NULL, -- 'in' | 'out' etc
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // (Optional) RECIPES / DELIVERY CONFIRMATIONS if your routes touch them
  await run(`
    CREATE TABLE IF NOT EXISTS recipes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS delivery_confirmations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      delivered_by UUID REFERENCES staff_members(id) ON DELETE SET NULL,
      confirmed_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // --- Seeds (idempotent) ---
  await run(`
    INSERT INTO users (email, password_hash, role, name)
    VALUES ('admin@example.com', crypt('admin123', gen_salt('bf')), 'admin', 'Admin')
    ON CONFLICT (email) DO NOTHING;
  `);

  await run(`
    INSERT INTO suppliers (name, contact, email, address, categories, rating)
    VALUES
      ('Default Supplier', 'John', 'supplier@example.com', 'Main st', ARRAY['general'], 5)
    ON CONFLICT DO NOTHING;
  `);

  await run(`
    INSERT INTO inventory_items (name, sku, current_stock, unit, cost_per_unit, min_stock, supplier_id)
    SELECT 'Sample Rice', 'RICE-001', 50, 'kg', 2.5, 10, s.id
    FROM suppliers s
    WHERE s.name = 'Default Supplier'
    ON CONFLICT DO NOTHING;
  `);

  console.log("✅ Migrations complete");
}

// allow manual run: node dist/scripts/migrate.js
if (process.argv[1]?.endsWith("migrate.js")) {
  runMigrations().then(() => process.exit(0)).catch(() => process.exit(1));
}
