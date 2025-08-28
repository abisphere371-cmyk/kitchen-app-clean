/*
  # Add default customers

  1. Default Customers
    - Add sample customers based on existing orders
    - Include customer preferences and history
    - Set loyalty points and status

  2. Customer Data
    - Complete contact information
    - Order history and preferences
    - Loyalty program data
*/

-- Insert default customers
INSERT INTO customers (name, phone, email, addresses, preferences, loyalty_points, status, notes, customer_since) VALUES
  (
    'Rajesh Kumar',
    '+91 9876543214',
    'rajesh.kumar@email.com',
    '[{"id": "1", "label": "Home", "address": "No. 45, Anna Nagar, Hosur - 635109", "isDefault": true}]'::jsonb,
    '{"spiceLevel": "medium", "favoriteItems": ["Chicken Biryani"], "dietaryRestrictions": []}'::jsonb,
    150,
    'active',
    'Regular customer, prefers medium spice level',
    CURRENT_DATE - INTERVAL '6 months'
  ),
  (
    'Meera Patel',
    '+91 9876543215',
    'meera.patel@email.com',
    '[{"id": "1", "label": "Home", "address": "No. 78, Sipcot Phase 1, Hosur - 635126", "isDefault": true}]'::jsonb,
    '{"spiceLevel": "mild", "favoriteItems": ["Vegetable Curry"], "dietaryRestrictions": ["vegetarian"]}'::jsonb,
    280,
    'vip',
    'VIP customer, vegetarian, prefers mild spice',
    CURRENT_DATE - INTERVAL '8 months'
  ),
  (
    'Arun Vijay',
    '+91 9876543216',
    'arun.vijay@email.com',
    '[{"id": "1", "label": "Home", "address": "No. 23, Mathigiri Road, Hosur - 635110", "isDefault": true}]'::jsonb,
    '{"spiceLevel": "spicy", "favoriteItems": ["Chicken Biryani", "Masala Dosa"], "dietaryRestrictions": []}'::jsonb,
    420,
    'vip',
    'Frequent customer, loves spicy food',
    CURRENT_DATE - INTERVAL '1 year'
  ),
  (
    'Priya Sharma',
    '+91 9876543217',
    'priya.sharma.customer@email.com',
    '[{"id": "1", "label": "Home", "address": "No. 12, Bagalur Road, Hosur - 635109", "isDefault": true}]'::jsonb,
    '{"spiceLevel": "medium", "favoriteItems": ["Vegetable Curry"], "dietaryRestrictions": ["no-onion"]}'::jsonb,
    95,
    'active',
    'No onion preference',
    CURRENT_DATE - INTERVAL '3 months'
  )
ON CONFLICT (phone) DO NOTHING;