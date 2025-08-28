import React, { useState } from 'react';
import { ShoppingCart, Clock, Truck, CheckCircle, Plus, Phone, MapPin, Calendar, Download, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AdminOrderCreation } from './AdminOrderCreation';
import { DeliveryAssignmentModal } from './DeliveryAssignmentModal';

export function OrderManagement() {
  const { orders, recipes, updateOrderStatus, addOrder, deliveryConfirmations } = useApp();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showAdminOrderModal, setShowAdminOrderModal] = useState(false);
  const [showDeliveryAssignmentModal, setShowDeliveryAssignmentModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<any>(null);

  // Get delivery confirmation for an order
  const getDeliveryConfirmation = (orderId: string) => {
    return deliveryConfirmations.find(dc => dc.order_id === orderId);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.orderTime);
      const today = new Date();
      
      // assuming: const today = new Date();
      switch (dateFilter) {
        case 'today': {
          matchesDate =
            orderDate.getFullYear() === today.getFullYear() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getDate() === today.getDate();
          break;
        }
        case 'yesterday': {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate =
            orderDate.getFullYear() === yesterday.getFullYear() &&
            orderDate.getMonth() === yesterday.getMonth() &&
            orderDate.getDate() === yesterday.getDate();
          break;
        }
        case 'this_week': {
          // week starts Monday (adjust if you want Sunday)
          const day = (today.getDay() + 6) % 7; // 0..6 with Monday=0
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - day);
          weekStart.setHours(0, 0, 0, 0);

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          matchesDate = orderDate >= weekStart && orderDate < weekEnd;
          break;
        }
        case 'this_month': {
          matchesDate =
            orderDate.getFullYear() === today.getFullYear() &&
            orderDate.getMonth() === today.getMonth(); // ← the () fix
          break;
        }
        case 'this_year': {
          matchesDate = orderDate.getFullYear() === today.getFullYear();
          break;
        }
        case 'custom': {
          if (selectedDate) {
            const selected = new Date(selectedDate);
            matchesDate =
              orderDate.getFullYear() === selected.getFullYear() &&
              orderDate.getMonth() === selected.getMonth() &&
              orderDate.getDate() === selected.getDate();
          }
          break;
        }
        default: {
          matchesDate = true;
        }
      }
    }
    
    return matchesStatus && matchesDate;
  });

  const handleDownloadOrders = () => {
    try {
      // Create CSV content
      const headers = [
        'Order ID',
        'Order Number', 
        'Customer Name',
        'Customer Phone',
        'Delivery Address',
        'Status',
        'Order Time',
        'Estimated Delivery',
        'Total Amount',
        'Items Count',
        'Assigned Staff',
        'Priority',
        'Payment Method'
      ];

      const csvRows = [
        headers.join(','),
        ...filteredOrders.map(order => [
          order.id,
          order.orderNumber || '',
          `"${order.customerName}"`,
          order.customerPhone,
          `"${order.deliveryAddress}"`,
          order.status,
          new Date(order.orderTime).toLocaleString('en-IN'),
          new Date(order.estimatedDelivery).toLocaleString('en-IN'),
          order.totalAmount,
          order.items.reduce((sum, item) => sum + item.quantity, 0),
          order.assignedStaff || '',
          (order as any).priority || 'normal',
          (order as any).paymentMethod || 'cash'
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const dateRange = dateFilter === 'all' ? 'all_orders' : 
                      dateFilter === 'custom' && selectedDate ? `orders_${selectedDate}` :
                      `orders_${dateFilter}`;
      const fileName = `abisphere_kitchen_orders_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`✅ Orders exported successfully!\n\nFile: ${fileName}\nTotal Orders: ${filteredOrders.length}\nDate Filter: ${dateFilter}\nStatus Filter: ${statusFilter}`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Error exporting orders. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cooking':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cooking':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'cooking': return 'Cooking';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadOrders}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 font-medium shadow-lg touch-manipulation"
          >
            <Download className="h-4 w-4" />
            <span>Download Orders ({filteredOrders.length})</span>
          </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAdminOrderModal(true)}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 font-semibold shadow-lg touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Order & Assign Staff</span>
          </button>
        )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Date Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    if (e.target.value !== 'custom') {
                      setSelectedDate('');
                    }
                  }}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="this_year">This Year</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>
              
              {dateFilter === 'custom' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="cooking">Cooking</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Filter Summary */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-600">Showing:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            {filteredOrders.length} orders
          </span>
          {dateFilter !== 'all' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
              📅 {dateFilter === 'custom' && selectedDate ? selectedDate : dateFilter.replace('_', ' ')}
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
              🏷️ {getStatusText(statusFilter)}
            </span>
          )}
          {(dateFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setDateFilter('all');
                setStatusFilter('all');
                setSelectedDate('');
              }}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Orders Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredOrders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ₹{filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0) / filteredOrders.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Order Value</div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4 sm:space-y-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {order.orderNumber ? `Order ${order.orderNumber}` : `Order #${order.id}`}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Delivery Information for Delivered Orders */}
                  {order.status === 'delivered' && (() => {
                    const deliveryConfirmation = getDeliveryConfirmation(order.id);
                    return deliveryConfirmation && (
                    <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Delivery Completed</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-green-700">Ordered Quantity:</span>
                              <span className="font-bold text-green-800">
                                {deliveryConfirmation.ordered_quantity} meals
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Delivered Quantity:</span>
                              <span className={`font-bold ${
                                deliveryConfirmation.delivered_quantity > deliveryConfirmation.ordered_quantity 
                                  ? 'text-blue-800' 
                                  : deliveryConfirmation.delivered_quantity < deliveryConfirmation.ordered_quantity
                                    ? 'text-orange-800'
                                    : 'text-green-800'
                              }`}>
                                {deliveryConfirmation.delivered_quantity} meals
                                {deliveryConfirmation.delivered_quantity > deliveryConfirmation.ordered_quantity && 
                                  ` (+${deliveryConfirmation.delivered_quantity - deliveryConfirmation.ordered_quantity} extra)`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Delivery Status:</span>
                              <span className={`font-bold ${
                                deliveryConfirmation.delivery_status === 'completed' ? 'text-green-800' :
                                deliveryConfirmation.delivery_status === 'partial' ? 'text-orange-800' :
                                'text-red-800'
                              }`}>
                                {deliveryConfirmation.delivered_quantity > deliveryConfirmation.ordered_quantity 
                                  ? 'Extra Delivery' 
                                  : deliveryConfirmation.delivery_status === 'completed' 
                                    ? 'Complete Delivery' 
                                    : deliveryConfirmation.delivery_status === 'partial'
                                      ? 'Partial Delivery'
                                      : 'Failed Delivery'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="space-y-1">
                            <div>
                              <span className="text-green-700">Delivered By:</span>
                              <span className="font-bold text-green-800 ml-2">{deliveryConfirmation.delivered_by}</span>
                            </div>
                            <div>
                              <span className="text-green-700">Delivery Date:</span>
                              <span className="font-bold text-green-800 ml-2">
                                {new Date(deliveryConfirmation.delivery_date).toLocaleString('en-IN')}
                              </span>
                            </div>
                            {deliveryConfirmation.delivery_notes && (
                              <div>
                                <span className="text-green-700">Delivery Notes:</span>
                                <div className="font-medium text-green-800 mt-1 p-2 bg-green-100 rounded">
                                  "{deliveryConfirmation.delivery_notes}"
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })()}

                  <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4 sm:space-y-0 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{order.customerPhone}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span className="break-words">{order.deliveryAddress}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Order Date: {new Date(order.orderTime).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Order Time: {formatTime(order.orderTime)}</span>
                        </div>
                        <div>Est. Delivery: {formatTime(order.estimatedDelivery)}</div>
                        <div>Total Amount: ₹{order.totalAmount}</div>
                        <div>Total Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)} meals</div>
                        {order.assignedStaff && (
                          <div>Assigned to: {order.assignedStaff}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {order.status === 'delivered' && order.deliveredQuantity && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <div className="text-green-800 font-medium">
                        ✅ Delivered: {order.deliveredQuantity} meals
                      </div>
                      {order.deliveryNotes && (
                        <div className="text-green-700 text-xs mt-1">
                          Notes: {order.deliveryNotes}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        const recipe = recipes.find(r => r.id === item.recipeId);
                        return (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2 sm:p-3">
                            <span className="font-medium text-sm sm:text-base">{recipe?.name || 'Unknown Recipe'}</span>
                            <div className="text-right">
                              <div className="text-sm">Qty: {item.quantity}</div>
                              <div className="text-sm font-medium">₹{item.price * item.quantity}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 sm:border-t-0 sm:pt-0">
                  <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cooking', user?.name)}
                        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors touch-manipulation font-medium"
                      >
                        Start Cooking
                      </button>
                    )}
                    {user?.role === 'admin' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          setSelectedOrderForDelivery(order);
                          setShowDeliveryAssignmentModal(true);
                        }}
                        className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors touch-manipulation font-medium"
                      >
                        🚚 Assign Delivery Partner
                      </button>
                    )}
                    {order.status === 'cooking' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery', user?.name)}
                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors touch-manipulation font-medium"
                      >
                        Send for Delivery
                      </button>
                    )}
                    {order.status === 'out_for_delivery' && user?.role !== 'kitchen_staff' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered', user?.name)}
                        className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors touch-manipulation font-medium"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <AdminOrderCreation
        isOpen={showAdminOrderModal}
        onClose={() => setShowAdminOrderModal(false)}
      />
      
      <DeliveryAssignmentModal
        isOpen={showDeliveryAssignmentModal}
        onClose={() => {
          setShowDeliveryAssignmentModal(false);
          setSelectedOrderForDelivery(null);
        }}
        order={selectedOrderForDelivery}
      />
    </div>
  );
}