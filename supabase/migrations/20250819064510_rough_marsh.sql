/*
  # Gabriel Kitchen Management System Database Schema

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `current_stock` (integer)
      - `unit` (text)
      - `min_stock` (integer)
      - `max_stock` (integer)
      - `cost_per_unit` (decimal)
      - `supplier` (text)
      - `last_restocked` (date)
      - `expiry_date` (date, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `recipes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `prep_time` (integer)
      - `cook_time` (integer)
      - `servings` (integer)
      - `ingredients` (jsonb)
      - `instructions` (text array)
      - `image` (text, optional)
      - `difficulty` (text)
      - `cuisine` (text)
      - `tags` (text array)
      - `nutrition_info` (jsonb)
      - `cost` (decimal)
      - `allergens` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `customer_email` (text, optional)
      - `delivery_address` (text)
      - `items` (jsonb)
      - `status` (text)
      - `order_time` (timestamp)
      - `estimated_delivery` (timestamp)
      - `total_amount` (decimal)
      - `assigned_staff` (text, optional)
      - `priority` (text)
      - `special_instructions` (text, optional)
      - `payment_method` (text)
      - `order_source` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text, unique)
      - `email` (text, optional)
      - `addresses` (jsonb)
      - `order_history` (jsonb)
      - `total_orders` (integer)
      - `total_spent` (decimal)
      - `average_order_value` (decimal)
      - `last_order_date` (timestamp, optional)
      - `customer_since` (timestamp)
      - `preferences` (jsonb)
      - `loyalty_points` (integer)
      - `status` (text)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `staff_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `role` (text)
      - `department` (text)
      - `salary` (decimal)
      - `username` (text, unique)
      - `password_hash` (text)
      - `join_date` (date)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to perform CRUD operations
    - Ensure data isolation and security
*/

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('vegetables', 'meat', 'dairy', 'spices', 'grains', 'other')),
  current_stock integer NOT NULL DEFAULT 0,
  unit text NOT NULL,
  min_stock integer NOT NULL DEFAULT 0,
  max_stock integer NOT NULL DEFAULT 0,
  cost_per_unit decimal(10,2) NOT NULL DEFAULT 0,
  supplier text NOT NULL,
  last_restocked date DEFAULT CURRENT_DATE,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  prep_time integer NOT NULL DEFAULT 0,
  cook_time integer NOT NULL DEFAULT 0,
  servings integer NOT NULL DEFAULT 1,
  ingredients jsonb NOT NULL DEFAULT '[]',
  instructions text[] NOT NULL DEFAULT '{}',
  image text,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine text,
  tags text[] DEFAULT '{}',
  nutrition_info jsonb DEFAULT '{"calories": 0, "protein": 0, "carbs": 0, "fat": 0}',
  cost decimal(10,2) DEFAULT 0,
  allergens text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  delivery_address text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cooking', 'out_for_delivery', 'delivered', 'cancelled')),
  order_time timestamptz DEFAULT now(),
  estimated_delivery timestamptz NOT NULL,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  assigned_staff text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  special_instructions text,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'online')),
  order_source text DEFAULT 'admin' CHECK (order_source IN ('admin', 'phone', 'online')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text,
  addresses jsonb DEFAULT '[]',
  order_history jsonb DEFAULT '[]',
  total_orders integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  average_order_value decimal(10,2) DEFAULT 0,
  last_order_date timestamptz,
  customer_since timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{"favoriteItems": [], "dietaryRestrictions": [], "spiceLevel": "medium"}',
  loyalty_points integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create staff_members table
CREATE TABLE IF NOT EXISTS staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'kitchen_staff', 'inventory_manager', 'delivery_staff')),
  department text NOT NULL,
  salary decimal(10,2) DEFAULT 25000,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  join_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_items
CREATE POLICY "Allow all operations for authenticated users on inventory_items"
  ON inventory_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for recipes
CREATE POLICY "Allow all operations for authenticated users on recipes"
  ON recipes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for orders
CREATE POLICY "Allow all operations for authenticated users on orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for customers
CREATE POLICY "Allow all operations for authenticated users on customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for staff_members
CREATE POLICY "Allow all operations for authenticated users on staff_members"
  ON staff_members
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role);
CREATE INDEX IF NOT EXISTS idx_staff_members_username ON staff_members(username);

-- Insert sample inventory data
INSERT INTO inventory_items (name, category, current_stock, unit, min_stock, max_stock, cost_per_unit, supplier, last_restocked, expiry_date) VALUES
('Basmati Rice', 'grains', 50, 'kg', 20, 100, 80, 'Tamil Nadu Rice Mills', '2024-01-15', NULL),
('Chicken Breast', 'meat', 15, 'kg', 10, 50, 250, 'Fresh Meat Co.', '2024-01-16', '2024-01-20'),
('Tomatoes', 'vegetables', 8, 'kg', 15, 40, 40, 'Hosur Vegetable Market', '2024-01-14', '2024-01-18'),
('Onions', 'vegetables', 25, 'kg', 20, 60, 30, 'Hosur Vegetable Market', '2024-01-13', NULL),
('Turmeric Powder', 'spices', 2, 'kg', 5, 15, 200, 'Spice World', '2024-01-10', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample recipes
INSERT INTO recipes (name, category, prep_time, cook_time, servings, ingredients, instructions, difficulty, cuisine) VALUES
('Chicken Biryani', 'main course', 30, 45, 4, 
 '[{"itemId": "1", "quantity": 2, "unit": "cups"}, {"itemId": "2", "quantity": 1, "unit": "kg"}]',
 ARRAY['Soak basmati rice for 30 minutes', 'Marinate chicken with spices', 'Cook rice until 70% done', 'Layer rice and chicken', 'Cook on low heat for 45 minutes'],
 'medium', 'Indian'),
('Vegetable Curry', 'main course', 15, 25, 4,
 '[{"itemId": "3", "quantity": 0.5, "unit": "kg"}, {"itemId": "4", "quantity": 0.3, "unit": "kg"}]',
 ARRAY['Chop all vegetables', 'Heat oil and add spices', 'Add vegetables and cook', 'Simmer until tender'],
 'easy', 'Indian')
ON CONFLICT (id) DO NOTHING;