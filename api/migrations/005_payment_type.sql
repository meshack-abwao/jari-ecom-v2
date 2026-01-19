-- Migration 005: Add payment_type column to bookings
-- Tracks whether customer chose full, deposit, or inquiry

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'full';

-- Add constraint for valid payment types
-- Note: Can't add constraint if column already has invalid values
-- ALTER TABLE bookings ADD CONSTRAINT valid_payment_type 
--   CHECK (payment_type IN ('full', 'deposit', 'inquiry'));

-- Add index for filtering by payment type
CREATE INDEX IF NOT EXISTS idx_bookings_payment_type ON bookings(payment_type);
