/*
  # Add order number field to orders table

  1. Schema Changes
    - Add `order_number` field to `orders` table
    - This will store human-readable order numbers like "ORD-20250120-001"
    - Keep existing `id` field as UUID for database relationships

  2. Features
    - Unique constraint on order_number
    - Index for fast lookups
    - Default value generation function
*/

-- Add order_number column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number text UNIQUE;
  END IF;
END $$;

-- Create index for order_number
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  today_date text;
  sequence_num integer;
  order_number text;
BEGIN
  -- Get today's date in YYYYMMDD format
  today_date := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  -- Get the next sequence number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-' || today_date || '-(.*)') AS integer)), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_number LIKE 'ORD-' || today_date || '-%';
  
  -- Generate the order number
  order_number := 'ORD-' || today_date || '-' || LPAD(sequence_num::text, 3, '0');
  
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;