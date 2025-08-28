export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'kitchen_staff' | 'inventory_manager' | 'delivery_staff';
  phone: string;
  joinDate: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'vegetables' | 'meat' | 'dairy' | 'spices' | 'grains' | 'other';
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Array<{
    itemId: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  image?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    recipeId: string;
    quantity: number;
    price: number;
  }>;
  status: 'pending' | 'cooking' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderTime: string;
  estimatedDelivery: string;
  totalAmount: number;
  assignedStaff?: string;
  deliveryAddress: string;
  deliveredQuantity?: number;
  deliveryNotes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses: Array<{
    id: string;
    label: string;
    address: string;
    isDefault: boolean;
  }>;
  orderHistory: Array<{
    orderId: string;
    date: string;
    amount: number;
    status: string;
  }>;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  customerSince: string;
  preferences: {
    favoriteItems: string[];
    dietaryRestrictions: string[];
    spiceLevel: 'mild' | 'medium' | 'spicy';
  };
  loyaltyPoints: number;
  status: 'active' | 'inactive' | 'vip';
  notes: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  categories: string[];
  rating: number;
  isActive: boolean;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
  }>;
  status: 'pending' | 'approved' | 'ordered' | 'received';
  orderDate: string;
  expectedDelivery: string;
  totalAmount: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'approved' | 'paid';
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  movementType: 'in' | 'out';
  quantity: number;
  reason: string;
  referenceNumber?: string;
  unitCost: number;
  totalCost: number;
  performedBy: string;
  notes: string;
  movementDate: string;
  createdAt: string;
}