import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Edit2, AlertTriangle, X, TrendingUp, TrendingDown, History, Eye, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StockMovementModal } from './StockMovementModal';
import { StockMovementHistory } from './StockMovementHistory';

export function InventoryList() {
  const { inventoryItems, updateInventoryItem, addInventoryItem, deleteInventoryItem, suppliers, stockMovements, loading, error, lastUpdated } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockMovementModal, setShowStockMovementModal] = useState(false);
  const [showStockHistoryModal, setShowStockHistoryModal] = useState(false);
  const [showUpdateInventoryModal, setShowUpdateInventoryModal] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<any>(null);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<any>(null);
  const [updateInventoryData, setUpdateInventoryData] = useState({
    selectedItemId: '',
    newQuantity: 0,
    unitPrice: 0
  });
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'vegetables' as const,
    currentStock: 0,
    unit: '',
    minStock: 0,
    maxStock: 0,
    costPerUnit: 0,
    supplier: '',
    lastRestocked: new Date().toISOString().split('T')[0],
    expiryDate: ''
  });

  // Debug suppliers in inventory
  useEffect(() => {
    console.log('InventoryList - Available suppliers:', suppliers);
    console.log('InventoryList - Suppliers count:', suppliers.length);
    console.log('InventoryList - Last updated:', lastUpdated);
    console.log('InventoryList - Stock movements:', stockMovements.length);
  }, [suppliers, lastUpdated, stockMovements]);

  // Reset editing state when opening add modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setShowEditModal(false);
    setShowAddModal(true);
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'vegetables', 'meat', 'dairy', 'spices', 'grains', 'other'];

  const getStockStatus = (item: any) => {
    if (item.currentStock <= 0) return 'out';
    if (item.currentStock <= item.minStock) return 'low';
    if (item.currentStock >= item.maxStock * 0.8) return 'high';
    return 'normal';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'out': return 'text-red-600 bg-red-50 border-red-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getRecentMovements = (itemId: string) => {
    return stockMovements.filter(movement => movement.inventoryItemId === itemId);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedItem: any) => {
    updateInventoryItem(updatedItem.id, updatedItem);
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleAddItem = () => {
    // More specific validation
    const missingFields = [];
    if (!newItem.name.trim()) missingFields.push('Item Name');
    if (!newItem.unit.trim()) missingFields.push('Unit');
    if (!newItem.supplier.trim()) missingFields.push('Supplier');
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    addInventoryItem(newItem);
    setNewItem({
      name: '',
      category: 'vegetables',
      currentStock: 0,
      unit: '',
      minStock: 0,
      maxStock: 0,
      costPerUnit: 0,
      supplier: '',
      lastRestocked: new Date().toISOString().split('T')[0],
      expiryDate: ''
    });
    setShowAddModal(false);
  };

  const handleStockMovement = (item: any) => {
    setSelectedItemForMovement(item);
    setShowStockMovementModal(true);
  };

  const handleViewHistory = (item: any) => {
    setSelectedItemForHistory(item);
    setShowStockHistoryModal(true);
  };

  const handleDeleteItem = async (item: any) => {
    const confirmed = confirm(`Are you sure you want to delete "${item.name}"?\n\nThis action cannot be undone.`);
    
    if (confirmed) {
      try {
        await deleteInventoryItem(item.id);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('❌ Failed to delete item. Please try again.');
      }
    }
  };

  const handleUpdateInventory = async () => {
    if (!updateInventoryData.selectedItemId) {
      alert('Please select an inventory item');
      return;
    }

    if (updateInventoryData.newQuantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }

    const selectedItem = inventoryItems.find(item => item.id === updateInventoryData.selectedItemId);
    if (!selectedItem) {
      alert('Selected item not found');
      return;
    }

    try {
      // Add new quantity to current stock
      const finalQuantity = selectedItem.currentStock + updateInventoryData.newQuantity;
      
      await updateInventoryItem(updateInventoryData.selectedItemId, {
        currentStock: finalQuantity,
        lastRestocked: new Date().toISOString().split('T')[0]
      });

      // Reset form
      setUpdateInventoryData({
        selectedItemId: '',
        newQuantity: 0,
        unitPrice: 0
      });

      setShowUpdateInventoryModal(false);
      
      alert(`✅ Inventory updated successfully!\n\n${selectedItem.name}: ${selectedItem.currentStock} + ${updateInventoryData.newQuantity} = ${finalQuantity} ${selectedItem.unit}`);
      
      // Update cost per unit if price was provided
      if (updateInventoryData.unitPrice > 0 && updateInventoryData.unitPrice !== selectedItem.costPerUnit) {
        await updateInventoryItem(updateInventoryData.selectedItemId, {
          costPerUnit: updateInventoryData.unitPrice
        });
      }
      
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('❌ Error updating inventory. Please try again.');
    }
  };

  const handleItemSelection = (itemId: string) => {
    const selectedItem = inventoryItems.find(item => item.id === itemId);
    setUpdateInventoryData({
      selectedItemId: itemId,
      newQuantity: 0,
      unitPrice: selectedItem?.costPerUnit || 0
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 hidden sm:block">Manage stock levels with manual in/out operations</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => setShowStockHistoryModal(true)}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 touch-manipulation"
          >
            <History className="h-4 w-4" />
            <span>View All History</span>
          </button>
          <button
            onClick={() => setShowUpdateInventoryModal(true)}
            className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2 touch-manipulation"
          >
            <Package className="h-4 w-4" />
            <span>Update Inventory</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Items</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {inventoryItems.filter(item => item.currentStock <= item.minStock).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock Movements Today</p>
              <p className="text-2xl font-bold text-green-600">
                {stockMovements.filter(m => {
                  const today = new Date().toDateString();
                  return new Date(m.movementDate).toDateString() === today;
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{Math.round(inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
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

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min/Max</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                const recentMovements = getRecentMovements(item.id);
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">Last restocked: {item.lastRestocked}</div>
                          {recentMovements.length > 0 && (
                            <div className="text-xs text-blue-600">
                              {recentMovements.length} recent movement{recentMovements.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.currentStock} {item.unit}</div>
                      {item.expiryDate && (
                        <div className="text-xs text-gray-500">
                          Expires: {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.minStock} / {item.maxStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{item.costPerUnit}</div>
                      <div className="text-xs text-gray-500">
                        Value: ₹{(item.currentStock * item.costPerUnit).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.supplier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {stockStatus === 'low' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {stockStatus === 'out' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStockColor(stockStatus)}`}>
                          {stockStatus === 'out' ? 'Out of Stock' :
                           stockStatus === 'low' ? 'Low Stock' : 
                           stockStatus === 'high' ? 'Well Stocked' : 'Normal'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStockMovement(item)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors flex items-center space-x-1"
                          title="Add/Remove Stock"
                        >
                          <TrendingUp className="h-3 w-3" />
                          <span>Stock</span>
                        </button>
                        <button
                          onClick={() => handleViewHistory(item)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors flex items-center space-x-1"
                          title="View Movement History"
                        >
                          <History className="h-3 w-3" />
                          <span>History</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title="Edit Item Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden p-4">
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item);
              const recentMovements = getRecentMovements(item.id);
              
              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEditItem(item)}
                      className="text-orange-600 hover:text-orange-900 transition-colors p-2 touch-manipulation"
                      title="Edit Item Details"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => handleDeleteItem(item)}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 touch-manipulation"
                        title="Delete Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Current Stock:</span>
                      <div className="font-medium text-gray-900">{item.currentStock} {item.unit}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Min/Max:</span>
                      <div className="font-medium text-gray-900">{item.minStock}/{item.maxStock}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost/Unit:</span>
                      <div className="font-medium text-gray-900">₹{item.costPerUnit}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Value:</span>
                      <div className="font-medium text-gray-900">₹{(item.currentStock * item.costPerUnit).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-gray-600 text-sm">Supplier:</span>
                    <div className="font-medium text-gray-900">{item.supplier}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {stockStatus === 'low' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {stockStatus === 'out' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStockColor(stockStatus)}`}>
                        {stockStatus === 'out' ? 'Out of Stock' :
                         stockStatus === 'low' ? 'Low Stock' : 
                         stockStatus === 'high' ? 'Well Stocked' : 'Normal'}
                      </span>
                    </div>
                    {recentMovements.length > 0 && (
                      <div className="text-xs text-blue-600">
                        {recentMovements.length} recent movement{recentMovements.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStockMovement(item)}
                      className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center justify-center space-x-1 touch-manipulation"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Stock</span>
                    </button>
                    <button
                      onClick={() => handleViewHistory(item)}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 touch-manipulation"
                    >
                      <History className="h-4 w-4" />
                      <span>History</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Item Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900">{editingItem.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{editingItem.category}</p>
                <p className="text-xs text-orange-600 mt-1">
                  Note: Use Stock Movement buttons to change stock levels
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock Level</label>
                  <input
                    type="number"
                    value={editingItem.minStock}
                    onChange={(e) => setEditingItem({...editingItem, minStock: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock Level</label>
                  <input
                    type="number"
                    value={editingItem.maxStock}
                    onChange={(e) => setEditingItem({...editingItem, maxStock: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standard Cost per Unit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.costPerUnit}
                    onChange={(e) => setEditingItem({...editingItem, costPerUnit: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={editingItem.expiryDate || ''}
                    onChange={(e) => setEditingItem({...editingItem, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(editingItem)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter item name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="meat">Meat</option>
                    <option value="dairy">Dairy</option>
                    <option value="spices">Spices</option>
                    <option value="grains">Grains</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({...newItem, currentStock: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use Stock Movement after creation to add initial stock with proper tracking</p>
                </div>
                  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="pieces">Pieces</option>
                    <option value="liters">Liters (L)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="packets">Packets</option>
                    <option value="boxes">Boxes</option>
                    <option value="bottles">Bottles</option>
                    <option value="cans">Cans</option>
                    <option value="bags">Bags</option>
                    <option value="bunches">Bunches</option>
                    <option value="dozens">Dozens</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock</label>
                    <input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({...newItem, minStock: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock</label>
                    <input
                      type="number"
                      value={newItem.maxStock}
                      onChange={(e) => setNewItem({...newItem, maxStock: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standard Cost per Unit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.costPerUnit}
                    onChange={(e) => setNewItem({...newItem, costPerUnit: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                  {suppliers.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500">
                        No suppliers available. Please add suppliers in the Suppliers tab first.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.filter(s => s.isActive !== false).map((supplier) => (
                        <option key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Inventory Modal */}
      {showUpdateInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Update Inventory Quantity</h3>
              <button
                onClick={() => setShowUpdateInventoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Inventory Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={updateInventoryData.selectedItemId}
                    onChange={(e) => handleItemSelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select an item to update</option>
                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - Current: {item.currentStock} {item.unit}
                      </option>
                    ))}
                  </select>
                </div>

                {updateInventoryData.selectedItemId && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Current Item Details</h4>
                      {(() => {
                        const selectedItem = inventoryItems.find(item => item.id === updateInventoryData.selectedItemId);
                        return selectedItem ? (
                          <div className="text-sm text-blue-700 space-y-1">
                            <div>Name: <span className="font-bold">{selectedItem.name}</span></div>
                            <div>Category: <span className="font-bold capitalize">{selectedItem.category}</span></div>
                            <div>Current Stock: <span className="font-bold">{selectedItem.currentStock} {selectedItem.unit}</span></div>
                            <div>Min Stock: <span className="font-bold">{selectedItem.minStock} {selectedItem.unit}</span></div>
                            <div>Max Stock: <span className="font-bold">{selectedItem.maxStock} {selectedItem.unit}</span></div>
                            <div>Supplier: <span className="font-bold">{selectedItem.supplier}</span></div>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity to Add <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={updateInventoryData.newQuantity}
                        onChange={(e) => setUpdateInventoryData(prev => ({
                          ...prev,
                          newQuantity: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="0"
                        placeholder="Enter quantity to add"
                        required
                      />
                      {(() => {
                        const selectedItem = inventoryItems.find(item => item.id === updateInventoryData.selectedItemId);
                        return selectedItem ? (
                          <p className="text-xs text-gray-500 mt-1">
                            Unit: {selectedItem.unit} | Will be added to current stock
                          </p>
                        ) : null;
                      })()}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={updateInventoryData.unitPrice}
                        onChange={(e) => setUpdateInventoryData(prev => ({
                          ...prev,
                          unitPrice: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="0"
                        placeholder="Enter unit price"
                        required
                      />
                      {(() => {
                        const selectedItem = inventoryItems.find(item => item.id === updateInventoryData.selectedItemId);
                        return selectedItem ? (
                          <p className="text-xs text-gray-500 mt-1">
                            Current price: ₹{selectedItem.costPerUnit} per {selectedItem.unit}
                          </p>
                        ) : null;
                      })()}
                    </div>

                    {(() => {
                      const selectedItem = inventoryItems.find(item => item.id === updateInventoryData.selectedItemId);
                      if (!selectedItem) return null;
                      
                      if (updateInventoryData.newQuantity === 0) return null;
                      
                      const finalQuantity = selectedItem.currentStock + updateInventoryData.newQuantity;
                      
                      return (
                        <div className="p-4 rounded-lg border-2 bg-green-50 border-green-200">
                          <h4 className="font-medium mb-2 text-green-800">
                            Update Summary
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Current Stock:</span>
                              <span className="font-medium">{selectedItem.currentStock} {selectedItem.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Adding:</span>
                              <span className="font-bold text-green-600">+{updateInventoryData.newQuantity} {selectedItem.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Final Stock:</span>
                              <span className="font-bold text-green-600">
                                {finalQuantity} {selectedItem.unit}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Unit Price:</span>
                              <span className="font-bold text-green-600">₹{updateInventoryData.unitPrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Cost:</span>
                              <span className="font-bold text-green-600">
                                ₹{(updateInventoryData.newQuantity * updateInventoryData.unitPrice).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUpdateInventoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateInventory}
                  disabled={!updateInventoryData.selectedItemId}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      <StockMovementModal
        isOpen={showStockMovementModal}
        onClose={() => {
          setShowStockMovementModal(false);
          setSelectedItemForMovement(null);
        }}
        selectedItem={selectedItemForMovement}
      />

      {/* Stock Movement History Modal */}
      <StockMovementHistory
        isOpen={showStockHistoryModal}
        onClose={() => {
          setShowStockHistoryModal(false);
          setSelectedItemForHistory(null);
        }}
        itemId={selectedItemForHistory?.id}
      />
    </div>
  );
}