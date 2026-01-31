-- Migration 015: Checkout Decoupling
-- Separates checkout modes from page designs
-- Allows any checkout to be used with any page layout

-- =====================================================
-- PART 1: Products table - Add checkout_mode
-- =====================================================

-- Add checkout_mode column (default 'standard' for existing products)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS checkout_mode VARCHAR(50) DEFAULT 'standard';

-- Add checkout_config for mode-specific settings (booking duration, deposit %, etc.)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS checkout_config JSONB DEFAULT '{}';

-- Index for filtering by checkout_mode
CREATE INDEX IF NOT EXISTS idx_products_checkout_mode ON products(checkout_mode);

-- =====================================================
-- PART 2: Stores table - Add unlocked checkouts tracking
-- =====================================================

-- Add unlocked_checkouts array (what checkout modes this store has access to)
-- Default: ['standard'] - everyone gets standard free
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS unlocked_checkouts TEXT[] DEFAULT ARRAY['standard'];

-- Add default_checkout for new products
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS default_checkout VARCHAR(50) DEFAULT 'standard';

-- =====================================================
-- PART 3: Checkout unlocks tracking table
-- =====================================================

-- Track checkout unlock purchases
CREATE TABLE IF NOT EXISTS checkout_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  checkout_mode VARCHAR(50) NOT NULL,
  price_paid DECIMAL(10,2) DEFAULT 0,
  payment_ref VARCHAR(255),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(store_id, checkout_mode)
);

CREATE INDEX IF NOT EXISTS idx_checkout_unlocks_store ON checkout_unlocks(store_id);

-- =====================================================
-- PART 4: Checkout modes reference table
-- =====================================================

-- Define available checkout modes and their prices
CREATE TABLE IF NOT EXISTS checkout_modes (
  slug VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  cta_text VARCHAR(50) DEFAULT 'Buy Now',
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default checkout modes
INSERT INTO checkout_modes (slug, name, description, price, cta_text, icon, sort_order) VALUES
  ('standard', 'Buy Now', 'Customers add to cart and pay immediately', 0, 'Add to Cart', '🛒', 1),
  ('booking', 'Book & Pay', 'Customers pick a date/time and reserve your service', 500, 'Book Now', '📅', 2),
  ('inquiry', 'Get Quote', 'Customers request information before committing', 300, 'Get Quote', '💬', 3),
  ('reservation', 'Reserve', 'Customers reserve a spot with party size', 500, 'Reserve', '🍽️', 4),
  ('event', 'Event Tickets', 'Customers register for events with ticket types', 600, 'Get Tickets', '🎟️', 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  cta_text = EXCLUDED.cta_text;

-- =====================================================
-- PART 5: Migration - Set checkout_mode for existing products
-- =====================================================

-- Products using portfolio-booking template get 'booking' checkout
UPDATE products 
SET checkout_mode = 'booking' 
WHERE template = 'portfolio-booking' AND checkout_mode = 'standard';

-- All other products keep 'standard' (already default)

-- =====================================================
-- PART 6: Migration - Unlock checkouts for existing stores
-- =====================================================

-- Stores with portfolio-booking template products get 'booking' unlocked
UPDATE stores s
SET unlocked_checkouts = ARRAY['standard', 'booking']
WHERE EXISTS (
  SELECT 1 FROM products p 
  WHERE p.store_id = s.id AND p.template = 'portfolio-booking'
);

-- Record the free unlock in checkout_unlocks table
INSERT INTO checkout_unlocks (store_id, checkout_mode, price_paid, payment_ref)
SELECT DISTINCT s.id, 'booking', 0, 'migration-free-unlock'
FROM stores s
JOIN products p ON p.store_id = s.id
WHERE p.template = 'portfolio-booking'
ON CONFLICT (store_id, checkout_mode) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES (run manually to verify)
-- =====================================================
-- SELECT checkout_mode, COUNT(*) FROM products GROUP BY checkout_mode;
-- SELECT unlocked_checkouts, COUNT(*) FROM stores GROUP BY unlocked_checkouts;
-- SELECT * FROM checkout_modes ORDER BY sort_order;
