// ============================================================================
// CARDS API - Product Card Management
// Phase C1: Card Purchase System
// ============================================================================

import express from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Card bundle pricing (v2.0 - matches pricing doc)
// Note: "cards" = additional cards added to the 3 included
const CARD_BUNDLES = {
  starter: { cards: 4, totalCards: 7, price: 350, pricePerCard: 87, name: 'Starter Pack' },
  growth: { cards: 7, totalCards: 10, price: 550, pricePerCard: 79, name: 'Growth Pack' },
  pro: { cards: 12, totalCards: 15, price: 850, pricePerCard: 71, name: 'Pro Pack' }
};

// ============================================================================
// GET /api/cards/balance - Get store's card balance
// ============================================================================
router.get('/balance', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get store and card limit
    const storeResult = await db.query(
      `SELECT id, product_card_limit FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const cardLimit = store.product_card_limit || 3;
    
    // Count products (cards used)
    const productCount = await db.query(
      `SELECT COUNT(*) as count FROM products WHERE store_id = $1`,
      [store.id]
    );
    
    const cardsUsed = parseInt(productCount.rows[0].count) || 0;
    const cardsRemaining = Math.max(0, cardLimit - cardsUsed);
    
    res.json({
      cardLimit,
      cardsUsed,
      cardsRemaining,
      canAddProduct: cardsRemaining > 0
    });
  } catch (error) {
    console.error('Error getting card balance:', error);
    res.status(500).json({ error: 'Failed to get card balance' });
  }
});

// ============================================================================
// POST /api/cards/check-limit - Check if store can add more products
// ============================================================================
router.post('/check-limit', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get store and card limit
    const storeResult = await db.query(
      `SELECT id, product_card_limit FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const cardLimit = store.product_card_limit || 3;
    
    // Count products
    const productCount = await db.query(
      `SELECT COUNT(*) as count FROM products WHERE store_id = $1`,
      [store.id]
    );
    
    const cardsUsed = parseInt(productCount.rows[0].count) || 0;
    const canAdd = cardsUsed < cardLimit;
    
    res.json({
      canAdd,
      cardsUsed,
      cardLimit,
      cardsRemaining: Math.max(0, cardLimit - cardsUsed),
      reason: canAdd ? null : 'Product limit reached. Purchase more cards to add products.'
    });
  } catch (error) {
    console.error('Error checking card limit:', error);
    res.status(500).json({ error: 'Failed to check card limit' });
  }
});

// ============================================================================
// GET /api/cards/bundles - Get available card bundles
// ============================================================================
router.get('/bundles', auth, async (req, res) => {
  try {
    res.json({
      bundles: Object.entries(CARD_BUNDLES).map(([id, bundle]) => ({
        id,
        name: bundle.name,
        cards: bundle.cards,
        totalCards: bundle.totalCards,
        price: bundle.price,
        pricePerCard: bundle.pricePerCard
      }))
    });
  } catch (error) {
    console.error('Error getting card bundles:', error);
    res.status(500).json({ error: 'Failed to get card bundles' });
  }
});

// ============================================================================
// POST /api/cards/purchase - Purchase card bundle (after M-Pesa payment)
// ============================================================================
router.post('/purchase', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bundleType, paymentRef } = req.body;
    
    // Validate bundle type
    const bundle = CARD_BUNDLES[bundleType];
    if (!bundle) {
      return res.status(400).json({ error: 'Invalid bundle type' });
    }
    
    // Get store
    const storeResult = await db.query(
      `SELECT id, product_card_limit FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const previousLimit = store.product_card_limit || 3;
    const newLimit = previousLimit + bundle.cards;
    
    // Record purchase
    await db.query(
      `INSERT INTO card_purchases 
       (store_id, bundle_type, cards_added, previous_card_limit, new_card_limit, 
        amount_paid, total_paid, payment_ref, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')`,
      [store.id, bundleType, bundle.cards, previousLimit, newLimit, 
       bundle.price, bundle.price, paymentRef]
    );
    
    // Update store's card limit (ADD, not SET)
    await db.query(
      `UPDATE stores SET product_card_limit = $1 WHERE id = $2`,
      [newLimit, store.id]
    );
    
    res.json({
      success: true,
      cardsAdded: bundle.cards,
      previousLimit,
      newLimit,
      message: `Successfully added ${bundle.cards} product cards!`
    });
  } catch (error) {
    console.error('Error purchasing cards:', error);
    res.status(500).json({ error: 'Failed to purchase cards' });
  }
});

// ============================================================================
// GET /api/cards/history - Get purchase history
// ============================================================================
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get store
    const storeResult = await db.query(
      `SELECT id FROM stores WHERE user_id = $1`,
      [userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const purchases = await db.query(
      `SELECT * FROM card_purchases 
       WHERE store_id = $1 
       ORDER BY purchased_at DESC`,
      [storeResult.rows[0].id]
    );
    
    res.json({ purchases: purchases.rows });
  } catch (error) {
    console.error('Error getting card history:', error);
    res.status(500).json({ error: 'Failed to get card history' });
  }
});

export default router;
