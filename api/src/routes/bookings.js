import { Router } from 'express';
import db from '../config/database.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// ===========================================
// BOOKING SETTINGS
// ===========================================

// Get booking settings for user's store
router.get('/settings', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    const result = await db.query(
      'SELECT * FROM booking_settings WHERE store_id = $1',
      [storeId]
    );
    
    res.json(result.rows[0] || {});
  } catch (err) {
    next(err);
  }
});

// Update booking settings
router.put('/settings', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    const {
      slot_duration_minutes,
      max_bookings_per_slot,
      max_bookings_per_day,
      min_notice_hours,
      max_advance_days,
      jump_line_enabled,
      jump_line_fee,
      deposit_enabled,
      deposit_percentage,
      inquiry_fee,
      reminders_enabled,
      reminder_method
    } = req.body;
    
    const result = await db.query(`
      INSERT INTO booking_settings (
        store_id, slot_duration_minutes, max_bookings_per_slot, max_bookings_per_day,
        min_notice_hours, max_advance_days, jump_line_enabled, jump_line_fee,
        deposit_enabled, deposit_percentage, inquiry_fee, reminders_enabled, reminder_method,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (store_id) DO UPDATE SET
        slot_duration_minutes = COALESCE($2, booking_settings.slot_duration_minutes),
        max_bookings_per_slot = COALESCE($3, booking_settings.max_bookings_per_slot),
        max_bookings_per_day = COALESCE($4, booking_settings.max_bookings_per_day),
        min_notice_hours = COALESCE($5, booking_settings.min_notice_hours),
        max_advance_days = COALESCE($6, booking_settings.max_advance_days),
        jump_line_enabled = COALESCE($7, booking_settings.jump_line_enabled),
        jump_line_fee = COALESCE($8, booking_settings.jump_line_fee),
        deposit_enabled = COALESCE($9, booking_settings.deposit_enabled),
        deposit_percentage = COALESCE($10, booking_settings.deposit_percentage),
        inquiry_fee = COALESCE($11, booking_settings.inquiry_fee),
        reminders_enabled = COALESCE($12, booking_settings.reminders_enabled),
        reminder_method = COALESCE($13, booking_settings.reminder_method),
        updated_at = NOW()
      RETURNING *
    `, [storeId, slot_duration_minutes, max_bookings_per_slot, max_bookings_per_day,
        min_notice_hours, max_advance_days, jump_line_enabled, jump_line_fee,
        deposit_enabled, deposit_percentage, inquiry_fee, reminders_enabled, reminder_method]);
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});


// ===========================================
// WORKING HOURS
// ===========================================

// Get working hours
router.get('/working-hours', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const result = await db.query(
      'SELECT * FROM working_hours WHERE store_id = $1 ORDER BY day_of_week',
      [storeResult.rows[0].id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Update working hours for a day
router.put('/working-hours/:day', auth, async (req, res, next) => {
  try {
    const { day } = req.params;
    const { is_open, start_time, end_time } = req.body;
    
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    const result = await db.query(`
      INSERT INTO working_hours (store_id, day_of_week, is_open, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (store_id, day_of_week) DO UPDATE SET
        is_open = COALESCE($3, working_hours.is_open),
        start_time = COALESCE($4, working_hours.start_time),
        end_time = COALESCE($5, working_hours.end_time)
      RETURNING *
    `, [storeId, day, is_open, start_time, end_time]);
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});


// ===========================================
// BLOCKED DATES
// ===========================================

// Get blocked dates
router.get('/blocked-dates', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const result = await db.query(
      'SELECT * FROM blocked_dates WHERE store_id = $1 ORDER BY blocked_date',
      [storeResult.rows[0].id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Add blocked date
router.post('/blocked-dates', auth, async (req, res, next) => {
  try {
    const { blocked_date, reason } = req.body;
    
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const result = await db.query(`
      INSERT INTO blocked_dates (store_id, blocked_date, reason)
      VALUES ($1, $2, $3)
      ON CONFLICT (store_id, blocked_date) DO UPDATE SET reason = $3
      RETURNING *
    `, [storeResult.rows[0].id, blocked_date, reason]);
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Remove blocked date
router.delete('/blocked-dates/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM blocked_dates WHERE id = $1', [id]);
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});


// ===========================================
// BOOKINGS (Dashboard - Provider View)
// ===========================================

// Get all bookings for store
router.get('/', auth, async (req, res, next) => {
  try {
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const { status, date_from, date_to } = req.query;
    
    let query = `
      SELECT b.*, p.data->>'name' as service_name
      FROM bookings b
      LEFT JOIN products p ON b.product_id = p.id
      WHERE b.store_id = $1
    `;
    const params = [storeResult.rows[0].id];
    let paramIndex = 2;
    
    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (date_from) {
      query += ` AND b.booking_date >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    
    if (date_to) {
      query += ` AND b.booking_date <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }
    
    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});


// Update booking status
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, provider_notes, payment_status, booking_date, booking_time } = req.body;
    
    const result = await db.query(`
      UPDATE bookings SET
        status = COALESCE($2, status),
        provider_notes = COALESCE($3, provider_notes),
        payment_status = COALESCE($4, payment_status),
        booking_date = COALESCE($5, booking_date),
        booking_time = COALESCE($6, booking_time),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, status, provider_notes, payment_status, booking_date, booking_time]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});


// ===========================================
// PUBLIC BOOKING ENDPOINTS (Customer-facing)
// ===========================================

// Default settings when none exist
const DEFAULT_BOOKING_SETTINGS = {
  slot_duration_minutes: 60,
  max_bookings_per_slot: 1,
  max_bookings_per_day: 5,
  min_notice_hours: 24,
  max_advance_days: 30,
  jump_line_enabled: false,
  jump_line_fee: 0,
  deposit_enabled: false,
  deposit_percentage: 20,
  inquiry_fee: 0,
  reminders_enabled: false,
  reminder_method: 'sms'
};

// Default working hours (Mon-Fri 9-5)
const DEFAULT_WORKING_HOURS = [
  { day_of_week: 0, is_open: false, start_time: '09:00', end_time: '17:00' }, // Sunday
  { day_of_week: 1, is_open: true, start_time: '09:00', end_time: '17:00' },  // Monday
  { day_of_week: 2, is_open: true, start_time: '09:00', end_time: '17:00' },  // Tuesday
  { day_of_week: 3, is_open: true, start_time: '09:00', end_time: '17:00' },  // Wednesday
  { day_of_week: 4, is_open: true, start_time: '09:00', end_time: '17:00' },  // Thursday
  { day_of_week: 5, is_open: true, start_time: '09:00', end_time: '17:00' },  // Friday
  { day_of_week: 6, is_open: false, start_time: '09:00', end_time: '17:00' }  // Saturday
];

// Get booking settings (public)
router.get('/public/:storeSlug/settings', async (req, res, next) => {
  try {
    const { storeSlug } = req.params;
    
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE slug = $1',
      [storeSlug]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const result = await db.query(
      'SELECT * FROM booking_settings WHERE store_id = $1',
      [storeResult.rows[0].id]
    );
    
    // Return settings or defaults
    res.json({ data: result.rows[0] || DEFAULT_BOOKING_SETTINGS });
  } catch (err) {
    next(err);
  }
});

// Get working hours (public)
router.get('/public/:storeSlug/working-hours', async (req, res, next) => {
  try {
    const { storeSlug } = req.params;
    
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE slug = $1',
      [storeSlug]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const result = await db.query(
      'SELECT * FROM working_hours WHERE store_id = $1 ORDER BY day_of_week',
      [storeResult.rows[0].id]
    );
    
    // Return working hours or defaults
    res.json({ data: result.rows.length > 0 ? result.rows : DEFAULT_WORKING_HOURS });
  } catch (err) {
    next(err);
  }
});

// Get blocked dates (public)
router.get('/public/:storeSlug/blocked-dates', async (req, res, next) => {
  try {
    const { storeSlug } = req.params;
    
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE slug = $1',
      [storeSlug]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Only return future blocked dates
    const result = await db.query(
      `SELECT * FROM blocked_dates 
       WHERE store_id = $1 AND blocked_date >= CURRENT_DATE
       ORDER BY blocked_date`,
      [storeResult.rows[0].id]
    );
    
    // Return empty array if no blocked dates (this is normal)
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get available slots for a date (public - no auth)
router.get('/public/:storeSlug/availability', async (req, res, next) => {
  try {
    const { storeSlug } = req.params;
    const { date, service_id } = req.query;
    
    // Get store
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE slug = $1',
      [storeSlug]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Get booking settings
    const settingsResult = await db.query(
      'SELECT * FROM booking_settings WHERE store_id = $1',
      [storeId]
    );
    const settings = settingsResult.rows[0] || {};
    
    // Get working hours for the day of week
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    const hoursResult = await db.query(
      'SELECT * FROM working_hours WHERE store_id = $1 AND day_of_week = $2',
      [storeId, dayOfWeek]
    );
    
    // Use DB hours if exist, otherwise fall back to defaults
    let workingHours = hoursResult.rows[0];
    if (!workingHours) {
      workingHours = DEFAULT_WORKING_HOURS.find(h => h.day_of_week === dayOfWeek);
    }
    
    // Check if closed on this day
    if (!workingHours || !workingHours.is_open) {
      return res.json({ available: false, reason: 'Closed on this day', slots: [] });
    }
    
    // Check if date is blocked
    const blockedResult = await db.query(
      'SELECT * FROM blocked_dates WHERE store_id = $1 AND blocked_date = $2',
      [storeId, date]
    );
    
    if (blockedResult.rows.length > 0) {
      return res.json({ available: false, reason: blockedResult.rows[0].reason || 'Unavailable', slots: [] });
    }
    
    // Get existing bookings for this date
    const bookingsResult = await db.query(
      `SELECT booking_time, duration_minutes FROM bookings 
       WHERE store_id = $1 AND booking_date = $2 AND status NOT IN ('cancelled')`,
      [storeId, date]
    );
    
    // Generate available slots
    const slotDuration = settings.slot_duration_minutes || 60;
    const maxPerSlot = settings.max_bookings_per_slot || 1;
    const maxPerDay = settings.max_bookings_per_day || 10;
    
    // Count total bookings for the day
    if (bookingsResult.rows.length >= maxPerDay) {
      return res.json({ available: false, reason: 'Fully booked', slots: [] });
    }
    
    // Generate time slots
    const slots = [];
    const startTime = workingHours.start_time.split(':');
    const endTime = workingHours.end_time.split(':');
    
    let currentMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
    
    while (currentMinutes + slotDuration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      // Count bookings at this slot - normalize time format for comparison
      // PostgreSQL TIME can return HH:MM:SS format
      const bookingsAtSlot = bookingsResult.rows.filter(b => {
        const bookingTime = String(b.booking_time).substring(0, 5); // Get HH:MM
        return bookingTime === timeStr;
      }).length;
      
      if (bookingsAtSlot < maxPerSlot) {
        slots.push({
          time: timeStr,
          available: maxPerSlot - bookingsAtSlot
        });
      }
      
      currentMinutes += slotDuration;
    }
    
    res.json({ 
      available: slots.length > 0, 
      slots,
      settings: {
        slot_duration: slotDuration,
        deposit_enabled: settings.deposit_enabled,
        deposit_percentage: settings.deposit_percentage,
        inquiry_fee: settings.inquiry_fee,
        jump_line_enabled: settings.jump_line_enabled,
        jump_line_fee: settings.jump_line_fee,
        min_notice_hours: settings.min_notice_hours
      }
    });
  } catch (err) {
    next(err);
  }
});


// Create booking (public - customer)
router.post('/public/:storeSlug/bookings', async (req, res, next) => {
  try {
    const { storeSlug } = req.params;
    const {
      service_id,
      product_id, // Accept both service_id and product_id
      package_name,
      customer_name,
      customer_phone,
      customer_email,
      booking_date,
      booking_time,
      customer_notes,
      notes, // Accept both customer_notes and notes
      jumped_line,
      payment_type, // 'full', 'deposit', 'inquiry'
      mpesa_code,
      payment_confirmed
    } = req.body;
    
    // Use service_id or product_id (frontend sends product_id)
    const serviceId = service_id || product_id;
    const customerNotes = customer_notes || notes || '';
    
    // Get store
    const storeResult = await db.query(
      'SELECT id FROM stores WHERE slug = $1',
      [storeSlug]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    const storeId = storeResult.rows[0].id;
    
    // Get booking settings
    const settingsResult = await db.query(
      'SELECT * FROM booking_settings WHERE store_id = $1',
      [storeId]
    );
    const settings = settingsResult.rows[0] || {};
    
    // Get service/product details for pricing
    let totalAmount = 0;
    let depositAmount = 0;
    let durationMinutes = settings.slot_duration_minutes || 60;
    
    if (serviceId) {
      const productResult = await db.query(
        'SELECT data FROM products WHERE id = $1',
        [serviceId]
      );
      if (productResult.rows.length > 0) {
        const productData = productResult.rows[0].data;
        totalAmount = parseFloat(productData.price) || 0;
        
        // Check if package selected
        if (package_name && productData.packages) {
          const pkg = productData.packages.find(p => p.name === package_name);
          if (pkg) {
            totalAmount = parseFloat(pkg.price) || totalAmount;
            durationMinutes = pkg.duration_minutes || durationMinutes;
          }
        }
      }
    }
    
    // Calculate deposit
    if (settings.deposit_enabled && payment_type === 'deposit') {
      depositAmount = totalAmount * (settings.deposit_percentage / 100);
    }
    
    // Add jump line fee
    let jumpFeePaid = 0;
    if (jumped_line && settings.jump_line_enabled) {
      jumpFeePaid = parseFloat(settings.jump_line_fee) || 0;
    }
    
    // Create booking
    const result = await db.query(`
      INSERT INTO bookings (
        store_id, product_id, customer_name, customer_phone, customer_email,
        booking_date, booking_time, duration_minutes, package_name,
        total_amount, deposit_amount, jumped_line, jump_fee_paid,
        customer_notes, status, payment_status, payment_type, mpesa_code, payment_confirmed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending', 'unpaid', $15, $16, $17)
      RETURNING *
    `, [
      storeId, serviceId, customer_name, customer_phone, customer_email,
      booking_date, booking_time, durationMinutes, package_name,
      totalAmount, depositAmount, jumped_line || false, jumpFeePaid,
      customerNotes, payment_type || 'full', mpesa_code || null, payment_confirmed || false
    ]);
    
    // TODO: Send notification to provider (SMS/WhatsApp)
    // TODO: Send confirmation to customer
    
    res.status(201).json({
      booking: result.rows[0],
      payment_required: payment_type !== 'inquiry' ? (payment_type === 'deposit' ? depositAmount : totalAmount) + jumpFeePaid : 0,
      inquiry_fee: payment_type === 'inquiry' ? settings.inquiry_fee : 0
    });
  } catch (err) {
    next(err);
  }
});

export default router;
