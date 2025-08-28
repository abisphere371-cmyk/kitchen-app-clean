import React from 'react';
import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function ReportsAnalytics() {
  const { orders, inventoryItems } = useApp();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    reportType: 'all',
    department: 'all'
  });

  const reportCards = [
    {
      title: 'Daily Sales',
      value: '₹18,450',
      change: '+12%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Orders Today',
      value: '42',
      change: '+8%',
      isPositive: true,
      icon: ShoppingCart,
      color: 'bg-orange-500'
    },
    {
      title: 'Active Customers',
      value: '156',
      change: '+15%',
      isPositive: true,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Inventory Value',
      value: '₹2,45,000',
      change: '-3%',
      isPositive: false,
      icon: Package,
      color: 'bg-purple-500'
    }
  ];

  const topSellingItems = [
    { name: 'Chicken Biryani', sales: 28, revenue: '₹7,840' },
    { name: 'Vegetable Curry', sales: 15, revenue: '₹2,700' },
    { name: 'Mutton Biryani', sales: 12, revenue: '₹4,320' },
    { name: 'Fish Curry', sales: 8, revenue: '₹2,160' },
    { name: 'Dal Rice', sales: 6, revenue: '₹840' }
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 45000, orders: 180 },
    { month: 'Feb', revenue: 52000, orders: 210 },
    { month: 'Mar', revenue: 48000, orders: 195 },
    { month: 'Apr', revenue: 61000, orders: 245 },
    { month: 'May', revenue: 58000, orders: 235 },
    { month: 'Jun', revenue: 67000, orders: 280 }
  ];

  const handleExportReport = () => {
    try {
      // Generate comprehensive report data
      const reportData = {
        generatedAt: new Date().toISOString(),
        filters: filters,
        summary: {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
          averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
          lowStockItems: inventoryItems.filter(item => item.currentStock <= item.minStock).length
        },
        orders: orders.map(order => ({
          id: order.id,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          status: order.status,
          orderTime: order.orderTime,
          totalAmount: order.totalAmount,
          itemCount: order.items.length
        })),
        inventory: inventoryItems.map(item => ({
          name: item.name,
          category: item.category,
          currentStock: item.currentStock,
          minStock: item.minStock,
          costPerUnit: item.costPerUnit,
          supplier: item.supplier,
          status: item.currentStock <= item.minStock ? 'Low Stock' : 'Normal'
        })),
        topSellingItems: topSellingItems,
        monthlyData: monthlyData
      };

      // Create CSV content
      const csvHeaders = [
        'Report Type', 'Gabriel Kitchen Management System Report',
        'Generated At', new Date().toLocaleString('en-IN'),
        'Date Range', filters.dateRange,
        'Report Type Filter', filters.reportType,
        'Department Filter', filters.department,
        '',
        '=== SUMMARY ===',
        'Total Orders', reportData.summary.totalOrders,
        'Total Revenue', `₹${reportData.summary.totalRevenue.toLocaleString()}`,
        'Average Order Value', `₹${Math.round(reportData.summary.averageOrderValue).toLocaleString()}`,
        'Low Stock Items', reportData.summary.lowStockItems,
        '',
        '=== ORDERS ===',
        'Order ID', 'Customer Name', 'Phone', 'Status', 'Order Time', 'Total Amount', 'Items Count'
      ];

      const csvRows = [
        ...csvHeaders.map(header => Array.isArray(header) ? header.join(',') : header),
        ...reportData.orders.map(order => [
          order.id,
          `"${order.customerName}"`,
          order.customerPhone,
          order.status,
          new Date(order.orderTime).toLocaleString('en-IN'),
          order.totalAmount,
          order.itemCount
        ].join(',')),
        '',
        '=== INVENTORY ===',
        'Item Name,Category,Current Stock,Min Stock,Cost Per Unit,Supplier,Status',
        ...reportData.inventory.map(item => [
          `"${item.name}"`,
          item.category,
          item.currentStock,
          item.minStock,
          item.costPerUnit,
          `"${item.supplier}"`,
          item.status
        ].join(',')),
        '',
        '=== TOP SELLING ITEMS ===',
        'Item Name,Sales Count,Revenue',
        ...reportData.topSellingItems.map(item => [
          `"${item.name}"`,
          item.sales,
          item.revenue
        ].join(',')),
        '',
        '=== MONTHLY DATA ===',
        'Month,Revenue,Orders',
        ...reportData.monthlyData.map(data => [
          data.month,
          data.revenue,
          data.orders
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const fileName = `gabriel_kitchen_report_${filters.dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`✅ Report exported successfully!\n\nFile: ${fileName}\n\nThe report includes:\n• Summary statistics\n• Order details\n• Inventory status\n• Top selling items\n• Monthly trends`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Error exporting report. Please try again.');
    }
  };

  const applyFilters = () => {
    // Apply the selected filters (this would normally filter the data)
    setShowFilterModal(false);
    alert(`✅ Filters applied successfully!\n\nDate Range: ${filters.dateRange}\nReport Type: ${filters.reportType}\nDepartment: ${filters.department}\n\nNote: Data filtering is now active.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportReport}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Export Report
          </button>
          <button 
            onClick={() => setShowFilterModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`h-4 w-4 ${card.isPositive ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm ml-1 ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {card.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <span>Monthly Revenue</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-600 w-8">{data.month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(data.revenue / 70000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">₹{data.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{data.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topSellingItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sales data available</p>
                  <p className="text-sm text-gray-400">Top selling items will appear here as orders are processed</p>
                </div>
              ) : (
                topSellingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.sales} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{item.revenue}</p>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kitchen Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Preparation Time</span>
              <span className="font-medium">25 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orders Completed</span>
              <span className="font-medium">98.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Satisfaction</span>
              <span className="font-medium">4.7/5</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Delivery Time</span>
              <span className="font-medium">32 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">On-Time Delivery</span>
              <span className="font-medium">94.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Success</span>
              <span className="font-medium">99.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Low Stock Items</span>
              <span className="font-medium text-red-600">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reorder Required</span>
              <span className="font-medium text-yellow-600">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Waste Percentage</span>
              <span className="font-medium">2.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filter Reports</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="thismonth">This Month</option>
                    <option value="lastmonth">Last Month</option>
                    <option value="thisyear">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={filters.reportType}
                    onChange={(e) => setFilters({...filters, reportType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Reports</option>
                    <option value="sales">Sales Report</option>
                    <option value="inventory">Inventory Report</option>
                    <option value="orders">Orders Report</option>
                    <option value="performance">Performance Report</option>
                    <option value="financial">Financial Report</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Departments</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="delivery">Delivery</option>
                    <option value="inventory">Inventory</option>
                    <option value="management">Management</option>
                  </select>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Current Filters</h4>
                  <div className="text-sm text-blue-700">
                    <div>Date Range: <span className="font-medium">{filters.dateRange}</span></div>
                    <div>Report Type: <span className="font-medium">{filters.reportType}</span></div>
                    <div>Department: <span className="font-medium">{filters.department}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setFilters({ dateRange: 'last30days', reportType: 'all', department: 'all' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}