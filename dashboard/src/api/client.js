const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const token = localStorage.getItem('jv2_token');
  
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  
  register: (data) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getMe: () => request('/api/auth/me'),
  
  // Store
  getStore: () => request('/api/store'),
  updateStore: (config) => request('/api/store', {
    method: 'PUT',
    body: JSON.stringify({ config })
  }),
  getThemes: () => request('/api/store/themes'),
  getTemplates: () => request('/api/store/templates'),
  
  // Products
  getProducts: () => request('/api/products'),
  getProduct: (id) => request(`/api/products/${id}`),
  createProduct: (data) => request('/api/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProduct: (id, data) => request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
  
  // Orders
  getOrders: () => request('/api/orders'),
  getOrderStats: () => request('/api/orders/stats'),
  updateOrder: (id, data) => request(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};
