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
    const { config: newConfig, slug: newSlug } = req.body;
    
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
    
    // Build update query dynamically
    let updateQuery;
    let params;
    
    if (newSlug && newConfig) {
      updateQuery = `UPDATE stores SET config = config || $1::jsonb, slug = $2 WHERE user_id = $3 RETURNING *`;
      params = [JSON.stringify(newConfig), newSlug, req.user.userId];
    } else if (newSlug) {
      updateQuery = `UPDATE stores SET slug = $1 WHERE user_id = $2 RETURNING *`;
      params = [newSlug, req.user.userId];
    } else if (newConfig) {
      updateQuery = `UPDATE stores SET config = config || $1::jsonb WHERE user_id = $2 RETURNING *`;
      params = [JSON.stringify(newConfig), req.user.userId];
    } else {
      return res.status(400).json({ error: 'No data to update' });
    }
    
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

export default router;
