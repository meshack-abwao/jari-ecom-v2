import { Router } from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JE-${timestamp}-${random}`;
};

// Get all orders for user's store
router.get('/', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Extract JSONB fields for dashboard display
    const result = await db.query(
      `SELECT 
         o.id,
         o.order_number,
         o.status,
         o.notes,
         o.created_at,
         o.updated_at,
         -- Extract customer info from JSONB
         o.customer->>'name' as customer_name,
         o.customer->>'phone' as customer_phone,
         o.customer->>'location' as customer_location,
         -- Extract payment info
         o.payment->>'method' as payment_method,
         o.payment->>'status' as payment_status,
         -- Extract items info (first item)
         (o.items->0->>'quantity')::int as quantity,
         (o.items->0->>'unit_price')::numeric as unit_price,
         (o.items->0->>'total')::numeric as total_amount,
         -- Product info from join
         p.data->>'name' as product_name,
         (p.media->'images'->>0) as product_image
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.store_id = $1
       ORDER BY o.created_at DESC`,
      [storeResult.rows[0].id]
    );
    
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get order stats
router.get('/stats', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.json({ 
        total: 0, 
        pending: 0, 
        paid: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0,
        pending_revenue: 0
      });
    }
    
    const result = await db.query(
      `SELECT 
         COUNT(*)::int as total,
         COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
         COUNT(*) FILTER (WHERE status = 'paid')::int as paid,
         COUNT(*) FILTER (WHERE status IN ('delivered', 'completed'))::int as delivered,
         COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled,
         COALESCE(SUM((items->0->>'total')::numeric) FILTER (WHERE status IN ('delivered', 'completed', 'paid')), 0) as revenue,
         COALESCE(SUM((items->0->>'total')::numeric) FILTER (WHERE status = 'pending'), 0) as pending_revenue
       FROM orders 
       WHERE store_id = $1`,
      [storeResult.rows[0].id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Create order (public endpoint for store checkout)
router.post('/', async (req, res, next) => {
  try {
    const { slug, productId, customer, items, payment } = req.body;
    
    // Validate required fields
    if (!slug) {
      return res.status(400).json({ error: 'Store slug is required' });
    }
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ error: 'Customer name and phone are required' });
    }
    
    // Get store by slug
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE slug = $1',
      [slug]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    const orderNumber = generateOrderNumber();
    
    // Stringify JSONB fields
    const result = await db.query(
      `INSERT INTO orders (store_id, product_id, order_number, customer, items, payment)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb)
       RETURNING *`,
      [
        storeId, 
        productId, 
        orderNumber, 
        JSON.stringify(customer), 
        JSON.stringify(items || []), 
        JSON.stringify(payment || {})
      ]
    );
    
    res.status(201).json({ 
      success: true,
      ...result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// Update order status
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    
    const updates = [];
    const values = [];
    let idx = 1;
    
    if (status !== undefined) { updates.push(`status = $${idx++}`); values.push(status); }
    if (notes !== undefined) { updates.push(`notes = $${idx++}`); values.push(notes); }
    updates.push(`updated_at = NOW()`);
    
    values.push(req.params.id);
    values.push(req.user.userId);
    
    const result = await db.query(
      `UPDATE orders o
       SET ${updates.join(', ')}
       FROM stores s
       WHERE o.id = $${idx++} AND o.store_id = s.id AND s.user_id = $${idx}
       RETURNING o.*`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
