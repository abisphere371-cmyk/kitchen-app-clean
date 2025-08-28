import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Package, 
  ChefHat, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  BarChart3, 
  Truck,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({ activeTab, onTabChange, isOpen, onClose, isMobile }: SidebarProps) {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'kitchen_staff', 'inventory_manager', 'delivery_staff'] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: ['admin', 'inventory_manager'] },
    { id: 'kitchen-inventory', label: 'Kitchen Inventory', icon: Package, roles: ['kitchen_staff'] },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat, roles: ['admin', 'kitchen_staff'] },
    { id: 'recipes', label: 'Recipes', icon: ChefHat, roles: ['admin'] },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, roles: ['admin', 'kitchen_staff', 'delivery_staff'] },
    { id: 'delivery', label: 'Delivery Tracking', icon: Truck, roles: ['admin'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['admin'] },
    { id: 'staff', label: 'Staff', icon: Users, roles: ['admin'] },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, roles: ['admin'] },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'inventory_manager'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const sidebarClasses = `
    ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
    ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
    w-64 bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 ease-in-out
  `;

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (isMobile) onClose();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}