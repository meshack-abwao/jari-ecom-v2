import axios from 'axios';

// ===========================================
// API CONFIGURATION
// ===========================================
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    // Remove trailing slash if present
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiUrl();

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor - adds auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jv2_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('jv2_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===========================================
// AUTH API
// ===========================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// ===========================================
// PRODUCTS API
// ===========================================
export const productsAPI = {
  getAll: () => api.get('/products'),
  get: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// ===========================================
// ORDERS API
// ===========================================
export const ordersAPI = {
  getAll: (period = 'all') => api.get(`/orders${period !== 'all' ? `?period=${period}` : ''}`),
  getStats: (period = 'all') => api.get(`/orders/stats${period !== 'all' ? `?period=${period}` : ''}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
};

// ===========================================
// SETTINGS API
// ===========================================
export const settingsAPI = {
  getAll: () => api.get('/store'),
  update: (settingsData) => api.put('/store', { config: settingsData }),
  getThemes: () => api.get('/store/themes'),
  getTemplates: () => api.get('/store/templates'),
  getAddOns: () => api.get('/store/add-ons'),
  activateAddOn: (id, paymentData) => api.post(`/store/add-ons/${id}/activate`, paymentData),
};

// ===========================================
// PIXEL/ANALYTICS API
// ===========================================
export const pixelAPI = {
  getStats: (storeId, period = 'today') => api.get(`/pixel/stats/${storeId}?period=${period}`),
};

// ===========================================
// LEGACY API (for backwards compatibility)
// ===========================================
export const legacyApi = {
  login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  getMe: () => api.get('/auth/me').then(r => r.data),
  getStore: () => api.get('/store').then(r => r.data),
  updateStore: (config) => api.put('/store', { config }).then(r => r.data),
  getThemes: () => api.get('/store/themes').then(r => r.data),
  getTemplates: () => api.get('/store/templates').then(r => r.data),
  getProducts: () => api.get('/products').then(r => r.data.products || []),
  getProduct: (id) => api.get(`/products/${id}`).then(r => r.data),
  createProduct: (data) => api.post('/products', data).then(r => r.data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then(r => r.data),
  getOrders: () => api.get('/orders').then(r => r.data.orders || []),
  getOrderStats: () => api.get('/orders/stats').then(r => r.data),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data).then(r => r.data),
};

export default api;
