import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, User, FileText, Hash, Filter, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StockMovementHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: string;
}

export function StockMovementHistory({ isOpen, onClose, itemId }: StockMovementHistoryProps) {
  const { stockMovements, inventoryItems } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  if (!isOpen) return null;

  // Filter movements
  let filteredMovements = stockMovements;
  
  if (itemId) {
    filteredMovements = filteredMovements.filter(m => m.inventoryItemId === itemId);
  }
  
  if (searchTerm) {
    filteredMovements = filteredMovements.filter(m => {
      const item = inventoryItems.find(i => i.id === m.inventoryItemId);
      return item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
             m.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
  
  if (typeFilter !== 'all') {
    filteredMovements = filteredMovements.filter(m => m.movementType === typeFilter);
  }
  
  if (dateFilter !== 'all') {
    const today = new Date();
    const filterDate = new Date();
    
    switch (dateFilter) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(today.getMonth() - 1);
        break;
    }
    
    filteredMovements = filteredMovements.filter(m => 
      new Date(m.movementDate) >= filterDate
    );
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN');
  };

  const getMovementIcon = (type: string) => {
    return type === 'in' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getMovementColor = (type: string) => {
    return type === 'in' 
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-red-50 border-red-200 text-red-800';
  };

  const totalStockIn = filteredMovements
    .filter(m => m.movementType === 'in')
    .reduce((sum, m) => sum + m.quantity, 0);
    
  const totalStockOut = filteredMovements
    .filter(m => m.movementType === 'out')
    .reduce((sum, m) => sum + m.quantity, 0);
    
  const totalValue = filteredMovements
    .filter(m => m.movementType === 'in')
    .reduce((sum, m) => sum + m.totalCost, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Stock Movement History</h2>
            {itemId && (
              <p className="text-gray-600">
                Showing movements for: {inventoryItems.find(i => i.id === itemId)?.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredMovements.length}</div>
                <div className="text-sm text-blue-700">Total Movements</div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalStockIn}</div>
                <div className="text-sm text-green-700">Stock In</div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{totalStockOut}</div>
                <div className="text-sm text-red-700">Stock Out</div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">₹{totalValue.toFixed(0)}</div>
                <div className="text-sm text-purple-700">Total Value</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search movements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Types</option>
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
              </select>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setDateFilter('all');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Movement List */}
          <div className="space-y-3">
            {filteredMovements.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No stock movements found</p>
                <p className="text-sm text-gray-400">Stock movements will appear here when recorded</p>
              </div>
            ) : (
              filteredMovements.map((movement) => {
                const item = inventoryItems.find(i => i.id === movement.inventoryItemId);
                return (
                  <div key={movement.id} className={`border-2 rounded-lg p-4 ${getMovementColor(movement.movementType)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getMovementIcon(movement.movementType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{item?.name || 'Unknown Item'}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              movement.movementType === 'in' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {movement.movementType === 'in' ? 'STOCK IN' : 'STOCK OUT'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <div><span className="text-gray-600">Quantity:</span> <span className="font-medium">{movement.quantity} {item?.unit}</span></div>
                              <div><span className="text-gray-600">Reason:</span> <span className="font-medium">{movement.reason}</span></div>
                              {movement.referenceNumber && (
                                <div><span className="text-gray-600">Reference:</span> <span className="font-medium">{movement.referenceNumber}</span></div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">By:</span> 
                                <span className="font-medium">{movement.performedBy}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">Date:</span> 
                                <span className="font-medium">{formatDateTime(movement.movementDate)}</span>
                              </div>
                              {movement.movementType === 'in' && movement.totalCost > 0 && (
                                <div><span className="text-gray-600">Cost:</span> <span className="font-medium">₹{movement.totalCost.toFixed(2)}</span></div>
                              )}
                            </div>
                          </div>
                          
                          {movement.notes && (
                            <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                              <span className="text-gray-600">Notes:</span> {movement.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          movement.movementType === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.movementType === 'in' ? '+' : '-'}{movement.quantity}
                        </div>
                        <div className="text-xs text-gray-500">{item?.unit}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}