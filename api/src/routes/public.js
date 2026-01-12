import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

// Get public store by slug (for customer-facing store)
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // Get store with user profile for business name
    const storeResult = await db.query(
      `SELECT s.*, u.profile
       FROM stores s
       JOIN users u ON s.user_id = u.id
       WHERE s.slug = $1`,
      [slug]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    
    // Get active products
    const productsResult = await db.query(
      `SELECT id, template, data, media
       FROM products
       WHERE store_id = $1 AND status = 'active'
       ORDER BY sort_order, created_at DESC`,
      [store.id]
    );
    
    // Get theme if specified
    let theme = null;
    if (store.config?.theme) {
      const themeResult = await db.query(
        'SELECT * FROM themes WHERE slug = $1',
        [store.config.theme]
      );
      if (themeResult.rows.length > 0) {
        theme = themeResult.rows[0];
      }
    }
    
    // Default theme
    if (!theme) {
      theme = {
        slug: 'warm-sunset',
        name: 'Warm Sunset',
        colors: { primary: '#ff9f0a', gradient: 'linear-gradient(135deg, #ff9f0a 0%, #ff375f 100%)' }
      };
    }
    
    res.json({
      store: {
        slug: store.slug,
        name: store.config?.name || store.profile?.business_name || 'Store',
        tagline: store.config?.tagline || '',
        logo: store.config?.logo || null,
        hero: store.config?.hero || null,
        features: store.config?.features || {},
        policies: store.config?.policies || {}
      },
      theme,
      products: productsResult.rows
    });
    
  } catch (err) {
    next(err);
  }
});

// Get single product (public)
router.get('/:slug/products/:productId', async (req, res, next) => {
  try {
    const { slug, productId } = req.params;
    
    const result = await db.query(
      `SELECT p.id, p.template, p.data, p.media
       FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE s.slug = $1 AND p.id = $2 AND p.status = 'active'`,
      [slug, productId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
