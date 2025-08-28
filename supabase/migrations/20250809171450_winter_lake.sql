/*
  # Comprehensive Supplier Management Fix

  This migration fixes all potential issues with supplier management:
  1. Drops all existing restrictive policies
  2. Creates proper RLS policies for all operations
  3. Ensures proper permissions for authenticated users
  4. Adds proper indexes for performance
  5. Handles edge cases and constraints
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "suppliers_select_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_insert_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_update_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_delete_policy" ON suppliers;

DROP POLICY IF EXISTS "purchase_orders_select_policy" ON purchase_orders;
DROP POLICY IF EXISTS "purchase_orders_insert_policy" ON purchase_orders;
DROP POLICY IF EXISTS "purchase_orders_update_policy" ON purchase_orders;
DROP POLICY IF EXISTS "purchase_orders_delete_policy" ON purchase_orders;

DROP POLICY IF EXISTS "purchase_order_items_select_policy" ON purchase_order_items;
DROP POLICY IF EXISTS "purchase_order_items_insert_policy" ON purchase_order_items;
DROP POLICY IF EXISTS "purchase_order_items_update_policy" ON purchase_order_items;
DROP POLICY IF EXISTS "purchase_order_items_delete_policy" ON purchase_order_items;

-- Ensure RLS is enabled
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for suppliers table
CREATE POLICY "suppliers_full_access_policy"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for purchase_orders table
CREATE POLICY "purchase_orders_full_access_policy"
  ON purchase_orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for purchase_order_items table
CREATE POLICY "purchase_order_items_full_access_policy"
  ON purchase_order_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions to authenticated role
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON purchase_order_items TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add unique constraint on email if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'suppliers_email_unique'
  ) THEN
    ALTER TABLE suppliers ADD CONSTRAINT suppliers_email_unique UNIQUE (email);
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';