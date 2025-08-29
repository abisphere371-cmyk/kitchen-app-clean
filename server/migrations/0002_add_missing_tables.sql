BEGIN;

-- RECIPES
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT[],
  image TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine TEXT,
  tags TEXT[],
  nutrition_info JSONB,
  cost NUMERIC,
  allergens TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received')),
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_delivery DATE,
  total_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- PURCHASE ORDER ITEMS
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory(id),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DELIVERY CONFIRMATIONS
CREATE TABLE IF NOT EXISTS delivery_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  delivered_quantity NUMERIC NOT NULL,
  ordered_quantity NUMERIC NOT NULL,
  delivery_notes TEXT,
  delivered_by TEXT,
  delivery_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_signature TEXT,
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('completed', 'partial', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

COMMIT;