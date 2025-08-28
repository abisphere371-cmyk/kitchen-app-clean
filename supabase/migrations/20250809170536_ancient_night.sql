/*
  # Fix RLS policies for supplier management

  1. Security Changes
    - Drop existing restrictive policies
    - Create permissive policies for authenticated users
    - Grant proper permissions to authenticated role
    - Enable RLS on all tables
    - Add comprehensive CRUD policies

  2. Tables Affected
    - suppliers
    - purchase_orders  
    - purchase_order_items

  3. Permissions
    - Allow all operations (SELECT, INSERT, UPDATE, DELETE) for authenticated users
    - Ensure admin users can perform all supplier management operations
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow all operations for authenticated users on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on purchase_order_" ON purchase_order_items;

-- Ensure RLS is enabled
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for suppliers table
CREATE POLICY "suppliers_select_policy" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "suppliers_insert_policy" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "suppliers_update_policy" ON suppliers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "suppliers_delete_policy" ON suppliers
  FOR DELETE TO authenticated
  USING (true);

-- Create comprehensive policies for purchase_orders table
CREATE POLICY "purchase_orders_select_policy" ON purchase_orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "purchase_orders_insert_policy" ON purchase_orders
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "purchase_orders_update_policy" ON purchase_orders
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "purchase_orders_delete_policy" ON purchase_orders
  FOR DELETE TO authenticated
  USING (true);

-- Create comprehensive policies for purchase_order_items table
CREATE POLICY "purchase_order_items_select_policy" ON purchase_order_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "purchase_order_items_insert_policy" ON purchase_order_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "purchase_order_items_update_policy" ON purchase_order_items
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "purchase_order_items_delete_policy" ON purchase_order_items
  FOR DELETE TO authenticated
  USING (true);

-- Grant necessary permissions to authenticated role
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON purchase_order_items TO authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure the authenticated role can use the tables
GRANT USAGE ON SCHEMA public TO authenticated;