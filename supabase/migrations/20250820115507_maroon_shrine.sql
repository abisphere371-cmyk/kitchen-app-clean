/*
  # Fix RLS Policies for All Tables

  This migration fixes Row Level Security policies that are blocking database operations.
  
  1. Tables Updated
     - suppliers: Allow all operations for authenticated users
     - inventory_items: Allow all operations for authenticated users  
     - recipes: Allow all operations for authenticated users
     - orders: Allow all operations for authenticated users
     - customers: Allow all operations for authenticated users
     - staff_members: Allow all operations for authenticated users
     - purchase_orders: Allow all operations for authenticated users
     - purchase_order_items: Allow all operations for authenticated users
     - stock_movements: Allow all operations for authenticated users

  2. Security Changes
     - Drop existing restrictive policies
     - Create new permissive policies for authenticated users
     - Maintain RLS enabled for security
     - Allow full CRUD operations for authenticated users

  3. Notes
     - This allows the application to function properly
     - All authenticated users can perform all operations
     - RLS is still enabled for basic security
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "suppliers_full_access_policy" ON suppliers;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on recipes" ON recipes;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on customers" ON customers;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on staff_members" ON staff_members;
DROP POLICY IF EXISTS "purchase_orders_full_access_policy" ON purchase_orders;
DROP POLICY IF EXISTS "purchase_order_items_full_access_policy" ON purchase_order_items;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on stock_movements" ON stock_movements;

-- Create new permissive policies for all tables
CREATE POLICY "suppliers_allow_all" ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "inventory_items_allow_all" ON inventory_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "recipes_allow_all" ON recipes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "orders_allow_all" ON orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "customers_allow_all" ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "staff_members_allow_all" ON staff_members
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "purchase_orders_allow_all" ON purchase_orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "purchase_order_items_allow_all" ON purchase_order_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "stock_movements_allow_all" ON stock_movements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;