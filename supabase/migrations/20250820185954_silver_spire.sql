/*
  # Fix ambiguous column reference in generate_order_number function

  1. Function Updates
    - Fix ambiguous column reference by fully qualifying table.column names
    - Ensure proper variable naming to avoid conflicts
    - Maintain sequential order number generation logic

  2. Changes Made
    - Qualify order_number column with orders table name
    - Use clear variable names to avoid conflicts
    - Ensure function works correctly with existing schema
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS generate_order_number();

-- Create the corrected function with proper column qualification
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    today_date TEXT;
    sequence_num INTEGER;
    new_order_number TEXT;
BEGIN
    -- Get today's date in YYYYMMDD format
    today_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    -- Get the count of orders for today and increment by 1
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(orders.order_number FROM 'ORD-\d{8}-(\d{3})') AS INTEGER
        )
    ), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE orders.order_number LIKE 'ORD-' || today_date || '-%';
    
    -- Format the new order number
    new_order_number := 'ORD-' || today_date || '-' || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;