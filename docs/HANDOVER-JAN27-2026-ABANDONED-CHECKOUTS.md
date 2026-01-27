# JARI.ECOM V2 - Session Handover Document
## January 27, 2026 - Abandoned Checkout Feature

---

## SESSION SUMMARY

This session implemented a complete **Abandoned Checkout Tracking** feature with dashboard analytics. The feature allows store owners to see which customers abandoned their checkout and at what step, enabling targeted follow-up via WhatsApp.

---

## WHAT WAS BUILT

### 1. Database Migration (010_abandoned_checkouts.sql)
- **Table**: `abandoned_checkouts`
- **Columns**:
  - `id` (SERIAL PRIMARY KEY)
  - `store_id` (UUID) - Links to stores table
  - `session_id` (VARCHAR) - Browser session identifier
  - `product_id`, `product_name`, `quantity`, `total_amount` - Product info
  - `step_reached` (INTEGER) - 1=Review, 2=Delivery, 3=Payment
  - `customer_name`, `customer_phone`, `customer_location`, `delivery_area` - Partial customer data
  - `payment_method`, `utm_source`, `utm_medium`, `utm_campaign`, `device` - Attribution data
  - `time_spent` (INTEGER) - Seconds before abandoning
  - `recovered`, `recovered_at`, `contacted`, `contacted_at`, `notes` - Recovery tracking
  - `created_at` (TIMESTAMP)

### 2. Backend API (api/src/routes/pixel.js)

**POST `/pixel/abandon`** - Save abandoned checkout
- Handles both JSON and text/plain (sendBeacon sends as text/plain)
- Silent fail (returns 204) to not disrupt user experience

**GET `/pixel/abandoned/:storeId`** - Fetch abandoned checkouts
- Accepts store UUID directly or resolves slug to UUID
- Supports periods: today, week, month, quarter, year
- Returns:
  - `abandonments[]` - Full list of abandoned checkouts
  - `funnel` - Breakdown by step (step_1, step_2, step_3)
  - `bySource[]` - Breakdown by UTM source
  - `recovery` - Stats on contacted/recovered
  - `anomalies[]` - Auto-detected issues (form friction, payment drop-off, quick exits)
  - `total` - Total count

**PUT `/pixel/abandoned/:id/contact`** - Mark as contacted
**PUT `/pixel/abandoned/:id/recover`** - Mark as recovered

### 3. Frontend Tracking (store/src/)

**checkout.js**
- `currentCheckoutStep` tracking (1-3)
- `checkoutStartTime` for time_spent calculation
- `capturePartialData()` - Captures form fields as user fills them
- `trackCheckoutAbandon()` - Sends data on page unload or navigation
- Triggers: `beforeunload`, `visibilitychange`, product switching

**pixel.js**
- `trackAbandon(data)` - Uses `sendBeacon` for reliable firing
- Includes UTM params and device detection
- Silent failure to not disrupt UX

### 4. Dashboard UI (dashboard/src/pages/AdsPage.jsx)

**New Tab**: "Abandoned Checkouts" in Marketing page

**Components**:
- **Funnel Chart**: Visual breakdown of where users abandoned
  - Step 1 (Review Order)
  - Step 2 (Delivery Details)
  - Step 3 (Payment)
- **Insights & Alerts**: Auto-generated warnings
  - High Step 2 abandonment = Form friction
  - High Step 3 abandonment = Payment issues
  - Quick exits (<30s) = Price/trust concerns
- **Recent Abandoned Checkouts Table**:
  - Date, Product, Amount, Step, Customer info
  - WhatsApp action button for follow-up
  - Contact modal with suggested message
- **Download CSV**: Export all data

---

## BUGS FIXED THIS SESSION

### 1. Deep Dive Gallery Freeze
- **Problem**: Opening/closing showcase gallery froze page scrolling
- **Fix**: Added `document.body.style.overflow` management in dd-showcase-viewer.js
- **Commit**: af44d2b

### 2. Migration Foreign Key Constraint
- **Problem**: `foreign key constraint "abandoned_checkouts_store_id_fkey" cannot be implemented`
- **Fix**: Removed FK constraint, kept `store_id UUID NOT NULL`
- **Commit**: 0e37555

### 3. UUID Type Mismatch
- **Problem**: stores.id is UUID but migration had INTEGER
- **Fix**: Changed to `store_id UUID NOT NULL`
- **Commit**: 80ee96d

### 4. sendBeacon Content-Type
- **Problem**: sendBeacon sends as text/plain, API expected JSON
- **Fix**: Added string parsing in API
- **Commit**: 6c089ef

### 5. Duplicate Route Shadowing
- **Problem**: Old GET `/pixel/abandoned/:storeId` route was shadowing new one
- **Fix**: Removed duplicate route
- **Commit**: 1a9e316

---

## FILES MODIFIED

### API
- `api/migrations/010_abandoned_checkouts.sql` - New migration
- `api/src/routes/pixel.js` - New endpoints + fixes

### Store (Frontend)
- `store/src/checkout.js` - Abandon tracking logic
- `store/src/pixel.js` - trackAbandon function
- `store/src/templates/deep-dive/dd-showcase-viewer.js` - Gallery freeze fix

### Dashboard
- `dashboard/src/pages/AdsPage.jsx` - New Abandoned tab + UI
- `dashboard/src/api/client.js` - getAbandoned API method

---

## GIT COMMITS (This Session)

```
fd7d534 Cleanup-Remove-all-debug-console-logs-from-pixel-checkout-and-render
1a9e316 Fix-Remove-duplicate-abandoned-GET-route-that-was-shadowing-new-endpoint
eeb4050 Fix-abandoned-GET-add-comprehensive-logging-and-simplify-recovery-query
65e3bc2 Fix-abandoned-GET-add-UUID-casting-and-detailed-error-logging
e49cf7b Debug-Add-logging-to-abandoned-GET-endpoint
6c089ef Fix-abandon-API-parse-text-plain-from-sendBeacon-add-logging
80ee96d Fix-abandoned-checkouts-store_id-to-UUID-type-and-resolve-slug-in-API
cb90b38 Debug-Add-console-logs-to-abandoned-checkout-tracking
0e37555 Fix-migration-010-remove-FK-constraint-causing-deploy-failure
af44d2b Fix-DD-showcase-viewer-restore-body-overflow-on-close-freeze-bug
```

---

## HOW IT WORKS

### Flow
1. User visits product page → session tracked
2. User clicks "Buy Now" → checkout step 1 (Review Order)
3. User fills delivery form → checkout step 2 (Delivery Details)
4. User reaches payment → checkout step 3 (Payment)
5. If user leaves at any step → `trackCheckoutAbandon()` fires
6. Data saved to `abandoned_checkouts` table
7. Store owner sees in Dashboard → Marketing → Abandoned Checkouts
8. Owner can click WhatsApp to follow up

### Data Captured
- Which product
- How far they got (step 1/2/3)
- Partial form data (name, phone, location)
- Time spent in checkout
- Traffic source (UTM params)
- Device type

---

## NEXT SESSION PRIORITIES

1. **Backend Subscription System**: Create `store_subscriptions` table to persist trial/paid status
2. **M-Pesa Payment**: Integrate payment for subscription upgrade
3. **Order-Based Tier Detection**: Auto-recommend tier based on monthly order count
4. **WhatsApp Templates**: Pre-fill better recovery messages

---

## TECHNICAL NOTES

### sendBeacon Handling Pattern
```javascript
// Frontend
navigator.sendBeacon(endpoint, JSON.stringify(payload));
// Sends as text/plain, NOT application/json

// Backend
let body = req.body;
if (typeof body === 'string') body = JSON.parse(body);
```

### Slug Resolution Pattern
```javascript
// API can receive UUID or slug
if (isNaN(storeId) && !storeId.includes('-')) {
  // It's a slug, look up the UUID
  const result = await pool.query('SELECT id FROM stores WHERE slug = $1', [storeId]);
  actualStoreId = result.rows[0].id;
}
```

### Express Route Order Matters
If you have two routes with same path, the FIRST one wins. This caused a bug where old route was shadowing new route.

---

## ENVIRONMENT URLS

- **Store**: https://jarisolutionsecom.store
- **Dashboard**: https://dashboard.jarisolutionsecom.store
- **API**: https://jari-ecom-v2-production.up.railway.app
- **GitHub**: https://github.com/meshack-abwao/jari-ecom-v2

---

*Document created: January 27, 2026*
*Session: Abandoned Checkout Feature Implementation*
*Updated: January 27, 2026 - Added Freemium Paywall*

---

## FREEMIUM MODEL ADDED

### Pricing Tiers (After 30-Day Free Trial)
| Tier | Monthly Orders | Price |
|------|----------------|-------|
| Starter | 0-50 orders | KES 300/month |
| Growth | 51-200 orders | KES 700/month |
| Pro | 200+ orders | KES 1,500/month |

### How It Works
1. User clicks "Abandoned Checkouts" tab
2. If no access → Paywall modal shows
3. User starts 30-day free trial (stored in localStorage)
4. After trial → Must subscribe to continue access
5. Trial banner shows days remaining

### Files Added/Modified
- `dashboard/src/pages/AdsPage.jsx` - Paywall modal, trial logic, teaser card
- `docs/FREEMIUM-MODEL.md` - Full pricing strategy documentation
- `docs/DEBUG-FORMULAS.md` - Added 5 new formulas (16-20)

### Current Limitation
- Trial status stored in localStorage (resets if cleared)
- Need backend `store_subscriptions` table for persistence
- Payment integration not yet built
