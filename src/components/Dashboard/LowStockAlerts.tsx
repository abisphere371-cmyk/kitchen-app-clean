import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function LowStockAlerts() {
  const { inventoryItems } = useApp();
  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
        </div>
      </div>
      <div className="p-6">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">All items are well stocked!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-red-50 rounded-lg border border-red-200 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                  </div>
                </div>
                <div className="flex justify-between sm:block sm:text-right">
                  <p className="text-lg font-bold text-red-600">{item.currentStock} {item.unit}</p>
                  <p className="text-sm text-gray-600">Min: {item.minStock} {item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}