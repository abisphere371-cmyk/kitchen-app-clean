import React, { useState } from 'react';
import { X, Plus, Minus, User, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface AdminOrderCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate customers from orders for dropdown
const getCustomersFromOrders = (orders: any[]) => {
  const customerMap = new Map();
  orders.forEach(order => {
    if (!customerMap.has(order.customerPhone)) {
      customerMap.set(order.customerPhone, {
        name: order.customerName,
        phone: order.customerPhone,
        address: order.deliveryAddress
      });
    }
  });
  return Array.from(customerMap.values());
};

export function AdminOrderCreation({ isOpen, onClose }: AdminOrderCreationProps) {
  const { recipes, addOrder, orders, staffMembers, loading } = useApp();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Customer Info, 2: Order Items, 3: Assignment & Review
  
  // Get existing customers for dropdown
  const existingCustomers = getCustomersFromOrders(orders);
  
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    items: [] as Array<{ recipeId: string; quantity: number; price: number; notes?: string }>,
    assignedStaff: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    specialInstructions: '',
    estimatedDeliveryTime: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'online',
    orderSource: 'admin' as 'admin' | 'phone' | 'online'
  });

  if (!isOpen) return null;

  const addItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, { recipeId: '', quantity: 1, price: 0, notes: '' }]
    }));
  };

  const removeItem = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { 
          ...item, 
          [field]: value,
          // Auto-set suggested price when recipe is selected
          ...(field === 'recipeId' && value ? {
            price: getSuggestedPrice(value)
          } : {})
        } : item
      )
    }));
  };

  const getSuggestedPrice = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return 0;
    
    // Calculate suggested price based on recipe category
    const basePrices = {
      'appetizer': 120,
      'main course': 280,
      'dessert': 150,
      'beverage': 80,
      'snack': 100,
      'soup': 140,
      'salad': 160
    };
    
    return basePrices[recipe.category.toLowerCase() as keyof typeof basePrices] || 200;
  };

  // Get kitchen staff members
  const kitchenStaff = staffMembers.filter(staff => {
    console.log('Checking staff member:', staff);
    return staff.role === 'kitchen_staff' && staff.is_active !== false;
  });
  
  console.log('Available kitchen staff:', kitchenStaff);
  console.log('All staff members:', staffMembers);
  const calculateTotal = () => {
    return orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white border-2 border-red-600';
      case 'high': return 'bg-orange-500 text-white border-2 border-orange-600';
      case 'normal': return 'bg-blue-500 text-white border-2 border-blue-600';
      default: return 'bg-blue-500 text-white';
    }
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return orderData.customerName.trim() && 
               orderData.customerPhone.trim() && 
               orderData.deliveryAddress.trim();
      case 2:
        return orderData.items.length > 0 && 
               orderData.items.every(item => item.recipeId && item.quantity > 0 && item.price > 0);
      case 3:
        return orderData.assignedStaff;
      default:
        return false;
    }
  };

  const handleCustomerSelect = (customerPhone: string) => {
    const customer = existingCustomers.find(c => c.phone === customerPhone);
    if (customer) {
      setOrderData(prev => ({
        ...prev,
        customerName: customer.name,
        customerPhone: customer.phone,
        deliveryAddress: customer.address
      }));
    } else if (customerPhone === '') {
      // Clear fields when "Select Customer" is chosen
      setOrderData(prev => ({
        ...prev,
        customerName: '',
        customerPhone: '',
        deliveryAddress: ''
      }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const handleSubmit = () => {
    if (!validateStep(3)) {
      alert('Please complete all required fields.');
      return;
    }

    const totalAmount = calculateTotal();
    
    const newOrder = {
      ...orderData,
      status: 'pending' as const,
      orderTime: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      totalAmount,
      assignedStaff: '',
      createdBy: user?.name || 'Admin'
    };
    
    addOrder(newOrder);
    
    // Reset form
    setOrderData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      deliveryAddress: '',
      items: [],
      assignedStaff: '',
      priority: 'normal',
      specialInstructions: '',
      estimatedDeliveryTime: '',
      paymentMethod: 'cash',
      orderSource: 'admin'
    });
    
    setStep(1);
    onClose();
    
    alert(`✅ Order created successfully!\n\nTotal Amount: ₹${totalAmount.toLocaleString()}\nStatus: Pending\n\nNote: Assign kitchen staff in Staff Management section to process orders.`);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((stepNum) => (
        <React.Fragment key={stepNum}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= stepNum ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`w-12 h-1 mx-2 ${
              step > stepNum ? 'bg-orange-500' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
      
      {/* Customer Selection Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Existing Customer (Optional)
        </label>
        <select
          value={orderData.customerPhone}
          onChange={(e) => handleCustomerSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
        >
          <option value="">Select Customer or Enter New</option>
          {existingCustomers.map((customer, index) => (
            <option key={index} value={customer.phone}>
              {customer.name} - {customer.phone}
            </option>
          ))}
        </select>
        {existingCustomers.length === 0 && (
          <p className="text-sm text-gray-500 mb-4">No existing customers found. Please enter customer details below.</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={orderData.customerName}
            onChange={(e) => setOrderData(prev => ({ ...prev, customerName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter customer name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={orderData.customerPhone}
            onChange={(e) => setOrderData(prev => ({ ...prev, customerPhone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="+91 9876543210"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
        <input
          type="email"
          value={orderData.customerEmail}
          onChange={(e) => setOrderData(prev => ({ ...prev, customerEmail: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="customer@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={orderData.deliveryAddress}
          onChange={(e) => setOrderData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={3}
          placeholder="Enter complete delivery address"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <select
            value={orderData.paymentMethod}
            onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="cash">Cash on Delivery</option>
            <option value="card">Card Payment</option>
            <option value="online">Online Payment</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
        <button
          onClick={addItem}
          className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </div>

      <div className="space-y-3">
        {orderData.items.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Item</label>
                <select
                  value={item.recipeId}
                  onChange={(e) => updateItem(index, 'recipeId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Item</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                     {recipe.name} - {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                  required
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes (Optional)</label>
              <input
                type="text"
                value={item.notes || ''}
                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Extra spicy, no onions, less oil, etc."
              />
            </div>
            
            {/* Recipe Details Display */}
            {item.recipeId && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                {(() => {
                  const recipe = recipes.find(r => r.id === item.recipeId);
                  return recipe ? (
                    <div className="text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-800">{recipe.name}</span>
                        <span className="text-blue-600 text-xs">{recipe.category}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-blue-700">
                        <div>⏱️ Prep: {recipe.prepTime}min</div>
                        <div>🔥 Cook: {recipe.cookTime}min</div>
                        <div>👥 Serves: {recipe.servings}</div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Subtotal: ₹{(item.price * item.quantity).toLocaleString()}
              </div>
              {orderData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        ))}
        
        {orderData.items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-medium">No recipes added yet</p>
              <p className="text-sm">Click "Add Item" to start building the order</p>
            </div>
          </div>
        )}
      </div>

      {orderData.items.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="font-medium text-gray-900">Order Summary</span>
              <div className="text-sm text-gray-600">
                {orderData.items.length} recipe{orderData.items.length !== 1 ? 's' : ''} • 
                {orderData.items.reduce((sum, item) => sum + item.quantity, 0)} total items
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ₹{calculateTotal().toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
          </div>
          
          {/* Recipe breakdown */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {orderData.items.map((item, index) => {
                const recipe = recipes.find(r => r.id === item.recipeId);
                return recipe ? (
                  <div key={index} className="flex justify-between items-center bg-white bg-opacity-60 rounded px-2 py-1">
                    <span className="font-medium">{recipe.name}</span>
                    <span className="text-gray-600">
                      {item.quantity}x ₹{item.price} = ₹{(item.quantity * item.price).toLocaleString()}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Assignment & Review</h3>
      
      {/* Kitchen Staff Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Assign to Kitchen Staff <span className="text-red-500">*</span>
        </label>
        {loading ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading kitchen staff...</p>
          </div>
        ) : kitchenStaff.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No Kitchen Staff Available</p>
            <p className="text-sm text-gray-400 mt-2">
              Please add kitchen staff members in the Staff Management section first.<br/>
              Current staff count: {staffMembers.length} | Kitchen staff: {kitchenStaff.length}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kitchenStaff.map((staff) => (
              <div
                key={staff.id}
                onClick={() => setOrderData(prev => ({ ...prev, assignedStaff: staff.name }))}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  orderData.assignedStaff === staff.name
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {staff.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{staff.name}</h4>
                    <p className="text-sm text-gray-600">{staff.department}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">📞 {staff.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">👤 {staff.username}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {staff.is_active ? '✅ Available' : '❌ Unavailable'}
                      </span>
                    </div>
                  </div>
                  {orderData.assignedStaff === staff.name && (
                    <div className="text-orange-500">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Special Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
        <textarea
          value={orderData.specialInstructions}
          onChange={(e) => setOrderData(prev => ({ ...prev, specialInstructions: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={3}
          placeholder="Any special instructions for the kitchen or delivery team..."
        />
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{orderData.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{orderData.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{orderData.items.length} item{orderData.items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Assigned to:</span>
            <span className="font-medium">
              {orderData.assignedStaff || 'Not assigned'}
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span className="text-lg">₹{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {renderStepIndicator()}
          
          <div className="mb-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          <div className="flex justify-between">
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!validateStep(step) || (step === 3 && kitchenStaff.length === 0)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!validateStep(3) || !orderData.assignedStaff}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}