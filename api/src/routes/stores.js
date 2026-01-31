import { Router } from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Get user's store
router.get('/', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update store config and/or slug
router.put('/', auth, async (req, res, next) => {
  try {
    const { config: newConfig, slug: newSlug, default_checkout, unlocked_checkouts } = req.body;
    
    // If slug is being updated, check if it's unique
    if (newSlug) {
      const slugCheck = await db.query(
        'SELECT id FROM stores WHERE slug = $1 AND user_id != $2',
        [newSlug, req.user.userId]
      );
      if (slugCheck.rows.length > 0) {
        return res.status(400).json({ error: 'This slug is already taken. Please choose another.' });
      }
    }
    
    // Build dynamic update parts
    const setParts = [];
    const params = [];
    let paramIndex = 1;
    
    if (newConfig) {
      setParts.push(`config = config || $${paramIndex}::jsonb`);
      params.push(JSON.stringify(newConfig));
      paramIndex++;
    }
    if (newSlug) {
      setParts.push(`slug = $${paramIndex}`);
      params.push(newSlug);
      paramIndex++;
    }
    if (default_checkout) {
      setParts.push(`default_checkout = $${paramIndex}`);
      params.push(default_checkout);
      paramIndex++;
    }
    if (unlocked_checkouts) {
      setParts.push(`unlocked_checkouts = $${paramIndex}`);
      params.push(unlocked_checkouts);
      paramIndex++;
    }
    
    if (setParts.length === 0) {
      return res.status(400).json({ error: 'No data to update' });
    }
    
    params.push(req.user.userId);
    const updateQuery = `UPDATE stores SET ${setParts.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`;
    
    const result = await db.query(updateQuery, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get available themes
router.get('/themes', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM themes ORDER BY sort_order'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get available templates
router.get('/templates', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM templates WHERE is_active = true ORDER BY sort_order'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get available checkout modes
router.get('/checkout-modes', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM checkout_modes WHERE is_active = true ORDER BY sort_order'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
