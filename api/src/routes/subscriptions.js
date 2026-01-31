import express from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Pricing tiers configuration
const PRICING_TIERS = {
  abandoned_checkouts: {
    starter: { price: 300, maxOrders: 50, name: 'Starter' },
    growth: { price: 700, maxOrders: 200, name: 'Growth' },
    pro: { price: 1500, maxOrders: Infinity, name: 'Pro' }
  }
};

const TRIAL_DAYS = 30;

// Available add-ons configuration
const AVAILABLE_ADDONS = [
  { 
    id: 'mpesa_stk', 
    name: 'M-Pesa STK Push', 
    description: 'Accept M-Pesa payments with one-tap STK Push. Customers pay instantly without leaving your store.', 
    price: 5 
  },
  { 
    id: 'whatsapp_auto', 
    name: 'WhatsApp Automation', 
    description: 'Send automatic order confirmations, shipping updates, and follow-ups via WhatsApp.', 
    price: 800 
  },
  { 
    id: 'advanced_analytics', 
    name: 'Advanced Analytics', 
    description: 'Deep insights into customer behavior, product performance, and revenue trends.', 
    price: 600 
  },
  { 
    id: 'priority_support', 
    name: 'Priority Support', 
    description: '24/7 priority support with dedicated account manager and faster response times.', 
    price: 1000 
  },
];

// GET /subscriptions/addons - Get all available addons with active status
router.get('/addons', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's store
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Get active addons from store_addons table
    const addonsResult = await db.query(
      'SELECT addon_type FROM store_addons WHERE store_id = $1 AND (expires_at IS NULL OR expires_at > NOW())',
      [storeId]
    );
    
    const activeAddonIds = addonsResult.rows.map(row => row.addon_type);
    
    // Map available addons with active status
    const addonsWithStatus = AVAILABLE_ADDONS.map(addon => ({
      ...addon,
      active: activeAddonIds.includes(addon.id)
    }));
    
    res.json({
      availableAddons: addonsWithStatus,
      activeAddons: activeAddonIds
    });
    
  } catch (error) {
    console.error('Get addons error:', error);
    res.status(500).json({ error: 'Failed to get addons' });
  }
});

// GET /subscriptions/status/:feature - Check subscription status
router.get('/status/:feature', auth, async (req, res) => {
  try {
    const { feature } = req.params;
    const userId = req.user.userId;
    
    // Get user's store
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Check for existing subscription
    const subResult = await db.query(
      'SELECT * FROM store_subscriptions WHERE store_id = $1 AND feature = $2',
      [storeId, feature]
    );
    
    if (subResult.rows.length === 0) {
      // No subscription exists
      return res.json({
        status: 'none',
        canAccess: false,
        trialAvailable: true
      });
    }
    
    const sub = subResult.rows[0];
    const now = new Date();
    
    // Check trial status
    if (sub.status === 'trial') {
      const trialEnds = new Date(sub.trial_ends_at);
      if (now < trialEnds) {
        return res.json({
          status: 'trial',
          canAccess: true,
          trialEndsAt: sub.trial_ends_at,
          daysRemaining: Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24))
        });
      } else {
        // Trial expired
        await db.query(
          'UPDATE store_subscriptions SET status = $1, updated_at = NOW() WHERE id = $2',
          ['expired', sub.id]
        );
        return res.json({
          status: 'expired',
          canAccess: false,
          trialAvailable: false
        });
      }
    }
    
    // Check active subscription
    if (sub.status === 'active') {
      const expires = new Date(sub.expires_at);
      if (now < expires) {
        return res.json({
          status: 'active',
          canAccess: true,
          tier: sub.tier,
          expiresAt: sub.expires_at,
          monthlyPrice: sub.monthly_price
        });
      } else {
        // Subscription expired
        await db.query(
          'UPDATE store_subscriptions SET status = $1, updated_at = NOW() WHERE id = $2',
          ['expired', sub.id]
        );
        return res.json({
          status: 'expired',
          canAccess: false,
          tier: sub.tier
        });
      }
    }
    
    // Expired or cancelled
    return res.json({
      status: sub.status,
      canAccess: false,
      tier: sub.tier
    });
    
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// POST /subscriptions/start-trial - Start free trial
router.post('/start-trial', auth, async (req, res) => {
  try {
    const { feature } = req.body;
    const userId = req.user.userId;
    
    if (!feature) {
      return res.status(400).json({ error: 'Feature is required' });
    }
    
    // Get user's store
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Check if trial already used
    const existingResult = await db.query(
      'SELECT * FROM store_subscriptions WHERE store_id = $1 AND feature = $2',
      [storeId, feature]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Trial already used for this feature',
        status: existingResult.rows[0].status
      });
    }
    
    // Calculate trial end date
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + TRIAL_DAYS);
    
    // Create trial subscription
    const result = await db.query(`
      INSERT INTO store_subscriptions (store_id, feature, status, trial_started_at, trial_ends_at)
      VALUES ($1, $2, 'trial', NOW(), $3)
      RETURNING *
    `, [storeId, feature, trialEnds]);
    
    res.json({
      success: true,
      status: 'trial',
      trialEndsAt: result.rows[0].trial_ends_at,
      daysRemaining: TRIAL_DAYS
    });
    
  } catch (error) {
    console.error('Start trial error:', error);
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

// GET /subscriptions/recommended-tier/:feature - Get recommended tier based on order count
router.get('/recommended-tier/:feature', auth, async (req, res) => {
  try {
    const { feature } = req.params;
    const userId = req.user.userId;
    
    // Get user's store
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Get last month's order count
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthStr = lastMonth.toISOString().slice(0, 7);
    
    const countResult = await db.query(
      'SELECT order_count FROM store_order_counts WHERE store_id = $1 AND month = $2',
      [storeId, monthStr]
    );
    
    const orderCount = countResult.rows[0]?.order_count || 0;
    
    // Also count from orders table as backup
    const ordersResult = await db.query(`
      SELECT COUNT(*) as count FROM orders 
      WHERE store_id = $1 
      AND created_at >= NOW() - INTERVAL '30 days'
    `, [storeId]);
    
    const recentOrders = parseInt(ordersResult.rows[0]?.count || 0);
    const effectiveCount = Math.max(orderCount, recentOrders);
    
    // Determine recommended tier
    const tiers = PRICING_TIERS[feature];
    let recommendedTier = 'starter';
    
    if (effectiveCount > 200) {
      recommendedTier = 'pro';
    } else if (effectiveCount > 50) {
      recommendedTier = 'growth';
    }
    
    res.json({
      orderCount: effectiveCount,
      recommendedTier,
      tiers: Object.entries(tiers).map(([key, value]) => ({
        key,
        ...value,
        recommended: key === recommendedTier
      }))
    });
    
  } catch (error) {
    console.error('Recommended tier error:', error);
    res.status(500).json({ error: 'Failed to get recommended tier' });
  }
});

// POST /subscriptions/subscribe - Subscribe to a feature (placeholder for M-Pesa integration)
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { feature, tier, paymentRef } = req.body;
    const userId = req.user.userId;
    
    if (!feature || !tier) {
      return res.status(400).json({ error: 'Feature and tier are required' });
    }
    
    // Get user's store
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Get tier pricing
    const tierConfig = PRICING_TIERS[feature]?.[tier];
    if (!tierConfig) {
      return res.status(400).json({ error: 'Invalid feature or tier' });
    }
    
    // Calculate expiry (1 month from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    // Create or update subscription
    const result = await db.query(`
      INSERT INTO store_subscriptions (
        store_id, feature, tier, status, subscribed_at, expires_at, 
        monthly_price, last_payment_at, last_payment_ref
      )
      VALUES ($1, $2, $3, 'active', NOW(), $4, $5, NOW(), $6)
      ON CONFLICT (store_id, feature) 
      DO UPDATE SET 
        tier = $3,
        status = 'active',
        subscribed_at = COALESCE(store_subscriptions.subscribed_at, NOW()),
        expires_at = $4,
        monthly_price = $5,
        last_payment_at = NOW(),
        last_payment_ref = $6,
        updated_at = NOW()
      RETURNING *
    `, [storeId, feature, tier, expiresAt, tierConfig.price, paymentRef || null]);
    
    res.json({
      success: true,
      subscription: result.rows[0]
    });
    
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

export default router;
