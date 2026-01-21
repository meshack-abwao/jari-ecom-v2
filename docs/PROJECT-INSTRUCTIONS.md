# Jari.Ecom V2 - Project Instructions

> **Purpose:** Feed this document into a Claude Project to maintain full context across all conversations.
> **Last Updated:** January 19, 2026
> **Current Phase:** Template Isolation Project (Next: Separate templates into independent modules)

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

## 2. CURRENT STATUS

### ✅ COMPLETED FEATURES

**Dashboard Bookings Page (2023 lines)**
- Stats cards (Today, This Week, Pending, Revenue)
- Clickable filters on stat cards
- Week view calendar with day selection
- Status filter pills (All, Pending, Confirmed, Completed, Cancelled)
- Search by name/phone/email
- Export to CSV
- Reschedule modal
- Booking cards with day names
- Expandable cards with details
- Confirm/Decline/Complete buttons
- Call/WhatsApp action buttons
- Revenue calculation (earned + pending in orange)
- Responsive layout (2 cols mobile, 4 cols desktop)
- Full-width desktop layout
- Settings tab (working hours, blocked dates)

**Storefront Booking Flow**
- Booking modal with date/time picker
- Customer details form
- Payment type (Full/Deposit/Inquiry)
- Booking saved with correct price
- Confirmation receipt
- Add to Calendar (.ics download)

**Layout/Navigation**
- Sidebar reordered: Overview → My Products → Orders → Bookings → Ads → Templates → Add-Ons → Settings

### 🔶 NEXT MAJOR TASK: Template Isolation

**Problem:** Monolithic code (render.js = 926 lines, base.css = 3716 lines)
**Solution:** Separate each template into independent modules
**Documentation:** See `docs/TEMPLATE-ISOLATION-HANDOVER.md`

---

## 3. PROJECT STRUCTURE

```
C:\Users\ADMIN\Desktop\jari-ecom-v2\
├── api/                      # Backend API (Express)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── stores.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── settings.js
│   │   │   ├── tracking.js
│   │   │   └── bookings.js   # Booking system API
│   │   ├── middleware/
│   │   └── config/
│   └── migrations/
│       ├── 001_initial.sql
│       ├── 002_pixel_tracking.sql
│       ├── 003_booking_system.sql
│       └── run.js
│
├── dashboard/                # React Admin Dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── BookingsPage.jsx   # 2023 lines - Full booking management
│   │   │   ├── AdsPage.jsx
│   │   │   ├── TemplatesPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── AddOnsPage.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Sidebar navigation
│   │   │   └── Sidebar.jsx
│   │   ├── api/
│   │   │   └── client.js          # API client (bookingsAPI, etc.)
│   │   └── hooks/
│   └── index.html
│
├── store/                    # Public Storefront (Vanilla JS)
│   ├── src/
│   │   ├── render.js         # MONOLITH - 926 lines (TO BE SPLIT)
│   │   ├── main.js
│   │   ├── state.js
│   │   ├── api.js
│   │   ├── checkout.js
│   │   ├── styles/
│   │   │   └── base.css      # MONOLITH - 3716 lines (TO BE SPLIT)
│   │   ├── booking/          # ✅ ALREADY ISOLATED
│   │   │   ├── bookingModal.js
│   │   │   ├── bookingHandlers.js
│   │   │   ├── bookingApi.js
│   │   │   ├── bookingState.js
│   │   │   └── bookingModal.css
│   │   └── templates/
│   │       ├── portfolioBooking.js      # ✅ ALREADY ISOLATED
│   │       ├── portfolioBooking.css
│   │       └── portfolioBookingHandlers.js
│   └── index.html
│
├── docs/
│   ├── PROJECT-INSTRUCTIONS.md          # THIS FILE
│   ├── TEMPLATE-ISOLATION-HANDOVER.md   # Detailed extraction guide
│   └── HANDOVER-CONTEXT.md
│
└── shared/                   # Shared utilities
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
const store = response.data.settings;  // ❌ WRONG
```

### Git Commands (Windows PowerShell)
```powershell
# Use semicolons, NOT &&
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "message"; git push origin main

# Check status
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -10
```

### CSS Prefixes by Template
| Template | Prefix | Example |
|----------|--------|---------|
| Quick Decision | `.qd-` | `.qd-card` |
| Deep Dive | `.deep-dive-` | `.deep-dive-hero` |
| Visual Menu | `.vm-` | `.vm-menu` |
| Portfolio-Booking | `.pbk-` | `.pbk-packages` |

---

## 5. TEMPLATE SYSTEM

### Available Templates
| Template | Purpose | Status |
|----------|---------|--------|
| **Quick Decision** | Fast impulse buys | ✅ In render.js |
| **Deep Dive** | High-value items | ✅ In render.js |
| **Visual Menu** | Food/restaurant | ✅ In render.js |
| **Portfolio/Booking** | Services | ✅ ISOLATED |

### Template Detection (render.js)
```javascript
export function renderSingleProduct(product) {
  const template = state.store?.template || 'quick-decision';
  
  if (template === 'portfolio-booking') {
    return renderPortfolioBookingTemplate(product);
  }
  
  switch (template) {
    case 'visual-menu': return renderVisualMenu(product);
    case 'deep-dive': return renderDeepDive(product);
    default: return renderQuickDecision(product);
  }
}
```

---

## 6. BOOKING SYSTEM

### Database Tables (Migration 003)
- `booking_settings` - Per-store settings
- `working_hours` - Day-by-day schedule
- `blocked_dates` - Holidays, personal days
- `bookings` - Customer bookings
- `service_packages` - Package options

### API Endpoints
```
GET    /bookings/settings         - Get booking settings
PUT    /bookings/settings         - Update settings
GET    /bookings/working-hours    - Get working hours
PUT    /bookings/working-hours/:day - Update day
GET    /bookings/blocked-dates    - Get blocked dates
POST   /bookings/blocked-dates    - Add blocked date
DELETE /bookings/blocked-dates/:id - Remove blocked
GET    /bookings                  - Get all bookings
POST   /bookings                  - Create booking
PUT    /bookings/:id              - Update booking (reschedule)
```

---

## 7. DEBUG FORMULAS

### Formula 1: API Response Structure
**Problem:** `Cannot read property 'slug' of undefined`
**Fix:** API returns store at `response.data`, not `response.data.store`

### Formula 2: CSS Parse Errors
**Problem:** Build fails with CSS syntax error
**Fix:** Search for orphaned selectors, remove duplicates

### Formula 3: Revenue Showing Zero
**Problem:** Revenue card shows 0
**Fix:** Check `total_amount` field in bookings, verify status is confirmed/completed

### Formula 4: Template Not Rendering
**Problem:** Wrong template displays
**Fix:** Check `store.template` setting in database

### Formula 5: Booking Price = 0
**Problem:** Booking created with KES 0
**Fix:** Ensure `product_id` sent (not `service_id`), check packages have prices

---

## 8. RECENT COMMITS

```
dfc032a 📝 Add comprehensive Template Isolation handover document
38cd3fe ✨ Bookings: WhatsApp config, search, export CSV, reschedule modal
5121814 ✨ Layout: full-width desktop, reorder sidebar
006c25a ✨ Layout: center content, responsive stats grid
8057acc ✨ Revenue card: pending revenue in orange
2ecb28d 🐛 Fix booking API: accept product_id
8d1593e ✨ Fix week calculation, Add to Calendar .ics
```

---

## 9. ENVIRONMENT URLS

| Environment | URL |
|-------------|-----|
| Dashboard | https://jari-dashboard.netlify.app |
| Store | https://jari-store.netlify.app |
| API | https://jari-api-production.up.railway.app |

---

## 10. MOBILE APP (NEW - January 21, 2026)

### Status: Phase 1 Complete ✅
- Capacitor installed and configured
- Android platform added
- Debug APK built (4.2MB)
- Ready for testing

### APK Location
```
dashboard/android/app/build/outputs/apk/debug/app-debug.apk
```

### Mobile Commands
```bash
# Build for Android
npm run build:android    # Build web + sync
cd android && ./gradlew assembleDebug

# Open in Android Studio
npx cap open android
```

### Pending
- [ ] Test APK on physical phone
- [ ] Fix emulator hypervisor
- [ ] Custom app icon (1024x1024)
- [ ] DUNS approval → Play Store

### See Also
- `docs/MOBILE-APP-GUIDE.md` - Complete mobile documentation

---

## 11. NEXT SESSION CHECKLIST

When starting a new chat:
1. ✅ Run `git status` and `git log --oneline -5`
2. ✅ Check `docs/HANDOVER-CONTEXT.md` for current status
3. ✅ Read `docs/MOBILE-APP-GUIDE.md` if doing mobile work
4. ✅ Read `docs/TEMPLATE-ISOLATION-HANDOVER.md` if doing template work
5. ✅ Commit after each successful change
6. ✅ Test before proceeding

---

**End of Project Instructions**
*Last Updated: January 21, 2026*
