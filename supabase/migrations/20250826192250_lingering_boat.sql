/*
  # Fix Admin and Staff Login System

  1. Database Structure
    - Ensure users table has proper admin user
    - Create database function for reliable user lookup
    - Add proper indexes for performance

  2. Admin Credentials
    - Email: admin@abispherekitchen.com
    - Username: admin (handled via email lookup)
    - Password: password123 (demo password)
    - Role: admin

  3. Staff Login Support
    - Staff members can login with username from staff_members table
    - Authentication checks both users and staff_members tables
    - Proper role validation
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_for_login(text, text);

-- Ensure admin user exists in users table
INSERT INTO users (email, password_hash, name, role, phone, active)
VALUES (
  'admin@abispherekitchen.com',
  'password123', -- Demo password hash
  'Abisphere Admin',
  'admin',
  '+91 9876543210',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = 'password123',
  name = 'Abisphere Admin',
  role = 'admin',
  active = true,
  updated_at = now();

-- Create function to get user for login (checks both tables)
CREATE OR REPLACE FUNCTION get_user_for_login(
  input_username text,
  input_role text
)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role text,
  phone text,
  active boolean,
  source_table text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First check users table by email
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.phone,
    u.active,
    'users'::text as source_table
  FROM users u
  WHERE u.email = input_username
    AND u.role = input_role
    AND u.active = true;
  
  -- If found, return
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Check if username is 'admin' and role is 'admin', then try admin email
  IF input_username = 'admin' AND input_role = 'admin' THEN
    RETURN QUERY
    SELECT 
      u.id,
      u.email,
      u.name,
      u.role,
      u.phone,
      u.active,
      'users'::text as source_table
    FROM users u
    WHERE u.email = 'admin@abispherekitchen.com'
      AND u.role = 'admin'
      AND u.active = true;
    
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Finally check staff_members table by username
  RETURN QUERY
  SELECT 
    s.id,
    s.email,
    s.name,
    s.role,
    s.phone,
    s.is_active as active,
    'staff_members'::text as source_table
  FROM staff_members s
  WHERE s.username = input_username
    AND s.role = input_role
    AND s.is_active = true;
END;
$$;

-- Add some demo staff users for testing
INSERT INTO users (email, password_hash, name, role, phone, active)
VALUES 
  ('ravi@abispherekitchen.com', 'password123', 'Ravi Kumar', 'kitchen_staff', '+91 9876543211', true),
  ('priya@abispherekitchen.com', 'password123', 'Priya Sharma', 'inventory_manager', '+91 9876543212', true),
  ('suresh@abispherekitchen.com', 'password123', 'Suresh Babu', 'delivery_staff', '+91 9876543213', true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = 'password123',
  active = true,
  updated_at = now();

-- Add corresponding staff_members records
INSERT INTO staff_members (id, name, email, phone, role, department, salary, username, password_hash, is_active)
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.role,
  CASE 
    WHEN u.role = 'admin' THEN 'Management'
    WHEN u.role = 'kitchen_staff' THEN 'Kitchen'
    WHEN u.role = 'inventory_manager' THEN 'Operations'
    WHEN u.role = 'delivery_staff' THEN 'Delivery'
    ELSE 'General'
  END as department,
  CASE 
    WHEN u.role = 'admin' THEN 50000
    WHEN u.role = 'kitchen_staff' THEN 25000
    WHEN u.role = 'inventory_manager' THEN 30000
    WHEN u.role = 'delivery_staff' THEN 20000
    ELSE 25000
  END as salary,
  CASE 
    WHEN u.email = 'admin@abispherekitchen.com' THEN 'admin'
    WHEN u.email = 'ravi@abispherekitchen.com' THEN 'ravi.kumar'
    WHEN u.email = 'priya@abispherekitchen.com' THEN 'priya.sharma'
    WHEN u.email = 'suresh@abispherekitchen.com' THEN 'suresh.babu'
    ELSE lower(split_part(u.name, ' ', 1))
  END as username,
  u.password_hash,
  u.active
FROM users u
WHERE u.role IN ('admin', 'kitchen_staff', 'inventory_manager', 'delivery_staff')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active,
  updated_at = now();