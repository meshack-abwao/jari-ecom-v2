-- Migration 014: KYC System for IntaSend Merchant Verification
-- Enables merchants to submit KYC docs and get IntaSend wallet after approval

-- Main KYC tracking table
CREATE TABLE IF NOT EXISTS merchant_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  
  -- Status flow: draft → docs_uploaded → submitted_to_intasend → approved → rejected
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Business type determines required documents
  business_type VARCHAR(50), -- sole_proprietor, partnership, limited_company
  
  -- Personal KYC (REQUIRED FOR ALL)
  national_id_front TEXT, -- Cloudinary URL
  national_id_back TEXT,
  kra_pin_cert TEXT,
  owner_full_name VARCHAR(255),
  owner_id_number VARCHAR(50),
  owner_kra_pin VARCHAR(50),
  
  -- Business Documents (REQUIRED FOR LIMITED COMPANIES)
  business_registration_cert TEXT,
  business_name VARCHAR(255),
  
  -- Physical Address (REQUIRED FOR ALL)
  physical_address TEXT,
  city VARCHAR(100),
  county VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Directors List (REQUIRED FOR LIMITED COMPANIES ONLY)
  directors_list TEXT, -- JSON array or Cloudinary PDF URL
  
  -- Board Resolution (REQUIRED FOR LIMITED COMPANIES ONLY)
  board_resolution_letter TEXT,
  
  -- IntaSend Wallet Integration
  intasend_wallet_id VARCHAR(100), -- Created when KYC approved
  intasend_wallet_label VARCHAR(255), -- Unique label for wallet
  intasend_notes TEXT, -- Admin notes or rejection reasons
  
  -- Timestamps
  docs_completed_at TIMESTAMP, -- When all docs uploaded
  submitted_at TIMESTAMP, -- When submitted to IntaSend
  approved_at TIMESTAMP, -- When IntaSend approves
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  resubmission_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_kyc_store ON merchant_kyc(store_id);
CREATE INDEX IF NOT EXISTS idx_merchant_kyc_status ON merchant_kyc(status);
CREATE INDEX IF NOT EXISTS idx_merchant_kyc_wallet ON merchant_kyc(intasend_wallet_id);

-- Track submission history for auditing
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_id UUID NOT NULL REFERENCES merchant_kyc(id) ON DELETE CASCADE,
  submission_type VARCHAR(50), -- initial, resubmission, appeal
  submitted_by VARCHAR(100), -- merchant email or admin name
  documents_submitted JSONB, -- Which docs were included
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_kyc ON kyc_submissions(kyc_id);

-- Support tickets for rejected KYC or questions
CREATE TABLE IF NOT EXISTS kyc_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_id UUID REFERENCES merchant_kyc(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  merchant_email VARCHAR(255),
  merchant_whatsapp VARCHAR(20),
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_tickets_kyc ON kyc_support_tickets(kyc_id);
CREATE INDEX IF NOT EXISTS idx_kyc_tickets_store ON kyc_support_tickets(store_id);
CREATE INDEX IF NOT EXISTS idx_kyc_tickets_status ON kyc_support_tickets(status);
