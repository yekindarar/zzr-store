const API_BASE = '';

function getToken(): string {
  return localStorage.getItem('zzr-token') || '';
}

export function setToken(token: string) {
  localStorage.setItem('zzr-token', token);
}

export function clearToken() {
  localStorage.removeItem('zzr-token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '请求失败');
  return data;
}

// === Auth ===
export const authApi = {
  register: (email: string, password: string, name: string, code: string) =>
    request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, code }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  sendCode: (email: string) =>
    request<{ message: string }>('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password: newPassword }),
    }),

  getMe: () =>
    request<{ user: any }>('/api/auth/me'),
};

// === User ===
export const userApi = {
  updateProfile: (data: { name?: string; phone?: string }) =>
    request<{ message: string }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getMyOrders: () =>
    request<{ orders: any[] }>('/api/orders/mine'),

  createOrder: (data: any) =>
    request<{ order_id: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// === Admin ===
export const adminApi = {
  getUsers: () =>
    request<{ users: any[] }>('/api/admin/users'),

  updateUser: (userId: string, data: { name?: string; role?: string }) =>
    request<{ message: string }>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  createUser: (data: { email: string; password: string; name: string; role: string }) =>
    request<{ message: string; id: string }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteUser: (userId: string) =>
    request<{ message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  getOrders: () =>
    request<{ orders: any[] }>('/api/admin/orders'),

  updateOrderStatus: (orderId: string, status: string) =>
    request<{ message: string }>(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getProducts: () =>
    request<{ products: any[] }>('/api/products'),

  createProduct: (data: any) =>
    request<{ message: string; id: string }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (productId: string, data: any) =>
    request<{ message: string }>(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (productId: string) =>
    request<{ message: string }>(`/api/admin/products/${productId}`, {
      method: 'DELETE',
    }),
};
