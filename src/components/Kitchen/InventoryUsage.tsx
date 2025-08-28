import React, { useState, useEffect } from 'react';
import { Package, Minus, Plus, ChefHat, Clock, Save, Search, Filter, History, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface UsageItem {
  inventoryItemId: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export function InventoryUsage() {
  const { inventoryItems, addStockMovement, stockMovements, loading, error } = useApp();
  const { user } = useAuth();
  const [usageItems, setUsageItems] = useState<UsageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [batchNotes, setBatchNotes] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('InventoryUsage - Current inventory items:', inventoryItems);
    console.log('InventoryUsage - Inventory items length:', inventoryItems.length);
    console.log('InventoryUsage - First few items:', inventoryItems.slice(0, 3));
    console.log('InventoryUsage - Loading:', loading);
    console.log('InventoryUsage - Error:', error);
    console.log('InventoryUsage - Search term:', searchTerm);
    console.log('InventoryUsage - Category filter:', categoryFilter);
    console.log('InventoryUsage - Filtered items count:', filteredItems.length);
    console.log('InventoryUsage - Filtered items:', filteredItems.slice(0, 3));
  }, [inventoryItems, loading, error]);

  // Kitchen-specific stock out reasons
  const kitchenReasons = [
    'Recipe Preparation',
    'Cooking Process',
    'Food Preparation',
    'Meal Service',
    'Taste Testing',
    'Staff Meal',
    'Waste/Spoilage',
    'Expired Items',
    'Damaged During Prep',
    'Over Portioning',
    'Customer Special Request',
    'Other Kitchen Use'
  ];

  const categories = ['all', 'vegetables', 'meat', 'dairy', 'spices', 'grains', 'other'];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get today's usage by current user
  const todayUsage = stockMovements.filter(movement => {
    const today = new Date().toDateString();
    const movementDate = new Date(movement.movementDate).toDateString();
    return movementDate === today && 
           movement.movementType === 'out' && 
           movement.performedBy === user?.name;
  });

  const addUsageItem = (item: any) => {
    const existingIndex = usageItems.findIndex(ui => ui.inventoryItemId === item.id);

    if (existingIndex >= 0) {
      // Update existing item quantity
      setUsageItems(prev => prev.map((ui, index) => 
        index === existingIndex 
          ? { ...ui, quantity: ui.quantity + 1 }
          : ui
      ));
    } else {
      // Add new usage item
      setUsageItems(prev => [...prev, {
        inventoryItemId: item.id,
        quantity: 1,
        reason: 'Recipe Preparation',
        notes: ''
      }]);
    }
  };

  const updateUsageItem = (index: number, field: keyof UsageItem, value: any) => {
    setUsageItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeUsageItem = (index: number) => {
    setUsageItems(prev => prev.filter((_, i) => i !== index));
  };

  const submitUsage = async () => {
    if (usageItems.length === 0) {
      alert('Please add items to record usage');
      return;
    }

    // Validate all items have valid quantities
    const invalidItems = usageItems.filter(item => item.quantity <= 0);
    if (invalidItems.length > 0) {
      alert('All items must have quantity greater than 0');
      return;
    }

    // Check for insufficient stock
    const insufficientStock = usageItems.filter(usageItem => {
      const inventoryItem = inventoryItems.find(item => item.id === usageItem.inventoryItemId);
      return inventoryItem && usageItem.quantity > inventoryItem.currentStock;
    });

    if (insufficientStock.length > 0) {
      const itemNames = insufficientStock.map(usageItem => {
        const item = inventoryItems.find(i => i.id === usageItem.inventoryItemId);
        return `${item?.name} (Need: ${usageItem.quantity}, Available: ${item?.currentStock})`;
      }).join('\n');
      
      if (!confirm(`Warning: Insufficient stock for:\n\n${itemNames}\n\nThis will result in negative stock. Continue?`)) {
        return;
      }
    }

    try {
      // Submit each usage item as a stock movement
      for (const usageItem of usageItems) {
        const inventoryItem = inventoryItems.find(item => item.id === usageItem.inventoryItemId);
        
        await addStockMovement({
          inventoryItemId: usageItem.inventoryItemId,
          movementType: 'out',
          quantity: usageItem.quantity,
          reason: usageItem.reason,
          referenceNumber: `KITCHEN-${Date.now()}`,
          unitCost: 0, // No cost for stock out
          totalCost: 0,
          performedBy: user?.name || 'Kitchen Staff',
          notes: usageItem.notes || batchNotes || `Kitchen usage by ${user?.name}`,
          movementDate: new Date().toISOString()
        });
      }

      // Clear the usage form
      setUsageItems([]);
      setBatchNotes('');
      
      alert(`✅ Stock usage recorded successfully!\n\n${usageItems.length} item${usageItems.length !== 1 ? 's' : ''} updated.\n\nInventory levels have been automatically updated.`);
      
    } catch (error) {
      console.error('Error recording stock usage:', error);
      alert('❌ Error recording stock usage. Please try again.');
    }
  };

  const getStockStatus = (item: any) => {
    if (item.currentStock <= 0) return 'out';
    if (item.currentStock <= item.minStock) return 'low';
    return 'normal';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'out': return 'text-red-600 bg-red-50 border-red-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory items...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-medium text-red-800">Error Loading Inventory</h3>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kitchen Inventory Usage</h2>
          <p className="text-gray-600 hidden sm:block">Record ingredients used during cooking and food preparation</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 touch-manipulation"
          >
            <History className="h-4 w-4" />
            <span>{showHistory ? 'Hide' : 'Show'} Today's Usage</span>
          </button>
          {usageItems.length > 0 && (
            <button
              onClick={submitUsage}
              className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 font-semibold touch-manipulation"
            >
              <Save className="h-4 w-4" />
              <span>Submit Usage ({usageItems.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-1 sm:p-2 bg-orange-100 rounded-lg">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Items to Record</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{usageItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Usage</p>
              <p className="text-2xl font-bold text-blue-600">{todayUsage.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">
                {inventoryItems.filter(item => item.currentStock <= item.minStock).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Items</p>
              <p className="text-2xl font-bold text-green-600">
                {inventoryItems.filter(item => item.currentStock > item.minStock).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Usage History */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <History className="h-5 w-5 text-blue-500" />
              <span>Today's Kitchen Usage</span>
            </h3>
          </div>
          <div className="p-6">
            {todayUsage.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No usage recorded today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayUsage.map((movement) => {
                  const item = inventoryItems.find(i => i.id === movement.inventoryItemId);
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getCategoryIcon(item?.category || 'other')}</span>
                        <div>
                          <p className="font-medium text-gray-900">{item?.name}</p>
                          <p className="text-sm text-gray-600">{movement.reason}</p>
                          <p className="text-xs text-gray-500">{formatTime(movement.movementDate)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">-{movement.quantity}</div>
                        <div className="text-sm text-gray-600">{item?.unit}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Usage Batch */}
      {usageItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Minus className="h-5 w-5 text-red-500" />
              <span>Current Usage Batch ({usageItems.length} items)</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Review and submit your ingredient usage. This will automatically update inventory levels.
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4 mb-6">
              {usageItems.map((usageItem, index) => {
                const item = inventoryItems.find(i => i.id === usageItem.inventoryItemId);
                const stockStatus = getStockStatus(item);
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getCategoryIcon(item?.category || 'other')}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{item?.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{item?.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStockColor(stockStatus)}`}>
                              Current: {item?.currentStock} {item?.unit}
                            </span>
                            {stockStatus === 'low' && (
                              <span className="text-xs text-red-600 font-medium">⚠️ Low Stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeUsageItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Used</label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateUsageItem(index, 'quantity', Math.max(1, usageItem.quantity - 1))}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            value={usageItem.quantity}
                            onChange={(e) => updateUsageItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                            min="1"
                          />
                          <button
                            type="button"
                            onClick={() => updateUsageItem(index, 'quantity', usageItem.quantity + 1)}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <span className="text-sm text-gray-600">{item?.unit}</span>
                        </div>
                        {usageItem.quantity > (item?.currentStock || 0) && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ Exceeds available stock by {usageItem.quantity - (item?.currentStock || 0)}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                        <select
                          value={usageItem.reason}
                          onChange={(e) => updateUsageItem(index, 'reason', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          {kitchenReasons.map((reason) => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                        <input
                          type="text"
                          value={usageItem.notes || ''}
                          onChange={(e) => updateUsageItem(index, 'notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Batch Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch Notes (Applied to all items)</label>
              <textarea
                value={batchNotes}
                onChange={(e) => setBatchNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={2}
                placeholder="e.g., Lunch service preparation, Evening batch cooking, etc."
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={submitUsage}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 font-semibold"
              >
                <Minus className="h-5 w-5" />
                <span>Record Stock Usage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Inventory */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Ingredients</h3>
            <div className="text-sm text-gray-500">
              Total: {inventoryItems.length} items | Filtered: {filteredItems.length} items
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {inventoryItems.length === 0 
                  ? 'No inventory items available. Please add items in the Inventory tab first.' 
                  : searchTerm || categoryFilter !== 'all' 
                    ? 'No items match your search criteria' 
                    : 'No inventory items found'
                }
              </p>
              {(searchTerm || categoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                  }}
                  className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Clear filters
                </button>
              )}
              {inventoryItems.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> It looks like no inventory items have been loaded from the database. 
                    Please check if the default inventory migration has been applied or add items manually in the Inventory tab.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                const isInUsage = usageItems.some(ui => ui.inventoryItemId === item.id);
                const usageQuantity = usageItems.find(ui => ui.inventoryItemId === item.id)?.quantity || 0;
                
                return (
                  <div key={item.id} className={`border-2 rounded-lg p-4 transition-colors ${
                    isInUsage ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(item.category)}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStockColor(stockStatus)}`}>
                        {stockStatus === 'out' ? 'OUT' : 
                         stockStatus === 'low' ? 'LOW' : 'OK'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-bold">{item.currentStock} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Stock:</span>
                        <span>{item.minStock} {item.unit}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Supplier:</span>
                        <span className="truncate ml-2">{item.supplier}</span>
                      </div>
                      {item.expiryDate && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Expires:</span>
                          <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {isInUsage && (
                      <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-orange-800">In Usage Batch</span>
                          <span className="text-lg font-bold text-orange-600">-{usageQuantity} {item.unit}</span>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => addUsageItem(item)}
                      disabled={item.currentStock <= 0}
                      className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 touch-manipulation ${
                        item.currentStock <= 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isInUsage
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      <Minus className="h-4 w-4" />
                      <span>{isInUsage ? 'Add More' : 'Use Ingredient'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}