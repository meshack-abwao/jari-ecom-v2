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
        // Contact
        contact_phone: config.contact_phone || config.contactPhone || '',
        // Payment (M-Pesa)
        payment: {
          type: config.payment_type || config.paymentType || '',
          paybill_number: config.paybill_number || config.paybillNumber || '',
          paybill_account: config.paybill_account_number || config.paybillAccountNumber || '',
          till_number: config.till_number || config.tillNumber || '',
          business_name: config.payment_business_name || config.paymentBusinessName || '',
        },
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


// ===========================================
// PUBLIC BOOKING ENDPOINTS
// ===========================================

// Get booking settings for a store
router.get('/:slug/booking-settings', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const storeResult = await db.query('SELECT id FROM stores WHERE slug = $1', [slug]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    const storeId = storeResult.rows[0].id;
    
    const result = await db.query('SELECT * FROM booking_settings WHERE store_id = $1', [storeId]);
    res.json(result.rows[0] || {});
  } catch (err) {
    next(err);
  }
});

// Get working hours for a store
router.get('/:slug/working-hours', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const storeResult = await db.query('SELECT id FROM stores WHERE slug = $1', [slug]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    const storeId = storeResult.rows[0].id;
    
    const result = await db.query(
      'SELECT * FROM working_hours WHERE store_id = $1 ORDER BY day_of_week',
      [storeId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get blocked dates for a store
router.get('/:slug/blocked-dates', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const storeResult = await db.query('SELECT id FROM stores WHERE slug = $1', [slug]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    const storeId = storeResult.rows[0].id;
    
    const result = await db.query(
      'SELECT * FROM blocked_dates WHERE store_id = $1 AND blocked_date >= CURRENT_DATE ORDER BY blocked_date',
      [storeId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get available time slots for a date
router.get('/:slug/availability', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }
    
    const storeResult = await db.query('SELECT id FROM stores WHERE slug = $1', [slug]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    const storeId = storeResult.rows[0].id;
    
    // Get settings
    const settingsResult = await db.query('SELECT * FROM booking_settings WHERE store_id = $1', [storeId]);
    const settings = settingsResult.rows[0] || { slot_duration_minutes: 60, max_bookings_per_slot: 1 };
    
    // Get working hours for the day
    const dayOfWeek = new Date(date).getDay();
    const hoursResult = await db.query(
      'SELECT * FROM working_hours WHERE store_id = $1 AND day_of_week = $2',
      [storeId, dayOfWeek]
    );
    const hours = hoursResult.rows[0];
    
    if (!hours || !hours.is_open) {
      return res.json({ available: false, slots: [], reason: 'Closed on this day' });
    }
    
    // Check if date is blocked
    const blockedResult = await db.query(
      'SELECT * FROM blocked_dates WHERE store_id = $1 AND blocked_date = $2',
      [storeId, date]
    );
    if (blockedResult.rows.length > 0) {
      return res.json({ available: false, slots: [], reason: blockedResult.rows[0].reason || 'Unavailable' });
    }
    
    // Generate time slots
    const slots = [];
    const startTime = hours.start_time.substring(0, 5);
    const endTime = hours.end_time.substring(0, 5);
    const duration = settings.slot_duration_minutes;
    
    let [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
      const timeStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
      
      // Count existing bookings for this slot
      const bookingsResult = await db.query(
        `SELECT COUNT(*) FROM bookings 
         WHERE store_id = $1 AND booking_date = $2 AND booking_time = $3 AND status != 'cancelled'`,
        [storeId, date, timeStr]
      );
      const bookedCount = parseInt(bookingsResult.rows[0].count);
      const available = bookedCount < settings.max_bookings_per_slot;
      
      slots.push({ time: timeStr, available, bookedCount });
      
      // Advance by duration
      startMin += duration;
      while (startMin >= 60) {
        startMin -= 60;
        startHour += 1;
      }
    }
    
    res.json({ available: true, slots });
  } catch (err) {
    next(err);
  }
});

// Create a booking (public)
router.post('/:slug/bookings', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { product_id, package_name, package_price, booking_date, booking_time, customer_name, customer_phone, customer_email, notes } = req.body;
    
    const storeResult = await db.query('SELECT id FROM stores WHERE slug = $1', [slug]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    const storeId = storeResult.rows[0].id;
    
    // Validate required fields
    if (!booking_date || !booking_time || !customer_name || !customer_phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create booking
    const result = await db.query(`
      INSERT INTO bookings (store_id, product_id, package_name, package_price, booking_date, booking_time, customer_name, customer_phone, customer_email, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING *
    `, [storeId, product_id, package_name, package_price, booking_date, booking_time, customer_name, customer_phone, customer_email, notes]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
