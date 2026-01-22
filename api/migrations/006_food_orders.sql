-- ===========================================
-- Migration 006: Food Orders System
-- For Visual Menu template - restaurant/food ordering
-- ===========================================

-- FOOD ORDERS TABLE
CREATE TABLE IF NOT EXISTS food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  order_number VARCHAR(30) NOT NULL,  -- Store prefix: "NIM-001"
  
  -- Customer Info
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  
  -- Order Type
  order_type VARCHAR(20) DEFAULT 'delivery',  -- 'delivery' | 'pickup'
  delivery_address TEXT,
  delivery_instructions TEXT,
  scheduled_time TIMESTAMP,  -- NULL = ASAP
  
  -- Order Items (JSONB array)
  items JSONB NOT NULL DEFAULT '[]',
  /*
    items structure:
    [
      {
        "productId": "uuid",
        "productName": "Beef Burger",
        "quantity": 2,
        "unitPrice": 450,
        "extras": [
          { "name": "Bacon", "price": 80 },
          { "name": "Cheese", "price": 50 }
        ],
        "specialInstructions": "No onions",
        "itemTotal": 1160
      }
    ]
  */
  
  -- Pricing (stored in smallest currency unit)
  subtotal INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  
  -- Payment
  payment_method VARCHAR(50),  -- 'mpesa', 'cash', 'card'
  payment_status VARCHAR(20) DEFAULT 'pending',
  mpesa_receipt VARCHAR(100),
  
  -- Order Status
  status VARCHAR(30) DEFAULT 'pending',
  /*
    Status flow:
    pending → confirmed → preparing → ready → 
      → out_for_delivery → delivered (delivery)
      → picked_up (pickup)
    OR: cancelled at any point
  */
  status_history JSONB DEFAULT '[]',
  /*
    status_history structure:
    [
      { "status": "pending", "timestamp": "2026-01-23T10:00:00Z" },
      { "status": "confirmed", "timestamp": "2026-01-23T10:05:00Z", "note": "Confirmed by merchant" }
    ]
  */
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  ready_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_orders_store ON food_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_food_orders_date ON food_orders(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_orders_phone ON food_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_food_orders_number ON food_orders(store_id, order_number);

-- FOOD ORDER SEQUENCE (for order numbers per store)
-- We'll handle this in the API with a simple counter approach

-- Add column to stores for tracking food order count
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS food_order_count INTEGER DEFAULT 0;
