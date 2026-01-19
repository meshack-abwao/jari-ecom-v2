-- Migration 004: Add M-Pesa tracking fields to bookings
-- Adds mpesa_code and payment_confirmed columns

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS mpesa_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT false;

-- Add index for M-Pesa code lookup
CREATE INDEX IF NOT EXISTS idx_bookings_mpesa_code ON bookings(mpesa_code) WHERE mpesa_code IS NOT NULL;
