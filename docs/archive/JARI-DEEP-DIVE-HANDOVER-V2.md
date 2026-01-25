# JARI.ECO V2 - COMPREHENSIVE HANDOVER DOCUMENT
## Last Updated: January 23, 2026 (Final Session)
## Status: Visual Menu Complete ✅ | Food Orders Complete ✅ | Testing Ready

---

## 1. EXECUTIVE SUMMARY

JARI.ECO V2 is an e-commerce platform for Kenyan/East African entrepreneurs. The platform has **4 template types**:

| Template | Purpose | Status |
|----------|---------|--------|
| **Deep Dive** | High-value products with specs | ✅ Complete |
| **Quick Decision** | Impulse buys, simple products | ✅ Complete |
| **Portfolio/Booking** | Services (photographers, consultants) | ✅ Complete |
| **Visual Menu** | Food/restaurant ordering | ✅ Complete |

### Recent Major Accomplishments (Jan 22-23):
- ✅ Visual Menu template with 8 font pairings + 6 color themes
- ✅ Food Orders system (database, API, dashboard, storefront)
- ✅ Customer order tracking page (`/order/{ORDER_NUMBER}`)
- ✅ Add-ons with quantity selectors (product-level)
- ✅ Template isolation (separate CSS/JS files per template)
- ✅ Dashboard FoodOrdersPage (Kanban-style, unified with BookingsPage)
- ✅ Dark mode fixes for filter pills

---

## 2. PROJECT ARCHITECTURE

### 2.1 Tech Stack
```
├── Frontend (Dashboard): React + Vite
├── Frontend (Storefront): Vanilla JS + CSS
├── Backend: Node.js + Express
├── Database: PostgreSQL (Railway hosted)
├── Hosting: 
│   ├── Dashboard: Netlify (jari-dashboard.netlify.app)
│   ├── Store: Netlify (jariecommstore.netlify.app)
│   └── API: Railway (jari-api-production.up.railway.app)
```

### 2.2 Directory Structure
```
C:\Users\ADMIN\Desktop\jari-ecom-v2\
├── api/
│   ├── migrations/
│   │   ├── 001_initial.sql
│   │   ├── 002_pixel_tracking.sql
│   │   ├── 003_booking_system.sql
│   │   ├── 004_mpesa_tracking.sql / 004_platform_payments.sql
│   │   ├── 006_food_orders.sql         # Food orders table
│   │   └── 007_food_orders_table_time.sql  # Table number, estimated time
│   └── src/routes/
│       ├── auth.js, stores.js, products.js, orders.js
│       ├── bookings.js               # Booking system
│       ├── food-orders.js            # Food orders system
│       ├── public.js                 # Public tracking endpoint
│       └── index.js
│
├── dashboard/src/
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── ProductsPage.jsx        # VM addOns editor
│   │   ├── OrdersPage.jsx
│   │   ├── FoodOrdersPage.jsx      # NEW - Kanban food orders
│   │   ├── BookingsPage.jsx
│   │   ├── AdsPage.jsx, TemplatesPage.jsx, SettingsPage.jsx, AddOnsPage.jsx
│   ├── components/
│   │   └── Layout.jsx              # Sidebar with Food Orders
│   ├── api/client.js               # foodOrdersAPI
│   └── App.jsx                     # /food-orders route
│
├── store/src/
│   ├── main.js                     # Order tracking route
│   ├── api.js                      # createFoodOrder()
│   ├── checkout.js                 # VM order routing
│   ├── order-tracking.js           # Customer tracking page
│   ├── styles/
│   │   ├── base.css                # All storefront CSS
│   │   └── order-tracking.css      # Tracking page styles
│   ├── shared/
│   │   ├── media-components.js, testimonials.js, quantity-controls.js
│   │   ├── policy-modals.js, utils.js
│   └── templates/
│       ├── deep-dive/
│       ├── visual-menu/            # VM isolated template
│       │   ├── vm-render.js, vm-handlers.js, vm-config.js, vm-styles.css
│       ├── portfolio-booking/
│       └── quick-decision/
│
└── docs/
    ├── PROJECT-INSTRUCTIONS.md
    ├── HANDOVER-VM-SESSION.md, HANDOVER-VM-SESSION-2.md
    ├── IDEA-SHELF.md
    ├── MOBILE-APP-GUIDE.md
    └── TEMPLATE-ISOLATION-HANDOVER.md
```

---

## 3. DATABASE SCHEMA

### 3.1 Food Orders Table (Migration 006 + 007)
```sql
CREATE TABLE food_orders (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  order_number VARCHAR(30),        -- "NIM-001" format
  
  -- Customer
  customer_name, customer_phone, customer_email
  
  -- Order Type
  order_type VARCHAR(20),          -- 'delivery' | 'pickup' | 'dine_in'
  delivery_address, delivery_instructions, scheduled_time
  
  -- Items (JSONB with extras)
  items JSONB NOT NULL DEFAULT '[]',
  
  -- Pricing
  subtotal, delivery_fee, discount, total INTEGER
  
  -- Payment
  payment_method, payment_status, mpesa_receipt
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending',
  status_history JSONB DEFAULT '[]',
  
  -- Table & Time (Migration 007)
  table_number VARCHAR(20),
  estimated_minutes INTEGER,
  estimated_ready_at TIMESTAMP,
  
  -- Timestamps
  created_at, updated_at, confirmed_at, ready_at, completed_at
);
```

### 3.2 Status Flow
```
pending → confirmed → preparing → ready → delivered/picked_up
                                       ↘ cancelled (any stage)
```

---

## 4. API ENDPOINTS

### 4.1 Food Orders API (`/api/food-orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/food-orders` | ✅ | List all orders |
| GET | `/api/food-orders/stats` | ✅ | Order statistics |
| GET | `/api/food-orders/:id` | ✅ | Single order |
| POST | `/api/food-orders` | ❌ | Create order (storefront) |
| PUT | `/api/food-orders/:id/status` | ✅ | Update status + table/time |
| PUT | `/api/food-orders/:id/payment` | ✅ | Update payment |
| DELETE | `/api/food-orders/:id` | ✅ | Cancel order |

### 4.2 Public Order Tracking
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/s/order/:orderNumber` | ❌ | Public tracking |

---

## 5. VISUAL MENU TEMPLATE

### 5.1 Font Pairings (8 options)
1. Playfair Display + Lato (Classic Elegance)
2. Poppins + Open Sans (Modern Clean)
3. Cormorant Garamond + Proza Libre (Upscale Dining)
4. Josefin Sans + Work Sans (Contemporary)
5. Lora + Source Sans Pro (Warm Traditional)
6. Montserrat + Roboto (Bold Modern)
7. Crimson Text + Nunito (Cozy Comfort)
8. Raleway + Karla (Light Minimalist)

### 5.2 Color Themes (6 options)
1. Warm Appetite (Orange/Brown)
2. Fresh Garden (Green)
3. Spicy Fire (Red)
4. Ocean Breeze (Blue)
5. Berry Delight (Purple/Pink)
6. Earthy Organic (Brown/Tan)

### 5.3 Key Files
- `store/src/templates/visual-menu/vm-render.js` - Template rendering
- `store/src/templates/visual-menu/vm-handlers.js` - Qty handlers, CTA
- `store/src/templates/visual-menu/vm-config.js` - Font pairings, themes
- `store/src/templates/visual-menu/vm-styles.css` - Isolated CSS

---

## 6. DEBUG FORMULAS (20 Total)

### Formula 1: API Response Structure
**Problem:** `Cannot read property 'slug' of undefined`
**Fix:** `response.data` is store directly, NOT `response.data.store`

### Formula 2: CSS Parse Errors
**Problem:** Build fails with CSS syntax error
**Fix:** Search for orphaned selectors, remove duplicates

### Formula 3: Template Handler Init
**Problem:** Click handlers don't work
**Fix:** Must import AND call handler init function in main.js

### Formula 4: CSS Isolation
**Problem:** Styles bleed between templates
**Fix:** Use prefixes: `vm-`, `pbk-`, `dd-`, `qd-`

### Formula 5: Migration UUID Types
**Problem:** Foreign key constraint fails
**Fix:** NEVER use INTEGER for store_id/user_id - always UUID

### Formula 6: Git on Windows
**Problem:** `&&` doesn't work
**Fix:** Use semicolons: `cd path; git add -A; git commit -m "msg"`

### Formula 17: VM Orders Going to Wrong Table
**Problem:** VM orders appear in Orders instead of Food Orders
**Fix:** Route based on template using `createFoodOrder()` vs `createOrder()`

### Formula 18: API Expects storeId but Storefront Sends slug
**Problem:** POST returns 400 "Store ID required"
**Fix:** API now looks up store by slug first

### Formula 19: Dark Mode Filter Pills Not Visible
**Problem:** Filter pill text invisible in dark mode
**Fix:** Add explicit `color: 'var(--text-primary, #111)'`

### Formula 20: Order Tracking Route Not Matching
**Problem:** `/order/NIM-001` shows store error
**Fix:** Added `checkOrderTrackingRoute()` in main.js before `getSlug()`

---

## 7. CURRENT GIT STATUS

### Latest Commits (Jan 23, 2026)
```
73cfbc9 Dashboard-VM-addOns-field-editor-save-load
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

## 8. NEXT PRIORITIES

### Immediate (Testing Phase):
1. **End-to-End Testing** - VM product → add extras → checkout → Food Orders
2. **Frontend Design Polish** - Apple aesthetics for VM template
3. **Checkout Flow UX** - Improve mobile experience
4. **Collection Page** - VM menu listing styling

### Near-term:
1. **Dynamic Tab Visibility** - Show tabs based on active templates
2. **WhatsApp Integration** - Order notifications (add-on)
3. **Store-Level Extras** - Global add-ons catalog

### Deferred (Idea Shelf):
- Kitchen Display System (KDS)
- SMS Reminders
- Google Calendar Sync
- Analytics Dashboard
- Inventory Management

---

## 9. KEY FILE QUICK REFERENCE

| Purpose | File Path |
|---------|-----------|
| Food Orders API | `api/src/routes/food-orders.js` |
| Food Orders Migration | `api/migrations/006_food_orders.sql` |
| Dashboard Food Orders | `dashboard/src/pages/FoodOrdersPage.jsx` |
| Dashboard Products | `dashboard/src/pages/ProductsPage.jsx` |
| Dashboard API Client | `dashboard/src/api/client.js` |
| Dashboard Routes | `dashboard/src/App.jsx` |
| Dashboard Sidebar | `dashboard/src/components/Layout.jsx` |
| Storefront Main | `store/src/main.js` |
| Storefront API | `store/src/api.js` |
| Storefront Checkout | `store/src/checkout.js` |
| Order Tracking | `store/src/order-tracking.js` |
| VM Render | `store/src/templates/visual-menu/vm-render.js` |
| VM Handlers | `store/src/templates/visual-menu/vm-handlers.js` |
| Base CSS | `store/src/styles/base.css` |

---

## 10. QUICK START COMMANDS

```powershell
# Check status
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -10

# Commit changes
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "message"; git push origin main

# Test URL
https://jariecommstore.netlify.app/store/nimoration
```

---

## 11. ENVIRONMENT URLS

| Environment | URL |
|-------------|-----|
| Dashboard | https://jari-dashboard.netlify.app |
| Store | https://jariecommstore.netlify.app |
| API | https://jari-api-production.up.railway.app |

---

*Document Version: 3.0*
*Last Updated: January 23, 2026*
*Session Focus: Visual Menu + Food Orders System Complete*
