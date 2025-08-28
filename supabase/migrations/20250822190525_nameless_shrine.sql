/*
  # Create users table for authentication

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `name` (text)
      - `role` (text with check constraint)
      - `phone` (text)
      - `active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for admins to manage all users

  3. Indexes
    - Index on email for fast lookups
    - Index on role for filtering
*/

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- RLS Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true); -- Allow all reads for now since we don't have auth.uid()

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  USING (true); -- Allow all operations for now

-- Insert default admin user
INSERT INTO users (email, password_hash, name, role, phone) 
VALUES (
  'admin@gabrielkitchen.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password123
  'Gabriel Admin',
  'admin',
  '+91 9876543210'
) ON CONFLICT (email) DO NOTHING;

-- Insert kitchen staff
INSERT INTO users (email, password_hash, name, role, phone) 
VALUES (
  'ravi@gabrielkitchen.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Ravi Kumar',
  'kitchen_staff',
  '+91 9876543211'
) ON CONFLICT (email) DO NOTHING;

-- Insert inventory manager
INSERT INTO users (email, password_hash, name, role, phone) 
VALUES (
  'priya@gabrielkitchen.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Priya Sharma',
  'inventory_manager',
  '+91 9876543212'
) ON CONFLICT (email) DO NOTHING;

-- Insert delivery staff
INSERT INTO users (email, password_hash, name, role, phone) 
VALUES (
  'suresh@gabrielkitchen.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Suresh Babu',
  'delivery_staff',
  '+91 9876543213'
) ON CONFLICT (email) DO NOTHING;