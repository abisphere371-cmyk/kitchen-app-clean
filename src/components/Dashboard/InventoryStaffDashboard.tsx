import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, Plus, Search, Truck, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export function InventoryStaffDashboard() {
  const { inventoryItems, suppliers } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate inventory insights
  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock);
  const outOfStockItems = inventoryItems.filter(item => item.currentStock === 0);
  const expiringItems = inventoryItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  });

  const totalInventoryValue = inventoryItems.reduce((sum, item) => 
    sum + (item.currentStock * item.costPerUnit), 0
  );

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (item: any) => {
    if (item.currentStock === 0) return 'out';
    if (item.currentStock <= item.minStock) return 'low';
    if (item.currentStock >= item.maxStock * 0.8) return 'good';
    return 'normal';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'out': return 'text-red-600 bg-red-50 border-red-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vegetables': return '🥬';
      case 'meat': return '🥩';
      case 'dairy': return '🥛';
      case 'spices': return '🌶️';
      case 'grains': return '🌾';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Welcome, {user?.name}! 📦</h1>
            <p className="text-blue-100 text-sm sm:text-base">Keep our kitchen well-stocked and organized</p>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold">{inventoryItems.length}</div>
            <div className="text-blue-100 text-sm sm:text-base">Total Items</div>
          </div>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-1 sm:p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Low Stock Items</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-orange-600">{outOfStockItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">{expiringItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">₹{Math.round(totalInventoryValue).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>⚠️ Critical Inventory Alerts</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Low Stock */}
              {lowStockItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-3">🔴 Low Stock Items ({lowStockItems.length})</h4>
                  <div className="space-y-2">
                    {lowStockItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                        <div className="flex items-center space-x-2">
                          <span>{getCategoryIcon(item.category)}</span>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600 font-bold">{item.currentStock} {item.unit}</div>
                          <div className="text-xs text-gray-600">Min: {item.minStock}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Out of Stock */}
              {outOfStockItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-600 mb-3">🟠 Out of Stock ({outOfStockItems.length})</h4>
                  <div className="space-y-2">
                    {outOfStockItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                        <div className="flex items-center space-x-2">
                          <span>{getCategoryIcon(item.category)}</span>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="text-orange-600 font-bold">0 {item.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expiring Soon */}
              {expiringItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-3">🟡 Expiring Soon ({expiringItems.length})</h4>
                  <div className="space-y-2">
                    {expiringItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                        <div className="flex items-center space-x-2">
                          <span>{getCategoryIcon(item.category)}</span>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-600 font-bold">{item.currentStock} {item.unit}</div>
                          <div className="text-xs text-gray-600">
                            Expires: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Inventory Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">📋 Inventory Overview</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.slice(0, 12).map((item) => {
              const status = getStockStatus(item);
              return (
                <div key={item.id} className={`p-4 rounded-lg border-2 ${getStockColor(status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'out' ? 'bg-red-100 text-red-800' :
                      status === 'low' ? 'bg-orange-100 text-orange-800' :
                      status === 'good' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {status === 'out' ? 'OUT' : 
                       status === 'low' ? 'LOW' : 
                       status === 'good' ? 'GOOD' : 'OK'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-bold">{item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min/Max:</span>
                      <span>{item.minStock}/{item.maxStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value:</span>
                      <span>₹{(item.currentStock * item.costPerUnit).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="text-xs">{item.supplier}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Supplier Quick Access */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Truck className="h-5 w-5 text-blue-500" />
            <span>🚚 Active Suppliers</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suppliers.filter(s => s.is_active).slice(0, 4).map((supplier) => (
              <div key={supplier.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-900">{supplier.name}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>📞 {supplier.contact}</div>
                  <div>⭐ {supplier.rating}/5</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {supplier.categories.map((cat, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}