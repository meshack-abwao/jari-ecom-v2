-- Migration: 004_platform_payments.sql
-- Platform payments for subscriptions, add-ons, cards, themes

-- Platform payments table (tracks all M-Pesa payments to Jari)
CREATE TABLE IF NOT EXISTS platform_payments (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'subscription', 'addon', 'cards', 'theme'
  item_id VARCHAR(50),       -- e.g., 'mpesa-stk', 'deep-dive', etc.
  item_name VARCHAR(100),    -- Human readable name
  
  -- M-Pesa details
  phone VARCHAR(15),
  checkout_request_id VARCHAR(100),
  merchant_request_id VARCHAR(100),
  mpesa_receipt_number VARCHAR(50),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  result_desc TEXT,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_platform_payments_store ON platform_payments(store_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_user ON platform_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_checkout ON platform_payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_status ON platform_payments(status);

-- Store add-ons table (tracks activated add-ons per store)
CREATE TABLE IF NOT EXISTS store_addons (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  addon_type VARCHAR(50) NOT NULL, -- 'mpesa-stk', 'whatsapp-auto', 'analytics', 'priority-support'
  activated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(store_id, addon_type)
);

-- Store themes table (tracks unlocked themes per store)
CREATE TABLE IF NOT EXISTS store_themes (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  theme_slug VARCHAR(50) NOT NULL, -- 'quick-decision', 'visual-menu', 'deep-dive', etc.
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(store_id, theme_slug)
);

-- Add subscription fields to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'trial';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_expires TIMESTAMP;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS product_card_limit INTEGER DEFAULT 3;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;

-- Set trial period for existing stores (14 days from creation)
UPDATE stores 
SET trial_ends_at = created_at + INTERVAL '14 days'
WHERE trial_ends_at IS NULL;

-- Comments
COMMENT ON TABLE platform_payments IS 'All M-Pesa payments made to Jari platform';
COMMENT ON TABLE store_addons IS 'Active add-ons for each store';
COMMENT ON TABLE store_themes IS 'Unlocked themes for each store';
COMMENT ON COLUMN stores.subscription_status IS 'trial, active, expired, cancelled';
COMMENT ON COLUMN stores.product_card_limit IS 'Max number of products store can have';
