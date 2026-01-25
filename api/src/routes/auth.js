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
 * 
 * SIMPLIFIED VERSION: Works without Migration 008 tables
 * Creates basic user + store only
 * Phase A tables (verification, settlement, etc.) will be added when migration runs
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
      
    } = req.body;
    
    // Validation
    if (!storeName || !ownerName || !email || !phone || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate slug from store name
    const slug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .slice(0, 50);
    
    // Add random suffix if slug is too short
    const finalSlug = slug.length < 3 ? `${slug}-${Date.now().toString(36)}` : slug;
    
    const hash = await bcrypt.hash(password, 10);
    
    // Start transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Create user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, profile)
         VALUES ($1, $2, $3) RETURNING id, email, profile`,
        [email, hash, { 
          business_name: storeName, 
          owner_name: ownerName, 
          phone,
          business_type: businessType,
          verification_tier: verificationTier,
          selected_addons: selectedAddons
        }]
      );
      
      const user = userResult.rows[0];
      
      // 2. Create store
      const templateMap = {
        food: 'vm',
        services: 'pbk',
        products: 'qd',
        premium: 'dd',
        events: 'events'
      };
      
      const defaultTemplate = templateMap[businessType] || 'qd';
      
      // Check if stores table has new columns (business_type, card_limit, etc.)
      const storeColumnsCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name IN ('business_type', 'card_limit', 'unlocked_themes')
      `);
      
      const hasNewColumns = storeColumnsCheck.rows.length === 3;
      
      let storeResult;
      if (hasNewColumns) {
        // Use new schema
        storeResult = await client.query(
          `INSERT INTO stores (
            user_id, slug, config, business_type, 
            card_limit, unlocked_themes, onboarding_completed
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, slug`,
          [
            user.id,
            finalSlug,
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
      } else {
        // Use old schema (backward compatible)
        storeResult = await client.query(
          `INSERT INTO stores (user_id, slug, config)
           VALUES ($1, $2, $3)
           RETURNING id, slug`,
          [
            user.id,
            finalSlug,
            { 
              name: storeName, 
              tagline: '', 
              theme: 'warm-sunset',
              contact_phone: phone,
              business_type: businessType,
              verification_tier: verificationTier
            }
          ]
        );
      }
      
      const storeId = storeResult.rows[0].id;
      const returnedSlug = storeResult.rows[0].slug;
      
      // 3-6. Try to create Phase A tables if they exist (graceful degradation)
      try {
        // Check if merchant_verification table exists
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'merchant_verification'
          );
        `);
        
        if (tableCheck.rows[0].exists) {
          const tierDefaults = {
            BASIC: { monthly_limit: 50000, per_tx_limit: 10000, delay: 3 },
            VERIFIED: { monthly_limit: 500000, per_tx_limit: 50000, delay: 2 },
            BUSINESS: { monthly_limit: null, per_tx_limit: null, delay: 0 }
          };
          
          const tierConfig = tierDefaults[verificationTier] || tierDefaults.BASIC;
          
          await client.query(
            `INSERT INTO merchant_verification (
              store_id, tier, phone_verified, email_verified,
              monthly_limit, per_transaction_limit, settlement_delay_days
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              storeId,
              verificationTier,
              false,
              false,
              tierConfig.monthly_limit,
              tierConfig.per_tx_limit,
              tierConfig.delay
            ]
          );
          
          await client.query(
            `INSERT INTO settlement_rules (store_id, hold_period_days)
             VALUES ($1, $2)`,
            [storeId, tierConfig.delay]
          );
          
          await client.query(
            `INSERT INTO complaint_metrics (store_id)
             VALUES ($1)`,
            [storeId]
          );
          
          await client.query(
            `INSERT INTO merchant_badges (store_id)
             VALUES ($1)`,
            [storeId]
          );
        }
      } catch (phaseAError) {
        // Phase A tables don't exist - that's okay, continue without them
        console.log('Phase A tables not found, continuing with basic signup:', phaseAError.message);
      }
      
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
          slug: returnedSlug,
          name: storeName,
          storeUrl: `https://jarisolutionsecom.store/?store=${returnedSlug}`,
          dashboardUrl: `https://dashboard.jarisolutionsecom.store`
        }
      });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email or store name already exists. Please try different values.' });
    }
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
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
