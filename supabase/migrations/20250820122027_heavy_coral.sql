/*
  # Fix RLS Policies for Gabriel Kitchen Management System

  This migration completely fixes all Row-Level Security policies to allow proper database operations
  for authenticated users in the Gabriel Kitchen Management System.

  ## Changes Made:
  1. Drop all existing restrictive policies
  2. Create new permissive policies for all tables
  3. Ensure all authenticated users can perform CRUD operations
  4. Maintain security while allowing application functionality

  ## Tables Updated:
  - suppliers
  - inventory_items  
  - recipes
  - orders
  - customers
  - staff_members
  - purchase_orders
  - purchase_order_items
  - stock_movements

  ## Security:
  - RLS remains enabled for security
  - All authenticated users can access all data
  - Policies are permissive to allow application functionality
*/

-- Drop all existing policies that might be blocking operations
DROP POLICY IF EXISTS "suppliers_allow_all" ON suppliers;
DROP POLICY IF EXISTS "inventory_items_allow_all" ON inventory_items;
DROP POLICY IF EXISTS "recipes_allow_all" ON recipes;
DROP POLICY IF EXISTS "orders_allow_all" ON orders;
DROP POLICY IF EXISTS "customers_allow_all" ON customers;
DROP POLICY IF EXISTS "staff_members_allow_all" ON staff_members;
DROP POLICY IF EXISTS "purchase_orders_allow_all" ON purchase_orders;
DROP POLICY IF EXISTS "purchase_order_items_allow_all" ON purchase_order_items;
DROP POLICY IF EXISTS "stock_movements_allow_all" ON stock_movements;

-- Create comprehensive policies for suppliers table
CREATE POLICY "suppliers_full_access"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for inventory_items table
CREATE POLICY "inventory_items_full_access"
  ON inventory_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for recipes table
CREATE POLICY "recipes_full_access"
  ON recipes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for orders table
CREATE POLICY "orders_full_access"
  ON orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for customers table
CREATE POLICY "customers_full_access"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for staff_members table
CREATE POLICY "staff_members_full_access"
  ON staff_members
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for purchase_orders table
CREATE POLICY "purchase_orders_full_access"
  ON purchase_orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for purchase_order_items table
CREATE POLICY "purchase_order_items_full_access"
  ON purchase_order_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive policies for stock_movements table
CREATE POLICY "stock_movements_full_access"
  ON stock_movements
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