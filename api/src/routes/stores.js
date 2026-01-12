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

// Update store config
router.put('/', auth, async (req, res, next) => {
  try {
    const { config: newConfig } = req.body;
    
    // Merge with existing config
    const result = await db.query(
      `UPDATE stores 
       SET config = config || $1::jsonb
       WHERE user_id = $2 
       RETURNING *`,
      [JSON.stringify(newConfig), req.user.userId]
    );
    
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
