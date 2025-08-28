import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, Phone, User, CheckCircle, AlertCircle, Navigation, Package, Edit, X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// No default delivery staff - will be loaded from database
const deliveryStaff: any[] = [];

export function DeliveryTracking() {
  const { orders, updateOrderStatus } = useApp();
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshTime, setRefreshTime] = useState(new Date());
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<any>(null);
  const [deliveryData, setDeliveryData] = useState({
    quantity: 0,
    notes: ''
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get delivery orders (out_for_delivery status)
  const deliveryOrders = orders.filter(order => order.status === 'out_for_delivery');
  
  // Get delivered orders for today
  const todayDelivered = orders.filter(order => {
    const orderDate = new Date(order.orderTime).toDateString();
    const today = new Date().toDateString();
    return orderDate === today && order.status === 'delivered';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivering': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'available': return 'bg-green-100 text-green-800 border-green-300';
      case 'returning': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivering': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'returning': return <Navigation className="h-4 w-4 text-orange-600" />;
      case 'offline': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEstimatedDeliveryTime = (orderTime: string) => {
    const orderDate = new Date(orderTime);
    const estimatedTime = new Date(orderDate.getTime() + 45 * 60000); // 45 minutes
    return estimatedTime.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDeliveryDuration = (orderTime: string) => {
    const orderDate = new Date(orderTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    return `${diffMinutes} min`;
  };

  const handleRecordDelivery = (order: any) => {
    setSelectedOrderForDelivery(order);
    setDeliveryData({
      quantity: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      notes: ''
    });
    setShowDeliveryModal(true);
  };

  const handleFetchDeliveryData = (order: any) => {
    const deliveryConfirmation = getDeliveryConfirmation(order.id);
    
    if (deliveryConfirmation) {
      // Display the delivery confirmation data from database
      alert(`📦 Delivery Data Retrieved\n\nOrder: ${order.orderNumber || order.id}\nCustomer: ${order.customerName}\nDelivered Quantity: ${deliveryConfirmation.delivered_quantity} meals\nOrdered Quantity: ${deliveryConfirmation.ordered_quantity} meals\nDelivery Status: ${deliveryConfirmation.delivery_status.toUpperCase()}\nDelivery Notes: "${deliveryConfirmation.delivery_notes || 'No notes provided'}"\nDelivered By: ${deliveryConfirmation.delivered_by}\nDelivery Date: ${new Date(deliveryConfirmation.delivery_date).toLocaleString('en-IN')}\n\nThis data is stored in the database and persists across logins.`);
    } else {
      // No delivery data found - delivery staff hasn't entered it yet
      alert(`⚠️ No Delivery Data Found\n\nOrder: ${order.orderNumber || order.id}\nCustomer: ${order.customerName}\n\nThe delivery staff has not yet entered the delivery quantity and notes for this order.\n\nPlease ask the delivery staff to mark this order as delivered first.`);
    }
  };

  const handleSaveDelivery = async () => {
    if (!selectedOrderForDelivery) return;
    
    if (deliveryData.quantity <= 0) {
      alert('Please enter a valid delivery quantity');
      return;
    }

    try {
      await updateOrderStatus(
        selectedOrderForDelivery.id, 
        'delivered', 
        selectedOrderForDelivery.assignedStaff,
        {
          quantity: deliveryData.quantity,
          notes: deliveryData.notes
        }
      );
      
      setShowDeliveryModal(false);
      setSelectedOrderForDelivery(null);
      setDeliveryData({ quantity: 0, notes: '' });
      
      alert(`✅ Delivery recorded successfully!\n\nOrder: ${selectedOrderForDelivery.orderNumber || selectedOrderForDelivery.id}\nDelivered: ${deliveryData.quantity} meals\nBy: ${selectedOrderForDelivery.assignedStaff}`);
    } catch (error) {
      console.error('Error recording delivery:', error);
      alert('❌ Error recording delivery. Please try again.');
    }
  };
  const filteredStaff = statusFilter === 'all' 
    ? deliveryStaff 
    : deliveryStaff.filter(staff => staff.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
          <p className="text-gray-600">Monitor delivery staff and track order deliveries in real-time</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {refreshTime.toLocaleTimeString('en-IN')}
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Delivery Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivered Today</p>
              <p className="text-2xl font-bold text-gray-900">{todayDelivered.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveryStaff.filter(s => s.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-gray-900">32 min</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Staff Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Delivery Staff Status</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No Delivery Staff Available</p>
              <p className="text-sm text-gray-400">Add delivery staff members in the Staff Management section to track deliveries</p>
            </div>
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Deliveries</h3>
          </div>
          <div className="p-6">
            {deliveryOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active deliveries</p>
                <p className="text-sm text-gray-400">All orders have been delivered</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveryOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₹{order.totalAmount}</div>
                        <div className="text-sm text-gray-600">
                          Duration: {getDeliveryDuration(order.orderTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Assigned to: </span>
                        <span className="font-medium">{order.assignedStaff || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{order.customerPhone}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Est. Delivery: {getEstimatedDeliveryTime(order.orderTime)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Items: </span>
                        <span className="font-medium">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </span>
                      </div>
                      <button
                        onClick={() => handleFetchDeliveryData(order)}
                        className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                      >
                        <Package className="h-4 w-4" />
                        <span>Fetch Delivery Data</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Deliveries (Today)</h3>
        </div>
        <div className="p-6">
          {todayDelivered.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No deliveries completed today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todayDelivered.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.customerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.assignedStaff || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatTime(order.orderTime)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{order.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record Delivery Modal */}
      {showDeliveryModal && selectedOrderForDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Record Delivery</h3>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">Order Details</h4>
                <div className="text-sm text-blue-700 mt-2">
                  <div>Order: {selectedOrderForDelivery.orderNumber || `#${selectedOrderForDelivery.id}`}</div>
                  <div>Customer: {selectedOrderForDelivery.customerName}</div>
                  <div>Phone: {selectedOrderForDelivery.customerPhone}</div>
                  <div>Total Amount: ₹{selectedOrderForDelivery.totalAmount}</div>
                  <div>Assigned to: {selectedOrderForDelivery.assignedStaff}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivered Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={deliveryData.quantity}
                    onChange={(e) => setDeliveryData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    placeholder="Enter delivered quantity"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total ordered: {selectedOrderForDelivery.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} meals
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    value={deliveryData.notes}
                    onChange={(e) => setDeliveryData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Any delivery notes or customer feedback..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDelivery}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Record Delivery</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}