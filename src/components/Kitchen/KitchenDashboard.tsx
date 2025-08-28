import React, { useState } from 'react';
import { ChefHat, Clock, CheckCircle, AlertCircle, Plus, Layers, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BulkCookingModal } from './BulkCookingModal';
import { MenuManagement } from './MenuManagement';
import { KitchenStaffDashboard } from './KitchenStaffDashboard';

export function KitchenDashboard() {
  const { orders, recipes, updateOrderStatus } = useApp();
  const { user } = useAuth();
  const [activeOrders] = useState(orders.filter(order => order.status === 'cooking'));
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [showBulkCookingModal, setShowBulkCookingModal] = useState(false);
  const [showMenuManagement, setShowMenuManagement] = useState(false);
  const [bulkCookingJobs, setBulkCookingJobs] = useState<any[]>([]);

  const isAdmin = user?.role === 'admin';
  const isKitchenStaff = user?.role === 'kitchen_staff';

  // If user is kitchen staff (not admin), show the staff-specific dashboard
  if (isKitchenStaff && !isAdmin) {
    return <KitchenStaffDashboard />;
  }

  const handleBulkCookingSubmit = (cookingData: any) => {
    const newJob = {
      id: Date.now().toString(),
      ...cookingData,
      status: 'in_progress',
      progress: 0
    };
    setBulkCookingJobs([...bulkCookingJobs, newJob]);
  };

  const getOrderPriority = (orderTime: string) => {
    const timeDiff = Date.now() - new Date(orderTime).getTime();
    const minutes = Math.floor(timeDiff / (1000 * 60));
    
    if (minutes > 45) return 'high';
    if (minutes > 30) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-green-100 border-green-300 text-green-800';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Kitchen Operations</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {(isAdmin || isKitchenStaff) && (
            <button
              onClick={() => setShowMenuManagement(true)}
              className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 touch-manipulation"
            >
              <Menu className="h-4 w-4" />
              <span>Manage Menu</span>
            </button>
          )}
          {isKitchenStaff && (
            <button
              onClick={() => setShowBulkCookingModal(true)}
              className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 touch-manipulation"
            >
              <Layers className="h-4 w-4" />
              <span>Bulk Cooking</span>
            </button>
          )}
          <div className="bg-orange-100 px-3 py-2 rounded-full text-center sm:text-left">
            <span className="text-sm font-medium text-orange-800">Active Orders: {activeOrders.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        {/* Bulk Cooking Jobs */}
        {bulkCookingJobs.length > 0 && (
          <div className="lg:col-span-3 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-blue-500" />
                  <span>Bulk Cooking Jobs</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bulkCookingJobs.map((job) => (
                    <div key={job.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {job.preset ? job.preset.name : 'Custom Bulk Cooking'}
                          </h4>
                          <p className="text-sm text-gray-600">{job.totalServings} servings</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {job.items.slice(0, 2).map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{item.recipe?.name || 'Unknown Recipe'}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                        {job.items.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{job.items.length - 2} more items
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{job.estimatedTime} min</span>
                        </div>
                        <span>{job.progress}% complete</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors touch-manipulation">
                          Update Progress
                        </button>
                        <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors touch-manipulation">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-orange-500" />
                <span>Active Orders</span>
              </h3>
            </div>
            <div className="p-6">
              {activeOrders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active orders. Great job!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => {
                    const priority = getOrderPriority(order.orderTime);
                    return (
                      <div key={order.id} className={`border-2 rounded-lg p-4 ${getPriorityColor(priority)}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">Order #{order.id}</h4>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(order.orderTime)}</span>
                            </div>
                            <span className="text-xs font-medium capitalize">{priority} priority</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.map((item, index) => {
                            const recipe = recipes.find(r => r.id === item.recipeId);
                            return (
                              <div key={index} className="flex items-center justify-between bg-white bg-opacity-50 rounded p-2">
                                <span className="font-medium">{recipe?.name || 'Unknown Recipe'}</span>
                                <span className="text-sm">Qty: {item.quantity}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          {isKitchenStaff && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'out_for_delivery', user?.name)}
                              className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors touch-manipulation"
                            >
                              Mark Ready
                            </button>
                          )}
                          {isAdmin && (
                            <div className="flex-1 text-center py-3 px-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <span className="text-blue-800 font-medium">
                                Status: {order.status === 'cooking' ? 'In Progress' : 'Ready for Delivery'}
                              </span>
                            </div>
                          )}
                          <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation">
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipe Quick Access */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recipe Quick Access</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {recipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(selectedRecipe === recipe.id ? null : recipe.id)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                        <p className="text-sm text-gray-600">{recipe.category}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>{recipe.prepTime + recipe.cookTime} min</div>
                        <div>{recipe.servings} servings</div>
                      </div>
                    </div>
                    
                    {selectedRecipe === recipe.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-2">Ingredients:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>
                              • {ingredient.quantity} {ingredient.unit} {/* ingredient name would be looked up */}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kitchen Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Kitchen Status</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Orders in Queue</span>
                <span className="font-semibold">{activeOrders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Prep Time</span>
                <span className="font-semibold">25 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Staff on Duty</span>
                <span className="font-semibold">3 chefs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Kitchen Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BulkCookingModal
        isOpen={showBulkCookingModal}
        onClose={() => setShowBulkCookingModal(false)}
        onSubmit={handleBulkCookingSubmit}
      />
      
      <MenuManagement
        isOpen={showMenuManagement}
        onClose={() => setShowMenuManagement(false)}
      />
    </div>
  );
}