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
    const config = store.config || {};
    const profile = store.profile || {};
    
    // Get active products
    const productsResult = await db.query(
      `SELECT id, template, data, media
       FROM products
       WHERE store_id = $1 AND status = 'active'
       ORDER BY sort_order, created_at DESC`,
      [store.id]
    );
    
    // Get theme if specified (check multiple field names)
    let theme = null;
    const themeSlug = config.theme_slug || config.themeSlug || config.theme || config.theme_color;
    if (themeSlug) {
      const themeResult = await db.query(
        'SELECT * FROM themes WHERE slug = $1',
        [themeSlug]
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
    
    // Build store response with support for both snake_case and camelCase config keys
    res.json({
      store: {
        id: store.id,  // Required for pixel tracking
        slug: store.slug,
        // Name - check multiple fields
        name: config.store_name || config.storeName || config.name || profile.business_name || 'Store',
        tagline: config.tagline || '',
        // Logo
        logo_text: config.logo_text || config.logoText || (config.store_name || profile.business_name || 'S').charAt(0),
        logo_url: config.logo_url || config.logoUrl || null,
        // Hero section
        hero: {
          title: config.hero_title || config.heroTitle || config.store_name || profile.business_name || '',
          subtitle: config.hero_subtitle || config.heroSubtitle || config.tagline || '',
          photo_url: config.hero_photo_url || config.heroPhotoUrl || null,
          background_url: config.header_bg_url || config.headerBgUrl || null,
          cta_primary: {
            text: config.hero_cta_primary_text || config.heroCtaPrimaryText || '',
            link: config.hero_cta_primary_link || config.heroCtaPrimaryLink || '',
          },
          cta_secondary: {
            text: config.hero_cta_secondary_text || config.heroCtaSecondaryText || '',
            link: config.hero_cta_secondary_link || config.heroCtaSecondaryLink || '',
          },
        },
        // Categories & Collection
        categories: config.categories || [],
        collection_title: config.collection_title || 'Shop All Products',
        collection_subtitle: config.collection_subtitle || '',
        // Testimonials
        show_testimonials: config.show_testimonials !== false,
        testimonials: config.testimonials || [],
        // Policies
        policies: {
          privacy: config.privacy_policy || config.privacyPolicy || '',
          terms: config.terms_of_service || config.termsOfService || '',
          refund: config.refund_policy || config.refundPolicy || '',
        },
        // Font
        font_family: config.font_family || config.fontFamily || 'Inter',
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
