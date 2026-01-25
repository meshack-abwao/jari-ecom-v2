# JARI.ECOM V2 - COMPREHENSIVE HANDOVER DOCUMENT
## Visual Menu Template Session 2 - January 23, 2026

---

## 🎯 SESSION SUMMARY

This session focused on building the **Food Orders system end-to-end**: database schema, API routes, dashboard UI (Kanban-style), order routing, customer tracking page, and dark mode fixes.

### Commits Made This Session
```
2528f5e VM-order-tracking-page-table-number-estimated-time-dark-mode-fix
03c555c API-food-orders-accept-slug-lookup-store-fix-field-names
1afcd10 VM-orders-route-to-food-orders-API-not-regular-orders
634ad91 FoodOrdersPage-redesign-unified-with-BookingsPage-style
2ff57ce VM-checkout-order-data-includes-extras-template-type
935c20d VM-checkout-extras-display-total-calculation
e86f016 VM-addons-CSS-card-grid-qty-handlers-fix
12460d1 VM-addons-qty-selectors-card-grid-layout
1e48004 VM-wire-FoodOrdersPage-to-App-and-Sidebar
40771d2 VM-dashboard-FoodOrdersPage-kanban-UI-modal
23acee6 VM-dashboard-foodOrdersAPI-client
54c400c VM-api-food-orders-routes-CRUD-status-payment
0ebac5e VM-migration-006-food-orders-table
```

---

## 📁 NEW FILES CREATED THIS SESSION

```
C:\Users\ADMIN\Desktop\jari-ecom-v2\
├── api/
│   ├── migrations/
│   │   ├── 006_food_orders.sql           # Food orders table
│   │   └── 007_food_orders_table_time.sql # Table number, estimated time
│   └── src/
│       └── routes/
│           └── food-orders.js            # CRUD for food orders
│
├── dashboard/
│   └── src/
│       └── pages/
│           └── FoodOrdersPage.jsx        # Kanban-style order management
│
├── store/
│   └── src/
│       ├── order-tracking.js             # Customer tracking page
│       └── styles/
│           └── order-tracking.css        # Tracking page styles
│
└── docs/
    └── IDEA-SHELF.md                     # Future feature ideas
```

---

## 🗄️ DATABASE SCHEMA - FOOD ORDERS

### Migration 006: `food_orders` table
```sql
CREATE TABLE food_orders (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  order_number VARCHAR(30),        -- "NIM-001" format
  
  -- Customer
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  
  -- Order Type
  order_type VARCHAR(20),          -- 'delivery' | 'pickup' | 'dine_in'
  delivery_address TEXT,
  delivery_instructions TEXT,
  scheduled_time TIMESTAMP,
  
  -- Items (JSONB)
  items JSONB NOT NULL DEFAULT '[]',
  
  -- Pricing
  subtotal INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  
  -- Payment
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  mpesa_receipt VARCHAR(100),
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending',
  status_history JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at, updated_at, confirmed_at, ready_at, completed_at
);
```

### Migration 007: Table & Time additions
```sql
ALTER TABLE food_orders ADD COLUMN table_number VARCHAR(20);
ALTER TABLE food_orders ADD COLUMN estimated_minutes INTEGER;
ALTER TABLE food_orders ADD COLUMN estimated_ready_at TIMESTAMP;
CREATE INDEX idx_food_orders_order_number ON food_orders(order_number);
```

### Status Flow
```
pending → confirmed → preparing → ready → delivered/picked_up
                                       ↘ cancelled (any stage)
```

---

## 🔌 API ENDPOINTS - FOOD ORDERS

**File:** `api/src/routes/food-orders.js`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/food-orders` | ✅ | List all orders (with status filter) |
| GET | `/api/food-orders/stats` | ✅ | Order statistics |
| GET | `/api/food-orders/:id` | ✅ | Single order details |
| POST | `/api/food-orders` | ❌ | Create new order (storefront) |
| PUT | `/api/food-orders/:id/status` | ✅ | Update status + table/time |
| PUT | `/api/food-orders/:id/payment` | ✅ | Update payment status |
| DELETE | `/api/food-orders/:id` | ✅ | Cancel order |

**Public endpoint for tracking:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/s/order/:orderNumber` | ❌ | Public order tracking |

---

## 🖥️ DASHBOARD - FOOD ORDERS PAGE

**File:** `dashboard/src/pages/FoodOrdersPage.jsx`

### Features:
- **Stats cards** with gradient icons (matching BookingsPage)
- **Filter pills**: All, Pending, Confirmed, Preparing, Ready, Completed
- **Search**: By name, phone, order number
- **Order cards**: Date box, customer info, status badge
- **Detail modal**: Customer info, items with extras, totals, payment
- **Editable fields**: Table number + estimated time (when pending/confirmed)
- **Status actions**: Confirm, Mark Preparing, Mark Ready, etc.
- **Dark mode**: Fixed filter pill visibility

### Wiring:
- **Route:** `dashboard/src/App.jsx` line 56: `<Route path="food-orders" element={<FoodOrdersPage />} />`
- **Sidebar:** `dashboard/src/components/Layout.jsx` line 221: NavLink to `/food-orders`
- **API Client:** `dashboard/src/api/client.js` lines 193-220: `foodOrdersAPI`

---

## 📱 STOREFRONT - ORDER TRACKING PAGE

**File:** `store/src/order-tracking.js`
**CSS:** `store/src/styles/order-tracking.css`

### URL Pattern:
```
/order/{ORDER_NUMBER}
Example: /order/NIM-001
```

### Features:
- Status banner with icon + message
- Time estimate (countdown or "Any moment now!")
- Progress steps (visual timeline)
- Order items with extras
- Totals breakdown
- Table/location display
- WhatsApp + Call buttons
- Auto-refresh every 30 seconds

### Routing:
**File:** `store/src/main.js`
```javascript
// Added checkOrderTrackingRoute() function
// Checks for /order/{orderNumber} pattern
// Loads order-tracking.css and calls initOrderTracking()
```

---

## 🛒 CHECKOUT FLOW - VM ORDERS

### Order Routing:
**File:** `store/src/checkout.js`
```javascript
// VM orders route to food_orders table
const result = isVisualMenu 
  ? await createFoodOrder(store.slug, orderData)
  : await createOrder(store.slug, orderData);
```

### Success Screen:
- Shows "📍 Track Your Order" button for VM orders
- Links to `/order/{ORDER_NUMBER}`

### API Function:
**File:** `store/src/api.js`
```javascript
export async function createFoodOrder(slug, orderData) {
  // Maps to /api/food-orders endpoint
  // Includes: customer, items, extras, payment
}
```

---

## 🎨 CSS CHANGES

### Dark Mode Fix:
**File:** `dashboard/src/pages/FoodOrdersPage.jsx`
```javascript
filterPill: {
  color: 'var(--text-primary, #111)', // Added explicit color
},
filterCount: {
  background: 'rgba(255,255,255,0.15)', // Changed from rgba(0,0,0,0.1)
},
```

### Track Order Button:
**File:** `store/src/styles/base.css` (appended)
```css
.btn-track-order {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  /* ... */
}
```

---

## 🐛 DEBUG FORMULAS

### Formula 17: VM Orders Going to Wrong Table
**Problem:** VM orders appear in Orders tab instead of Food Orders tab
**Cause:** Using `createOrder()` instead of `createFoodOrder()`
**Solution:** Route based on template:
```javascript
const result = isVisualMenu 
  ? await createFoodOrder(store.slug, orderData)
  : await createOrder(store.slug, orderData);
```

### Formula 18: API Expects storeId but Storefront Sends slug
**Problem:** `POST /api/food-orders` returns 400 "Store ID required"
**Cause:** Storefront sends `slug`, API expected `storeId`
**Solution:** API now looks up store by slug first:
```javascript
if (!resolvedStoreId && slug) {
  const storeResult = await db.query(
    'SELECT id FROM stores WHERE slug = $1', [slug]
  );
  resolvedStoreId = storeResult.rows[0].id;
}
```

### Formula 19: Dark Mode Filter Pills Not Visible
**Problem:** Filter pill text invisible in dark mode
**Cause:** Missing explicit `color` property
**Solution:** Add `color: 'var(--text-primary, #111)'` to filterPill style

### Formula 20: Order Tracking Route Not Matching
**Problem:** `/order/NIM-001` shows store error
**Cause:** main.js wasn't checking for order tracking route
**Solution:** Added `checkOrderTrackingRoute()` before `getSlug()`:
```javascript
const orderNumber = checkOrderTrackingRoute();
if (orderNumber) {
  initOrderTracking(orderNumber);
  return;
}
```

---

## 📋 IDEA SHELF (Future Features)

**File:** `docs/IDEA-SHELF.md`

1. **WhatsApp Order Notifications** (Add-on) - Push status updates
2. **Kitchen Display System (KDS)** - Separate chef vs waiter views
3. **Smart Prep Time Calculation** - Auto-estimate based on items
4. **SMS Reminders** - For bookings
5. **Google Calendar Sync** - For service providers

---

## 🔜 NEXT STEPS

### Immediate (This Session):
1. Add VM product edit fields in dashboard:
   - Add-ons (name, price, image)
   - Ingredients
   - Category/tags
   - Prep time
2. Ensure fields save to products.data JSONB
3. Render all fields in storefront VM template
4. Tweak frontend design

### After Fields Working:
1. Checkout flow design review
2. Visual Menu collection page styling
3. Testing end-to-end flow

---

## 📂 KEY FILE LOCATIONS

| Purpose | File Path |
|---------|-----------|
| Food Orders API | `api/src/routes/food-orders.js` |
| Food Orders Migration | `api/migrations/006_food_orders.sql` |
| Dashboard Page | `dashboard/src/pages/FoodOrdersPage.jsx` |
| Dashboard API Client | `dashboard/src/api/client.js` (lines 193-220) |
| Storefront Checkout | `store/src/checkout.js` |
| Storefront API | `store/src/api.js` |
| Order Tracking JS | `store/src/order-tracking.js` |
| Order Tracking CSS | `store/src/styles/order-tracking.css` |
| VM Render | `store/src/templates/visual-menu/vm-render.js` |
| VM Handlers | `store/src/templates/visual-menu/vm-handlers.js` |
| Base CSS | `store/src/styles/base.css` |

---

*Last Updated: January 23, 2026*
*Session Focus: Food Orders System End-to-End*
