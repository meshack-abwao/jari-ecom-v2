-- Migration 010: Abandoned Checkouts Tracking
-- Purpose: Store detailed data about abandoned checkouts for follow-up and analysis
-- Date: January 27, 2026
-- IMPORTANT: This migration is IDEMPOTENT - safe to run multiple times

-- Create abandoned_checkouts table with UUID store_id to match stores table
-- Using IF NOT EXISTS to prevent data loss on re-run
CREATE TABLE IF NOT EXISTS abandoned_checkouts (
  id SERIAL PRIMARY KEY,
  store_id UUID NOT NULL,
  session_id VARCHAR(100),
  
  -- Product info
  product_id VARCHAR(100),
  product_name VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  total_amount INTEGER,
  
  -- Checkout progress
  step_reached INTEGER NOT NULL DEFAULT 1,
  -- 1 = Review Order, 2 = Delivery Details, 3 = Payment Selection
  
  -- Partial customer data (captured as they fill forms)
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_location VARCHAR(255),
  delivery_area VARCHAR(100),
  payment_method VARCHAR(50),
  
  -- Traffic source
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  device VARCHAR(50),
  
  -- Time tracking
  time_spent INTEGER,  -- seconds spent in checkout before abandoning
  
  -- Recovery tracking
  recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMP,
  contacted BOOLEAN DEFAULT FALSE,
  contacted_at TIMESTAMP,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_abandoned_store_id ON abandoned_checkouts(store_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_created_at ON abandoned_checkouts(created_at);
CREATE INDEX IF NOT EXISTS idx_abandoned_session ON abandoned_checkouts(session_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_step ON abandoned_checkouts(step_reached);
CREATE INDEX IF NOT EXISTS idx_abandoned_recovered ON abandoned_checkouts(recovered);

-- Add comment for documentation
COMMENT ON TABLE abandoned_checkouts IS 'Tracks checkout abandonments with partial customer data for follow-up';
COMMENT ON COLUMN abandoned_checkouts.step_reached IS '1=Review, 2=Delivery, 3=Payment';
COMMENT ON COLUMN abandoned_checkouts.time_spent IS 'Seconds spent in checkout before abandoning';
