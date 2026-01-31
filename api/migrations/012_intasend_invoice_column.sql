-- Migration: 012_intasend_invoice_column.sql
-- Add IntaSend invoice ID column to platform_payments

ALTER TABLE platform_payments 
ADD COLUMN IF NOT EXISTS intasend_invoice_id VARCHAR(100);

-- Index for fast lookups by invoice ID
CREATE INDEX IF NOT EXISTS idx_platform_payments_intasend_invoice 
ON platform_payments(intasend_invoice_id);
