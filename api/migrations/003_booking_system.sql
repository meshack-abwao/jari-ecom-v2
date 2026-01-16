-- Jari.Ecom V2 - Booking System Schema
-- For Portfolio/Booking template: photographers, consultants, trainers, coaches

-- 1. BOOKING SETTINGS (per store)
CREATE TABLE IF NOT EXISTS booking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Slot configuration
  slot_duration_minutes INTEGER DEFAULT 60,
  max_bookings_per_slot INTEGER DEFAULT 1,
  max_bookings_per_day INTEGER DEFAULT 5,
  
  -- Advance booking rules
  min_notice_hours INTEGER DEFAULT 24,
  max_advance_days INTEGER DEFAULT 30,
  
  -- Premium: Jump the Line
  jump_line_enabled BOOLEAN DEFAULT false,
  jump_line_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Payment settings
  deposit_enabled BOOLEAN DEFAULT false,
  deposit_percentage INTEGER DEFAULT 20,
  inquiry_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Reminders
  reminders_enabled BOOLEAN DEFAULT false,
  reminder_method VARCHAR(20) DEFAULT 'sms',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_store_booking UNIQUE(store_id),
  CONSTRAINT valid_reminder_method CHECK (reminder_method IN ('sms', 'whatsapp', 'both'))
);

-- 2. WORKING HOURS (per store, per day of week)
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
);

-- 3. BLOCKED DATES (holidays, personal days)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_store_blocked UNIQUE(store_id, blocked_date)
);

-- 4. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  
  -- Customer info
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  
  -- Booking details
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  package_name VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Payment
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  
  -- Premium features
  jumped_line BOOLEAN DEFAULT false,
  jump_fee_paid DECIMAL(10,2) DEFAULT 0,
  
  -- Notes
  customer_notes TEXT,
  provider_notes TEXT,
  
  -- Reminders tracking
  reminder_5hr_sent BOOLEAN DEFAULT false,
  reminder_2hr_sent BOOLEAN DEFAULT false,
  reminder_30min_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_booking_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('unpaid', 'deposit_paid', 'paid', 'refunded'))
);

-- 5. SERVICE PACKAGES (for booking template)
-- Stored in products.data JSONB, but adding helper table for complex queries
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  deposit_percentage INTEGER DEFAULT 20,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for packages
CREATE INDEX IF NOT EXISTS idx_service_packages_product ON service_packages(product_id);

-- Note: Categories remain in store.config JSONB
-- Products have a 'category' field in data JSONB for single category
-- For multi-select, we'll add 'categories' array to products.data JSONB

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_booking_settings_store ON booking_settings(store_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_store ON working_hours(store_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_store ON blocked_dates(store_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_bookings_store ON bookings(store_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);

-- Insert default working hours for new stores (trigger function)
CREATE OR REPLACE FUNCTION create_default_working_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Monday to Friday: 9am-5pm
  INSERT INTO working_hours (store_id, day_of_week, is_open, start_time, end_time)
  VALUES 
    (NEW.id, 1, true, '09:00', '17:00'),
    (NEW.id, 2, true, '09:00', '17:00'),
    (NEW.id, 3, true, '09:00', '17:00'),
    (NEW.id, 4, true, '09:00', '17:00'),
    (NEW.id, 5, true, '09:00', '17:00'),
    (NEW.id, 6, false, '09:00', '17:00'),
    (NEW.id, 0, false, '09:00', '17:00');
  
  -- Create default booking settings
  INSERT INTO booking_settings (store_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Trigger should be created after stores table exists
-- CREATE TRIGGER after_store_created
-- AFTER INSERT ON stores
-- FOR EACH ROW EXECUTE FUNCTION create_default_working_hours();
