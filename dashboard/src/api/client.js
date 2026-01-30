import axios from 'axios';

// ===========================================
// API CONFIGURATION
// ===========================================
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    // Remove trailing slash if present
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // Production fallback - ensures login works even if env var not set
  return 'https://jari-ecom-v2-production.up.railway.app';
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
  
  // Phase B: Enhanced Signup Endpoints
  post: (endpoint, data) => api.post(endpoint, data), // Generic post for signup flow
  signupBusinessType: (businessType) => api.post('/auth/signup/business-type', { businessType }),
  signupComplete: (signupData) => api.post('/auth/signup/complete', signupData),
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
  getTopProducts: (period = 'all') => api.get(`/orders/top-products${period !== 'all' ? `?period=${period}` : ''}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
};

// ===========================================
// SETTINGS API
// ===========================================
export const settingsAPI = {
  getAll: () => api.get('/store'),
  update: (settingsData, slug = null) => {
    const payload = { config: settingsData };
    if (slug) payload.slug = slug;
    return api.put('/store', payload);
  },
  updateSlug: (slug) => api.put('/store', { slug }),
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
  getAbandoned: (storeId, period = 'week') => api.get(`/pixel/abandoned/${storeId}?period=${period}`),
  debug: (storeId) => api.get(`/pixel/debug/${storeId}`),
};

// ===========================================
// BOOKINGS API
// ===========================================
export const bookingsAPI = {
  // Settings
  getSettings: () => api.get('/bookings/settings'),
  updateSettings: (data) => api.put('/bookings/settings', data),
  
  // Working hours
  getWorkingHours: () => api.get('/bookings/working-hours'),
  updateWorkingHours: (day, data) => api.put(`/bookings/working-hours/${day}`, data),
  
  // Blocked dates
  getBlockedDates: () => api.get('/bookings/blocked-dates'),
  addBlockedDate: (data) => api.post('/bookings/blocked-dates', data),
  removeBlockedDate: (id) => api.delete(`/bookings/blocked-dates/${id}`),
  
  // Bookings
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/bookings${params ? `?${params}` : ''}`);
  },
  update: (id, data) => api.put(`/bookings/${id}`, data),
  updateStatus: (id, status) => api.put(`/bookings/${id}`, { status }),
};

// ===========================================
// UPLOAD/CLOUDINARY API
// ===========================================
export const uploadAPI = {
  // Get signature for client-side upload
  getSignature: (folder = 'products') => api.post('/upload/signature', { folder }),
  
  // Delete image from Cloudinary
  deleteImage: (publicId) => api.delete(`/upload/${encodeURIComponent(publicId)}`),
  
  // Get upload stats
  getStats: () => api.get('/upload/stats'),
  
  // Helper: Upload file to Cloudinary using signature
  uploadToCloudinary: async (file, folder = 'products', onProgress) => {
    // 1. Get signature from our API
    const sigResponse = await api.post('/upload/signature', { folder });
    const { signature, timestamp, folder: uploadFolder, cloudName, apiKey } = sigResponse.data;
    
    // 2. Build FormData for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', uploadFolder);
    
    // 3. Upload directly to Cloudinary
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          });
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);
    });
  }
};

// ===========================================
// FOOD ORDERS API (Visual Menu Template)
// ===========================================
export const foodOrdersAPI = {
  // Get all food orders
  getAll: (status = 'all') => api.get(`/food-orders${status !== 'all' ? `?status=${status}` : ''}`),
  
  // Get order statistics
  getStats: () => api.get('/food-orders/stats'),
  
  // Get single order
  getById: (id) => api.get(`/food-orders/${id}`),
  
  // Update order status
  updateStatus: (id, status, note = null) => 
    api.put(`/food-orders/${id}/status`, { status, note }),
  
  // Update payment status
  updatePayment: (id, paymentStatus, mpesaReceipt = null) => 
    api.put(`/food-orders/${id}/payment`, { paymentStatus, mpesaReceipt })
};

// ===========================================
// CARDS API (Product Card Management)
// ===========================================
export const cardsAPI = {
  // Get card balance
  getBalance: () => api.get('/cards/balance'),
  
  // Check if can add more products
  checkLimit: () => api.post('/cards/check-limit'),
  
  // Get available bundles
  getBundles: () => api.get('/cards/bundles'),
  
  // Purchase card bundle
  purchase: (bundleType, paymentRef) => 
    api.post('/cards/purchase', { bundleType, paymentRef }),
  
  // Get purchase history
  getHistory: () => api.get('/cards/history'),
};

// ===========================================
// TEMPLATES API (Template Management)
// ===========================================
export const templatesAPI = {
  // Get available templates with unlock status
  getAvailable: () => api.get('/templates/available'),
  
  // Unlock a template (after payment)
  unlock: (templateId, paymentRef) => 
    api.post('/templates/unlock', { templateId, paymentRef }),
  
  // Assign template to a product
  assign: (productId, templateId) => 
    api.put(`/templates/assign/${productId}`, { templateId }),
};

// ===========================================
// M-PESA PAYMENTS API
// ===========================================
export const mpesaAPI = {
  // Initiate STK Push
  stkPush: (phone, amount, type, itemId = null, itemName = null) => 
    api.post('/mpesa/stk-push', { phone, amount, type, itemId, itemName }),
  
  // Check payment status
  getStatus: (paymentId) => api.get(`/mpesa/status/${paymentId}`),
  
  // Get payment history
  getHistory: () => api.get('/mpesa/history'),
  
  // Helper: Poll for payment completion
  pollStatus: async (paymentId, maxAttempts = 30, intervalMs = 2000) => {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await api.get(`/mpesa/status/${paymentId}`);
      const { status, success } = response.data;
      
      if (status === 'completed') {
        return { success: true, ...response.data };
      }
      if (status === 'failed') {
        return { success: false, ...response.data };
      }
      
      // Still pending, wait and retry
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    return { success: false, status: 'timeout', message: 'Payment verification timed out' };
  }
};

// ===========================================
// COMPLAINTS API (Phase F)
// ===========================================
export const complaintsAPI = {
  // Get all complaints for merchant's store
  getAll: () => api.get('/complaints'),
  
  // Get complaint statistics
  getStats: () => api.get('/complaints/stats'),
  
  // Respond to a complaint (resolve/reject)
  respond: (complaintId, resolution, status) => 
    api.put(`/complaints/${complaintId}/respond`, { resolution, status }),
  
  // Generate complaint link for an order
  generateLink: (orderId) => 
    api.post('/complaints/generate-link', { orderId }),
};

// ===========================================
// DOMAINS API (Custom Domain Feature)
// ===========================================
export const domainsAPI = {
  // Get current domain settings for user's store
  getSettings: () => api.get('/domains/settings'),
  
  // Setup/add a custom domain
  setup: (domain) => api.post('/domains/setup', { domain }),
  
  // Verify domain DNS records
  verify: () => api.post('/domains/verify'),
  
  // Remove custom domain
  remove: () => api.delete('/domains/remove'),
  
  // Manual verification (for support/beta)
  manualVerify: () => api.post('/domains/manual-verify'),
  
  // Public: Lookup store by domain (no auth required)
  lookup: (domain) => api.get(`/domain/lookup/${encodeURIComponent(domain)}`),
};

// ===========================================
// SUBSCRIPTIONS API
// ===========================================
export const subscriptionsAPI = {
  // Check subscription status for a feature
  getStatus: (feature) => {
    // If no feature provided, return general subscription info with addons
    if (!feature) {
      return api.get('/subscriptions/addons');
    }
    return api.get(`/subscriptions/status/${feature}`);
  },
  
  // Start free trial
  startTrial: (feature) => api.post('/subscriptions/start-trial', { feature }),
  
  // Get recommended tier based on order count
  getRecommendedTier: (feature) => api.get(`/subscriptions/recommended-tier/${feature}`),
  
  // Subscribe to a feature
  subscribe: (feature, tier, paymentRef) => 
    api.post('/subscriptions/subscribe', { feature, tier, paymentRef }),
    
  // Activate an add-on (after payment)
  activateAddon: (addonId, paymentRef, months = 1) => 
    api.post('/subscriptions/addon', { addonId, paymentRef, months }),
};

// ===========================================
// KYC API
// ===========================================
export const kycAPI = {
  // Get KYC status
  getStatus: () => api.get('/kyc/status'),
  
  // Submit/Save KYC documents (status stays docs_uploaded)
  submit: (data) => api.post('/kyc/submit', data),
  
  // Submit for IntaSend review (changes status to submitted_to_intasend)
  submitForReview: () => api.post('/kyc/submit-for-review'),
  
  // MOCK: Instantly approve KYC for testing (test mode only)
  mockApprove: () => api.post('/kyc/mock-approve'),
  
  // Resubmit after rejection
  resubmit: (data) => api.post('/kyc/resubmit', data),
  
  // Create support ticket
  createSupportTicket: (data) => api.post('/kyc/support', data),
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
