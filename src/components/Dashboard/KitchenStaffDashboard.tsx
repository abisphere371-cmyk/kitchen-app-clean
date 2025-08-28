import React, { useState } from 'react';
import { ChefHat, Clock, CheckCircle, AlertCircle, User, Phone, MapPin, Timer, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export function KitchenStaffDashboard() {
  const { orders, recipes, updateOrderStatus, notifications } = useApp();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Filter orders assigned to current kitchen staff or pending orders
  const myOrders = orders.filter(order => 
    order.assignedStaff === user?.name && 
    ['pending', 'cooking', 'out_for_delivery', 'delivered', 'cancelled'].includes(order.status)
  );

  const completedToday = orders.filter(order => {
    const orderDate = new Date(order.orderTime).toDateString();
    const today = new Date().toDateString();
    return orderDate === today && order.status === 'delivered' && order.assignedStaff === user?.name;
  });

  const myNotifications = notifications.filter(n => 
    !n.read && (n.userId === user?.id || !n.userId)
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getOrderPriority = (orderTime: string) => {
    const timeDiff = Date.now() - new Date(orderTime).getTime();
    const minutes = Math.floor(timeDiff / (1000 * 60));
    
    if (minutes > 45) return 'urgent';
    if (minutes > 30) return 'high';
    return 'normal';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Welcome, Chef {user?.name}! 👨‍🍳</h1>
            <p className="text-orange-100 text-sm sm:text-base">Ready to create delicious meals today?</p>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold">{myOrders.length}</div>
            <div className="text-orange-100 text-sm sm:text-base">Active Orders</div>
          </div>
        </div>
      </div>

      {/* Kitchen Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-1 sm:p-2 bg-orange-100 rounded-lg">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Orders to Cook</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{myOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{completedToday.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Timer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Cook Time</p>
              <p className="text-2xl font-bold text-gray-900">25 min</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{myNotifications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Orders Queue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <ChefHat className="h-5 w-5 text-orange-500" />
            <span>Kitchen Queue - Orders to Prepare</span>
          </h3>
        </div>
        <div className="p-6">
          {myOrders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500">Great job! No pending orders in the kitchen.</p>
              <p className="text-sm text-gray-400">New orders will appear here when they come in.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => {
                const priority = getOrderPriority(order.orderTime);
                return (
                  <div key={order.id} className={`rounded-lg p-4 ${getPriorityColor(priority)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">Order #{order.id}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Ordered: {formatTime(order.orderTime)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₹{order.totalAmount}</div>
                        <div className="text-sm text-gray-600">{order.items.length} items</div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Items to Prepare:</h5>
                        <h4 className="font-semibold text-gray-900">
                          {order.orderNumber ? `Order ${order.orderNumber}` : `Order #${order.id}`}
                        </h4>
                        {order.items.map((item: any, index: number) => {
                          const recipe = recipes.find(r => r.id === item.recipeId);
                          return (
                            <div key={index} className="flex items-center justify-between bg-white bg-opacity-70 rounded p-2">
                              <div>
                                <span className="font-medium">{recipe?.name || 'Unknown Recipe'}</span>
                                {recipe && (
                                  <div className="text-xs text-gray-600">
                                    Prep: {recipe.prepTime}min • Cook: {recipe.cookTime}min
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">×{item.quantity}</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    
                    <div className="flex space-x-3 mt-4">
                      {/* Action Buttons */}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cooking', user?.name)}
                          className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                        >
                          🔥 Start Cooking
                        </button>
                      )}
                      {order.status === 'cooking' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'out_for_delivery', user?.name)}
                          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                          ✅ Mark Ready
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {selectedOrder === order.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Phone className="h-4 w-4" />
                              <span className="text-gray-600">{order.customerPhone}</span>
                            </div>
                            <div className="flex items-start space-x-1">
                              <MapPin className="h-4 w-4 mt-0.5" />
                              <span className="text-gray-600">{order.deliveryAddress}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">
                              <div>Est. Delivery: {formatTime(order.estimatedDelivery)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Today's Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Today's Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{completedToday.length}</div>
              <div className="text-gray-600">Orders Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                ₹{completedToday.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Revenue Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">4.8⭐</div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}