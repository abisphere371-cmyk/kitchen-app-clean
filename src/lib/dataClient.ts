// src/lib/dataClient.ts
// Pure REST client for your Express API (no Supabase paths)

import axios from 'axios';
import { getToken, setToken, clearToken } from './token';

// --- Axios instance ---
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // keep '' so '/api/*' is same-origin in prod
  timeout: 10000
});

// Attach auth token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      // reload app so guards/routers kick in
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// --- Helpers ---
const unwrap = <T = any>(p: Promise<{ data: T }>) =>
  p.then((r) => r.data);

// ====================== AUTH ======================

export const login = async (email: string, password: string) => {
  try {
    const { data } = await apiClient.post('/api/auth/login', { email, password });
    const token = (data as any).token ?? (data as any).access_token;
    const user  = (data as any).user;
    if (token) setToken(token);
    return { success: true, user };
  } catch (e: any) {
    return { success: false, error: e?.response?.data?.message || 'Login failed' };
  }
};

export const loginWithUsername = async (username: string, password: string) => {
  try {
    const { data } = await apiClient.post('/api/auth/login', { username, password });
    const token = (data as any).token ?? (data as any).access_token;
    const user  = (data as any).user;
    if (token) setToken(token);
    return { success: true, user };
  } catch (e: any) {
    return { success: false, error: e?.response?.data?.message || 'Login failed' };
  }
};

export const getMe = async () => {
  try {
    const res = await apiClient.get('/api/auth/me');
    return (res.data as any).user;
  } catch (e) {
    console.error('Error fetching user:', e);
    return null;
  }
};

// ==================== INVENTORY ====================

export const getInventory = () =>
  unwrap(apiClient.get('/api/inventory'));

export const createInventory = (item: any) =>
  unwrap(apiClient.post('/api/inventory', item));

export const updateInventory = (id: string, data: any) =>
  unwrap(apiClient.put(`/api/inventory/${id}`, data));

export const deleteInventory = (id: string) =>
  unwrap(apiClient.delete(`/api/inventory/${id}`));

// ====================== ORDERS =====================

export const getOrders = () =>
  unwrap(apiClient.get('/api/orders'));

export const createOrder = (payload: any) =>
  unwrap(apiClient.post('/api/orders', payload));

// ======================= STAFF =====================

export const getStaff = () =>
  unwrap(apiClient.get('/api/staff'));

export const createStaff = async (data: any) => {
  try {
    const res = await apiClient.post('/api/staff', data);
    return { success: true, data: res.data };
  } catch (e: any) {
    console.error('Error creating staff member:', e);
    return { success: false, error: e?.response?.data?.message || 'Failed to create staff' };
  }
};

export const updateStaff = (id: string, data: any) =>
  unwrap(apiClient.put(`/api/staff/${id}`, data));

export const deleteStaff = (id: string) =>
  unwrap(apiClient.delete(`/api/staff/${id}`));

// ===================== SUPPLIERS ===================

export const getSuppliers = () =>
  unwrap(apiClient.get('/api/suppliers'));

export const createSupplier = (data: any) =>
  unwrap(apiClient.post('/api/suppliers', data));

export const updateSupplier = (id: string, data: any) =>
  unwrap(apiClient.put(`/api/suppliers/${id}`, data));

export const deleteSupplier = (id: string) =>
  unwrap(apiClient.delete(`/api/suppliers/${id}`));

// ================= STOCK MOVEMENTS =================

export const getStockMovements = () =>
  unwrap(apiClient.get('/api/stock-movements'));

export const createStockMovement = (data: any) =>
  unwrap(apiClient.post('/api/stock-movements', data));

// ====================== RECIPES ====================

export const getRecipes = () =>
  unwrap(apiClient.get('/api/recipes'));

export const createRecipe = (data: any) =>
  unwrap(apiClient.post('/api/recipes', data));

export const updateRecipe = (id: string, data: any) =>
  unwrap(apiClient.put(`/api/recipes/${id}`, data));

export const deleteRecipe = (id: string) =>
  unwrap(apiClient.delete(`/api/recipes/${id}`));

// ========= DELIVERY CONFIRMATIONS ==================

export const getDeliveryConfirmations = () =>
  unwrap(apiClient.get('/api/delivery-confirmations'));

export const createDeliveryConfirmation = (data: any) =>
  unwrap(apiClient.post('/api/delivery-confirmations', data));

export const getDeliveryConfirmationByOrderId = (orderId: string) =>
  unwrap(apiClient.get(`/api/delivery-confirmations/order/${orderId}`));

// ===================== CUSTOMERS ===================

export const getCustomers = () =>
  unwrap(apiClient.get('/api/customers'));

export const createCustomer = (data: any) =>
  unwrap(apiClient.post('/api/customers', data));

export const updateCustomer = (id: string, data: any) =>
  unwrap(apiClient.put(`/api/customers/${id}`, data));

// (exporting apiClient in case other modules need it)
export { apiClient };
