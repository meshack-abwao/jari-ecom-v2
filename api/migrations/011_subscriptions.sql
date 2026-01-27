-- Migration 011: Subscription System
-- Purpose: Track feature subscriptions and trial periods
-- Date: January 27, 2026
-- IMPORTANT: This migration is IDEMPOTENT - safe to run multiple times

-- Store subscriptions table
CREATE TABLE IF NOT EXISTS store_subscriptions (
  id SERIAL PRIMARY KEY,
  store_id UUID NOT NULL,
  
  -- Feature being subscribed to
  feature VARCHAR(50) NOT NULL,
  -- 'abandoned_checkouts', 'premium_templates', 'priority_support', etc.
  
  -- Pricing tier
  tier VARCHAR(20),
  -- 'starter', 'growth', 'pro'
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'trial',
  -- 'trial', 'active', 'expired', 'cancelled'
  
  -- Trial tracking
  trial_started_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  
  -- Subscription tracking
  subscribed_at TIMESTAMP,
  expires_at TIMESTAMP,
  monthly_price INTEGER,
  
  -- Payment tracking
  last_payment_at TIMESTAMP,
  last_payment_ref VARCHAR(100),
  next_billing_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint: one subscription per feature per store
  UNIQUE(store_id, feature)
);

-- Track monthly order counts for tier recommendations
CREATE TABLE IF NOT EXISTS store_order_counts (
  id SERIAL PRIMARY KEY,
  store_id UUID NOT NULL,
  month VARCHAR(7) NOT NULL,  -- '2026-01'
  order_count INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  
  -- Unique constraint
  UNIQUE(store_id, month)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_store ON store_subscriptions(store_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON store_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_feature ON store_subscriptions(feature);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON store_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_order_counts_store ON store_order_counts(store_id);
CREATE INDEX IF NOT EXISTS idx_order_counts_month ON store_order_counts(month);

-- Comments
COMMENT ON TABLE store_subscriptions IS 'Tracks feature subscriptions and trial periods per store';
COMMENT ON TABLE store_order_counts IS 'Monthly order counts for tier recommendations';
COMMENT ON COLUMN store_subscriptions.feature IS 'Feature key: abandoned_checkouts, premium_templates, etc.';
COMMENT ON COLUMN store_subscriptions.tier IS 'Pricing tier: starter, growth, pro';
