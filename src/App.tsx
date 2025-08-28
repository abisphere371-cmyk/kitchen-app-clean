import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AuthContainer } from './components/Auth/AuthContainer';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardStats } from './components/Dashboard/DashboardStats';
import { RecentOrders } from './components/Dashboard/RecentOrders';
import { LowStockAlerts } from './components/Dashboard/LowStockAlerts';
import { InventoryList } from './components/Inventory/InventoryList';
import { KitchenDashboard } from './components/Kitchen/KitchenDashboard';
import { OrderManagement } from './components/Orders/OrderManagement';
import { StaffManagement } from './components/Staff/StaffManagement';
import { ReportsAnalytics } from './components/Reports/ReportsAnalytics';
import { SupplierManagement } from './components/Suppliers/SupplierManagement';
import { PayrollManagement } from './components/Payroll/PayrollManagement';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { RecipeManagement } from './components/Recipes/RecipeManagement';
import { CustomerManagement } from './components/Customers/CustomerManagement';
import { DeliveryTracking } from './components/Delivery/DeliveryTracking';
import { KitchenStaffDashboard } from './components/Dashboard/KitchenStaffDashboard';
import { InventoryStaffDashboard } from './components/Dashboard/InventoryStaffDashboard';
import { DeliveryStaffDashboard } from './components/Dashboard/DeliveryStaffDashboard';
import { InventoryUsage } from './components/Kitchen/InventoryUsage';

function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth >= 640) {
        setSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const renderRoleSpecificDashboard = () => {
    switch (user?.role) {
      case 'kitchen_staff':
        return <KitchenStaffDashboard />;
      case 'inventory_manager':
        return <InventoryStaffDashboard />;
      case 'delivery_staff':
        return <DeliveryStaffDashboard />;
      default:
        // Admin dashboard
        return (
          <div className="space-y-6">
            <DashboardStats />
            <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              <RecentOrders />
              <LowStockAlerts />
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderRoleSpecificDashboard();
      case 'inventory':
        return <InventoryList />;
      case 'kitchen-inventory':
        return <InventoryUsage />;
      case 'kitchen':
        return <KitchenDashboard />;
      case 'recipes':
        return <RecipeManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'delivery':
        return <DeliveryTracking />;
      case 'customers':
        return <CustomerManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setSidebarOpen(true)} 
        isMobile={isMobile}
      />
      
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
        
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <AuthContainer />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}