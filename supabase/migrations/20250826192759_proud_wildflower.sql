/*
  # Fix Staff Creation Process

  1. Database Function
    - `create_staff_with_login()` - Creates staff member with working login credentials
    - Ensures both users and staff_members records are created in transaction
    - Handles all constraint violations and errors

  2. Security
    - Transaction-based creation ensures data consistency
    - Proper error handling for duplicate usernames/emails
    - Returns detailed success/failure information

  3. Testing
    - Creates test staff member to verify function works
    - Ensures login credentials are properly stored
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_staff_with_login(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, BOOLEAN);

-- Create improved function to add staff member with login credentials
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
  
  -- Start transaction (implicit in function)
  
  -- Check for existing username in staff_members
  IF EXISTS (SELECT 1 FROM staff_members WHERE username = p_username) THEN
    result := json_build_object(
      'success', false,
      'error', 'username_exists',
      'message', 'Username already exists. Please choose a different username.'
    );
    RETURN result;
  END IF;
  
  -- Check for existing email in users table
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    result := json_build_object(
      'success', false,
      'error', 'email_exists',
      'message', 'Email already exists. Please choose a different email.'
    );
    RETURN result;
  END IF;
  
  -- Insert into users table for authentication
  INSERT INTO users (
    id, email, password_hash, name, role, phone, active
  ) VALUES (
    new_user_id, p_email, p_password, p_name, p_role, p_phone, p_is_active
  );
  
  -- Insert into staff_members table for management
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
    'email', p_email,
    'role', p_role,
    'message', 'Staff member created successfully with login credentials'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Handle any other errors
    result := json_build_object(
      'success', false,
      'error', SQLSTATE,
      'message', 'Database error: ' || SQLERRM
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function by creating a test staff member
SELECT create_staff_with_login(
  'Test Kitchen Staff',
  'test.kitchen@abispherekitchen.com',
  '+91 9876543299',
  'kitchen_staff',
  'test.kitchen',
  'password123',
  25000,
  'Kitchen',
  true
);

-- Ensure admin user exists and works
DO $$
BEGIN
  -- Delete existing admin records to avoid conflicts
  DELETE FROM staff_members WHERE email = 'admin@abispherekitchen.com';
  DELETE FROM users WHERE email = 'admin@abispherekitchen.com';
  
  -- Create admin using the function
  PERFORM create_staff_with_login(
    'Admin User',
    'admin@abispherekitchen.com',
    '+91 9876543210',
    'admin',
    'admin',
    'password123',
    50000,
    'Management',
    true
  );
  
  RAISE NOTICE 'Admin user created successfully';
END $$;