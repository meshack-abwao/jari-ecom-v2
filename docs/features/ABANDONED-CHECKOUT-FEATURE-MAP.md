# Abandoned Checkout Enhancement - Feature Map
## JARI.ECO Marketing Panel Enhancement
## Date: January 27, 2026

---

## 1. PROBLEM STATEMENT

Currently, the Marketing (Ads) page shows:
- ✅ Total abandoned checkout count
- ✅ Abandonment rate percentage
- ❌ WHERE in checkout they abandoned (which step?)
- ❌ WHAT data they entered (name, phone, location?)
- ❌ Ability to download for follow-up
- ❌ Anomaly detection (patterns in abandonment)

---

## 2. PROPOSED SOLUTION ARCHITECTURE

### 2.1 Data We Need to Capture

**Checkout Steps (3-step flow):**
```
Step 1: Review Order      → checkout_step_1
Step 2: Delivery Details  → checkout_step_2 (name, phone, location)
Step 3: Payment Selection → checkout_step_3 (payment method chosen)
Step 4: Payment Confirmed → purchase (SUCCESS - not abandoned)
```

**Data to Save on Abandonment:**
```javascript
{
  session_id: 'sid_xxx',
  step_reached: 2,
  product_id: 'xxx',
  product_name: 'Product Name',
  quantity: 2,
  total_amount: 5000,
  customer_name: 'John',
  customer_phone: '07...',
  customer_location: 'Nairobi',
  delivery_area: 'Westlands',
  device: 'mobile',
  utm_source: 'instagram',
  time_spent: 45,
  abandoned_at: '2026-01-27T14:30:00Z'
}
```

### 2.2 When to Capture Abandonment

**Triggers:**
1. User closes checkout modal (X button)
2. User clicks outside modal (overlay click)
3. User navigates away (beforeunload event)
4. User goes back to product page
5. Inactivity timeout (5 minutes)

---

## 3. DATABASE SCHEMA

### New Table: `abandoned_checkouts`

```sql
CREATE TABLE abandoned_checkouts (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id),
  session_id VARCHAR(100),
  product_id VARCHAR(100),
  product_name VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  total_amount INTEGER,
  step_reached INTEGER NOT NULL DEFAULT 1,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_location VARCHAR(255),
  delivery_area VARCHAR(100),
  payment_method VARCHAR(50),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  device VARCHAR(50),
  time_spent INTEGER,
  recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMP,
  contacted BOOLEAN DEFAULT FALSE,
  contacted_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Deep Dive CTA Change ✅ (Do First)
### Phase 2: Database Migration
### Phase 3: Frontend Tracking
### Phase 4: API Endpoints
### Phase 5: Dashboard UI

---

*Full details in feature map document*
