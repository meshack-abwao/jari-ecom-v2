-- Migration 008: Pricing and Security Foundation
-- Created: January 25, 2026
-- Purpose: Add pricing config, verification tiers, settlement rules, fraud detection, complaints, badges

-- ============================================================================
-- A1: PRICING CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricing_config (
  id SERIAL PRIMARY KEY,
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('subscription', 'addon', 'card_bundle', 'theme')),
  item_id VARCHAR(50) NOT NULL UNIQUE,
  
  -- Pricing
  price_once DECIMAL(10,2), -- For one-time purchases (cards, themes)
  price_monthly DECIMAL(10,2), -- For subscriptions/addons
  
  -- Processing fees
  processing_fee_percent DECIMAL(5,2) DEFAULT 3.50, -- IntaSend 3% + Jari 0.5%
  show_processing_fee BOOLEAN DEFAULT true,
  
  -- Metadata
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed pricing data
INSERT INTO pricing_config (item_type, item_id, price_monthly, display_name, sort_order) VALUES
('subscription', 'base', 1200.00, 'Base Platform', 1),
('addon', 'mpesa_stk', 300.00, 'M-Pesa STK Push', 2),
('addon', 'whatsapp_auto', 80.00, 'WhatsApp Auto-Reply', 3),
('addon', 'advanced_analytics', 200.00, 'Advanced Analytics', 4),
('addon', 'priority_support', 500.00, 'Priority Support', 5)
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO pricing_config (item_type, item_id, price_once, display_name, description, sort_order) VALUES
('card_bundle', 'starter_pack', 350.00, 'Starter Pack', '+4 cards', 1),
('card_bundle', 'growth_pack', 550.00, 'Growth Pack', '+7 cards', 2),
('card_bundle', 'pro_pack', 850.00, 'Pro Pack', '+12 cards', 3)
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO pricing_config (item_type, item_id, price_once, display_name, sort_order) VALUES
('theme', 'qd', 0.00, 'Quick Decision', 1),
('theme', 'vm', 600.00, 'Visual Menu', 2),
('theme', 'dd', 800.00, 'Deep Dive', 3),
('theme', 'pbk', 1000.00, 'Portfolio/Booking', 4),
('theme', 'events', 1000.00, 'Events/Booking', 5)
ON CONFLICT (item_id) DO NOTHING;

-- ============================================================================
-- A2: MERCHANT VERIFICATION (4 TIERS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS merchant_verification (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) UNIQUE NOT NULL,
  tier VARCHAR(20) DEFAULT 'BASIC' CHECK (tier IN ('BASIC', 'VERIFIED', 'BUSINESS', 'PREMIUM')),
  
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  
  national_id_number VARCHAR(20),
  national_id_front_url TEXT,
  national_id_back_url TEXT,
  national_id_verified BOOLEAN DEFAULT false,
  national_id_verified_at TIMESTAMP,
  national_id_verified_by INTEGER,
  
  business_reg_number VARCHAR(100),
  business_reg_document_url TEXT,
  business_reg_verified BOOLEAN DEFAULT false,
  kra_pin VARCHAR(50),
  kra_document_url TEXT,
  kra_verified BOOLEAN DEFAULT false,
  business_verified_at TIMESTAMP,
  
  bank_statement_url TEXT,
  tax_compliance_certificate_url TEXT,
  premium_verified_at TIMESTAMP,
  
  monthly_limit DECIMAL(10,2) DEFAULT 50000.00,
  per_transaction_limit DECIMAL(10,2) DEFAULT 10000.00,
  settlement_delay_days INTEGER DEFAULT 3,
  
  is_whitelisted BOOLEAN DEFAULT false,
  whitelist_reason TEXT,
  whitelisted_at TIMESTAMP,
  whitelist_approved_by VARCHAR(100),
  
  is_beta_merchant BOOLEAN DEFAULT false,
  beta_merchant_until TIMESTAMP,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- A3: SETTLEMENT RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS settlement_rules (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) UNIQUE NOT NULL,
  
  risk_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  merchant_age_days INTEGER DEFAULT 0,
  total_successful_transactions INTEGER DEFAULT 0,
  total_disputes INTEGER DEFAULT 0,
  dispute_rate DECIMAL(5,2) DEFAULT 0.00,
  
  hold_period_days INTEGER DEFAULT 3,
  auto_approve_threshold DECIMAL(10,2) DEFAULT 10000.00,
  require_manual_approval BOOLEAN DEFAULT false,
  
  early_settlement_enabled BOOLEAN DEFAULT true,
  early_settlement_fee_percent DECIMAL(5,2) DEFAULT 2.00,
  
  last_reviewed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- A4: FRAUD DETECTION THRESHOLDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fraud_thresholds (
  id SERIAL PRIMARY KEY,
  threshold_type VARCHAR(50) UNIQUE NOT NULL,
  min_merchants INTEGER,
  max_merchants INTEGER,
  max_transactions_per_hour INTEGER,
  max_transactions_per_day INTEGER,
  amount_deviation_multiplier INTEGER,
  max_purchases_per_customer_per_day INTEGER,
  max_bookings_per_phone_per_day INTEGER,
  auto_suspend_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO fraud_thresholds (threshold_type, min_merchants, max_merchants, max_transactions_per_hour, max_transactions_per_day, amount_deviation_multiplier, max_purchases_per_customer_per_day, max_bookings_per_phone_per_day, auto_suspend_enabled) VALUES
('beta', 0, 50, 200, 1000, 50, 10, 5, false),
('early_growth', 51, 100, 100, 500, 20, 5, 3, false),
('scale', 101, 999999, 50, 200, 10, 3, 2, true)
ON CONFLICT (threshold_type) DO NOTHING;

-- ============================================================================
-- A5: CUSTOMER COMPLAINTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_complaints (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) NOT NULL,
  
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  store_url TEXT NOT NULL,
  
  complaint_type VARCHAR(50) NOT NULL CHECK (complaint_type IN ('product_not_delivered', 'quality_issue', 'refund_request', 'wrong_item', 'damaged_product', 'service_issue', 'other')),
  order_id INTEGER REFERENCES orders(id),
  booking_id INTEGER REFERENCES bookings(id),
  complaint_text TEXT NOT NULL,
  
  is_verified_customer BOOLEAN DEFAULT false,
  verification_checked_at TIMESTAMP,
  
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'responded', 'resolved', 'escalated')),
  merchant_response TEXT,
  responded_at TIMESTAMP,
  resolved_at TIMESTAMP,
  
  escalated_to_admin BOOLEAN DEFAULT false,
  escalated_at TIMESTAMP,
  admin_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaint_metrics (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) UNIQUE NOT NULL,
  
  total_complaints INTEGER DEFAULT 0,
  verified_complaints INTEGER DEFAULT 0,
  open_complaints INTEGER DEFAULT 0,
  resolved_complaints INTEGER DEFAULT 0,
  
  complaints_last_7_days INTEGER DEFAULT 0,
  complaints_last_30_days INTEGER DEFAULT 0,
  
  response_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_response_time_hours DECIMAL(10,2),
  
  auto_suspend_threshold INTEGER DEFAULT 5,
  is_suspended BOOLEAN DEFAULT false,
  suspended_at TIMESTAMP,
  suspension_reason TEXT,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- A6: CHARGEBACK TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS chargebacks (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) NOT NULL,
  
  original_transaction_ref VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP,
  
  chargeback_reason VARCHAR(100),
  chargeback_date TIMESTAMP DEFAULT NOW(),
  chargeback_status VARCHAR(20) DEFAULT 'pending' CHECK (chargeback_status IN ('pending', 'won', 'lost', 'refunded')),
  
  merchant_evidence TEXT,
  admin_decision TEXT,
  resolution_date TIMESTAMP,
  
  chargeback_fee DECIMAL(10,2),
  amount_refunded DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- A7: BADGE SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS merchant_badges (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) UNIQUE NOT NULL,
  
  current_badge VARCHAR(20) DEFAULT 'none' CHECK (current_badge IN ('none', 'bronze', 'silver', 'gold', 'platinum')),
  
  total_sales_volume DECIMAL(10,2) DEFAULT 0.00,
  successful_transactions INTEGER DEFAULT 0,
  customer_satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
  dispute_rate DECIMAL(5,2) DEFAULT 0.00,
  response_rate DECIMAL(5,2) DEFAULT 0.00,
  
  trust_score INTEGER DEFAULT 0,
  
  bronze_unlocked_at TIMESTAMP,
  silver_unlocked_at TIMESTAMP,
  gold_unlocked_at TIMESTAMP,
  platinum_unlocked_at TIMESTAMP,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badge_criteria (
  badge_tier VARCHAR(20) PRIMARY KEY,
  min_sales_volume DECIMAL(10,2),
  min_transactions INTEGER,
  max_dispute_rate DECIMAL(5,2),
  min_response_rate DECIMAL(5,2),
  verification_tier_required VARCHAR(20),
  display_name VARCHAR(50),
  badge_color VARCHAR(20)
);

INSERT INTO badge_criteria VALUES
('bronze', 10000.00, 10, 5.00, 70.00, 'BASIC', 'Trusted Seller', '#CD7F32'),
('silver', 50000.00, 50, 3.00, 80.00, 'VERIFIED', 'Verified Merchant', '#C0C0C0'),
('gold', 200000.00, 200, 1.00, 90.00, 'BUSINESS', 'Premium Merchant', '#FFD700'),
('platinum', 1000000.00, 1000, 0.50, 95.00, 'PREMIUM', 'Elite Partner', '#E5E4E2')
ON CONFLICT (badge_tier) DO NOTHING;

-- ============================================================================
-- A8: UPDATE STORES TABLE
-- ============================================================================

ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_type VARCHAR(50);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS card_limit INTEGER DEFAULT 3;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS unlocked_themes JSONB DEFAULT '[]';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- ============================================================================
-- A9: UPDATE PRODUCTS TABLE (Template Assignment)
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS assigned_template VARCHAR(20);

-- ============================================================================
-- A10: CARD & THEME PURCHASES TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS card_purchases (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) NOT NULL,
  
  bundle_type VARCHAR(50) NOT NULL,
  cards_added INTEGER NOT NULL,
  previous_card_limit INTEGER NOT NULL,
  new_card_limit INTEGER NOT NULL,
  
  amount_paid DECIMAL(10,2) NOT NULL,
  processing_fee DECIMAL(10,2),
  total_paid DECIMAL(10,2),
  payment_ref VARCHAR(100),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  
  purchased_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS theme_purchases (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) NOT NULL,
  
  theme_id VARCHAR(50) NOT NULL,
  theme_name VARCHAR(100),
  
  amount_paid DECIMAL(10,2) NOT NULL,
  processing_fee DECIMAL(10,2),
  total_paid DECIMAL(10,2),
  payment_ref VARCHAR(100),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  
  purchased_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- END OF MIGRATION 008
-- ============================================================================
