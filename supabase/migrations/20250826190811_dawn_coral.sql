/*
  # Ensure Admin User Exists

  1. New Tables
    - Ensures admin user exists in users table
  2. Security
    - Admin user with proper credentials
    - Active status enabled
*/

-- Insert admin user if not exists
INSERT INTO users (email, password_hash, name, role, phone, active)
VALUES (
  'admin@abispherekitchen.com',
  'password123',
  'Admin User',
  'admin',
  '+91 9876543210',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = 'password123',
  name = 'Admin User',
  role = 'admin',
  active = true,
  updated_at = now();

-- Also ensure we can login with 'admin' as username by creating alternate entry
INSERT INTO users (email, password_hash, name, role, phone, active)
VALUES (
  'admin',
  'Abisphere@999',
  'Administrator',
  'admin',
  '+91 9876543210',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = 'Abisphere@999',
  name = 'Administrator',
  role = 'admin',
  active = true,
  updated_at = now();