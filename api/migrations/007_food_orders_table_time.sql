-- ===========================================
-- Migration 007: Food Orders - Table & Estimated Time
-- Adds dine-in table support and time estimates
-- ===========================================

-- Add table number for dine-in orders
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS table_number VARCHAR(20);

-- Add estimated ready time (in minutes from order creation)
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER;

-- Add actual ready timestamp (when marked ready)
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS estimated_ready_at TIMESTAMP;

-- Index for quick lookup by order number (for tracking page)
CREATE INDEX IF NOT EXISTS idx_food_orders_order_number ON food_orders(order_number);
