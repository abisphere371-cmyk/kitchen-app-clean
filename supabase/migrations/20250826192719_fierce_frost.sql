/*
  # Create Staff with Login Function

  1. Database Function
    - `create_staff_with_login()` - Creates staff member with login credentials
    - Ensures both users and staff_members records are created atomically
    - Handles duplicate username/email errors gracefully

  2. Security
    - Transaction-based creation ensures data consistency
    - Proper error handling for constraint violations
    - Returns success/failure status

  3. Admin Credentials
    - Email: admin@abispherekitchen.com
    - Username: admin
    - Password: password123 (demo password)
    - Role: admin
*/

-- Create function to add staff member with login credentials
CREATE OR REPLACE FUNCTION create_staff_with_login(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_role TEXT,
  p_username TEXT,
  p_password TEXT,
  p_salary NUMERIC DEFAULT 25000,
  p_department TEXT DEFAULT 'General',
  p_is_active BOOLEAN DEFAULT true
) RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Insert into users table first
  INSERT INTO users (
    id, email, password_hash, name, role, phone, active
  ) VALUES (
    new_user_id, p_email, p_password, p_name, p_role, p_phone, p_is_active
  );
  
  -- Insert into staff_members table with same ID
  INSERT INTO staff_members (
    id, name, email, phone, role, department, salary, username, password_hash, is_active
  ) VALUES (
    new_user_id, p_name, p_email, p_phone, p_role, p_department, p_salary, p_username, p_password, p_is_active
  );
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'username', p_username,
    'message', 'Staff member created successfully with login credentials'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN unique_violation THEN
    -- Handle duplicate username or email
    result := json_build_object(
      'success', false,
      'error', 'Username or email already exists',
      'message', 'Please choose a different username or email'
    );
    RETURN result;
  WHEN OTHERS THEN
    -- Handle other errors
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create staff member'
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure admin user exists with proper credentials
DO $$
BEGIN
  -- Delete existing admin user if exists
  DELETE FROM users WHERE email = 'admin@abispherekitchen.com';
  DELETE FROM staff_members WHERE email = 'admin@abispherekitchen.com';
  
  -- Create admin user
  INSERT INTO users (
    id,
    email,
    password_hash,
    name,
    role,
    phone,
    active
  ) VALUES (
    gen_random_uuid(),
    'admin@abispherekitchen.com',
    'password123',
    'Admin User',
    'admin',
    '+91 9876543210',
    true
  ) ON CONFLICT (email) DO UPDATE SET
    password_hash = 'password123',
    name = 'Admin User',
    role = 'admin',
    active = true;
    
  -- Also create admin in staff_members table
  INSERT INTO staff_members (
    id,
    name,
    email,
    phone,
    role,
    department,
    salary,
    username,
    password_hash,
    is_active
  ) VALUES (
    (SELECT id FROM users WHERE email = 'admin@abispherekitchen.com'),
    'Admin User',
    'admin@abispherekitchen.com',
    '+91 9876543210',
    'admin',
    'Management',
    50000,
    'admin',
    'password123',
    true
  ) ON CONFLICT (email) DO UPDATE SET
    username = 'admin',
    password_hash = 'password123',
    is_active = true;
    
END $$;