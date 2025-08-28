import React, { useState } from 'react';
import { X, Plus, Minus, Package, TrendingUp, TrendingDown, Calendar, User, FileText, Hash } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: any;
}

export function StockMovementModal({ isOpen, onClose, selectedItem }: StockMovementModalProps) {
  const { inventoryItems, addStockMovement } = useApp();
  const { user } = useAuth();
  
  const [movementData, setMovementData] = useState({
    inventoryItemId: selectedItem?.id || '',
    movementType: 'in' as 'in' | 'out',
    quantity: 0,
    reason: '',
    referenceNumber: '',
    unitCost: 0,
    notes: '',
    movementDate: new Date().toISOString().split('T')[0]
  });

  const stockInReasons = [
    'Purchase Order Received',
    'Supplier Delivery',
    'Stock Transfer In',
    'Return from Kitchen',
    'Inventory Adjustment',
    'Emergency Purchase',
    'Bulk Purchase',
    'Other'
  ];

  const stockOutReasons = [
    'Recipe Usage',
    'Kitchen Consumption',
    'Waste/Spoilage',
    'Stock Transfer Out',
    'Inventory Adjustment',
    'Expired Items',
    'Damaged Items',
    'Staff Consumption',
    'Other'
  ];

  if (!isOpen) return null;

  const selectedInventoryItem = inventoryItems.find(item => item.id === movementData.inventoryItemId);
  const totalCost = movementData.quantity * movementData.unitCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movementData.inventoryItemId) {
      alert('Please select an inventory item');
      return;
    }
    
    if (movementData.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (!movementData.reason) {
      alert('Please select a reason for the stock movement');
      return;
    }

    // Check if stock out quantity exceeds current stock
    if (movementData.movementType === 'out' && selectedInventoryItem) {
      if (movementData.quantity > selectedInventoryItem.currentStock) {
        if (!confirm(`Warning: You're trying to remove ${movementData.quantity} ${selectedInventoryItem.unit}, but only ${selectedInventoryItem.currentStock} ${selectedInventoryItem.unit} are available. This will result in negative stock. Continue?`)) {
          return;
        }
      }
    }

    const movement = {
      ...movementData,
      totalCost: totalCost,
      performedBy: user?.name || 'Unknown User'
    };

    addStockMovement(movement);
    
    // Reset form
    setMovementData({
      inventoryItemId: '',
      movementType: 'in',
      quantity: 0,
      reason: '',
      referenceNumber: '',
      unitCost: 0,
      notes: '',
      movementDate: new Date().toISOString().split('T')[0]
    });
    
    onClose();
  };

  const getCurrentReasons = () => {
    return movementData.movementType === 'in' ? stockInReasons : stockOutReasons;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Stock Movement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Movement Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Movement Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMovementData(prev => ({ ...prev, movementType: 'in', reason: '', unitCost: selectedInventoryItem?.costPerUnit || 0 }))}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  movementData.movementType === 'in'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <span className="font-semibold">Stock In</span>
                </div>
                <p className="text-sm text-gray-600">Add inventory to stock</p>
              </button>
              
              <button
                type="button"
                onClick={() => setMovementData(prev => ({ ...prev, movementType: 'out', reason: '', unitCost: 0 }))}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  movementData.movementType === 'out'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                  <span className="font-semibold">Stock Out</span>
                </div>
                <p className="text-sm text-gray-600">Remove inventory from stock</p>
              </button>
            </div>
          </div>

          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Item <span className="text-red-500">*</span>
            </label>
            <select
              value={movementData.inventoryItemId}
              onChange={(e) => {
                const item = inventoryItems.find(i => i.id === e.target.value);
                setMovementData(prev => ({ 
                  ...prev, 
                  inventoryItemId: e.target.value,
                  unitCost: movementData.movementType === 'in' ? (item?.costPerUnit || 0) : 0
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select an inventory item</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - Current: {item.currentStock} {item.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Display */}
          {selectedInventoryItem && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Current Stock Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                <div>Current Stock: <span className="font-bold">{selectedInventoryItem.currentStock} {selectedInventoryItem.unit}</span></div>
                <div>Min Stock: <span className="font-bold">{selectedInventoryItem.minStock} {selectedInventoryItem.unit}</span></div>
                <div>Max Stock: <span className="font-bold">{selectedInventoryItem.maxStock} {selectedInventoryItem.unit}</span></div>
                <div>Cost per Unit: <span className="font-bold">₹{selectedInventoryItem.costPerUnit}</span></div>
              </div>
            </div>
          )}

          {/* Quantity and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setMovementData(prev => ({ ...prev, quantity: Math.max(0, prev.quantity - 1) }))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  step="0.01"
                  value={movementData.quantity}
                  onChange={(e) => setMovementData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                  min="0"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMovementData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {selectedInventoryItem && (
                <p className="text-xs text-gray-500 mt-1">
                  Unit: {selectedInventoryItem.unit}
                </p>
              )}
            </div>

            {movementData.movementType === 'in' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Cost (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={movementData.unitCost}
                  onChange={(e) => setMovementData(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total Cost: ₹{totalCost.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={movementData.reason}
              onChange={(e) => setMovementData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select reason for {movementData.movementType === 'in' ? 'stock in' : 'stock out'}</option>
              {getCurrentReasons().map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Number (Optional)
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={movementData.referenceNumber}
                onChange={(e) => setMovementData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="PO#, Invoice#, etc."
              />
            </div>
          </div>

          {/* Movement Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Movement Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={movementData.movementDate}
                onChange={(e) => setMovementData(prev => ({ ...prev, movementDate: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={movementData.notes}
                onChange={(e) => setMovementData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Add any additional notes about this stock movement..."
              />
            </div>
          </div>

          {/* Summary */}
          {movementData.inventoryItemId && movementData.quantity > 0 && (
            <div className={`p-4 rounded-lg border-2 ${
              movementData.movementType === 'in' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h4 className={`font-medium mb-2 ${
                movementData.movementType === 'in' ? 'text-green-800' : 'text-red-800'
              }`}>
                Movement Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Item:</span>
                  <span className="font-medium">{selectedInventoryItem?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Action:</span>
                  <span className="font-medium">
                    {movementData.movementType === 'in' ? '➕ Add' : '➖ Remove'} {movementData.quantity} {selectedInventoryItem?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current Stock:</span>
                  <span className="font-medium">{selectedInventoryItem?.currentStock} {selectedInventoryItem?.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Stock:</span>
                  <span className={`font-bold ${
                    movementData.movementType === 'in' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movementData.movementType === 'in' 
                      ? (selectedInventoryItem?.currentStock || 0) + movementData.quantity
                      : Math.max(0, (selectedInventoryItem?.currentStock || 0) - movementData.quantity)
                    } {selectedInventoryItem?.unit}
                  </span>
                </div>
                {movementData.movementType === 'in' && movementData.unitCost > 0 && (
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-bold text-green-600">₹{totalCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Performed By:</span>
                  <span className="font-medium">{user?.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                movementData.movementType === 'in'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {movementData.movementType === 'in' ? '➕ Add Stock' : '➖ Remove Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}