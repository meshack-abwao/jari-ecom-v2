import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import db from './config/database.js';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.text()); // For sendBeacon which sends as text/plain

// Routes
setupRoutes(app);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function start() {
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('✅ Database connected');
    
    // Auto-run essential migrations
    await runMigrations();
    
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Jari.Ecom API v2 running on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

// Run migrations on startup
async function runMigrations() {
  // Helper to run migration with individual error handling
  const runSafe = async (name, query) => {
    try {
      await db.query(query);
    } catch (err) {
      console.log(`⚠️ Migration ${name}:`, err.message);
    }
  };

  try {
    // Pixel events table
    await runSafe('pixel_events', `
      CREATE TABLE IF NOT EXISTS pixel_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        event VARCHAR(50) NOT NULL,
        data JSONB DEFAULT '{}',
        utm_source VARCHAR(50) DEFAULT 'direct',
        utm_medium VARCHAR(50),
        utm_campaign VARCHAR(100),
        device VARCHAR(20),
        url TEXT,
        referrer TEXT,
        session_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Pixel indexes
    await runSafe('pixel_idx_1', `CREATE INDEX IF NOT EXISTS idx_pixel_store_date ON pixel_events(store_id, created_at DESC)`);
    await runSafe('pixel_idx_2', `CREATE INDEX IF NOT EXISTS idx_pixel_source ON pixel_events(store_id, utm_source)`);
    await runSafe('pixel_idx_3', `CREATE INDEX IF NOT EXISTS idx_pixel_event ON pixel_events(store_id, event)`);
    
    // ===========================================
    // BOOKING SYSTEM TABLES
    // ===========================================
    
    // Booking settings
    await runSafe('booking_settings', `
      CREATE TABLE IF NOT EXISTS booking_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        slot_duration_minutes INTEGER DEFAULT 60,
        max_bookings_per_slot INTEGER DEFAULT 1,
        max_bookings_per_day INTEGER DEFAULT 5,
        min_notice_hours INTEGER DEFAULT 24,
        max_advance_days INTEGER DEFAULT 30,
        jump_line_enabled BOOLEAN DEFAULT false,
        jump_line_fee DECIMAL(10,2) DEFAULT 0,
        deposit_enabled BOOLEAN DEFAULT false,
        deposit_percentage INTEGER DEFAULT 20,
        inquiry_fee DECIMAL(10,2) DEFAULT 0,
        reminders_enabled BOOLEAN DEFAULT false,
        reminder_method VARCHAR(20) DEFAULT 'sms',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_store_booking UNIQUE(store_id)
      )
    `);
    
    // Working hours
    await runSafe('working_hours', `
      CREATE TABLE IF NOT EXISTS working_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        is_open BOOLEAN DEFAULT true,
        start_time TIME DEFAULT '09:00',
        end_time TIME DEFAULT '17:00',
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT valid_day CHECK (day_of_week >= 0 AND day_of_week <= 6),
        CONSTRAINT unique_store_day UNIQUE(store_id, day_of_week)
      )
    `);
    
    // Blocked dates
    await runSafe('blocked_dates', `
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        blocked_date DATE NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_store_blocked UNIQUE(store_id, blocked_date)
      )
    `);
    
    // Bookings
    await runSafe('bookings', `
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_email VARCHAR(255),
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        duration_minutes INTEGER NOT NULL,
        package_name VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        deposit_amount DECIMAL(10,2) DEFAULT 0,
        amount_paid DECIMAL(10,2) DEFAULT 0,
        payment_status VARCHAR(20) DEFAULT 'unpaid',
        jumped_line BOOLEAN DEFAULT false,
        jump_fee_paid DECIMAL(10,2) DEFAULT 0,
        customer_notes TEXT,
        provider_notes TEXT,
        reminder_5hr_sent BOOLEAN DEFAULT false,
        reminder_2hr_sent BOOLEAN DEFAULT false,
        reminder_30min_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Booking indexes
    await runSafe('booking_idx_1', `CREATE INDEX IF NOT EXISTS idx_booking_settings_store ON booking_settings(store_id)`);
    await runSafe('booking_idx_2', `CREATE INDEX IF NOT EXISTS idx_working_hours_store ON working_hours(store_id)`);
    await runSafe('booking_idx_3', `CREATE INDEX IF NOT EXISTS idx_blocked_dates_store ON blocked_dates(store_id)`);
    await runSafe('booking_idx_4', `CREATE INDEX IF NOT EXISTS idx_bookings_store ON bookings(store_id)`);
    await runSafe('booking_idx_5', `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date)`);
    
    // ===========================================
    // ADDITIONAL COLUMNS (004, 005 migrations)
    // ===========================================
    
    // M-Pesa tracking columns (migration 004)
    await runSafe('mpesa_code_col', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mpesa_code VARCHAR(50)`);
    await runSafe('payment_confirmed_col', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT false`);
    await runSafe('mpesa_idx', `CREATE INDEX IF NOT EXISTS idx_bookings_mpesa_code ON bookings(mpesa_code) WHERE mpesa_code IS NOT NULL`);
    
    // Payment type column (migration 005)
    await runSafe('payment_type_col', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'full'`);
    await runSafe('payment_type_idx', `CREATE INDEX IF NOT EXISTS idx_bookings_payment_type ON bookings(payment_type)`);
    
    console.log('✅ Migrations verified');
  } catch (err) {
    console.error('⚠️ Migration error:', err.message);
    // Don't crash - continue starting the server
  }
}

start();
