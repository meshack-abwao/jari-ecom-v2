// ============================================================================
// COMPLAINTS API - Customer Complaints System
// Phase F2: Security & Fraud Detection
// ============================================================================

import { Router } from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// ============================================================================
// PUBLIC: Submit complaint (requires valid token from order confirmation)
// ============================================================================
router.post('/submit', async (req, res, next) => {
  try {
    const { token, reason, description, evidenceUrls = [] } = req.body;
    
    if (!token || !reason || !description) {
      return res.status(400).json({ error: 'Token, reason, and description are required' });
    }
    
    // Find order by complaint token
    const orderResult = await db.query(
      `SELECT o.*, s.id as store_id 
       FROM orders o 
       JOIN stores s ON o.store_id = s.id
       WHERE o.complaint_token = $1 
       AND o.complaint_token_expires > NOW()`,
      [token]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired complaint link' });
    }
    
    const order = orderResult.rows[0];
    
    // Check if complaint already exists for this order
    const existingComplaint = await db.query(
      `SELECT id FROM complaints WHERE order_id = $1`,
      [order.id]
    );
    
    if (existingComplaint.rows.length > 0) {
      return res.status(400).json({ error: 'A complaint has already been submitted for this order' });
    }
    
    // Generate unique complaint token
    const complaintToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Create complaint
    const complaintResult = await db.query(
      `INSERT INTO complaints 
       (store_id, order_id, customer_phone, customer_name, reason, description, 
        evidence_urls, complaint_token, token_expires_at, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       RETURNING id`,
      [order.store_id, order.id, order.customer_phone, order.customer_name,
       reason, description, JSON.stringify(evidenceUrls), complaintToken, tokenExpires]
    );
    
    // Update complaint metrics
    await db.query(
      `INSERT INTO complaint_metrics (store_id, total_complaints, open_complaints, last_complaint_at)
       VALUES ($1, 1, 1, NOW())
       ON CONFLICT (store_id) DO UPDATE SET
         total_complaints = complaint_metrics.total_complaints + 1,
         open_complaints = complaint_metrics.open_complaints + 1,
         last_complaint_at = NOW(),
         updated_at = NOW()`,
      [order.store_id]
    );
    
    res.json({
      success: true,
      complaintId: complaintResult.rows[0].id,
      message: 'Complaint submitted successfully. The merchant will be notified.'
    });
    
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// MERCHANT: Get complaints for their store
// ============================================================================
router.get('/', auth, async (req, res, next) => {
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
    
    const storeId = storeResult.rows[0].id;
    
    // Get complaints
    const complaints = await db.query(
      `SELECT c.*, o.data as order_data
       FROM complaints c
       LEFT JOIN orders o ON c.order_id = o.id
       WHERE c.store_id = $1
       ORDER BY c.created_at DESC
       LIMIT 100`,
      [storeId]
    );
    
    // Get metrics
    const metrics = await db.query(
      `SELECT * FROM complaint_metrics WHERE store_id = $1`,
      [storeId]
    );
    
    res.json({
      complaints: complaints.rows,
      metrics: metrics.rows[0] || {
        total_complaints: 0,
        open_complaints: 0,
        resolved_complaints: 0,
        complaint_rate: 0
      }
    });
    
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// MERCHANT: Respond to complaint
// ============================================================================
router.put('/:complaintId/respond', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { complaintId } = req.params;
    const { resolution, status } = req.body;
    
    if (!resolution || !status) {
      return res.status(400).json({ error: 'Resolution and status are required' });
    }
    
    if (!['resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "resolved" or "rejected"' });
    }
    
    // Verify ownership
    const complaint = await db.query(
      `SELECT c.id, c.store_id, c.status
       FROM complaints c
       JOIN stores s ON c.store_id = s.id
       WHERE c.id = $1 AND s.user_id = $2`,
      [complaintId, userId]
    );
    
    if (complaint.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    if (complaint.rows[0].status !== 'open' && complaint.rows[0].status !== 'under_review') {
      return res.status(400).json({ error: 'Complaint has already been processed' });
    }
    
    const storeId = complaint.rows[0].store_id;
    
    // Update complaint
    await db.query(
      `UPDATE complaints 
       SET status = $1, resolution = $2, resolved_at = NOW(), updated_at = NOW()
       WHERE id = $3`,
      [status, resolution, complaintId]
    );
    
    // Update metrics
    const metricField = status === 'resolved' ? 'resolved_complaints' : 'rejected_complaints';
    await db.query(
      `UPDATE complaint_metrics 
       SET open_complaints = open_complaints - 1,
           ${metricField} = ${metricField} + 1,
           updated_at = NOW()
       WHERE store_id = $1`,
      [storeId]
    );
    
    res.json({
      success: true,
      message: `Complaint ${status} successfully`
    });
    
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// PUBLIC: Generate complaint link for order
// ============================================================================
router.post('/generate-link', async (req, res, next) => {
  try {
    const { orderId, storeSlug } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    // Generate complaint token for order
    const complaintToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await db.query(
      `UPDATE orders SET 
        complaint_token = $1, 
        complaint_token_expires = $2 
       WHERE id = $3`,
      [complaintToken, tokenExpires, orderId]
    );
    
    // Build complaint URL
    const baseUrl = process.env.STORE_URL || 'https://jarisolutionsecom.store';
    const complaintUrl = `${baseUrl}/complaint?token=${complaintToken}`;
    
    res.json({
      success: true,
      complaintUrl,
      expiresAt: tokenExpires
    });
    
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// MERCHANT: Get complaint statistics
// ============================================================================
router.get('/stats', auth, async (req, res, next) => {
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
    
    const storeId = storeResult.rows[0].id;
    
    // Get stats by reason
    const byReason = await db.query(
      `SELECT reason, COUNT(*) as count
       FROM complaints 
       WHERE store_id = $1
       GROUP BY reason
       ORDER BY count DESC`,
      [storeId]
    );
    
    // Get stats by status
    const byStatus = await db.query(
      `SELECT status, COUNT(*) as count
       FROM complaints 
       WHERE store_id = $1
       GROUP BY status`,
      [storeId]
    );
    
    // Get recent trend (last 30 days)
    const trend = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM complaints 
       WHERE store_id = $1 AND created_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [storeId]
    );
    
    res.json({
      byReason: byReason.rows,
      byStatus: byStatus.rows,
      trend: trend.rows
    });
    
  } catch (err) {
    next(err);
  }
});

export default router;
