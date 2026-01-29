-- Jari.Ecom V2 - Custom Domains Feature
-- Migration: 012_custom_domains.sql
-- Date: January 29, 2026
-- Purpose: Enable users to use their own domains for their stores

-- ============================================
-- PHASE 1: Add domain columns to stores table
-- ============================================

-- Add custom_domain column (the user's domain, e.g., 'lanixkenya.com')
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) UNIQUE;

-- Add domain verification status
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;

-- Add SSL status tracking
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS domain_ssl_status VARCHAR(50) DEFAULT 'pending';

-- Add domain type (subdomain vs root)
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS domain_type VARCHAR(20) DEFAULT 'subdomain';

-- Add timestamp for when domain was added
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS domain_added_at TIMESTAMP;

-- Add timestamp for when domain was verified
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMP;

-- ============================================
-- PHASE 2: Create domain verification tracking
-- ============================================

CREATE TABLE IF NOT EXISTS domain_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  verification_token VARCHAR(255) NOT NULL,
  verification_method VARCHAR(50) DEFAULT 'dns_txt',
  status VARCHAR(20) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  verified_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_verification_status CHECK (status IN ('pending', 'verified', 'failed', 'expired'))
);

-- ============================================
-- PHASE 3: Create indexes for performance
-- ============================================

-- Fast lookup by custom domain (critical for routing)
CREATE INDEX IF NOT EXISTS idx_stores_custom_domain 
ON stores(custom_domain) 
WHERE custom_domain IS NOT NULL AND domain_verified = true;

-- Index for verification lookups
CREATE INDEX IF NOT EXISTS idx_domain_verifications_store 
ON domain_verifications(store_id);

CREATE INDEX IF NOT EXISTS idx_domain_verifications_domain 
ON domain_verifications(domain);

CREATE INDEX IF NOT EXISTS idx_domain_verifications_token 
ON domain_verifications(verification_token);

-- ============================================
-- PHASE 4: Add constraint for domain format
-- ============================================

-- Ensure domain is lowercase and valid format
ALTER TABLE stores 
ADD CONSTRAINT valid_custom_domain 
CHECK (custom_domain IS NULL OR custom_domain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$');

-- ============================================
-- COMMENTS for documentation
-- ============================================

COMMENT ON COLUMN stores.custom_domain IS 'User custom domain e.g. lanixkenya.com or shop.lanixkenya.com';
COMMENT ON COLUMN stores.domain_verified IS 'Whether DNS verification has passed';
COMMENT ON COLUMN stores.domain_ssl_status IS 'SSL certificate status: pending, active, failed';
COMMENT ON COLUMN stores.domain_type IS 'Type of domain: subdomain or root';
COMMENT ON TABLE domain_verifications IS 'Tracks domain verification attempts and tokens';
