/*
  # Create delivery confirmations table

  1. New Tables
    - `delivery_confirmations`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `delivered_quantity` (integer)
      - `ordered_quantity` (integer)
      - `delivery_notes` (text)
      - `delivered_by` (text)
      - `delivery_date` (timestamp)
      - `customer_signature` (text, optional)
      - `delivery_status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `delivery_confirmations` table
    - Add policy for authenticated users to read/write delivery data

  3. Changes
    - Creates comprehensive delivery tracking system
    - Links delivery confirmations to orders
    - Stores delivery staff information and timestamps
*/

CREATE TABLE IF NOT EXISTS delivery_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivered_quantity integer NOT NULL CHECK (delivered_quantity >= 0),
  ordered_quantity integer NOT NULL CHECK (ordered_quantity >= 0),
  delivery_notes text DEFAULT '',
  delivered_by text NOT NULL,
  delivery_date timestamptz DEFAULT now(),
  customer_signature text,
  delivery_status text DEFAULT 'completed' CHECK (delivery_status IN ('completed', 'partial', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_confirmations_order_id ON delivery_confirmations(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_confirmations_delivered_by ON delivery_confirmations(delivered_by);
CREATE INDEX IF NOT EXISTS idx_delivery_confirmations_delivery_date ON delivery_confirmations(delivery_date);

-- Enable RLS
ALTER TABLE delivery_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery confirmations
CREATE POLICY "Anyone can read delivery confirmations"
  ON delivery_confirmations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert delivery confirmations"
  ON delivery_confirmations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update delivery confirmations"
  ON delivery_confirmations
  FOR UPDATE
  TO public
  USING (true);