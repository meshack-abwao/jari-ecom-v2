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

// ===========================================
// ABANDONED CHECKOUTS - DETAILED TRACKING
// ===========================================

// POST /pixel/abandon - Save abandoned checkout with full details
router.post('/abandon', async (req, res) => {
  try {
    // Handle both JSON and text/plain (sendBeacon sends as text/plain)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('Failed to parse abandon body:', e);
        return res.status(204).end();
      }
    }
    
    const { store_id, session_id, data = {} } = body;
    
    console.log('📥 Abandon request received:', { store_id, session_id, data });
    
    if (!store_id) {
      console.log('📥 No store_id, skipping');
      return res.status(204).end();
    }
    
    await pool.query(`
      INSERT INTO abandoned_checkouts (
        store_id, session_id, product_id, product_name, quantity, total_amount,
        step_reached, customer_name, customer_phone, customer_location, delivery_area,
        payment_method, utm_source, utm_medium, utm_campaign, device, time_spent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      store_id,
      session_id || null,
      data.product_id || null,
      data.product_name || null,
      data.quantity || 1,
      data.total_amount || 0,
      data.step_reached || 1,
      data.customer_name || null,
      data.customer_phone || null,
      data.customer_location || null,
      data.delivery_area || null,
      data.payment_method || null,
      data.utm_source || 'direct',
      data.utm_medium || null,
      data.utm_campaign || null,
      data.device || null,
      data.time_spent || 0
    ]);
    
    console.log('✅ Abandon saved successfully');
    res.status(204).end();
  } catch (error) {
    console.error('❌ Save abandoned checkout error:', error.message, error.stack);
    res.status(204).end(); // Silent fail like analytics
  }
});

// GET /pixel/abandoned/:storeId - Get detailed abandoned checkouts
router.get('/abandoned/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { period = 'week', limit = 50 } = req.query;
    
    console.log('📊 GET abandoned - storeId param:', storeId, 'period:', period);
    
    // Resolve store ID - could be numeric ID or UUID
    let actualStoreId = storeId;
    
    // If it looks like a slug (not a number or UUID), look it up
    if (isNaN(storeId) && !storeId.includes('-')) {
      console.log('📊 Looking up slug:', storeId);
      const storeResult = await pool.query(
        'SELECT id FROM stores WHERE slug = $1',
        [storeId]
      );
      if (storeResult.rows.length === 0) {
        return res.status(404).json({ error: 'Store not found' });
      }
      actualStoreId = storeResult.rows[0].id;
      console.log('📊 Resolved to UUID:', actualStoreId);
    }
    
    console.log('📊 Querying with store_id:', actualStoreId);
    
    let dateFilter;
    switch (period) {
      case 'today': dateFilter = `created_at >= CURRENT_DATE`; break;
      case 'week': dateFilter = `created_at >= CURRENT_DATE - INTERVAL '7 days'`; break;
      case 'month': dateFilter = `created_at >= CURRENT_DATE - INTERVAL '30 days'`; break;
      case 'quarter': dateFilter = `created_at >= CURRENT_DATE - INTERVAL '90 days'`; break;
      case 'year': dateFilter = `created_at >= CURRENT_DATE - INTERVAL '365 days'`; break;
      default: dateFilter = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    }
    
    console.log('📊 Date filter:', dateFilter);
    
    // Get detailed abandoned checkouts
    console.log('📊 Running main query...');
    const abandonedResult = await pool.query(`
      SELECT * FROM abandoned_checkouts
      WHERE store_id = $1::uuid AND ${dateFilter}
      ORDER BY created_at DESC
      LIMIT $2
    `, [actualStoreId, parseInt(limit)]);
    
    console.log('📊 Found', abandonedResult.rows.length, 'abandoned checkouts');
    
    // Get funnel breakdown (which step they abandoned at)
    console.log('📊 Running funnel query...');
    const funnelResult = await pool.query(`
      SELECT 
        step_reached,
        COUNT(*) as count
      FROM abandoned_checkouts
      WHERE store_id = $1::uuid AND ${dateFilter}
      GROUP BY step_reached
      ORDER BY step_reached
    `, [actualStoreId]);
    
    console.log('📊 Funnel result:', funnelResult.rows);
    
    // Get total by source
    console.log('📊 Running source query...');
    const bySourceResult = await pool.query(`
      SELECT 
        COALESCE(utm_source, 'direct') as utm_source,
        COUNT(*) as count
      FROM abandoned_checkouts
      WHERE store_id = $1::uuid AND ${dateFilter}
      GROUP BY utm_source
      ORDER BY count DESC
    `, [actualStoreId]);
    
    console.log('📊 Source result:', bySourceResult.rows);
    
    // Get recovery stats - simplified query
    console.log('📊 Running recovery query...');
    const recoveryResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN recovered = true THEN 1 ELSE 0 END) as recovered,
        SUM(CASE WHEN contacted = true THEN 1 ELSE 0 END) as contacted,
        COUNT(*) as total
      FROM abandoned_checkouts
      WHERE store_id = $1::uuid AND ${dateFilter}
    `, [actualStoreId]);
    
    console.log('📊 Recovery result:', recoveryResult.rows);
    
    // Calculate anomalies
    const totalAbandoned = abandonedResult.rows.length;
    const funnel = {};
    funnelResult.rows.forEach(r => { funnel[`step_${r.step_reached}`] = parseInt(r.count); });
    
    const anomalies = [];
    
    // Check for high Step 2 abandonment (form friction)
    if (funnel.step_2 && totalAbandoned > 5) {
      const step2Rate = (funnel.step_2 / totalAbandoned) * 100;
      if (step2Rate > 50) {
        anomalies.push({
          type: 'warning',
          title: 'Delivery Form Friction',
          message: `${step2Rate.toFixed(0)}% abandon at delivery details. Consider simplifying.`
        });
      }
    }
    
    // Check for high Step 3 abandonment (payment issues)
    if (funnel.step_3 && totalAbandoned > 5) {
      const step3Rate = (funnel.step_3 / totalAbandoned) * 100;
      if (step3Rate > 40) {
        anomalies.push({
          type: 'error',
          title: 'Payment Drop-off',
          message: `${step3Rate.toFixed(0)}% abandon at payment. Check M-Pesa flow.`
        });
      }
    }
    
    // Check for quick exits
    const quickExits = abandonedResult.rows.filter(r => r.time_spent && r.time_spent < 30).length;
    if (totalAbandoned > 5 && (quickExits / totalAbandoned) > 0.3) {
      anomalies.push({
        type: 'info',
        title: 'Quick Exits',
        message: `${((quickExits / totalAbandoned) * 100).toFixed(0)}% leave within 30 seconds.`
      });
    }
    
    const recovery = recoveryResult.rows[0] || { recovered: 0, contacted: 0, total: 0 };
    
    console.log('📊 Sending response with', totalAbandoned, 'abandonments');
    
    res.json({
      abandonments: abandonedResult.rows,
      funnel: {
        step_1: funnel.step_1 || 0,
        step_2: funnel.step_2 || 0,
        step_3: funnel.step_3 || 0
      },
      bySource: bySourceResult.rows,
      recovery: {
        recovered: parseInt(recovery.recovered) || 0,
        contacted: parseInt(recovery.contacted) || 0,
        total: parseInt(recovery.total) || 0
      },
      anomalies,
      total: totalAbandoned
    });
  } catch (error) {
    console.error('❌ Get abandoned checkouts error:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch abandoned checkouts', details: error.message });
  }
});

// PUT /pixel/abandoned/:id/contact - Mark as contacted
router.put('/abandoned/:id/contact', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    await pool.query(`
      UPDATE abandoned_checkouts 
      SET contacted = true, contacted_at = CURRENT_TIMESTAMP, notes = COALESCE($2, notes)
      WHERE id = $1
    `, [id, notes]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// PUT /pixel/abandoned/:id/recover - Mark as recovered
router.put('/abandoned/:id/recover', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`
      UPDATE abandoned_checkouts 
      SET recovered = true, recovered_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

export default router;
