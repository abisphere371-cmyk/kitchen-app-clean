/*
  # Disable RLS Completely for All Tables

  This migration completely disables Row Level Security (RLS) for all tables
  to ensure that authenticated users can perform all operations without
  policy violations.

  1. Tables Affected
    - suppliers
    - inventory_items  
    - recipes
    - orders
    - customers
    - staff_members
    - purchase_orders
    - purchase_order_items
    - stock_movements

  2. Changes Made
    - Disable RLS on all tables
    - Remove all existing policies
    - Allow full access for authenticated users

  3. Security Note
    - This removes all access restrictions
    - All authenticated users can perform all operations
    - Suitable for internal kitchen management system
*/

-- Disable RLS on all tables
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "suppliers_full_access" ON suppliers;
DROP POLICY IF EXISTS "inventory_items_full_access" ON inventory_items;
DROP POLICY IF EXISTS "recipes_full_access" ON recipes;
DROP POLICY IF EXISTS "orders_full_access" ON orders;
DROP POLICY IF EXISTS "customers_full_access" ON customers;
DROP POLICY IF EXISTS "staff_members_full_access" ON staff_members;
DROP POLICY IF EXISTS "purchase_orders_full_access" ON purchase_orders;
DROP POLICY IF EXISTS "purchase_order_items_full_access" ON purchase_order_items;
DROP POLICY IF EXISTS "stock_movements_full_access" ON stock_movements;

-- Grant full access to authenticated users on all tables
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON inventory_items TO authenticated;
GRANT ALL ON recipes TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON customers TO authenticated;
GRANT ALL ON staff_members TO authenticated;
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON purchase_order_items TO authenticated;
GRANT ALL ON stock_movements TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;