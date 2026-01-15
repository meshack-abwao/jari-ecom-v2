import { Router } from 'express';
import pool from '../config/database.js';

const router = Router();

// CORS middleware for pixel - allow all origins (like Google Analytics)
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// GET /pixel/health - Check if pixel tracking is working
router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM pixel_events');
    res.json({ 
      status: 'ok', 
      table_exists: true, 
      total_events: parseInt(result.rows[0].count) 
    });
  } catch (error) {
    res.json({ 
      status: 'error', 
      table_exists: false, 
      error: error.message 
    });
  }
});

// POST /pixel - Track an event (public, no auth)
router.post('/', async (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { return res.status(204).end(); }
    }
    
    if (!body || Object.keys(body).length === 0) return res.status(204).end();
    
    const { store_id, event, data = {}, utm = {}, device, url, referrer, session_id } = body;
    
    if (!store_id || !event) return res.status(204).end();
    
    await pool.query(`
      INSERT INTO pixel_events (store_id, event, data, utm_source, utm_medium, utm_campaign, device, url, referrer, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      store_id, event, JSON.stringify(data), utm.source || 'direct', utm.medium || null,
      utm.campaign || null, device || null, url || null, referrer || null, session_id || null
    ]);
    
    res.status(204).end();
  } catch (error) {
    res.status(204).end();
  }
});

// GET /pixel/stats/:storeId - Get traffic stats (authenticated)
router.get('/stats/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { period = 'today' } = req.query;
    
    // Calculate date range
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = `created_at >= CURRENT_DATE`;
        break;
      case 'week':
        dateFilter = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
        break;
      case 'month':
        dateFilter = `created_at >= CURRENT_DATE - INTERVAL '30 days'`;
        break;
      case 'quarter':
        dateFilter = `created_at >= CURRENT_DATE - INTERVAL '90 days'`;
        break;
      case 'year':
        dateFilter = `created_at >= CURRENT_DATE - INTERVAL '365 days'`;
        break;
      default:
        dateFilter = `created_at >= CURRENT_DATE`;
    }
    
    // Get traffic by source
    const trafficResult = await pool.query(`
      SELECT 
        utm_source,
        COUNT(*) as visitors
      FROM pixel_events
      WHERE store_id = $1 
        AND event = 'page_view'
        AND ${dateFilter}
      GROUP BY utm_source
      ORDER BY visitors DESC
    `, [storeId]);
    
    // Get total visitors
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM pixel_events
      WHERE store_id = $1 
        AND event = 'page_view'
        AND ${dateFilter}
    `, [storeId]);
    
    // Get conversion funnel
    const funnelResult = await pool.query(`
      SELECT 
        event,
        COUNT(*) as count
      FROM pixel_events
      WHERE store_id = $1 
        AND ${dateFilter}
        AND event IN ('page_view', 'product_view', 'add_to_cart', 'checkout_start', 'purchase')
      GROUP BY event
    `, [storeId]);
    
    // Build funnel object
    const funnel = {};
    funnelResult.rows.forEach(row => {
      funnel[row.event] = parseInt(row.count);
    });
    
    // Calculate comparison (previous period)
    let comparisonFilter;
    switch (period) {
      case 'today':
        comparisonFilter = `created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE`;
        break;
      case 'week':
        comparisonFilter = `created_at >= CURRENT_DATE - INTERVAL '14 days' AND created_at < CURRENT_DATE - INTERVAL '7 days'`;
        break;
      case 'month':
        comparisonFilter = `created_at >= CURRENT_DATE - INTERVAL '60 days' AND created_at < CURRENT_DATE - INTERVAL '30 days'`;
        break;
      case 'quarter':
        comparisonFilter = `created_at >= CURRENT_DATE - INTERVAL '180 days' AND created_at < CURRENT_DATE - INTERVAL '90 days'`;
        break;
      case 'year':
        comparisonFilter = `created_at >= CURRENT_DATE - INTERVAL '730 days' AND created_at < CURRENT_DATE - INTERVAL '365 days'`;
        break;
      default:
        comparisonFilter = `created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE`;
    }
    
    const previousResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM pixel_events
      WHERE store_id = $1 
        AND event = 'page_view'
        AND ${comparisonFilter}
    `, [storeId]);
    
    const currentTotal = parseInt(totalResult.rows[0]?.total || 0);
    const previousTotal = parseInt(previousResult.rows[0]?.total || 0);
    const change = previousTotal > 0 
      ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) 
      : 0;
    
    res.json({
      total: currentTotal,
      change,
      sources: trafficResult.rows.map(row => ({
        source: row.utm_source,
        visitors: parseInt(row.visitors),
        percentage: currentTotal > 0 ? Math.round((parseInt(row.visitors) / currentTotal) * 100) : 0
      })),
      funnel
    });
  } catch (error) {
    console.error('Pixel stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
