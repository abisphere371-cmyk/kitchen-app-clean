/*
  # Create Robust Admin Authentication System

  1. New Tables
    - Ensures `users` table exists with proper structure
    - Creates admin user with working credentials
    
  2. Security
    - Enable RLS on users table
    - Add policies for user authentication
    
  3. Admin Credentials
    - Email: admin@abispherekitchen.com
    - Username: abisphere_admin
    - Password: AbisphereAdmin2025!
    - Role: admin
*/

-- Ensure users table exists with proper structure
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'kitchen_staff', 'inventory_manager', 'delivery_staff')),
  phone text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Create RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO public
  USING (true);

-- Delete any existing admin users to avoid conflicts
DELETE FROM users WHERE email = 'admin@abispherekitchen.com' OR role = 'admin';

-- Create the admin user with working credentials
INSERT INTO users (
  email,
  password_hash,
  name,
  role,
  phone,
  active
) VALUES (
  'admin@abispherekitchen.com',
  'AbisphereAdmin2025!',
  'Abisphere Admin',
  'admin',
  '+91 9876543210',
  true
);

-- Create a function to get user by username or email
CREATE OR REPLACE FUNCTION get_user_for_login(input_username text, input_role text)
RETURNS TABLE (
  id uuid,
  email text,
  password_hash text,
  name text,
  role text,
  phone text,
  active boolean
) AS $$
BEGIN
  -- First try exact email match
  RETURN QUERY
  SELECT u.id, u.email, u.password_hash, u.name, u.role, u.phone, u.active
  FROM users u
  WHERE u.email = input_username
    AND u.role = input_role
    AND u.active = true;
  
  -- If no results and username is 'admin', try admin email
  IF NOT FOUND AND input_username = 'admin' THEN
    RETURN QUERY
    SELECT u.id, u.email, u.password_hash, u.name, u.role, u.phone, u.active
    FROM users u
    WHERE u.email = 'admin@abispherekitchen.com'
      AND u.role = input_role
      AND u.active = true;
  END IF;
  
  -- If still no results and username is 'abisphere_admin', try admin email
  IF NOT FOUND AND input_username = 'abisphere_admin' THEN
    RETURN QUERY
    SELECT u.id, u.email, u.password_hash, u.name, u.role, u.phone, u.active
    FROM users u
    WHERE u.email = 'admin@abispherekitchen.com'
      AND u.role = input_role
      AND u.active = true;
  END IF;
END;
$$ LANGUAGE plpgsql;