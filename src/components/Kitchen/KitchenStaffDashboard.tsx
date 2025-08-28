import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, AlertCircle, ChefHat, Timer, User, MapPin, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface OrderProgress {
  orderId: string;
  stage: 'received' | 'prep' | 'cooking' | 'plating' | 'ready';
  startTime: string;
  estimatedTime: number;
  actualTime?: number;
}

export function KitchenStaffDashboard() {
  const { orders, recipes, updateOrderStatus, notifications, markNotificationRead } = useApp();
  const { user } = useAuth();
  const [orderProgress, setOrderProgress] = useState<OrderProgress[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter orders assigned to current kitchen staff
  const myOrders = orders.filter(order => 
    order.assignedStaff === user?.name && 
    ['pending', 'cooking'].includes(order.status)
  );

  // Get notifications for current user
  const myNotifications = notifications.filter(n => 
    !n.read && (n.userId === user?.id || !n.userId)
  );

  // Initialize progress tracking for new orders
  useEffect(() => {
    myOrders.forEach(order => {
      if (!orderProgress.find(p => p.orderId === order.id)) {
        const newProgress: OrderProgress = {
          orderId: order.id,
          stage: order.status === 'pending' ? 'received' : 'prep',
          startTime: new Date().toISOString(),
          estimatedTime: calculateEstimatedTime(order)
        };
        setOrderProgress(prev => [...prev, newProgress]);
      }
    });
  }, [myOrders]);

  const calculateEstimatedTime = (order: any) => {
    // Calculate based on recipes and quantities
    let totalTime = 0;
    order.items.forEach((item: any) => {
      const recipe = recipes.find(r => r.id === item.recipeId);
      if (recipe) {
        totalTime += (recipe.prepTime + recipe.cookTime) * item.quantity;
      }
    });
    return Math.max(totalTime, 15); // Minimum 15 minutes
  };

  const getProgressStages = () => [
    { id: 'received', label: 'Order Received', icon: Bell, color: 'text-blue-500' },
    { id: 'prep', label: 'Preparation', icon: ChefHat, color: 'text-yellow-500' },
    { id: 'cooking', label: 'Cooking', icon: Timer, color: 'text-orange-500' },
    { id: 'plating', label: 'Plating', icon: CheckCircle, color: 'text-green-500' },
    { id: 'ready', label: 'Ready for Delivery', icon: CheckCircle, color: 'text-green-600' }
  ];

  const updateProgress = (orderId: string, newStage: string) => {
    setOrderProgress(prev => prev.map(p => 
      p.orderId === orderId 
        ? { ...p, stage: newStage as any, actualTime: Date.now() - new Date(p.startTime).getTime() }
        : p
    ));

    // Update order status in main system
    if (newStage === 'ready') {
      updateOrderStatus(orderId, 'out_for_delivery', user?.name);
    } else if (newStage === 'prep' || newStage === 'cooking') {
      updateOrderStatus(orderId, 'cooking', user?.name);
    }
  };

  const getOrderProgress = (orderId: string) => {
    return orderProgress.find(p => p.orderId === orderId);
  };

  const getStageIndex = (stage: string) => {
    const stages = ['received', 'prep', 'cooking', 'plating', 'ready'];
    return stages.indexOf(stage);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeElapsed = (startTime: string) => {
    const elapsed = Date.now() - new Date(startTime).getTime();
    const minutes = Math.floor(elapsed / (1000 * 60));
    return `${minutes} min`;
  };

  const getPriorityColor = (priority: string = 'normal') => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'normal': return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low': return 'border-l-4 border-gray-500 bg-gray-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kitchen Dashboard</h2>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {myNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {myNotifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {myNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    myNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${
                            notification.type === 'info' ? 'bg-blue-100' :
                            notification.type === 'warning' ? 'bg-yellow-100' :
                            notification.type === 'error' ? 'bg-red-100' :
                            'bg-green-100'
                          }`}>
                            <AlertCircle className={`h-4 w-4 ${
                              notification.type === 'info' ? 'text-blue-600' :
                              notification.type === 'warning' ? 'text-yellow-600' :
                              notification.type === 'error' ? 'text-red-600' :
                              'text-green-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-green-100 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-green-800">
              {myOrders.length} Active Orders
            </span>
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="grid gap-6">
        {myOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active orders assigned to you</p>
            <p className="text-sm text-gray-400">New orders will appear here when assigned</p>
          </div>
        ) : (
          myOrders.map((order) => {
            const progress = getOrderProgress(order.id);
            const stages = getProgressStages();
            const currentStageIndex = progress ? getStageIndex(progress.stage) : 0;
            
            return (
              <div key={order.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 ${getPriorityColor(order.priority)}`}>
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          order.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          order.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {(order.priority || 'normal').toUpperCase()} PRIORITY
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Ordered: {formatTime(order.orderTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Timer className="h-4 w-4" />
                          <span>Est. Delivery: {formatTime(order.estimatedDelivery)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">₹{order.totalAmount}</div>
                      {progress && (
                        <div className="text-sm text-gray-600">
                          Time: {getTimeElapsed(progress.startTime)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item: any, index: number) => {
                        const recipe = recipes.find(r => r.id === item.recipeId);
                        return (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-3">
                            <div>
                              <span className="font-medium">{recipe?.name || 'Unknown Recipe'}</span>
                              {item.notes && (
                                <div className="text-sm text-orange-600 mt-1">
                                  Note: {item.notes}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-medium">Qty: {item.quantity}</div>
                              <div className="text-sm text-gray-600">₹{item.price * item.quantity}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress Stages */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Progress</h4>
                    <div className="flex items-center justify-between">
                      {stages.map((stage, index) => {
                        const Icon = stage.icon;
                        const isCompleted = index <= currentStageIndex;
                        const isCurrent = index === currentStageIndex;
                        
                        return (
                          <div key={stage.id} className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                              isCompleted 
                                ? 'bg-green-500 text-white' 
                                : isCurrent 
                                  ? 'bg-orange-500 text-white animate-pulse'
                                  : 'bg-gray-200 text-gray-400'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className={`text-xs text-center ${
                              isCompleted ? 'text-green-600 font-medium' : 
                              isCurrent ? 'text-orange-600 font-medium' : 
                              'text-gray-400'
                            }`}>
                              {stage.label}
                            </span>
                            {index < stages.length - 1 && (
                              <div className={`absolute h-0.5 w-full mt-5 ${
                                index < currentStageIndex ? 'bg-green-500' : 'bg-gray-200'
                              }`} style={{ 
                                left: '50%', 
                                width: `${100 / stages.length}%`,
                                zIndex: -1 
                              }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    {progress && currentStageIndex < stages.length - 1 && (
                      <button
                        onClick={() => updateProgress(order.id, stages[currentStageIndex + 1].id)}
                        className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                        Mark as {stages[currentStageIndex + 1].label}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Delivery Address</h5>
                          <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span>{order.deliveryAddress}</span>
                          </div>
                        </div>
                        
                        {order.specialInstructions && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Special Instructions</h5>
                            <p className="text-sm text-gray-600">{order.specialInstructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}