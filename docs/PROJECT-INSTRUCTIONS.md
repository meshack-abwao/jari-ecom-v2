# Jari.Ecom V2 - Project Instructions

> **Purpose:** Feed this document into a Claude Project to maintain full context across all conversations.
> **Last Updated:** January 23, 2026
> **Current Phase:** Testing & Frontend Polish

---

## 1. PROJECT OVERVIEW

### What is Jari.Ecom?
An e-commerce platform targeting solo entrepreneurs and small teams in Kenya and East Africa. Built by Jari Solutions (Mesh - Technical Lead, Charles - CEO).

### Core Value Proposition
- Instagram/WhatsApp-focused sellers
- M-Pesa integration for local payments
- Simplified checkout optimized for emerging markets
- Multiple store templates for different business types

### Tech Stack
- **Frontend (Dashboard):** React + Vite
- **Frontend (Storefront):** Vanilla JS + CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Railway hosted)
- **Hosting:** Netlify (dashboard + store), Railway (API + DB)

---

## 2. CURRENT STATUS (January 23, 2026)

### ✅ COMPLETED FEATURES

**Templates (All 4 Complete)**
| Template | Purpose | Status |
|----------|---------|--------|
| Deep Dive | High-value products with specs | ✅ Complete |
| Quick Decision | Impulse buys, simple products | ✅ Complete |
| Portfolio/Booking | Services (photographers, consultants) | ✅ Complete |
| Visual Menu | Food/restaurant ordering | ✅ Complete |

**Visual Menu System**
- 8 font pairings with Google Fonts
- 6 food color themes
- Add-ons with quantity selectors
- Ingredients display (Apple card style)
- Sticky CTA (PBK style)

**Food Orders System**
- Database schema (migration 006 + 007)
- API endpoints (CRUD, status, payment)
- Dashboard FoodOrdersPage (Kanban-style)
- Order routing (VM → food_orders table)
- Customer order tracking page
- Table number + estimated time

**Booking System**
- Calendar week view
- Status filters
- Search + Export CSV
- Reschedule modal
- Add to Calendar (.ics)

**Mobile App**
- Capacitor configured
- Debug APK built (4.2MB)
- Pending: Play Store submission

---

## 3. PROJECT STRUCTURE

```
C:\Users\ADMIN\Desktop\jari-ecom-v2\
├── api/
│   ├── migrations/
│   │   ├── 001_initial.sql
│   │   ├── 002_pixel_tracking.sql
│   │   ├── 003_booking_system.sql
│   │   ├── 006_food_orders.sql
│   │   └── 007_food_orders_table_time.sql
│   └── src/routes/
│       ├── auth.js, stores.js, products.js, orders.js
│       ├── bookings.js, food-orders.js, public.js
│       └── index.js
│
├── dashboard/src/
│   ├── pages/
│   │   ├── DashboardPage.jsx, ProductsPage.jsx, OrdersPage.jsx
│   │   ├── FoodOrdersPage.jsx, BookingsPage.jsx
│   │   ├── AdsPage.jsx, TemplatesPage.jsx, SettingsPage.jsx
│   ├── components/Layout.jsx
│   ├── api/client.js
│   └── App.jsx
│
├── store/src/
│   ├── main.js, api.js, checkout.js, order-tracking.js
│   ├── styles/base.css, order-tracking.css
│   ├── shared/ (media-components, testimonials, utils)
│   └── templates/
│       ├── deep-dive/
│       ├── visual-menu/ (vm-render.js, vm-handlers.js, vm-config.js)
│       ├── portfolio-booking/
│       └── quick-decision/
│
└── docs/
    ├── PROJECT-INSTRUCTIONS.md (THIS FILE)
    ├── JARI-DEEP-DIVE-HANDOVER-V2.md
    ├── HANDOVER-VM-SESSION-2.md
    ├── IDEA-SHELF.md
    └── MOBILE-APP-GUIDE.md
```

---

## 4. CRITICAL TECHNICAL PATTERNS

### ⚠️ API Response Pattern (CRITICAL)
```javascript
// settingsAPI.getAll() returns store object DIRECTLY
const response = await settingsAPI.getAll();
const store = response.data;  // ✅ CORRECT
const slug = store.slug;      // ✅ CORRECT

// WRONG patterns:
const store = response.data.store;     // ❌ WRONG
```

### Git Commands (Windows PowerShell)
```powershell
# Use semicolons, NOT &&
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "message"; git push origin main
```

### CSS Prefixes by Template
| Template | Prefix |
|----------|--------|
| Quick Decision | `.qd-` |
| Deep Dive | `.dd-` |
| Visual Menu | `.vm-` |
| Portfolio-Booking | `.pbk-` |

---

## 5. DEBUG FORMULAS (20 Total)

### Formula 1: API Response Structure
`response.data` is store directly, NOT `response.data.store`

### Formula 2: CSS Parse Errors
Search for orphaned selectors, remove duplicates

### Formula 3: Template Handler Init
Must import AND call handler init function in main.js

### Formula 4: CSS Isolation
Use prefixes: `vm-`, `pbk-`, `dd-`, `qd-`

### Formula 5: Migration UUID Types
NEVER use INTEGER for store_id/user_id - always UUID

### Formula 6: Git on Windows
Use semicolons not `&&`

### Formula 17: VM Orders Wrong Table
Use `createFoodOrder()` not `createOrder()` for VM

### Formula 18: API Slug Lookup
API now looks up store by slug if storeId missing

### Formula 19: Dark Mode Pills
Add explicit `color: 'var(--text-primary, #111)'`

### Formula 20: Order Tracking Route
Check order route before getSlug() in main.js

---

## 6. FOOD ORDERS SYSTEM

### API Endpoints
```
GET    /api/food-orders          - List orders
GET    /api/food-orders/stats    - Statistics
POST   /api/food-orders          - Create order
PUT    /api/food-orders/:id/status - Update status
DELETE /api/food-orders/:id      - Cancel
GET    /s/order/:orderNumber     - Public tracking
```

### Status Flow
```
pending → confirmed → preparing → ready → delivered/picked_up
```

---

## 7. ENVIRONMENT URLS

| Environment | URL |
|-------------|-----|
| Dashboard | https://jari-dashboard.netlify.app |
| Store | https://jariecommstore.netlify.app |
| API | https://jari-api-production.up.railway.app |
| Test Store | /store/nimoration |

---

## 8. RECENT COMMITS (Jan 23, 2026)

```
73cfbc9 Dashboard-VM-addOns-field-editor-save-load
2528f5e VM-order-tracking-page-table-number-estimated-time-dark-mode-fix
03c555c API-food-orders-accept-slug-lookup-store-fix-field-names
1afcd10 VM-orders-route-to-food-orders-API-not-regular-orders
634ad91 FoodOrdersPage-redesign-unified-with-BookingsPage-style
```

---

## 9. NEXT PRIORITIES

### Immediate:
1. End-to-End Testing - VM flow
2. Frontend Design Polish - Apple aesthetics
3. Checkout Flow UX - Mobile experience
4. Collection Page - Menu listing styling

### Near-term:
1. Dynamic Tab Visibility
2. WhatsApp Integration (add-on)
3. Store-Level Extras

---

## 10. KEY FILE REFERENCE

| Purpose | File |
|---------|------|
| Food Orders API | `api/src/routes/food-orders.js` |
| Dashboard Food Orders | `dashboard/src/pages/FoodOrdersPage.jsx` |
| Dashboard Products | `dashboard/src/pages/ProductsPage.jsx` |
| VM Render | `store/src/templates/visual-menu/vm-render.js` |
| VM Handlers | `store/src/templates/visual-menu/vm-handlers.js` |
| Checkout | `store/src/checkout.js` |
| Order Tracking | `store/src/order-tracking.js` |

---

## 11. NEXT SESSION CHECKLIST

1. ✅ Run `git status; git log --oneline -10`
2. ✅ Check `docs/JARI-DEEP-DIVE-HANDOVER-V2.md` for context
3. ✅ Check `docs/IDEA-SHELF.md` for future features
4. ✅ Commit after each successful change
5. ✅ Test before proceeding

---

**End of Project Instructions**
*Last Updated: January 23, 2026*
