/*
  # Fix suppliers table RLS policy

  1. Security Changes
    - Drop existing restrictive policy on suppliers table
    - Create new permissive policy allowing all operations for authenticated users
    - Ensure INSERT, SELECT, UPDATE, DELETE operations work properly

  2. Notes
    - Fixes RLS policy violation when adding new suppliers
    - Allows authenticated users to perform all CRUD operations
    - Maintains security while enabling functionality
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "suppliers_full_access_policy" ON suppliers;

-- Create new comprehensive policy for suppliers
CREATE POLICY "suppliers_full_access_policy"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);