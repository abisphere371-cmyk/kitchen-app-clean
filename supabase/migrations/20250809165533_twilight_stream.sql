/*
  # Create supplier permissions for admin users

  1. Security
    - Update RLS policies on suppliers table to allow INSERT operations
    - Update RLS policies on purchase_orders table to allow INSERT operations  
    - Update RLS policies on purchase_order_items table to allow INSERT operations
    - Ensure authenticated users can perform all CRUD operations

  2. Changes
    - Add INSERT policy for suppliers table
    - Add INSERT policy for purchase_orders table
    - Add INSERT policy for purchase_order_items table
    - Update existing policies to be more permissive for authenticated users
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can read suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers" ON suppliers;

DROP POLICY IF EXISTS "Users can insert purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can read purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can update purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can delete purchase orders" ON purchase_orders;

DROP POLICY IF EXISTS "Users can insert purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Users can read purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Users can update purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Users can delete purchase order items" ON purchase_order_items;

-- Create comprehensive policies for suppliers table
CREATE POLICY "Authenticated users can insert suppliers"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read suppliers"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update suppliers"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete suppliers"
  ON suppliers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create comprehensive policies for purchase_orders table
CREATE POLICY "Authenticated users can insert purchase orders"
  ON purchase_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read purchase orders"
  ON purchase_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update purchase orders"
  ON purchase_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete purchase orders"
  ON purchase_orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create comprehensive policies for purchase_order_items table
CREATE POLICY "Authenticated users can insert purchase order items"
  ON purchase_order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read purchase order items"
  ON purchase_order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update purchase order items"
  ON purchase_order_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete purchase order items"
  ON purchase_order_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;