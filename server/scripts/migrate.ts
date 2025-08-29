// server/scripts/migrate.ts
import { query } from "../db.js";

const SQL = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

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

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  total NUMERIC DEFAULT 0,
  order_number TEXT UNIQUE,             -- <— add
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE SEQUENCE IF NOT EXISTS order_num_seq START 1001;

CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TEXT AS $$
DECLARE
  yyyymm TEXT := to_char(NOW(), 'YYYYMM');
  n BIGINT := nextval('order_num_seq');
BEGIN
  RETURN 'ORD-' || yyyymm || '-' || lpad(n::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE orders
  ALTER COLUMN order_number SET DEFAULT generate_order_number();
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  type TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const SEED = `
INSERT INTO users (email, password_hash, role, name)
VALUES ('admin@example.com', crypt('admin123', gen_salt('bf')), 'admin', 'Admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO suppliers (name, contact, email, address, categories, rating)
VALUES ('Default Supplier', 'John', 'supplier@example.com', 'Main st', ARRAY['general'], 5)
ON CONFLICT DO NOTHING;

INSERT INTO inventory_items (name, sku, current_stock, unit, cost_per_unit, min_stock, supplier_id)
SELECT 'Sample Rice', 'RICE-001', 50, 'kg', 2.5, 10, s.id
FROM suppliers s
WHERE s.name = 'Default Supplier'
ON CONFLICT DO NOTHING;
`;

export async function runMigrations(): Promise<void> {
  console.log("Starting database migrations...");
  await query(SQL);
  await query(SEED);
  console.log("✅ Migrations complete");
}
