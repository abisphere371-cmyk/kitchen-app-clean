/*
  # Suppliers and Purchase Orders Schema

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `contact` (text)
      - `email` (text)
      - `address` (text)
      - `categories` (text array)
      - `rating` (decimal)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `purchase_orders`
      - `id` (text, primary key)
      - `supplier_id` (uuid, foreign key)
      - `status` (text)
      - `order_date` (date)
      - `expected_delivery` (date)
      - `total_amount` (decimal)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `purchase_order_items`
      - `id` (uuid, primary key)
      - `purchase_order_id` (text, foreign key)
      - `item_id` (text)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  categories text[] DEFAULT '{}',
  rating decimal(2,1) DEFAULT 5.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id text PRIMARY KEY,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received')),
  order_date date DEFAULT CURRENT_DATE,
  expected_delivery date NOT NULL,
  total_amount decimal(10,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id text REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers
CREATE POLICY "Users can read suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert suppliers"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update suppliers"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for purchase_orders
CREATE POLICY "Users can read purchase orders"
  ON purchase_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert purchase orders"
  ON purchase_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update purchase orders"
  ON purchase_orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for purchase_order_items
CREATE POLICY "Users can read purchase order items"
  ON purchase_order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert purchase order items"
  ON purchase_order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);

-- Insert sample data
INSERT INTO suppliers (name, contact, email, address, categories, rating, is_active) VALUES
('Tamil Nadu Rice Mills', '+91 9876543220', 'info@tnricemills.com', 'Industrial Area, Hosur - 635109', ARRAY['grains'], 4.5, true),
('Fresh Meat Co.', '+91 9876543221', 'orders@freshmeat.com', 'Meat Market Complex, Hosur - 635110', ARRAY['meat'], 4.2, true),
('Hosur Vegetable Market', '+91 9876543222', 'sales@hosurveg.com', 'Main Vegetable Market, Hosur - 635109', ARRAY['vegetables'], 4.0, true),
('Spice World', '+91 9876543223', 'info@spiceworld.com', 'Spice Market, Hosur - 635126', ARRAY['spices'], 4.7, true)
ON CONFLICT (id) DO NOTHING;