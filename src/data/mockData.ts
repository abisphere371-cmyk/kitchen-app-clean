import { InventoryItem, Recipe, Order, Supplier, PurchaseOrder, PayrollRecord } from '../types';

export const mockInventoryItems: InventoryItem[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Basmati Rice',
    category: 'grains',
    currentStock: 50,
    unit: 'kg',
    minStock: 20,
    maxStock: 100,
    costPerUnit: 80,
    supplier: 'Tamil Nadu Rice Mills',
    lastRestocked: '2024-01-15',
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    name: 'Chicken Breast',
    category: 'meat',
    currentStock: 15,
    unit: 'kg',
    minStock: 10,
    maxStock: 50,
    costPerUnit: 250,
    supplier: 'Fresh Meat Co.',
    lastRestocked: '2024-01-16',
    expiryDate: '2024-01-20'
  },
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    name: 'Tomatoes',
    category: 'vegetables',
    currentStock: 8,
    unit: 'kg',
    minStock: 15,
    maxStock: 40,
    costPerUnit: 40,
    supplier: 'Hosur Vegetable Market',
    lastRestocked: '2024-01-14',
    expiryDate: '2024-01-18'
  },
  {
    id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
    name: 'Onions',
    category: 'vegetables',
    currentStock: 25,
    unit: 'kg',
    minStock: 20,
    maxStock: 60,
    costPerUnit: 30,
    supplier: 'Hosur Vegetable Market',
    lastRestocked: '2024-01-13',
  },
  {
    id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
    name: 'Turmeric Powder',
    category: 'spices',
    currentStock: 2,
    unit: 'kg',
    minStock: 5,
    maxStock: 15,
    costPerUnit: 200,
    supplier: 'Spice World',
    lastRestocked: '2024-01-10',
  }
];

export const mockRecipes: Recipe[] = [
  {
    id: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
    name: 'Chicken Biryani',
    category: 'Main Course',
    prepTime: 30,
    cookTime: 45,
    servings: 4,
    ingredients: [
      { itemId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2, unit: 'cups' },
      { itemId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', quantity: 1, unit: 'kg' },
      { itemId: 'd4e5f6g7-h8i9-0123-defg-456789012345', quantity: 0.5, unit: 'kg' },
      { itemId: 'e5f6g7h8-i9j0-1234-efgh-567890123456', quantity: 0.02, unit: 'kg' }
    ],
    instructions: [
      'Soak basmati rice for 30 minutes',
      'Marinate chicken with spices',
      'Cook rice until 70% done',
      'Layer rice and chicken',
      'Cook on low heat for 45 minutes'
    ]
  },
  {
    id: 'g7h8i9j0-k1l2-3456-ghij-789012345678',
    name: 'Vegetable Curry',
    category: 'Main Course',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    ingredients: [
      { itemId: 'c3d4e5f6-g7h8-9012-cdef-345678901234', quantity: 0.5, unit: 'kg' },
      { itemId: 'd4e5f6g7-h8i9-0123-defg-456789012345', quantity: 0.3, unit: 'kg' },
      { itemId: 'e5f6g7h8-i9j0-1234-efgh-567890123456', quantity: 0.01, unit: 'kg' }
    ],
    instructions: [
      'Chop all vegetables',
      'Heat oil and add spices',
      'Add vegetables and cook',
      'Simmer until tender'
    ]
  }
];

export const mockOrders: Order[] = [
  {
    id: 'h8i9j0k1-l2m3-4567-hijk-890123456789',
    customerName: 'Rajesh Kumar',
    customerPhone: '+91 9876543214',
    items: [
      { recipeId: 'f6g7h8i9-j0k1-2345-fghi-678901234567', quantity: 2, price: 280 }
    ],
    status: 'cooking',
    orderTime: '2024-01-17T12:30:00Z',
    estimatedDelivery: '2024-01-17T13:30:00Z',
    totalAmount: 560,
    assignedStaff: 'Ravi Kumar',
    deliveryAddress: 'No. 45, Anna Nagar, Hosur - 635109'
  },
  {
    id: 'i9j0k1l2-m3n4-5678-ijkl-901234567890',
    customerName: 'Meera Patel',
    customerPhone: '+91 9876543215',
    items: [
      { recipeId: 'g7h8i9j0-k1l2-3456-ghij-789012345678', quantity: 1, price: 180 },
      { recipeId: 'f6g7h8i9-j0k1-2345-fghi-678901234567', quantity: 1, price: 280 }
    ],
    status: 'out_for_delivery',
    orderTime: '2024-01-17T11:45:00Z',
    estimatedDelivery: '2024-01-17T12:45:00Z',
    totalAmount: 460,
    assignedStaff: 'Suresh Babu',
    deliveryAddress: 'No. 78, Sipcot Phase 1, Hosur - 635126'
  },
  {
    id: 'j0k1l2m3-n4o5-6789-jklm-012345678901',
    customerName: 'Arun Vijay',
    customerPhone: '+91 9876543216',
    items: [
      { recipeId: 'f6g7h8i9-j0k1-2345-fghi-678901234567', quantity: 3, price: 280 }
    ],
    status: 'delivered',
    orderTime: '2024-01-17T10:15:00Z',
    estimatedDelivery: '2024-01-17T11:15:00Z',
    totalAmount: 840,
    assignedStaff: 'Suresh Babu',
    deliveryAddress: 'No. 23, Mathigiri Road, Hosur - 635110'
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: 'k1l2m3n4-o5p6-7890-klmn-123456789012',
    name: 'Tamil Nadu Rice Mills',
    contact: '+91 9876543220',
    email: 'info@tnricemills.com',
    address: 'Industrial Area, Hosur - 635109',
    categories: ['grains'],
    rating: 4.5,
    isActive: true
  },
  {
    id: 'l2m3n4o5-p6q7-8901-lmno-234567890123',
    name: 'Fresh Meat Co.',
    contact: '+91 9876543221',
    email: 'orders@freshmeat.com',
    address: 'Meat Market Complex, Hosur - 635110',
    categories: ['meat'],
    rating: 4.2,
    isActive: true
  },
  {
    id: 'm3n4o5p6-q7r8-9012-mnop-345678901234',
    name: 'Hosur Vegetable Market',
    contact: '+91 9876543222',
    email: 'sales@hosurveg.com',
    address: 'Main Vegetable Market, Hosur - 635109',
    categories: ['vegetables'],
    rating: 4.0,
    isActive: true
  },
  {
    id: 'n4o5p6q7-r8s9-0123-nopq-456789012345',
    name: 'Spice World',
    contact: '+91 9876543223',
    email: 'info@spiceworld.com',
    address: 'Spice Market, Hosur - 635126',
    categories: ['spices'],
    rating: 4.7,
    isActive: true
  }
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'o5p6q7r8-s9t0-1234-opqr-567890123456',
    supplierId: 'k1l2m3n4-o5p6-7890-klmn-123456789012',
    items: [
      { itemId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 50, unitPrice: 80 }
    ],
    status: 'pending',
    orderDate: '2024-01-17',
    expectedDelivery: '2024-01-19',
    totalAmount: 4000
  },
  {
    id: 'p6q7r8s9-t0u1-2345-pqrs-678901234567',
    supplierId: 'm3n4o5p6-q7r8-9012-mnop-345678901234',
    items: [
      { itemId: 'c3d4e5f6-g7h8-9012-cdef-345678901234', quantity: 20, unitPrice: 40 },
      { itemId: 'd4e5f6g7-h8i9-0123-defg-456789012345', quantity: 30, unitPrice: 30 }
    ],
    status: 'approved',
    orderDate: '2024-01-16',
    expectedDelivery: '2024-01-18',
    totalAmount: 1700
  }
];

export const mockPayrollRecords: PayrollRecord[] = [
  {
    id: 'q7r8s9t0-u1v2-3456-qrst-789012345678',
    employeeId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    month: '2024-01',
    baseSalary: 25000,
    overtime: 2000,
    bonus: 1000,
    deductions: 500,
    netSalary: 27500,
    status: 'paid'
  },
  {
    id: 'r8s9t0u1-v2w3-4567-rstu-890123456789',
    employeeId: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    month: '2024-01',
    baseSalary: 30000,
    overtime: 1500,
    bonus: 2000,
    deductions: 600,
    netSalary: 32900,
    status: 'paid'
  },
  {
    id: 's9t0u1v2-w3x4-5678-stuv-901234567890',
    employeeId: 'd4e5f6g7-h8i9-0123-defg-456789012345',
    month: '2024-01',
    baseSalary: 20000,
    overtime: 3000,
    bonus: 500,
    deductions: 400,
    netSalary: 23100,
    status: 'pending'
  }
];