-- Migration: Add product slugs for SEO-friendly URLs
-- Date: January 29, 2026

-- Add slug column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create unique index on slug within a store (same slug can exist in different stores)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_store_slug ON products(store_id, slug) WHERE slug IS NOT NULL;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_product_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),  -- Remove special chars
        '\s+', '-', 'g'                                      -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'                                         -- Remove multiple hyphens
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing products to have slugs (based on their name in data JSONB)
UPDATE products 
SET slug = generate_product_slug(data->>'name') || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL AND data->>'name' IS NOT NULL;

-- For products without names, use a portion of the UUID
UPDATE products
SET slug = 'product-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set slug if it's NULL or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_product_slug(NEW.data->>'name') || '-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_set_product_slug ON products;
CREATE TRIGGER trigger_set_product_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_slug();
