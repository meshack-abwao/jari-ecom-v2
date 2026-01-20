# Jari.Ecom V2 - Handover Context
## Session: January 19, 2026 (Evening)
## Status: M-Pesa Phase 1 COMPLETE

---

## 1. PROJECT OVERVIEW

### What is Jari.Ecom?
E-commerce platform for solo entrepreneurs and small teams in Kenya/East Africa.
- Instagram/WhatsApp-focused sellers
- M-Pesa integration for payments
- Multiple store templates for different business types

### Tech Stack
| Layer | Technology |
|-------|------------|
| Dashboard | React + Vite |
| Storefront | Vanilla JS + CSS |
| API | Node.js + Express |
| Database | PostgreSQL (Railway) |
| Hosting | Netlify (frontend), Railway (API + DB) |

### Repository
```
C:\Users\ADMIN\Desktop\jari-ecom-v2\
├── api/           # Express backend
├── dashboard/     # React admin
├── store/         # Public storefront
├── shared/        # Utilities
└── docs/          # Documentation
```

---

## 2. DEBUG FORMULAS (CRITICAL)

### Formula 1: API Response Pattern
```javascript
// ✅ CORRECT - API returns store object directly
const response = await settingsAPI.getAll();
const store = response.data;
const slug = store.slug;

// ❌ WRONG - These cause "Cannot read property of undefined"
const store = response.data.store;
const store = response.data.settings;
```

### Formula 2: CSS Isolation
- Template prefixes: `pbk-` (Portfolio/Booking), `bkm-` (Booking Modal), `dd-` (Deep Dive)
- Use CSS vars: `--fs-*`, `--space-*`
- Never use generic class names that could conflict

### Formula 3: Git on Windows (PowerShell)
```powershell
# Use cmd /c wrapper for complex commands
cmd /c "cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2 && git add -A && git commit -m 'message' && git push origin main"

# Simple status check
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -5
```

### Formula 4: Surgical Edits
1. `read_file` with offset/length to see current state
2. `edit_block` with exact old_string match
3. Commit immediately after each fix
4. Small, focused changes prevent cascading bugs

### Formula 5: Store Config Access (Storefront)
```javascript
// Store config is set on page load
window.JARI_STORE_CONFIG = data.store;

// Access payment config
const payment = window.JARI_STORE_CONFIG?.payment || {};
const hasPaymentConfig = payment.type && (payment.paybill_number || payment.till_number);
```

### Formula 6: Database Column Must Exist Before INSERT
```javascript
// ❌ WRONG - Column doesn't exist, INSERT fails silently
INSERT INTO bookings (..., payment_type, ...) VALUES (...)
// Error: column "payment_type" does not exist

// ✅ FIX - Create migration first
// api/migrations/005_payment_type.sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'full';

// Then deploy to run migration before API uses the column
```

### Formula 7: Progress Bar Must Update on Step Change
```javascript
// When using perceived steps (3 visible) but internal steps (5 actual):
function getPerceivedStep(internalStep) {
  if (internalStep <= 2) return 1;  // Package + Date/Time = SELECT
  if (internalStep <= 4) return 2;  // Details + Review = DETAILS
  return 3;                          // Payment = PAY
}

// updateContent() must call updateProgressBar()
// updateProgressBar() must target correct selectors (.bkm-step-group not .bkm-step)
```

### Formula 8: Two Migration Systems - Keep Both in Sync!
```javascript
// ❌ PROBLEM: migrations/*.sql files exist BUT index.js has inline migrations
// The SQL files run via package.json "start" script
// The inline migrations run on every server startup
// If they're out of sync, columns are missing!

// ✅ FIX: When adding columns, update BOTH:
// 1. api/migrations/00X_name.sql  (for full migration runs)
// 2. api/src/index.js runMigrations() (for inline startup)

// Example - adding payment_type column:
// In migrations/005_payment_type.sql:
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'full';

// In index.js runMigrations():
await runSafe('payment_type_col', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'full'`);
```

### Formula 9: API Must Use Defaults When No DB Records Exist
```javascript
// ❌ PROBLEM: Availability endpoint returns "Closed" when no working_hours in DB
// New stores have no working_hours records yet!

// ✅ FIX: Fall back to DEFAULT_WORKING_HOURS when no DB records
let workingHours = hoursResult.rows[0];
if (!workingHours) {
  workingHours = DEFAULT_WORKING_HOURS.find(h => h.day_of_week === dayOfWeek);
}
```

### Formula 10: PostgreSQL TIME Format Comparison
```javascript
// ❌ PROBLEM: PostgreSQL TIME returns 'HH:MM:SS' but we compare with 'HH:MM'
// b.booking_time === '09:00' fails when DB has '09:00:00'

// ✅ FIX: Normalize to HH:MM before comparing
const bookingTime = String(b.booking_time).substring(0, 5); // Get HH:MM
return bookingTime === timeStr;
```

### Formula 11: CSS Must Use Theme Variables (No Hardcoded Colors)
```css
/* ❌ WRONG - Hardcoded colors don't respect store theme */
.pbk-package-price { color: #1d1d1f; }
.pbk-package-badge { background: #e8f4f5; color: #2a8d9c; }
.pbk-package-btn { background: #2a8d9c; }

/* ✅ CORRECT - Uses CSS variables from store theme */
.pbk-package-price { color: var(--color-primary); }
.pbk-package-badge { 
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
}
.pbk-package-btn { background: var(--color-primary); }

/* Theme variables to use:
   --color-primary      (store's main accent color)
   --text-primary       (main text color)
   --text-secondary     (secondary/muted text)
   --surface            (card backgrounds)
   --bg-gray            (neutral backgrounds)
   --border             (borders)
   --radius-*           (border radius sizes)
   --fs-*               (font sizes)
   --space-*            (spacing scale)
*/
```

### Formula 12: Commit Frequently to Prevent Memory Loss
```bash
# ❌ PROBLEM: Making many edits before committing
# Context window fills up, AI loses progress, work is lost

# ✅ FIX: Commit after EACH successful change
# Pattern: Edit → Test → Commit → Next Edit
cd C:\Users\ADMIN\Desktop\jari-ecom-v2
git add -A
git commit -m "PREFIX: Short description of single change"

# Push every 2-3 commits to prevent total loss
git push origin main

# Prefixes: DD: (Deep Dive), PBK: (Portfolio Booking), Fix:, docs:
```

### Formula 13: What's Included Comma Split
```javascript
// ❌ PROBLEM: User enters all items in ONE field with commas
// "Remote, TV stand, Cable" should become 3 separate items

// ✅ FIX: Auto-split comma-separated items in render function
items.forEach(item => {
  if (item && item.includes(',')) {
    const splitItems = item.split(',').map(i => i.trim()).filter(i => i);
    allItems.push(...splitItems);
  } else if (item && item.trim()) {
    allItems.push(item.trim());
  }
});
```

### Formula 14: Apple Dynamic Spacing with clamp()
```css
/* ❌ PROBLEM: Fixed gap values don't scale with screen size */
gap: 24px;

/* ✅ FIX: Use clamp() for responsive scaling */
gap: clamp(var(--space-lg), 4vw, var(--space-2xl));
/* Minimum: 24px, Preferred: 4% viewport, Maximum: 48px */

/* Same pattern for margins, padding, font-sizes */
margin: clamp(32px, 5vw, 64px);
```

---

## 3. TEMPLATE SYSTEM

### Available Templates
| Template | Purpose | Status |
|----------|---------|--------|
| Quick Decision | Fast impulse buys | ✅ Complete |
| Deep Dive | High-value items, specs | ✅ Complete |
| Visual Menu | Food/menu items | ✅ Complete |
| Event Landing | Events/tickets | ✅ Complete |
| Portfolio/Booking | Services, photographers | ✅ Complete |

### Two Checkout Flows
1. **Product Checkout** (`store/src/checkout.js`)
   - Used by: Quick Decision, Deep Dive, Visual Menu, Event Landing
   - Flow: Summary → Delivery → Payment → M-Pesa → Success

2. **Booking Modal** (`store/src/booking/`)
   - Used by: Portfolio/Booking template
   - Flow: Package → Date/Time → Details → Review → Payment → Success

Both now support M-Pesa payment instructions!

---

## 4. M-PESA PHASE 1 (COMPLETE)

### What Was Built

#### Dashboard (Settings Page)
- Payment Settings section with Wallet icon
- Radio: Paybill vs Till Number
- Fields: Paybill/Till number, Account number (Paybill only), Business name
- Saves to store config

#### API
- `GET/PUT /settings` includes payment fields
- `GET /public/:slug` returns payment object
- `POST /bookings` accepts mpesa_code, payment_confirmed
- Migration 004: Adds mpesa_code, payment_confirmed to bookings table

#### Storefront - Booking Modal (5-step flow)
```
Step 1: Select Package
Step 2: Pick Date & Time  
Step 3: Your Details
Step 4: Review & Price → "Continue to Payment"
Step 5: M-Pesa Instructions + "I've paid" + Code input → "Complete Booking"
```

#### Storefront - Product Checkout (4-step flow)
```
Step 1: Order Summary
Step 2: Delivery Details
Step 3: Choose Payment (M-Pesa / COD)
Step 4: M-Pesa Instructions + Confirmation → "Complete Order"
```

### Key Files Modified
| File | Changes |
|------|---------|
| `api/package.json` | Auto-migrate on deploy |
| `api/migrations/004_mpesa_tracking.sql` | New columns |
| `api/src/routes/bookings.js` | Accept M-Pesa fields |
| `api/src/routes/public.js` | Return payment config |
| `dashboard/src/pages/SettingsPage.jsx` | Payment settings UI |
| `store/src/checkout.js` | M-Pesa step for products |
| `store/src/styles/base.css` | M-Pesa CSS |
| `store/src/booking/bookingModal.js` | Step 5 for M-Pesa |
| `store/src/booking/bookingModal.css` | Payment confirmation CSS |
| `store/src/booking/bookingState.js` | mpesaCode, paymentConfirmed |
| `store/src/booking/bookingHandlers.js` | Step 5 handlers |
| `store/src/main.js` | window.JARI_STORE_CONFIG |

---

## 5. RECENT COMMITS

```
6fa3de1 M-Pesa Phase 1: Add payment instructions to product checkout
00889d4 Booking flow: Add Step 5 for M-Pesa payment confirmation, auto-migrate on deploy
38cbfc3 M-Pesa Phase 1: Add payment confirmation, M-Pesa code tracking, proper icon
330c1a4 M-Pesa Phase 1: Add payment instructions UI to booking checkout
cacd949 M-Pesa Phase 1: Add payment fields to dashboard, API, and booking state
27faabd docs: Update handover with shelved ideas section and current status
97285c7 CTA polish: centered hero CTAs, calendar+WhatsApp icons in PBK
```

---

## 6. SHELVED IDEAS (Future Work)

### 🔴 HIGH PRIORITY

#### M-Pesa WaaS Integration (Phase 2)
**Partner:** IntaSend
**Job:** Automatic STK Push, no manual payment
**Status:** Email drafted, awaiting partnership confirmation

Key Architecture:
```
Phase 1: Manual Paybill/Till display ✅ DONE
Phase 2: IntaSend WaaS (STK Push via their shortcode)
Phase 3: Direct Daraja BYOC (merchants with own Paybill)
Phase 4: Jari as Aggregator (requires CBK PSP license)
```

Database schema planned:
- `store_wallets` - Link stores to IntaSend wallets
- `wallet_transactions` - Track money movement

#### User Accounts & Authentication
- Customer registration/login
- Order history, saved addresses
- Repeat purchase flow

### 🟡 MEDIUM PRIORITY

#### SMS/WhatsApp Reminders
- 5hr, 2hr, 30min before booking
- Africa's Talking or Twilio
- Toggle exists in booking_settings table

#### Real Discount Codes
- Dashboard UI to create codes
- Validation on checkout
- Currently just shows input, no backend

#### Multi-Select Categories
- Allow services in multiple categories
- "Wedding Photography" in both "Weddings" AND "Outdoor"

### 🟢 LOW PRIORITY
- Dashboard debouncing (prevent double-saves)
- Confirmation emails
- Image CDN optimization
- CSS file splitting

---

## 7. TESTING CHECKLIST

### Dashboard
- [ ] Settings → Payment Settings shows Wallet icon
- [ ] Can select Paybill or Till
- [ ] Conditional fields work (Account # only for Paybill)
- [ ] Save persists, reload shows saved values

### Storefront - Product Checkout
- [ ] Add to cart, proceed to checkout
- [ ] Fill delivery details
- [ ] Select M-Pesa → See "Continue" or go to Step 4
- [ ] Step 4 shows M-Pesa instructions (if configured)
- [ ] Can check "I've paid" and enter code
- [ ] Complete order works

### Storefront - Booking Modal
- [ ] Open booking, select package
- [ ] Pick date/time, enter details
- [ ] Step 4 shows Review with price breakdown
- [ ] "Continue to Payment" goes to Step 5
- [ ] Step 5 shows M-Pesa instructions
- [ ] Confirm checkbox + code input work
- [ ] Complete booking saves M-Pesa code

---

## 8. ENVIRONMENT URLS

| Service | URL |
|---------|-----|
| Dashboard | https://jari-dashboard.netlify.app |
| Store | https://jariecommstore.netlify.app |
| API | https://jari-api-production.up.railway.app |
| GitHub | github.com/meshack-abwao/jari-ecom-v2 |

**Note:** Store URL is `jariecommstore` (double-m)

---

## 9. QUICK COMMANDS

### Check Status
```powershell
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -5
```

### Read File with Offset
```javascript
read_file(path, { offset: 100, length: 50 })
```

### Surgical Edit
```javascript
edit_block(path, { old_string: "exact match", new_string: "replacement" })
```

### Commit & Push
```powershell
cmd /c "cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2 && git add -A && git commit -m 'message' && git push origin main"
```

---

## 10. NEXT SESSION PRIORITIES

1. **Test M-Pesa flow** on live site
2. **Fix any bugs** discovered in testing
3. **Template polish** - any remaining UI issues
4. **Consider Phase 2** - IntaSend partnership if ready

---

## 11. KEY LEARNINGS FROM THIS SESSION

1. **Separate checkout flows** need separate M-Pesa implementations
2. **window.JARI_STORE_CONFIG** is the bridge for store config to storefront
3. **Auto-migrate on deploy** prevents forgotten migrations
4. **5-step vs 4-step** booking flow depends on payment config
5. **CSS in base.css** for product checkout, **bookingModal.css** for booking modal

---

*Last updated: January 19, 2026 ~23:30 EAT*
*Author: Claude (AI Assistant)*
