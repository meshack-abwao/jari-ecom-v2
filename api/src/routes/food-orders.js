import { Router } from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// ===========================================
// FOOD ORDERS API - Visual Menu Template
// ===========================================

/**
 * Generate food order number with store prefix
 * Format: SLUG-001, SLUG-002, etc.
 */
async function generateFoodOrderNumber(storeId) {
  // Get store slug and increment counter
  const result = await db.query(
    `UPDATE stores 
     SET food_order_count = COALESCE(food_order_count, 0) + 1
     WHERE id = $1
     RETURNING slug, food_order_count`,
    [storeId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Store not found');
  }
  
  const { slug, food_order_count } = result.rows[0];
  const prefix = slug.substring(0, 3).toUpperCase();
  const number = String(food_order_count).padStart(3, '0');
  
  return `${prefix}-${number}`;
}

// -----------------------------------------
// GET /food-orders - List all food orders
// -----------------------------------------
router.get('/', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT * FROM food_orders 
      WHERE store_id = $1
    `;
    const params = [storeId];
    
    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// GET /food-orders/stats - Order statistics
// -----------------------------------------
router.get('/stats', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.json({ 
        total: 0, pending: 0, confirmed: 0, preparing: 0,
        ready: 0, completed: 0, cancelled: 0, revenue: 0
      });
    }
    
    const storeId = storeResult.rows[0].id;
    
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'preparing') as preparing,
        COUNT(*) FILTER (WHERE status = 'ready') as ready,
        COUNT(*) FILTER (WHERE status IN ('delivered', 'picked_up')) as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COALESCE(SUM(total) FILTER (WHERE status IN ('delivered', 'picked_up')), 0) as revenue
      FROM food_orders
      WHERE store_id = $1
    `, [storeId]);
    
    res.json({ success: true, stats: result.rows[0] });
  } catch (err) {
    next(err);
  }
});


// -----------------------------------------
// GET /food-orders/:id - Get single order
// -----------------------------------------
router.get('/:id', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const result = await db.query(
      'SELECT * FROM food_orders WHERE id = $1 AND store_id = $2',
      [req.params.id, storeResult.rows[0].id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// POST /food-orders - Create new food order
// (Called from storefront checkout)
// -----------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const {
      storeId,
      customerName,
      customerPhone,
      customerEmail,
      orderType = 'delivery',
      deliveryAddress,
      deliveryInstructions,
      scheduledTime,
      items,
      subtotal,
      deliveryFee = 0,
      discount = 0,
      total,
      paymentMethod
    } = req.body;
    
    // Validate required fields
    if (!storeId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Store ID and items are required' });
    }
    
    if (!customerPhone) {
      return res.status(400).json({ error: 'Customer phone is required' });
    }
    
    // Generate order number
    const orderNumber = await generateFoodOrderNumber(storeId);
    
    // Initial status history
    const statusHistory = [
      { status: 'pending', timestamp: new Date().toISOString() }
    ];
    
    const result = await db.query(`
      INSERT INTO food_orders (
        store_id, order_number, customer_name, customer_phone, customer_email,
        order_type, delivery_address, delivery_instructions, scheduled_time,
        items, subtotal, delivery_fee, discount, total,
        payment_method, status_history
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      storeId, orderNumber, customerName, customerPhone, customerEmail,
      orderType, deliveryAddress, deliveryInstructions, scheduledTime,
      JSON.stringify(items), subtotal, deliveryFee, discount, total,
      paymentMethod, JSON.stringify(statusHistory)
    ]);
    
    res.status(201).json({ 
      success: true, 
      order: result.rows[0],
      orderNumber 
    });
  } catch (err) {
    next(err);
  }
});


// -----------------------------------------
// PUT /food-orders/:id/status - Update order status
// -----------------------------------------
router.put('/:id/status', auth, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    
    const validStatuses = [
      'pending', 'confirmed', 'preparing', 'ready',
      'out_for_delivery', 'delivered', 'picked_up', 'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Get current order
    const orderResult = await db.query(
      'SELECT * FROM food_orders WHERE id = $1 AND store_id = $2',
      [req.params.id, storeResult.rows[0].id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Build status history entry
    const historyEntry = {
      status,
      timestamp: new Date().toISOString()
    };
    if (note) historyEntry.note = note;
    
    const statusHistory = [...(order.status_history || []), historyEntry];
    
    // Build update query
    let updateQuery = `
      UPDATE food_orders 
      SET status = $1, 
          status_history = $2,
          updated_at = NOW()
    `;
    const params = [status, JSON.stringify(statusHistory)];
    
    // Set timestamp fields based on status
    if (status === 'confirmed') {
      updateQuery += `, confirmed_at = NOW()`;
    } else if (status === 'ready') {
      updateQuery += `, ready_at = NOW()`;
    } else if (status === 'delivered' || status === 'picked_up') {
      updateQuery += `, completed_at = NOW()`;
    }
    
    updateQuery += ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(req.params.id);
    
    const result = await db.query(updateQuery, params);
    
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// PUT /food-orders/:id/payment - Update payment status
// -----------------------------------------
router.put('/:id/payment', auth, async (req, res, next) => {
  try {
    const { paymentStatus, mpesaReceipt } = req.body;
    
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const result = await db.query(`
      UPDATE food_orders 
      SET payment_status = $1, 
          mpesa_receipt = COALESCE($2, mpesa_receipt),
          updated_at = NOW()
      WHERE id = $3 AND store_id = $4
      RETURNING *
    `, [paymentStatus, mpesaReceipt, req.params.id, storeResult.rows[0].id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
