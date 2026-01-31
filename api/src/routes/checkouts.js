import { Router } from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Get store's unlocked checkouts with full mode details
router.get('/unlocked', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id, unlocked_checkouts, default_checkout FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const unlockedSlugs = store.unlocked_checkouts || ['standard'];
    
    // Get all checkout modes with unlocked status
    const modesResult = await db.query(
      'SELECT * FROM checkout_modes WHERE is_active = true ORDER BY sort_order'
    );
    
    const modes = modesResult.rows.map(mode => ({
      ...mode,
      is_unlocked: unlockedSlugs.includes(mode.slug)
    }));
    
    res.json({
      unlocked_checkouts: unlockedSlugs,
      default_checkout: store.default_checkout || 'standard',
      modes
    });
  } catch (err) {
    next(err);
  }
});

// Unlock a checkout mode (after payment)
router.post('/unlock', auth, async (req, res, next) => {
  try {
    const { checkout_mode, payment_ref, price_paid } = req.body;
    
    if (!checkout_mode) {
      return res.status(400).json({ error: 'checkout_mode is required' });
    }
    
    // Get store
    const storeResult = await db.query(
      'SELECT id, unlocked_checkouts FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const store = storeResult.rows[0];
    const currentUnlocked = store.unlocked_checkouts || ['standard'];
    
    // Check if already unlocked
    if (currentUnlocked.includes(checkout_mode)) {
      return res.status(400).json({ error: 'Checkout mode already unlocked' });
    }
    
    // Verify checkout_mode exists
    const modeCheck = await db.query(
      'SELECT slug, price FROM checkout_modes WHERE slug = $1 AND is_active = true',
      [checkout_mode]
    );
    
    if (modeCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid checkout mode' });
    }
    
    // Record the unlock
    await db.query(
      `INSERT INTO checkout_unlocks (store_id, checkout_mode, price_paid, payment_ref)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (store_id, checkout_mode) DO NOTHING`,
      [store.id, checkout_mode, price_paid || 0, payment_ref || null]
    );
    
    // Add to unlocked_checkouts array
    const newUnlocked = [...currentUnlocked, checkout_mode];
    const updateResult = await db.query(
      'UPDATE stores SET unlocked_checkouts = $1 WHERE id = $2 RETURNING *',
      [newUnlocked, store.id]
    );
    
    res.json({
      success: true,
      unlocked_checkouts: updateResult.rows[0].unlocked_checkouts,
      message: `${checkout_mode} checkout unlocked successfully`
    });
  } catch (err) {
    next(err);
  }
});

// Get unlock history
router.get('/history', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const result = await db.query(
      `SELECT cu.*, cm.name, cm.description 
       FROM checkout_unlocks cu
       JOIN checkout_modes cm ON cu.checkout_mode = cm.slug
       WHERE cu.store_id = $1
       ORDER BY cu.unlocked_at DESC`,
      [storeResult.rows[0].id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
