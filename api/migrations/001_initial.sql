-- Jari.Ecom V2 - Initial Schema
-- Clean, lean, JSONB-powered

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. STORES
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  template VARCHAR(50) NOT NULL DEFAULT 'quick-decision',
  status VARCHAR(20) DEFAULT 'active',
  data JSONB NOT NULL DEFAULT '{}',
  media JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'draft', 'archived'))
);

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id),
  product_id UUID REFERENCES products(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  customer JSONB NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  payment JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_order_status CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- 5. TEMPLATES (Reference)
CREATE TABLE IF NOT EXISTS templates (
  slug VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 500,
  schema JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. THEMES (Reference)
CREATE TABLE IF NOT EXISTS themes (
  slug VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  colors JSONB NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_stores_user ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_template ON products(template);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_products_data ON products USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_stores_config ON stores USING GIN(config);

-- Insert default templates
INSERT INTO templates (slug, name, description, price, schema, sort_order) VALUES
  ('quick-decision', 'Quick Decision', 'Single product impulse buy', 250, 
   '{"required": ["name", "price"], "optional": ["description", "stock"]}', 1),
  ('portfolio-booking', 'Portfolio + Booking', 'Service showcase with booking', 500,
   '{"required": ["name", "price"], "optional": ["packages", "availability"]}', 2),
  ('visual-menu', 'Visual Menu', 'Food ordering with photos', 600,
   '{"required": ["name", "price"], "optional": ["dietary_tags", "prep_time", "calories"]}', 3),
  ('deep-dive', 'Deep Dive', 'Detailed product pages', 800,
   '{"required": ["name", "price"], "optional": ["specifications", "warranty"]}', 4),
  ('catalog', 'Catalog Navigator', 'Multi-product homepage', 400,
   '{"required": ["name", "price"], "optional": ["category"]}', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert default themes
INSERT INTO themes (slug, name, colors, is_premium, sort_order) VALUES
  ('warm-sunset', 'Warm Sunset', '{"primary": "#ff9f0a", "gradient": "linear-gradient(135deg, #ff9f0a 0%, #ff375f 100%)"}', false, 1),
  ('cool-ocean', 'Cool Ocean', '{"primary": "#0a84ff", "gradient": "linear-gradient(135deg, #0a84ff 0%, #00d4ff 100%)"}', false, 2),
  ('royal-purple', 'Royal Purple', '{"primary": "#bf5af2", "gradient": "linear-gradient(135deg, #667eea 0%, #bf5af2 100%)"}', false, 3),
  ('fresh-mint', 'Fresh Mint', '{"primary": "#11998e", "gradient": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"}', false, 4),
  ('midnight', 'Midnight', '{"primary": "#34495e", "gradient": "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)"}', false, 5),
  ('rose-gold', 'Rose Gold', '{"primary": "#ed6ea0", "gradient": "linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%)"}', true, 6),
  ('cosmic', 'Cosmic Purple', '{"primary": "#C850C0", "gradient": "linear-gradient(135deg, #4158D0 0%, #C850C0 100%)"}', true, 7)
ON CONFLICT (slug) DO NOTHING;
