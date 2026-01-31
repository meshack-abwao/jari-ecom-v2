import { Router } from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Get all products for user's store
router.get('/', auth, async (req, res, next) => {
  try {
    // Get store ID first
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    const result = await db.query(
      `SELECT id, template, status, data, media, sort_order, checkout_mode, checkout_config, created_at, updated_at
       FROM products 
       WHERE store_id = $1 
       ORDER BY sort_order, created_at DESC`,
      [storeId]
    );
    
    res.json({ success: true, products: result.rows });
  } catch (err) {
    next(err);
  }
});

// Create product
router.post('/', auth, async (req, res, next) => {
  try {
    const { template, data, media, checkout_mode, checkout_config } = req.body;
    
    // Get store ID and default_checkout
    const storeResult = await db.query(
      'SELECT id, default_checkout FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    const defaultCheckout = storeResult.rows[0].default_checkout || 'standard';
    
    // Stringify JSONB fields
    const result = await db.query(
      `INSERT INTO products (store_id, template, data, media, checkout_mode, checkout_config)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6::jsonb)
       RETURNING *`,
      [
        storeId, 
        template || 'quick-decision', 
        JSON.stringify(data || {}), 
        JSON.stringify(media || []),
        checkout_mode || defaultCheckout,
        JSON.stringify(checkout_config || {})
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get single product
router.get('/:id', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.* FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id = $1 AND s.user_id = $2`,
      [req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update product
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { template, status, data, media, sort_order, checkout_mode, checkout_config } = req.body;
    
    // Build dynamic update
    const updates = [];
    const values = [];
    let idx = 1;
    
    if (template !== undefined) { 
      updates.push(`template = $${idx++}`); 
      values.push(template); 
    }
    if (status !== undefined) { 
      updates.push(`status = $${idx++}`); 
      values.push(status); 
    }
    if (data !== undefined) { 
      updates.push(`data = $${idx++}::jsonb`); 
      values.push(JSON.stringify(data)); 
    }
    if (media !== undefined) { 
      updates.push(`media = $${idx++}::jsonb`); 
      values.push(JSON.stringify(media)); 
    }
    if (sort_order !== undefined) { 
      updates.push(`sort_order = $${idx++}`); 
      values.push(sort_order); 
    }
    if (checkout_mode !== undefined) { 
      updates.push(`checkout_mode = $${idx++}`); 
      values.push(checkout_mode); 
    }
    if (checkout_config !== undefined) { 
      updates.push(`checkout_config = $${idx++}::jsonb`); 
      values.push(JSON.stringify(checkout_config)); 
    }
    
    updates.push(`updated_at = NOW()`);
    
    values.push(req.params.id);
    values.push(req.user.userId);
    
    const result = await db.query(
      `UPDATE products p
       SET ${updates.join(', ')}
       FROM stores s
       WHERE p.id = $${idx++} AND p.store_id = s.id AND s.user_id = $${idx}
       RETURNING p.*`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete product
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      `DELETE FROM products p
       USING stores s
       WHERE p.id = $1 AND p.store_id = s.id AND s.user_id = $2
       RETURNING p.id`,
      [req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
