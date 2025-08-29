-- server/migrations/0001_init.sql
-- Enable UUIDs & bcrypt helpers
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- If your CREATE TABLE accidentally created username earlier, replace it.
-- Otherwise you can ignore this block.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='email'
  ) THEN
    ALTER TABLE users ADD COLUMN email TEXT;
    UPDATE users SET email = username WHERE email IS NULL;
    ALTER TABLE users DROP COLUMN IF EXISTS username;
  END IF;
END$$;

-- USERS -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','staff','kitchen_staff','inventory_manager','delivery_staff','manager')),
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STAFF -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'kitchen_staff',
  phone TEXT,
  salary NUMERIC(10,2) DEFAULT 0,
  department TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CUSTOMERS -------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE,
  addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUPPLIERS -------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 5.0,
  categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INVENTORY -------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  cost_per_unit NUMERIC(12,2) DEFAULT 0,
  category TEXT,
  supplier TEXT,
  reorder_level NUMERIC(12,3) DEFAULT 0,
  last_restocked TIMESTAMPTZ,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC(12,3) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_number TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  qty NUMERIC(12,3) NOT NULL,
  price NUMERIC(12,2) NOT NULL
);

-- INDICES ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(inventory_item_id);

-- SEED ADMIN USER (bcrypt hash of "admin")
INSERT INTO users (email, password_hash, role, name)
VALUES ('admin@example.com', crypt('admin123', gen_salt('bf')), 'admin', 'Admin')
ON CONFLICT (email) DO NOTHING;