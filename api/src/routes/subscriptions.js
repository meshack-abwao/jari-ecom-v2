// ============================================================================
// SUBSCRIPTIONS API - Subscription Management
// Phase D1: Pricing & Subscriptions
// ============================================================================

import { Router } from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// ===========================================
// PRICING CONFIGURATION (v2.0 - No Setup Fee)
// ===========================================

// Subscription pricing
const SUBSCRIPTION_PLANS = {
  base: { 
    name: 'Base Plan', 
    price: 1200, 
    features: ['3 product cards', '1 free theme', 'Basic analytics', 'Shareable store link', 'Order management']
  }
};

// Add-on pricing
const ADDONS = {
  mpesa_stk: { name: 'M-Pesa STK Push', price: 300, description: 'Instant M-Pesa prompt, auto-confirmation' },
  whatsapp_auto: { name: 'WhatsApp Auto-Reply', price: 80, description: '24/7 automated responses' },
  advanced_analytics: { name: 'Advanced Analytics', price: 200, description: 'Traffic sources, conversion rates, insights' },
  priority_support: { name: 'Priority Support', price: 500, description: 'Fast response, dedicated assistance' }
};

// Card bundles (one-time purchase)
const CARD_BUNDLES = {
  starter: { name: 'Starter Pack', cards: 4, price: 350, pricePerCard: 87 },
  growth: { name: 'Growth Pack', cards: 7, price: 550, pricePerCard: 79 },
  pro: { name: 'Pro Pack', cards: 12, price: 850, pricePerCard: 71 }
};

// Card tier monthly fees (for >15 cards)
const CARD_TIERS = {
  tier1: { range: '1-15', fee: 0 },
  tier2: { range: '16-30', fee: 200 },
  tier3: { range: '31-60', fee: 500 },
  enterprise: { range: '60+', fee: null, note: 'Contact us' }
};

// ============================================================================
// GET /api/subscriptions - Get current subscription status
// ============================================================================
router.get('/', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Get store with subscription info
    const storeResult = await db.query(
      `SELECT id, subscription_status, subscription_expires, trial_ends_at, created_at 
       FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    
    // Get active add-ons
    const addonsResult = await db.query(
      `SELECT addon_type, activated_at, expires_at FROM store_addons 
       WHERE store_id = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
      [store.id]
    );
    
    // Calculate subscription status
    const now = new Date();
    const trialEnds = store.trial_ends_at ? new Date(store.trial_ends_at) : null;
    const subExpires = store.subscription_expires ? new Date(store.subscription_expires) : null;
    
    let status = store.subscription_status || 'trial';
    let daysRemaining = 0;
    
    if (status === 'trial' && trialEnds) {
      daysRemaining = Math.max(0, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24)));
      if (daysRemaining === 0) status = 'expired';
    } else if (status === 'active' && subExpires) {
      daysRemaining = Math.max(0, Math.ceil((subExpires - now) / (1000 * 60 * 60 * 24)));
      if (daysRemaining === 0) status = 'expired';
    }
    
    res.json({
      status,
      plan: 'base',
      daysRemaining,
      trialEndsAt: store.trial_ends_at,
      subscriptionExpires: store.subscription_expires,
      activeAddons: addonsResult.rows.map(a => ({
        type: a.addon_type,
        ...ADDONS[a.addon_type],
        activatedAt: a.activated_at,
        expiresAt: a.expires_at
      })),
      availableAddons: Object.entries(ADDONS).map(([id, addon]) => ({
        id,
        ...addon,
        active: addonsResult.rows.some(a => a.addon_type === id)
      }))
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// GET /api/subscriptions/pricing - Get all pricing info
// ============================================================================
router.get('/pricing', async (req, res) => {
  res.json({
    setupFee: SETUP_FEE,
    plans: SUBSCRIPTION_PLANS,
    addons: ADDONS,
    trial: TRIAL_CONFIG,
    paymentOptions: PAYMENT_OPTIONS,
    currency: 'KES'
  });
});

// ============================================================================
// POST /api/subscriptions/activate - Activate subscription (after payment)
// ============================================================================
router.post('/activate', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { paymentRef, months = 1 } = req.body;
    
    // Get store
    const storeResult = await db.query(
      `SELECT id, subscription_status, subscription_expires FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    
    // Calculate new expiry date
    const currentExpiry = store.subscription_expires ? new Date(store.subscription_expires) : new Date();
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiry = new Date(baseDate);
    newExpiry.setMonth(newExpiry.getMonth() + months);
    
    // Update store subscription
    await db.query(
      `UPDATE stores SET 
        subscription_status = 'active',
        subscription_expires = $1
       WHERE id = $2`,
      [newExpiry, store.id]
    );
    
    // Record payment
    await db.query(
      `INSERT INTO platform_payments 
        (store_id, user_id, amount, type, item_id, item_name, status, completed_at)
       VALUES ($1, $2, $3, 'subscription', 'base', 'Base Plan', 'completed', NOW())`,
      [store.id, userId, SUBSCRIPTION_PLANS.base.price * months]
    );
    
    res.json({
      success: true,
      status: 'active',
      expiresAt: newExpiry,
      message: `Subscription activated for ${months} month(s)!`
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// POST /api/subscriptions/addon - Activate an add-on (after payment)
// ============================================================================
router.post('/addon', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { addonId, paymentRef, months = 1 } = req.body;
    
    // Validate addon
    const addon = ADDONS[addonId];
    if (!addon) {
      return res.status(400).json({ error: 'Invalid add-on' });
    }
    
    // Get store
    const storeResult = await db.query(
      `SELECT id FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    
    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);
    
    // Upsert addon
    await db.query(
      `INSERT INTO store_addons (store_id, addon_type, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (store_id, addon_type) 
       DO UPDATE SET expires_at = GREATEST(store_addons.expires_at, $3)`,
      [store.id, addonId, expiresAt]
    );
    
    // Record payment
    await db.query(
      `INSERT INTO platform_payments 
        (store_id, user_id, amount, type, item_id, item_name, status, completed_at)
       VALUES ($1, $2, $3, 'addon', $4, $5, 'completed', NOW())`,
      [store.id, userId, addon.price * months, addonId, addon.name]
    );
    
    res.json({
      success: true,
      addonId,
      addonName: addon.name,
      expiresAt,
      message: `${addon.name} activated for ${months} month(s)!`
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// GET /api/subscriptions/history - Get payment history
// ============================================================================
router.get('/history', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const result = await db.query(
      `SELECT * FROM platform_payments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    
    res.json({ payments: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
