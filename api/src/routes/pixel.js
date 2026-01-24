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

// GET /pixel/debug/:storeId - Debug endpoint to see raw data
router.get('/debug/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Get all events for this store
    const events = await pool.query(
      `SELECT event, utm_source, utm_medium, created_at, session_id, data
       FROM pixel_events 
       WHERE store_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [storeId]
    );
    
    // Get store info
    const store = await pool.query(
      `SELECT id, slug FROM stores WHERE id = $1`,
      [storeId]
    );
    
    res.json({
      store: store.rows[0] || null,
      total_events: events.rows.length,
      events: events.rows
    });
  } catch (error) {
    res.json({ error: error.message });
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

// GET /pixel/stats/:storeId - Get comprehensive traffic & conversion stats
router.get('/stats/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { period = 'today' } = req.query;
    
    // Calculate date range
    let dateFilter;
    
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
    
    // Get conversion funnel (all events)
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
    
    // Calculate abandoned checkouts
    // Abandoned = sessions with checkout_start but no purchase within 30 minutes
    const abandonedResult = await pool.query(`
      WITH checkout_sessions AS (
        SELECT DISTINCT session_id, MIN(created_at) as checkout_time
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'checkout_start'
          AND ${dateFilter}
          AND session_id IS NOT NULL
        GROUP BY session_id
      ),
      purchase_sessions AS (
        SELECT DISTINCT session_id
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'purchase'
          AND ${dateFilter}
          AND session_id IS NOT NULL
      )
      SELECT COUNT(*) as abandoned
      FROM checkout_sessions cs
      WHERE cs.session_id NOT IN (SELECT session_id FROM purchase_sessions)
        AND cs.checkout_time < NOW() - INTERVAL '30 minutes'
    `, [storeId]);
    
    const abandonedCheckouts = parseInt(abandonedResult.rows[0]?.abandoned || 0);
    
    // Get conversion rates by source
    const sourceConversionResult = await pool.query(`
      WITH source_visitors AS (
        SELECT utm_source, COUNT(DISTINCT session_id) as visitors
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'page_view'
          AND ${dateFilter}
          AND session_id IS NOT NULL
        GROUP BY utm_source
      ),
      source_purchases AS (
        SELECT utm_source, COUNT(DISTINCT session_id) as purchases
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'purchase'
          AND ${dateFilter}
          AND session_id IS NOT NULL
        GROUP BY utm_source
      )
      SELECT 
        sv.utm_source,
        sv.visitors,
        COALESCE(sp.purchases, 0) as purchases,
        CASE WHEN sv.visitors > 0 
          THEN ROUND((COALESCE(sp.purchases, 0)::numeric / sv.visitors) * 100, 1)
          ELSE 0 
        END as conversion_rate
      FROM source_visitors sv
      LEFT JOIN source_purchases sp ON sv.utm_source = sp.utm_source
      ORDER BY sv.visitors DESC
    `, [storeId]);
    
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
    
    // Calculate overall metrics
    const checkoutsStarted = funnel.checkout_start || 0;
    const purchases = funnel.purchase || 0;
    const conversionRate = currentTotal > 0 
      ? ((purchases / currentTotal) * 100).toFixed(1) 
      : '0.0';
    const abandonmentRate = checkoutsStarted > 0 
      ? ((abandonedCheckouts / checkoutsStarted) * 100).toFixed(1) 
      : '0.0';
    
    res.json({
      total: currentTotal,
      change,
      sources: trafficResult.rows.map(row => ({
        source: row.utm_source,
        visitors: parseInt(row.visitors),
        percentage: currentTotal > 0 ? Math.round((parseInt(row.visitors) / currentTotal) * 100) : 0
      })),
      sourceConversions: sourceConversionResult.rows.map(row => ({
        source: row.utm_source,
        visitors: parseInt(row.visitors),
        purchases: parseInt(row.purchases),
        conversionRate: parseFloat(row.conversion_rate)
      })),
      funnel,
      metrics: {
        checkoutsStarted,
        purchases,
        abandonedCheckouts,
        conversionRate: parseFloat(conversionRate),
        abandonmentRate: parseFloat(abandonmentRate)
      }
    });
  } catch (error) {
    console.error('Pixel stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /pixel/abandoned/:storeId - Get detailed abandoned checkout data
router.get('/abandoned/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { period = 'week' } = req.query;
    
    let dateFilter;
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
      default:
        dateFilter = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    }
    
    // Get abandoned sessions with details
    const abandonedResult = await pool.query(`
      WITH checkout_sessions AS (
        SELECT 
          session_id, 
          MIN(created_at) as checkout_time,
          MAX(data) as checkout_data,
          MAX(utm_source) as source,
          MAX(device) as device
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'checkout_start'
          AND ${dateFilter}
          AND session_id IS NOT NULL
        GROUP BY session_id
      ),
      purchase_sessions AS (
        SELECT DISTINCT session_id
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'purchase'
          AND ${dateFilter}
          AND session_id IS NOT NULL
      )
      SELECT 
        cs.session_id,
        cs.checkout_time,
        cs.checkout_data,
        cs.source,
        cs.device
      FROM checkout_sessions cs
      WHERE cs.session_id NOT IN (SELECT session_id FROM purchase_sessions)
        AND cs.checkout_time < NOW() - INTERVAL '30 minutes'
      ORDER BY cs.checkout_time DESC
      LIMIT 100
    `, [storeId]);
    
    // Get abandonment by source
    const bySourceResult = await pool.query(`
      WITH checkout_sessions AS (
        SELECT session_id, utm_source
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'checkout_start'
          AND ${dateFilter}
          AND session_id IS NOT NULL
      ),
      purchase_sessions AS (
        SELECT DISTINCT session_id
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'purchase'
          AND ${dateFilter}
          AND session_id IS NOT NULL
      )
      SELECT 
        cs.utm_source as source,
        COUNT(*) as abandoned
      FROM checkout_sessions cs
      WHERE cs.session_id NOT IN (SELECT session_id FROM purchase_sessions)
      GROUP BY cs.utm_source
      ORDER BY abandoned DESC
    `, [storeId]);
    
    // Get abandonment by device
    const byDeviceResult = await pool.query(`
      WITH checkout_sessions AS (
        SELECT session_id, device
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'checkout_start'
          AND ${dateFilter}
          AND session_id IS NOT NULL
      ),
      purchase_sessions AS (
        SELECT DISTINCT session_id
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'purchase'
          AND ${dateFilter}
          AND session_id IS NOT NULL
      )
      SELECT 
        COALESCE(cs.device, 'unknown') as device,
        COUNT(*) as abandoned
      FROM checkout_sessions cs
      WHERE cs.session_id NOT IN (SELECT session_id FROM purchase_sessions)
      GROUP BY cs.device
      ORDER BY abandoned DESC
    `, [storeId]);
    
    // Get abandonment by hour of day
    const byHourResult = await pool.query(`
      WITH checkout_sessions AS (
        SELECT session_id, created_at
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'checkout_start'
          AND ${dateFilter}
          AND session_id IS NOT NULL
      ),
      purchase_sessions AS (
        SELECT DISTINCT session_id
        FROM pixel_events
        WHERE store_id = $1 
          AND event = 'purchase'
          AND ${dateFilter}
          AND session_id IS NOT NULL
      )
      SELECT 
        EXTRACT(HOUR FROM cs.created_at) as hour,
        COUNT(*) as abandoned
      FROM checkout_sessions cs
      WHERE cs.session_id NOT IN (SELECT session_id FROM purchase_sessions)
      GROUP BY EXTRACT(HOUR FROM cs.created_at)
      ORDER BY hour
    `, [storeId]);
    
    res.json({
      recentAbandoned: abandonedResult.rows.map(row => ({
        sessionId: row.session_id,
        time: row.checkout_time,
        data: row.checkout_data,
        source: row.source,
        device: row.device
      })),
      bySource: bySourceResult.rows.map(row => ({
        source: row.source || 'direct',
        abandoned: parseInt(row.abandoned)
      })),
      byDevice: byDeviceResult.rows.map(row => ({
        device: row.device,
        abandoned: parseInt(row.abandoned)
      })),
      byHour: byHourResult.rows.map(row => ({
        hour: parseInt(row.hour),
        abandoned: parseInt(row.abandoned)
      }))
    });
  } catch (error) {
    console.error('Abandoned checkout error:', error);
    res.status(500).json({ error: 'Failed to fetch abandoned data' });
  }
});

export default router;
