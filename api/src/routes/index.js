import authRoutes from './auth.js';
import storesRoutes from './stores.js';
import productsRoutes from './products.js';
import ordersRoutes from './orders.js';
import publicRoutes from './public.js';
import pixelRoutes from './pixel.js';

export function setupRoutes(app) {
  // Health check
  app.get('/', (req, res) => {
    res.json({ status: 'ok', version: '2.0.0', message: 'Jari.Ecom API v2' });
  });
  
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '2.0.0' });
  });
  
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/store', storesRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/orders', ordersRoutes);
  
  // Public store routes (no /api prefix for cleaner URLs)
  app.use('/s', publicRoutes);
  
  // Pixel tracking - both paths for compatibility
  app.use('/pixel', pixelRoutes);      // For store (no /api prefix)
  app.use('/api/pixel', pixelRoutes);  // For dashboard (with /api prefix)
}
