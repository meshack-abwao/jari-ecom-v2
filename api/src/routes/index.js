import authRoutes from './auth.js';
import storesRoutes from './stores.js';
import productsRoutes from './products.js';
import ordersRoutes from './orders.js';
import foodOrdersRoutes from './food-orders.js';
import publicRoutes from './public.js';
import pixelRoutes from './pixel.js';
import bookingsRoutes from './bookings.js';
import uploadRoutes from './upload.js';
import mpesaRoutes from './mpesa.js';
import cloudinaryRoutes from './cloudinary.js';
import otpRoutes from './otp.js';
import cardsRoutes from './cards.js';
import templatesRoutes from './templates.js';
import subscriptionsRoutes from './subscriptions.js';

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
  app.use('/api/food-orders', foodOrdersRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/mpesa', mpesaRoutes);
  app.use('/api/cloudinary', cloudinaryRoutes);
  app.use('/api/otp', otpRoutes);
  app.use('/api/cards', cardsRoutes);
  app.use('/api/templates', templatesRoutes);
  app.use('/api/subscriptions', subscriptionsRoutes);
  
  // Public store routes (no /api prefix for cleaner URLs)
  app.use('/s', publicRoutes);
  
  // Pixel tracking - both paths for compatibility
  app.use('/pixel', pixelRoutes);      // For store (no /api prefix)
  app.use('/api/pixel', pixelRoutes);  // For dashboard (with /api prefix)
}
