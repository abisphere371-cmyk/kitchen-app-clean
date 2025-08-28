/*
  # Create stock movements tracking system

  1. New Tables
    - `stock_movements`
      - `id` (uuid, primary key)
      - `inventory_item_id` (uuid, foreign key to inventory_items)
      - `movement_type` (text, 'in' or 'out')
      - `quantity` (integer, positive for in, negative for out)
      - `reason` (text, reason for movement)
      - `reference_number` (text, optional reference like PO number)
      - `unit_cost` (numeric, cost per unit for stock in)
      - `total_cost` (numeric, calculated total cost)
      - `performed_by` (text, staff member who performed the action)
      - `notes` (text, additional notes)
      - `movement_date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `stock_movements` table
    - Add policy for authenticated users to manage stock movements

  3. Triggers
    - Auto-update inventory current_stock when stock movement is added
    - Update last_restocked date for stock in movements
*/

-- Create stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('in', 'out')),
  quantity integer NOT NULL CHECK (quantity > 0),
  reason text NOT NULL,
  reference_number text,
  unit_cost numeric(10,2) DEFAULT 0,
  total_cost numeric(10,2) DEFAULT 0,
  performed_by text NOT NULL,
  notes text DEFAULT '',
  movement_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow all operations for authenticated users on stock_movements"
  ON stock_movements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);

-- Function to update inventory stock
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current stock based on movement type
  IF NEW.movement_type = 'in' THEN
    UPDATE inventory_items 
    SET 
      current_stock = current_stock + NEW.quantity,
      last_restocked = CASE 
        WHEN NEW.movement_type = 'in' THEN CURRENT_DATE 
        ELSE last_restocked 
      END,
      updated_at = now()
    WHERE id = NEW.inventory_item_id;
  ELSE
    UPDATE inventory_items 
    SET 
      current_stock = GREATEST(0, current_stock - NEW.quantity),
      updated_at = now()
    WHERE id = NEW.inventory_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_inventory_stock ON stock_movements;
CREATE TRIGGER trigger_update_inventory_stock
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_stock();

-- Insert sample stock movements
INSERT INTO stock_movements (inventory_item_id, movement_type, quantity, reason, performed_by, unit_cost, total_cost, notes) VALUES
  ((SELECT id FROM inventory_items WHERE name = 'Basmati Rice' LIMIT 1), 'in', 50, 'Initial Stock', 'System', 80, 4000, 'Initial inventory setup'),
  ((SELECT id FROM inventory_items WHERE name = 'Chicken Breast' LIMIT 1), 'in', 20, 'Fresh Delivery', 'Priya Sharma', 250, 5000, 'Fresh delivery from supplier'),
  ((SELECT id FROM inventory_items WHERE name = 'Tomatoes' LIMIT 1), 'out', 5, 'Recipe Usage', 'Ravi Kumar', 0, 0, 'Used for Chicken Biryani preparation');