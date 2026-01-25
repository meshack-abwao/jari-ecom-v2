import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { config } from '../config/env.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// ============================================================================
// ENHANCED REGISTRATION (JTBD-DRIVEN MULTI-STEP SIGNUP)
// ============================================================================

/**
 * Step 1: Business Type Selection (stored in session, not committed yet)
 * POST /api/auth/signup/business-type
 */
router.post('/signup/business-type', async (req, res, next) => {
  try {
    const { businessType } = req.body;
    
    const validTypes = ['food', 'services', 'products', 'premium', 'events'];
    if (!validTypes.includes(businessType)) {
      return res.status(400).json({ error: 'Invalid business type' });
    }
    
    // Map business type to default free template
    const templateMap = {
      food: 'vm',      // Visual Menu
      services: 'pbk',  // Portfolio/Booking
      products: 'qd',   // Quick Decision
      premium: 'dd',    // Deep Dive
      events: 'events'  // Events/Booking
    };
    
    const defaultTemplate = templateMap[businessType];
    
    // Return template info + preview data
    res.json({
      success: true,
      businessType,
      defaultTemplate,
      templateName: getTemplateName(defaultTemplate),
      previewUrl: `/preview/${defaultTemplate}`, // For live preview
      smartAddons: getSmartAddons(businessType) // Recommended add-ons
    });
    
  } catch (err) {
    next(err);
  }
});

/**
 * Step 2: Complete Registration (with all collected data)
 * POST /api/auth/signup/complete
 */
router.post('/signup/complete', async (req, res, next) => {
  try {
    const {
      // Step 1 data
      businessType,
      
      // Step 3 data
      storeName,
      ownerName,
      email,
      phone,
      password,
      
      // Step 4 data
      selectedAddons, // ['mpesa_stk', 'whatsapp_auto']
      
      // Step 5 data
      verificationTier, // 'BASIC', 'VERIFIED', 'BUSINESS'
      
      // Optional documents (if VERIFIED/BUSINESS selected)
      nationalIdFront,
      nationalIdBack,
      businessRegDoc,
      kraDoc
      
    } = req.body;
    
    // Validation
    if (!storeName || !ownerName || !email || !phone || !password || !businessType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate slug from store name
    const slug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
    
    const hash = await bcrypt.hash(password, 10);
    
    // Start transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Create user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, profile)
         VALUES ($1, $2, $3) RETURNING id, email, profile`,
        [email, hash, { business_name: storeName, owner_name: ownerName, phone }]
      );
      
      const user = userResult.rows[0];
      
      // 2. Create store with business_type and initial settings
      const templateMap = {
        food: 'vm',
        services: 'pbk',
        products: 'qd',
        premium: 'dd',
        events: 'events'
      };
      
      const defaultTemplate = templateMap[businessType];
      
      const storeResult = await client.query(
        `INSERT INTO stores (
          user_id, slug, config, business_type, 
          card_limit, unlocked_themes, onboarding_completed
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          user.id,
          slug,
          { 
            name: storeName, 
            tagline: '', 
            theme: 'warm-sunset',
            contact_phone: phone
          },
          businessType,
          3, // Initial 3 cards
          JSON.stringify([defaultTemplate]), // Free template unlocked
          true // Onboarding complete
        ]
      );
      
      const storeId = storeResult.rows[0].id;
      
      // 3. Create merchant verification record
      const tierDefaults = {
        BASIC: { monthly_limit: 50000, per_tx_limit: 10000, delay: 3 },
        VERIFIED: { monthly_limit: 500000, per_tx_limit: 50000, delay: 2 },
        BUSINESS: { monthly_limit: null, per_tx_limit: null, delay: 0 }
      };
      
      const tierConfig = tierDefaults[verificationTier] || tierDefaults.BASIC;
      
      await client.query(
        `INSERT INTO merchant_verification (
          store_id, tier, phone_verified, email_verified,
          monthly_limit, per_transaction_limit, settlement_delay_days,
          national_id_front_url, national_id_back_url,
          business_reg_document_url, kra_document_url
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          storeId,
          verificationTier,
          false, // Will verify via OTP
          false, // Will verify via email link
          tierConfig.monthly_limit,
          tierConfig.per_tx_limit,
          tierConfig.delay,
          nationalIdFront || null,
          nationalIdBack || null,
          businessRegDoc || null,
          kraDoc || null
        ]
      );
      
      // 4. Create settlement rules
      await client.query(
        `INSERT INTO settlement_rules (
          store_id, hold_period_days
        )
         VALUES ($1, $2)`,
        [storeId, tierConfig.delay]
      );
      
      // 5. Create complaint metrics (initialize)
      await client.query(
        `INSERT INTO complaint_metrics (store_id)
         VALUES ($1)`,
        [storeId]
      );
      
      // 6. Create merchant badges (initialize)
      await client.query(
        `INSERT INTO merchant_badges (store_id)
         VALUES ($1)`,
        [storeId]
      );
      
      // 7. Activate selected add-ons (if payment successful)
      // NOTE: This will be handled by M-Pesa callback in Phase E
      // For now, just store the selected add-ons in user profile
      
      await client.query('COMMIT');
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, storeId },
        config.jwtSecret,
        { expiresIn: config.jwtExpiry }
      );
      
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          ...user.profile
        },
        store: {
          id: storeId,
          slug,
          name: storeName,
          storeUrl: `https://jarisolutionsecom.store/?store=${slug}`,
          dashboardUrl: `https://dashboard.jarisolutionsecom.store`
        },
        verification: {
          tier: verificationTier,
          settlementDelay: tierConfig.delay
        }
      });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email or store URL already exists' });
    }
    next(err);
  }
});

// ============================================================================
// LEGACY REGISTRATION (Keep for backwards compatibility)
// ============================================================================

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, businessName, instagram } = req.body;
    
    if (!email || !password || !businessName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const slug = (instagram?.replace('@', '') || businessName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
    
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, profile)
         VALUES ($1, $2, $3) RETURNING id, email, profile`,
        [email, hash, { business_name: businessName, instagram }]
      );
      
      const user = userResult.rows[0];
      
      await client.query(
        `INSERT INTO stores (user_id, slug, config)
         VALUES ($1, $2, $3)`,
        [user.id, slug, { name: businessName, tagline: '', theme: 'warm-sunset' }]
      );
      
      await client.query('COMMIT');
      
      const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
      
      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, ...user.profile }
      });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email or store URL already exists' });
    }
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await db.query(
      'SELECT id, email, password_hash, profile FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    
    res.json({
      token,
      user: { id: user.id, email: user.email, ...user.profile }
    });
    
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email, profile FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({ id: user.id, email: user.email, ...user.profile });
    
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTemplateName(templateId) {
  const names = {
    vm: 'Visual Menu',
    pbk: 'Portfolio/Booking',
    qd: 'Quick Decision',
    dd: 'Deep Dive',
    events: 'Events/Booking'
  };
  return names[templateId] || templateId;
}

function getSmartAddons(businessType) {
  // Smart defaults based on business type
  const addonRecommendations = {
    food: ['mpesa_stk', 'whatsapp_auto'], // Food needs payments + customer comms
    services: ['mpesa_stk'], // Services need payments + booking system (built-in)
    products: ['mpesa_stk', 'whatsapp_auto'], // Retail needs payments + support
    premium: ['mpesa_stk', 'priority_support'], // Premium wants fast support
    events: ['mpesa_stk', 'whatsapp_auto'] // Events need payments + reminders
  };
  
  return addonRecommendations[businessType] || ['mpesa_stk'];
}

export default router;
