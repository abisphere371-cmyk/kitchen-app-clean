// src/lib/dataClient.ts
// Pure REST client for your Express API (no Supabase paths)

// --- Helpers ---
const BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    // ensure cookies (session) get sent on every request
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    // bubble up "unauthorized" nicely for UI
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  // 204 may have no body
  return (res.status === 204 ? (undefined as unknown as T) : await res.json());
}

// ====================== AUTH ======================

export const login = async (email: string, password: string) => {
  try {
    const data = await request<{ access_token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { success: true, user: data.user };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Login failed' };
  }
};

export const loginWithUsername = async (username: string, password: string) => {
  try {
    const data = await request<{ access_token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return { success: true, user: data.user };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Login failed' };
  }
};

export const getMe = async () => {
  try {
    const data = await request<{ user: any }>('/api/auth/me');
    return data.user;
  } catch (e) {
    console.error('Error fetching user:', e);
    return null;
  }
};

// ==================== INVENTORY ====================

export const getInventory = () =>
  request<any[]>('/api/inventory');

export const createInventory = (item: any) =>
  request<any>('/api/inventory', {
    method: 'POST',
    body: JSON.stringify(item),
  });

export const updateInventory = (id: string, data: any) =>
  request<any>(`/api/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteInventory = (id: string) =>
  request<void>(`/api/inventory/${id}`, {
    method: 'DELETE',
  });

// ====================== ORDERS =====================

export const getOrders = () =>
  request<any[]>('/api/orders');

export const createOrder = (payload: any) =>
  request<any>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ======================= STAFF =====================

export const getStaff = () =>
  request<any[]>('/api/staff');

export const createStaff = async (data: any) => {
  try {
    const res = await request<any>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, data: res };
  } catch (e: any) {
    console.error('Error creating staff member:', e);
    return { success: false, error: e?.message || 'Failed to create staff' };
  }
};

export const updateStaff = (id: string, data: any) =>
  request<any>(`/api/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteStaff = (id: string) =>
  request<void>(`/api/staff/${id}`, {
    method: 'DELETE',
  });

// ===================== SUPPLIERS ===================

export const getSuppliers = () =>
  request<any[]>('/api/suppliers');

export const createSupplier = (data: any) =>
  request<any>('/api/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateSupplier = (id: string, data: any) =>
  request<any>(`/api/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteSupplier = (id: string) =>
  request<void>(`/api/suppliers/${id}`, {
    method: 'DELETE',
  });

// ================= STOCK MOVEMENTS =================

export const getStockMovements = () =>
  request<any[]>('/api/stock-movements');

export const createStockMovement = (data: any) =>
  request<any>('/api/stock-movements', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ====================== RECIPES ====================

export const getRecipes = () =>
  request<any[]>('/api/recipes');

export const createRecipe = (data: any) =>
  request<any>('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateRecipe = (id: string, data: any) =>
  request<any>(`/api/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteRecipe = (id: string) =>
  request<void>(`/api/recipes/${id}`, {
    method: 'DELETE',
  });

// ========= DELIVERY CONFIRMATIONS ==================

export const getDeliveryConfirmations = () =>
  request<any[]>('/api/delivery-confirmations');

export const createDeliveryConfirmation = (data: any) =>
  request<any>('/api/delivery-confirmations', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getDeliveryConfirmationByOrderId = (orderId: string) =>
  request<any>(`/api/delivery-confirmations/order/${orderId}`);

// ===================== CUSTOMERS ===================

export const getCustomers = () =>
  request<any[]>('/api/customers');

export const createCustomer = (data: any) =>
  request<any>('/api/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateCustomer = (id: string, data: any) =>
  request<any>(`/api/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
