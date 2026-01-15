-- Jari.Ecom V2 - Pixel Tracking Schema
-- Lightweight analytics for traffic & conversion tracking

-- PIXEL EVENTS TABLE
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
);

-- Indexes for fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_pixel_store_date ON pixel_events(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pixel_source ON pixel_events(store_id, utm_source);
CREATE INDEX IF NOT EXISTS idx_pixel_event ON pixel_events(store_id, event);
CREATE INDEX IF NOT EXISTS idx_pixel_session ON pixel_events(session_id);

-- Composite index for time-filtered source queries
CREATE INDEX IF NOT EXISTS idx_pixel_store_source_date ON pixel_events(store_id, utm_source, created_at DESC);
