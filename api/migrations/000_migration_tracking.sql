-- Migration 000: Migration Tracking System
-- Purpose: Track which migrations have been run to prevent re-running
-- This MUST be the first migration to run

CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comment for documentation
COMMENT ON TABLE _migrations IS 'Tracks which migrations have been executed';
