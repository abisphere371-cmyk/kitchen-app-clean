import React from 'react';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs sm:text-sm ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-gray-500 text-xs sm:text-sm ml-1 hidden sm:inline">vs last month</span>
          </div>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const { orders, inventoryItems } = useApp();
  
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.orderTime).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const lowStockCount = inventoryItems.filter(item => item.currentStock <= item.minStock).length;

  const stats = [
    {
      title: 'Total Orders Today',
      value: todayOrders.length,
      change: 12,
      icon: <ShoppingCart className="h-6 w-6 text-white" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Revenue Today',
      value: `₹${todayRevenue.toLocaleString()}`,
      change: 8,
      icon: <DollarSign className="h-6 w-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount,
      change: -20,
      icon: <Package className="h-6 w-6 text-white" />,
      color: 'bg-red-500'
    },
    {
      title: 'Active Staff',
      value: 8,
      change: 0,
      icon: <Users className="h-6 w-6 text-white" />,
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}