-- Migration 009: Complaints System
-- Phase F: Security & Fraud Detection
-- Created: January 26, 2026

-- ============================================================================
-- CUSTOMER COMPLAINTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  
  -- Complaint details
  reason VARCHAR(50) NOT NULL CHECK (reason IN (
    'never_received', 'wrong_item', 'damaged', 'poor_quality', 
    'overcharged', 'refund_issue', 'rude_service', 'other'
  )),
  description TEXT NOT NULL,
  evidence_urls JSONB DEFAULT '[]',
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN (
    'open', 'under_review', 'resolved', 'rejected', 'escalated'
  )),
  resolution TEXT,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  
  -- Verification
  complaint_token VARCHAR(100) UNIQUE NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_store ON complaints(store_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_token ON complaints(complaint_token);
CREATE INDEX IF NOT EXISTS idx_complaints_order ON complaints(order_id);

-- ============================================================================
-- COMPLAINT METRICS (per store)
-- ============================================================================

CREATE TABLE IF NOT EXISTS complaint_metrics (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  
  -- Counts
  total_complaints INTEGER DEFAULT 0,
  open_complaints INTEGER DEFAULT 0,
  resolved_complaints INTEGER DEFAULT 0,
  rejected_complaints INTEGER DEFAULT 0,
  escalated_complaints INTEGER DEFAULT 0,
  
  -- Rates (calculated)
  complaint_rate DECIMAL(5,4) DEFAULT 0,  -- complaints / orders
  resolution_rate DECIMAL(5,4) DEFAULT 0,  -- resolved / total
  avg_resolution_hours DECIMAL(10,2) DEFAULT 0,
  
  -- Timestamps
  last_complaint_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- FRAUD ALERTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  transaction_id VARCHAR(100),
  
  -- Alert details
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  flags JSONB DEFAULT '[]',
  
  -- Actions
  action_taken VARCHAR(50) CHECK (action_taken IN (
    'none', 'flagged', 'reviewed', 'cleared', 'suspended', 'blocked'
  )),
  action_by UUID REFERENCES users(id),
  action_notes TEXT,
  action_at TIMESTAMP,
  
  -- Status
  is_resolved BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_store ON fraud_alerts(store_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_risk ON fraud_alerts(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_resolved ON fraud_alerts(is_resolved);

-- ============================================================================
-- MERCHANT WATCHLIST
-- ============================================================================

CREATE TABLE IF NOT EXISTS merchant_watchlist (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  
  -- Reason for watchlist
  reason VARCHAR(50) NOT NULL,
  notes TEXT,
  
  -- Added by
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP DEFAULT NOW(),
  
  -- Removal
  removed_at TIMESTAMP,
  removed_by UUID REFERENCES users(id),
  removal_reason TEXT
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE complaints IS 'Customer complaints about orders/merchants';
COMMENT ON TABLE complaint_metrics IS 'Aggregated complaint metrics per store';
COMMENT ON TABLE fraud_alerts IS 'Fraud detection alerts for manual review';
COMMENT ON TABLE merchant_watchlist IS 'Merchants under enhanced monitoring';

COMMENT ON COLUMN complaints.complaint_token IS 'Unique token sent to customer for verification';
COMMENT ON COLUMN complaints.evidence_urls IS 'Array of image/document URLs as evidence';
COMMENT ON COLUMN complaint_metrics.complaint_rate IS 'Total complaints divided by total orders';
