/*
  # Create Admin User

  1. New Users
    - Create admin user account for login
  
  2. Security
    - Enable RLS on users table (already enabled)
    - Admin user can access system
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
ON CONFLICT (email) DO NOTHING;