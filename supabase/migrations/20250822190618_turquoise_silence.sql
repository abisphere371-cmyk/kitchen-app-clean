/*
  # Add default orders

  1. Default Orders
    - Add sample orders with realistic data
    - Include various order statuses
    - Link to existing customers

  2. Order Structure
    - Complete order information
    - Proper customer references
    - Realistic timing and amounts
*/

-- Insert default orders
INSERT INTO orders (customer_name, customer_phone, customer_email, delivery_address, items, status, order_time, estimated_delivery, total_amount, assigned_staff, priority, special_instructions, payment_method, order_source) VALUES
  (
    'Rajesh Kumar',
    '+91 9876543214',
    'rajesh.kumar@email.com',
    'No. 45, Anna Nagar, Hosur - 635109',
    '[{"recipeId": "recipe_placeholder", "quantity": 2, "price": 280, "name": "Chicken Biryani"}]'::jsonb,
    'cooking',
    NOW() - INTERVAL '30 minutes',
    NOW() + INTERVAL '30 minutes',
    560,
    'Ravi Kumar',
    'normal',
    'Medium spice level',
    'cash',
    'phone'
  ),
  (
    'Meera Patel',
    '+91 9876543215',
    'meera.patel@email.com',
    'No. 78, Sipcot Phase 1, Hosur - 635126',
    '[{"recipeId": "recipe_placeholder", "quantity": 1, "price": 150, "name": "Vegetable Curry"}, {"recipeId": "recipe_placeholder", "quantity": 1, "price": 280, "name": "Chicken Biryani"}]'::jsonb,
    'out_for_delivery',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '15 minutes',
    430,
    'Suresh Babu',
    'normal',
    'Mild spice, vegetarian curry only',
    'online',
    'online'
  ),
  (
    'Arun Vijay',
    '+91 9876543216',
    'arun.vijay@email.com',
    'No. 23, Mathigiri Road, Hosur - 635110',
    '[{"recipeId": "recipe_placeholder", "quantity": 3, "price": 280, "name": "Chicken Biryani"}]'::jsonb,
    'delivered',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour',
    840,
    'Suresh Babu',
    'high',
    'Extra spicy',
    'cash',
    'phone'
  ),
  (
    'Priya Sharma',
    '+91 9876543217',
    'priya.sharma.customer@email.com',
    'No. 12, Bagalur Road, Hosur - 635109',
    '[{"recipeId": "recipe_placeholder", "quantity": 2, "price": 120, "name": "Masala Dosa"}]'::jsonb,
    'pending',
    NOW() - INTERVAL '10 minutes',
    NOW() + INTERVAL '50 minutes',
    240,
    NULL,
    'normal',
    'No onion in any preparation',
    'card',
    'admin'
  )
ON CONFLICT DO NOTHING;