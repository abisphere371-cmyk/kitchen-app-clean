/*
  # Add Default Inventory Items

  1. New Data
    - Add sample inventory items for testing kitchen usage functionality
    - Includes vegetables, meat, dairy, spices, and grains
    - Sets realistic stock levels, costs, and suppliers
    - Includes items with different stock statuses (normal, low, out)

  2. Categories Covered
    - Vegetables: Tomatoes, Onions, Potatoes, Carrots
    - Meat: Chicken Breast, Mutton, Fish
    - Dairy: Milk, Paneer, Curd
    - Spices: Turmeric, Red Chili, Garam Masala, Cumin
    - Grains: Basmati Rice, Wheat Flour, Dal

  3. Stock Levels
    - Some items with normal stock
    - Some items with low stock (for testing alerts)
    - Some items out of stock (for testing validation)
*/

-- Insert default inventory items
INSERT INTO inventory_items (
  name, category, current_stock, unit, min_stock, max_stock, 
  cost_per_unit, supplier, last_restocked, expiry_date
) VALUES 
-- Vegetables
('Tomatoes', 'vegetables', 25, 'kg', 10, 50, 40.00, 'Hosur Vegetable Market', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days'),
('Onions', 'vegetables', 8, 'kg', 15, 40, 30.00, 'Hosur Vegetable Market', CURRENT_DATE - INTERVAL '3 days', NULL),
('Potatoes', 'vegetables', 35, 'kg', 20, 60, 25.00, 'Hosur Vegetable Market', CURRENT_DATE - INTERVAL '1 day', NULL),
('Carrots', 'vegetables', 0, 'kg', 10, 30, 35.00, 'Hosur Vegetable Market', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '3 days'),
('Green Chilies', 'vegetables', 5, 'kg', 8, 20, 60.00, 'Hosur Vegetable Market', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '4 days'),

-- Meat
('Chicken Breast', 'meat', 12, 'kg', 15, 40, 280.00, 'Fresh Meat Co.', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days'),
('Mutton', 'meat', 8, 'kg', 10, 25, 450.00, 'Fresh Meat Co.', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days'),
('Fish (Pomfret)', 'meat', 0, 'kg', 5, 20, 320.00, 'Fresh Meat Co.', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '1 day'),

-- Dairy
('Milk', 'dairy', 20, 'liters', 25, 50, 55.00, 'Aavin Dairy', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days'),
('Paneer', 'dairy', 6, 'kg', 8, 20, 280.00, 'Aavin Dairy', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days'),
('Curd', 'dairy', 15, 'kg', 10, 30, 60.00, 'Aavin Dairy', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days'),

-- Spices
('Turmeric Powder', 'spices', 3, 'kg', 5, 15, 200.00, 'Spice World', CURRENT_DATE - INTERVAL '10 days', NULL),
('Red Chili Powder', 'spices', 4, 'kg', 6, 18, 180.00, 'Spice World', CURRENT_DATE - INTERVAL '8 days', NULL),
('Garam Masala', 'spices', 2, 'kg', 3, 10, 350.00, 'Spice World', CURRENT_DATE - INTERVAL '15 days', NULL),
('Cumin Seeds', 'spices', 1, 'kg', 2, 8, 220.00, 'Spice World', CURRENT_DATE - INTERVAL '12 days', NULL),
('Coriander Powder', 'spices', 0, 'kg', 3, 12, 160.00, 'Spice World', CURRENT_DATE - INTERVAL '20 days', NULL),

-- Grains
('Basmati Rice', 'grains', 45, 'kg', 30, 100, 85.00, 'Tamil Nadu Rice Mills', CURRENT_DATE - INTERVAL '5 days', NULL),
('Wheat Flour', 'grains', 25, 'kg', 20, 80, 45.00, 'Tamil Nadu Rice Mills', CURRENT_DATE - INTERVAL '7 days', NULL),
('Toor Dal', 'grains', 12, 'kg', 15, 40, 120.00, 'Tamil Nadu Rice Mills', CURRENT_DATE - INTERVAL '6 days', NULL),
('Chana Dal', 'grains', 8, 'kg', 10, 30, 110.00, 'Tamil Nadu Rice Mills', CURRENT_DATE - INTERVAL '8 days', NULL),

-- Other essentials
('Cooking Oil', 'other', 18, 'liters', 20, 50, 140.00, 'Local Supplier', CURRENT_DATE - INTERVAL '3 days', NULL),
('Salt', 'other', 5, 'kg', 8, 25, 20.00, 'Local Supplier', CURRENT_DATE - INTERVAL '10 days', NULL),
('Sugar', 'other', 15, 'kg', 12, 40, 50.00, 'Local Supplier', CURRENT_DATE - INTERVAL '4 days', NULL);