/*
  # Fix Supplier Management Permissions

  1. Security Changes
    - Drop existing restrictive policies on suppliers table
    - Create new permissive policies for authenticated users
    - Enable proper CRUD operations for suppliers
    - Fix purchase orders permissions
    - Fix purchase order items permissions

  2. Tables Affected
    - suppliers: Full CRUD access for authenticated users
    - purchase_orders: Full CRUD access for authenticated users  
    - purchase_order_items: Full CRUD access for authenticated users
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Authenticated users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can read suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can delete suppliers" ON suppliers;

DROP POLICY IF EXISTS "Authenticated users can insert purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can read purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can update purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can delete purchase orders" ON purchase_orders;

DROP POLICY IF EXISTS "Authenticated users can insert purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Authenticated users can read purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Authenticated users can update purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Authenticated users can delete purchase order items" ON purchase_order_items;

-- Ensure RLS is enabled
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for suppliers
CREATE POLICY "Allow all operations for authenticated users on suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create permissive policies for purchase_orders
CREATE POLICY "Allow all operations for authenticated users on purchase_orders"
  ON purchase_orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create permissive policies for purchase_order_items
CREATE POLICY "Allow all operations for authenticated users on purchase_order_items"
  ON purchase_order_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions to authenticated role
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON purchase_order_items TO authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;