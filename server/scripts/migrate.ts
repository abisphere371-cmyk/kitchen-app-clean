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

  // Needed for gen_random_uuid()/crypt()
  await run(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // USERS
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'kitchen_staff',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;`);
  await run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;`);
  await run(`UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;`);

  // STAFF MEMBERS
  await run(`
    CREATE TABLE IF NOT EXISTS staff_members (
      id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
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
  await run(`ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS name TEXT;`);
  await run(`ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS email TEXT;`);
  await run(`ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS phone TEXT;`);
  await run(`ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS role TEXT;`);
  await run(`ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS department TEXT;`);
  await run(`ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS salary NUMERIC;`);
  await run(`ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;`);
  await run(`ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`);
  await run(`ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;`);

  // CUSTOMERS
  await run(`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
      preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);
  await run(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS name TEXT;`);
  await run(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;`);
  await run(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT;`);
  await run(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;`);
  await run(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;`);
  await run(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`);
  await run(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;`);

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
  await run(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS name TEXT;`);
  await run(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact TEXT;`);
  await run(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email TEXT;`);
  await run(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address TEXT;`);
  await run(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';`);
  await run(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS rating NUMERIC;`);
  await run(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`);
  await run(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`);
  await run(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;`);

  // INVENTORY
  await run(`
    CREATE TABLE IF NOT EXISTS inventory (
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
      inventory_id UUID NOT NULL,
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
