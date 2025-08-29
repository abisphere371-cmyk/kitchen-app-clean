// server/scripts/migrate.ts
import { pool } from "../db.js";

async function run(sql: string) {
  try {
    await pool.query(sql);
  } catch (err) {
    console.error("❌ Migration step failed:\n", sql, "\n---\n", err);
    throw err;
  }
}

export async function runMigrations() {
  console.log("Starting database migrations...");

  // Needed for gen_random_uuid(), crypt()
  await run(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
  await run(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

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

  // KITCHENS (kept because your file had it)
  await run(`
    CREATE TABLE IF NOT EXISTS kitchens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      location TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);

  // SUPPLIERS
  await run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      email TEXT,
      address TEXT,
      categories TEXT[] NOT NULL DEFAULT '{}',
      rating NUMERIC,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);

  // INVENTORY ITEMS
  await run(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      sku TEXT,
      quantity NUMERIC NOT NULL DEFAULT 0,
      unit TEXT,
      reorder_level NUMERIC DEFAULT 0,
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

  // STOCK MOVEMENTS
  await run(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      inventory_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      quantity NUMERIC NOT NULL,
      type TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Seed admin (idempotent)
  await run(`
    INSERT INTO users (email, password_hash, role, name)
    VALUES ('admin@example.com', crypt('admin123', gen_salt('bf')), 'admin', 'Admin')
    ON CONFLICT (email) DO NOTHING;
  `);

  console.log("✅ Migrations complete");
}

if (process.argv[1] && process.argv[1].endsWith("migrate.js")) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
