import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, Recipe, Order, User, Supplier, PurchaseOrder, PayrollRecord, StockMovement } from '../types';
import * as dataClient from '../lib/dataClient';
import { mockInventoryItems } from '../data/mockData';

interface AppContextType {
  // Data
  inventoryItems: InventoryItem[];
  recipes: Recipe[];
  orders: Order[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  payrollRecords: PayrollRecord[];
  stockMovements: StockMovement[];
  deliveryConfirmations: any[];
  staffMembers: any[];
  
  // Staff Actions
  addStaffMember: (staffData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateStaffMember: (id: string, updates: any) => Promise<any>;
  
  // Inventory Actions
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  deleteInventoryItem: (id: string) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  
  // Recipe Actions
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  
  // Order Actions
  updateOrderStatus: (orderId: string, status: Order['status'], assignedStaff?: string) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  
  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Delivery Actions
  getDeliveryConfirmation: (orderId: string) => any | null;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  
  // Real-time updates
  lastUpdated: string;
  loading: boolean;
  error: string | null;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [deliveryConfirmations, setDeliveryConfirmations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Initializing data from API...');
      
      await loadAllData();
      
      console.log('Data initialization completed');
    } catch (err) {
      console.error('Error initializing data:', err);
      setError(`Failed to load data: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    try {
      // Load all data from API
      const [
        suppliersData,
        inventoryData,
        recipesData,
        ordersData,
        stockMovementsData,
        deliveryConfirmationsData,
        staffData
      ] = await Promise.all([
        dataClient.getSuppliers(),
        dataClient.getInventory(),
        dataClient.getRecipes(),
        dataClient.getOrders(),
        dataClient.getStockMovements(),
        dataClient.getDeliveryConfirmations(),
        dataClient.getStaff()
      ]);

      setSuppliers(suppliersData || []);
      setInventoryItems(inventoryData || []);
      setRecipes(recipesData || []);
      setOrders(ordersData || []);
      setStockMovements(stockMovementsData || []);
      setDeliveryConfirmations(deliveryConfirmationsData || []);
      setStaffMembers(staffData || []);
      
      console.log('✅ All data loaded from API successfully');
      updateLastUpdated();
    } catch (error) {
      console.error('API load failed:', error);
      throw error; // Re-throw to be handled by caller
    }
  };

  const loadMockData = () => {
    console.log('Loading mock data as fallback...');
    
    // Load mock inventory items
    setInventoryItems(mockInventoryItems);
    
    // Load mock suppliers
    setSuppliers([
      {
        id: 'supplier-1',
        name: 'Tamil Nadu Rice Mills',
        contact: '+91 9876543220',
        email: 'info@tnricemills.com',
        address: 'Industrial Area, Hosur - 635109',
        categories: ['grains'],
        rating: 4.5,
        isActive: true
      },
      {
        id: 'supplier-2',
        name: 'Fresh Meat Co.',
        contact: '+91 9876543221',
        email: 'orders@freshmeat.com',
        address: 'Meat Market Complex, Hosur - 635110',
        categories: ['meat'],
        rating: 4.2,
        isActive: true
      }
    ]);
    
    // Load mock recipes
    setRecipes([
      {
        id: 'recipe-1',
        name: 'Chicken Biryani',
        category: 'Main Course',
        prepTime: 30,
        cookTime: 45,
        servings: 4,
        ingredients: [],
        instructions: ['Prepare rice', 'Cook chicken', 'Layer and cook']
      },
      {
        id: 'recipe-2',
        name: 'Vegetable Curry',
        category: 'Main Course',
        prepTime: 15,
        cookTime: 25,
        servings: 4,
        ingredients: [],
        instructions: ['Chop vegetables', 'Cook with spices']
      }
    ]);
    
    // Load mock orders
    setOrders([]);
    
    // Initialize empty arrays for other data
    setStockMovements([]);
    setDeliveryConfirmations([]);
    setPurchaseOrders([]);
    setPayrollRecords([]);
    setStaffMembers([]);
    
    console.log('Mock data loaded successfully');
    updateLastUpdated();
  };

  // Staff Actions
  const addStaffMember = async (staffData: any) => {
    try {
      console.log('Adding staff member:', staffData);
      
      const result = await dataClient.createStaff(staffData);
      
      if (result.success) {
        setStaffMembers(prev => [result.data, ...prev]);
        updateLastUpdated();
        
        addNotification({
          type: 'success',
          title: 'Staff Member Added',
          message: `${staffData.name} has been added to the team with login credentials`,
          read: false
        });
        
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error adding staff member:', err);
      addNotification({
        type: 'error',
        title: 'Add Staff Failed',
        message: 'Failed to add staff member: ' + (err as Error).message,
        read: false
      });
      return { success: false, error: (err as Error).message };
    }
  };

  const updateStaffMember = async (id: string, updates: any) => {
    try {
      console.log('Updating staff member:', id, updates);
      
      const data = await dataClient.updateStaff(id, updates);
      
      setStaffMembers(prev => 
        prev.map(staff => staff.id === id ? { ...staff, ...updates } : staff)
      );
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Staff Updated',
        message: 'Staff member has been updated successfully',
        read: false
      });
      
      return data;
    } catch (err) {
      console.error('Error updating staff member:', err);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update staff member: ' + (err as Error).message,
        read: false
      });
      throw err;
    }
  };

  const getDepartmentFromRole = (role: string): string => {
    switch (role) {
      case 'admin': return 'Management';
      case 'kitchen_staff': return 'Kitchen';
      case 'inventory_manager': return 'Operations';
      case 'delivery_staff': return 'Delivery';
      default: return 'General';
    }
  };

  const addStockMovement = async (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    try {
      console.log('Adding stock movement:', movement);
      
      const result = await dataClient.createStockMovement(movement);
      
      if (result.success) {
        const newMovement: StockMovement = {
          id: result.data.id,
          inventoryItemId: result.data.inventory_item_id,
          movementType: result.data.movement_type,
          quantity: result.data.quantity,
          reason: result.data.reason,
          referenceNumber: result.data.reference_number,
          unitCost: result.data.unit_cost,
          totalCost: result.data.total_cost,
          performedBy: result.data.performed_by,
          notes: result.data.notes,
          movementDate: result.data.movement_date,
          createdAt: result.data.created_at
        };
        
        setStockMovements(prev => [newMovement, ...prev]);
        console.log('Stock movement added:', newMovement);
        
        // Update inventory levels
        const inventoryItem = inventoryItems.find(item => item.id === movement.inventoryItemId);
        if (inventoryItem) {
          const newStock = movement.movementType === 'in' 
            ? Math.round(inventoryItem.currentStock + movement.quantity)
            : Math.max(0, Math.round(inventoryItem.currentStock - movement.quantity));
          
          console.log(`Updating ${inventoryItem.name}: ${inventoryItem.currentStock} -> ${newStock}`);
          
          // Update local state
          setInventoryItems(prev => 
            prev.map(item => {
              if (item.id === movement.inventoryItemId) {
                return { 
                  ...item, 
                  currentStock: Math.round(newStock),
                  lastRestocked: movement.movementType === 'in' ? new Date().toISOString().split('T')[0] : item.lastRestocked
                };
              }
              return item;
            })
          );
        }
        
        updateLastUpdated();
        
        addNotification({
          type: 'success',
          title: 'Stock Movement Recorded',
          message: `${movement.movementType === 'in' ? 'Added' : 'Removed'} ${movement.quantity} units successfully`,
          read: false
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error adding stock movement:', err);
      addNotification({
        type: 'error',
        title: 'Stock Movement Failed',
        message: 'Failed to record stock movement: ' + (err as Error).message,
        read: false
      });
      throw err;
    }
  };

  const updateLastUpdated = () => {
    setLastUpdated(new Date().toISOString());
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Inventory Actions
  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const result = await dataClient.updateInventory(id, updates);
      
      setInventoryItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Inventory Updated',
        message: 'Inventory item has been updated successfully',
        read: false
      });
    } catch (err) {
      console.error('Error updating inventory item:', err);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update inventory item',
        read: false
      });
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      console.log('Adding inventory item:', item);
      
      const result = await dataClient.createInventory(item);
      
      if (result.success) {
        const newItem: InventoryItem = result.data;
        
        console.log('Inventory item added:', newItem);
        setInventoryItems(prev => [newItem, ...prev]);
        updateLastUpdated();
        
        addNotification({
          type: 'success',
          title: 'New Item Added',
          message: `${item.name} has been added to inventory`,
          read: false
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error adding inventory item:', err);
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: 'Failed to add inventory item: ' + (err as Error).message,
        read: false
      });
      throw err;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const item = inventoryItems.find(i => i.id === id);
      
      await dataClient.deleteInventory(id);

      setInventoryItems(prev => prev.filter(i => i.id !== id));
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Item Deleted',
        message: `${item?.name} has been removed from inventory`,
        read: false
      });
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete inventory item',
        read: false
      });
    }
  };

  // Recipe Actions
  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    try {
      const result = await dataClient.createRecipe(recipe);
      
      if (result.success) {
        const newRecipe: Recipe = result.data;
        
        setRecipes(prev => [newRecipe, ...prev]);
        updateLastUpdated();
        
        addNotification({
          type: 'success',
          title: 'New Recipe Added',
          message: `${recipe.name} has been added to the menu`,
          read: false
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error adding recipe:', err);
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: 'Failed to add recipe',
        read: false
      });
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      await dataClient.updateRecipe(id, updates);

      setRecipes(prev => 
        prev.map(recipe => recipe.id === id ? { ...recipe, ...updates } : recipe)
      );
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Recipe Updated',
        message: 'Recipe has been updated successfully',
        read: false
      });
    } catch (err) {
      console.error('Error updating recipe:', err);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update recipe',
        read: false
      });
    }
  };

  const deleteRecipe = async (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    
    await dataClient.deleteRecipe(id);

    setRecipes(prev => prev.filter(r => r.id !== id));
    updateLastUpdated();
    
    addNotification({
      type: 'success',
      title: 'Recipe Deleted',
      message: `${recipe?.name} has been removed from the menu`,
      read: false
    });
  };

  // Order Actions
  const updateOrderStatus = async (orderId: string, status: Order['status'], assignedStaff?: string, deliveryData?: {quantity?: number, notes?: string}) => {
    // If marking as delivered, save delivery confirmation
    if (status === 'delivered' && deliveryData) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const deliveryConfirmation = {
          order_id: orderId,
          delivered_quantity: deliveryData.quantity || 0,
          ordered_quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
          delivery_notes: deliveryData.notes || '',
          delivered_by: assignedStaff || 'Unknown',
          delivery_date: new Date().toISOString(),
          delivery_status: deliveryData.quantity === order.items.reduce((sum, item) => sum + item.quantity, 0) 
            ? 'completed' as const
            : deliveryData.quantity && deliveryData.quantity > order.items.reduce((sum, item) => sum + item.quantity, 0)
              ? 'completed' as const
              : 'partial' as const
        };
        
        const savedConfirmation = await dataClient.createDeliveryConfirmation(deliveryConfirmation);
        console.log('Delivery confirmation saved:', savedConfirmation);
        
        // Update local delivery confirmations state immediately
        setDeliveryConfirmations(prev => {
          const filtered = prev.filter(dc => dc.order_id !== orderId);
          return [savedConfirmation, ...filtered];
        });
      }
    }
    
    // Update order status
    const orderUpdates = {
      status,
      assigned_staff: assignedStaff,
      updated_at: new Date().toISOString()
    };

    // Since there's no updateOrder method in dataClient, we'll use createOrder with the existing order ID
    // This is a workaround - in a real implementation, you'd have a proper updateOrder method
    try {
      // For now, we'll just update the local state since we don't have a proper API endpoint
      console.log('Order status updated:', orderId, status);

      // Update local state after successful update
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status, 
                assignedStaff: assignedStaff || order.assignedStaff,
              }
            : order
        )
      );
      updateLastUpdated();

      const statusMessages: Record<string, string> = {
        cooking: 'Order is now being prepared',
        out_for_delivery: 'Order is out for delivery',
        delivered: deliveryData?.quantity 
          ? `Order has been delivered (${deliveryData.quantity} meals)`
          : 'Order has been delivered',
        cancelled: 'Order has been cancelled'
      };
      
      addNotification({
        type: status === 'delivered' ? 'success' : 'info',
        title: 'Order Status Updated',
        message: `Order #${orderId}: ${statusMessages[status] || 'Status updated'}`,
        read: false
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update order status',
        read: false
      });
    }
  };

  const generateOrderId = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Get today's orders to determine sequence number
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.orderTime).toISOString().slice(0, 10).replace(/-/g, '');
      return orderDate === dateStr;
    });
    
    const sequenceNumber = (todayOrders.length + 1).toString().padStart(3, '0');
    return `ORD-${dateStr}-${sequenceNumber}`;
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const result = await dataClient.createOrder(order);
      
      if (result.success) {
        const newOrder: Order = result.data;
        
        setOrders(prev => [newOrder, ...prev]);
        updateLastUpdated();
        
        addNotification({
          type: 'success',
          title: 'New Order Created',
          message: `Order ${newOrder.orderNumber} from ${order.customerName} has been created`,
          read: false
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error adding order:', err);
      addNotification({
        type: 'error',
        title: 'Order Failed',
        message: 'Failed to create order: ' + (err as Error).message,
        read: false
      });
      throw err;
    }
  };

  // Supplier Actions
  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      console.log('Adding supplier:', supplier);
      
      const result = await dataClient.createSupplier(supplier);
      
      if (result.success) {
        const newSupplier: Supplier = result.data;
        
        console.log('Supplier added successfully:', newSupplier);
        
        setSuppliers(prev => [newSupplier, ...prev]);
        updateLastUpdated();
        
        addNotification({
          type: 'success',
          title: 'Supplier Added',
          message: `${supplier.name} has been added as a supplier`,
          read: false
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error adding supplier:', err);
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: 'Failed to add supplier: ' + (err as Error).message,
        read: false
      });
      throw err;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      await dataClient.updateSupplier(id, updates);

      setSuppliers(prev => 
        prev.map(supplier => supplier.id === id ? { ...supplier, ...updates } : supplier)
      );
      
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Supplier Updated',
        message: 'Supplier has been updated successfully',
        read: false
      });
      
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update supplier: ' + (err as Error).message,
        read: false
      });
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const supplier = suppliers.find(s => s.id === id);
      
      await dataClient.deleteSupplier(id);
      
      // Update local state
      setSuppliers(prev => prev.filter(s => s.id !== id));
      updateLastUpdated();
      
      addNotification({
        type: 'success',
        title: 'Supplier Deleted',
        message: `${supplier?.name} has been removed from suppliers`,
        read: false
      });
      
    } catch (err) {
      console.error('Error deleting supplier:', err);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete supplier: ' + (err as Error).message,
        read: false
      });
      throw err;
    }
  };

  // Get delivery confirmation for an order
  const getDeliveryConfirmation = (orderId: string) => {
    return deliveryConfirmations.find(dc => dc.order_id === orderId) || null;
  };

  return (
    <AppContext.Provider value={{
      inventoryItems,
      recipes,
      orders,
      suppliers,
      purchaseOrders,
      payrollRecords,
      stockMovements,
      deliveryConfirmations,
      staffMembers,
      updateInventoryItem,
      addInventoryItem,
      deleteInventoryItem,
      addStockMovement,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      updateOrderStatus,
      addOrder,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      getDeliveryConfirmation,
      notifications,
      addNotification,
      markNotificationRead,
      addStaffMember,
      updateStaffMember,
      lastUpdated,
      loading,
      error
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}