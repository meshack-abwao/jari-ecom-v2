# Jari.Ecom V2 - Project Instructions

> **Purpose:** Feed this document into a Claude Project to maintain full context across all conversations.
> **Last Updated:** January 17, 2026
> **Current Phase:** Building Portfolio/Booking Template + Calendar System

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
- **Frontend (Storefront):** Vanilla JS + CSS (render.js)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Railway hosted)
- **Hosting:** Netlify (dashboard + store), Railway (API + DB)

---

## 2. PROJECT STRUCTURE

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
│   │   │   └── bookings.js   # NEW - Booking system
│   │   ├── middleware/
│   │   └── config/
│   └── migrations/
│       ├── 001_initial.sql
│       ├── 002_pixel_tracking.sql
│       ├── 003_booking_system.sql  # NEW
│       └── run.js
│
├── dashboard/                # React Admin Dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx   # Overview/Stats
│   │   │   ├── ProductsPage.jsx    # Product management + Templates
│   │   │   ├── OrdersPage.jsx      # Order management
│   │   │   ├── AdsPage.jsx         # UTM tracking + Ads
│   │   │   ├── TemplatesPage.jsx   # Template selection
│   │   │   ├── SettingsPage.jsx    # Store settings
│   │   │   ├── AddOnsPage.jsx      # Premium features
│   │   │   └── BookingsPage.jsx    # NEW - Calendar + Booking settings
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Sidebar + main content
│   │   │   └── Sidebar.jsx
│   │   ├── api/
│   │   │   └── client.js           # API client (settingsAPI, productsAPI, bookingsAPI, etc.)
│   │   └── hooks/
│   └── index.html
│
├── store/                    # Public Storefront (Vanilla JS)
│   ├── src/
│   │   ├── render.js         # Main rendering engine (all templates)
│   │   ├── styles/
│   │   │   └── base.css      # All CSS including templates
│   │   └── utils/
│   └── index.html
│
├── shared/                   # Shared utilities
│
└── docs/
    ├── HANDOVER-CONTEXT.md
    ├── PROJECT-INSTRUCTIONS.md  # THIS FILE
    └── sales-materials/
```

---

## 3. CRITICAL TECHNICAL PATTERNS

### ⚠️ API Response Pattern (CRITICAL - Memorize This)
```javascript
// settingsAPI.getAll() returns store object DIRECTLY
const response = await settingsAPI.getAll();
const store = response.data;  // ✅ CORRECT
const slug = store.slug;      // ✅ CORRECT

// WRONG patterns that cause bugs:
const store = response.data.store;     // ❌ WRONG
const store = response.data.settings;  // ❌ WRONG
```

### Git Commands (Windows PowerShell)
```powershell
# Use semicolons, NOT &&
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "message"; git push origin main

# Check status + recent commits
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -5
```

### Debug Workflow (Surgical Edits)
1. `read_file` with offset/length to examine specific sections
2. `edit_block` with exact old_string match for surgical changes
3. `git commit` immediately after each fix to preserve progress
4. Small, focused commits prevent context loss

### CSS File Location
- All storefront CSS: `store/src/styles/base.css`
- Dashboard uses inline styles in JSX components

---

## 4. TEMPLATE SYSTEM (THEMES)

### Available Templates
| Template | Purpose | Status |
|----------|---------|--------|
| **Quick Decision** | Fast impulse buys, simple products | ✅ Complete |
| **Deep Dive** | High-value items, detailed specs | ✅ Complete |
| **Portfolio/Booking** | Services, photographers, consultants | 🚧 Building |
| **Showcase** | Fashion, visual products | 📋 Planned |
| **Subscription** | Recurring services | 📋 Planned |
| **Bundle** | Product bundles | 📋 Planned |

### Deep Dive Theme - Completed Features
- Title + Stars above image (premium typography)
- Social icons (share/heart) bottom-right, parallel to stars
- KES stacked on top of price (both mobile + desktop)
- Magazine-style lightbox gallery (Apple Music/Spotify inspired)
- Intelligent text split (light/bold word splitting)
- Caption inside image overlay with breathing room
- Description below caption (smallest text, 10-12px, 85% width)
- Specifications section with breathing room
- Sticky CTA on desktop with centered elements
- Dashboard fields for showcase image descriptions

---

## 5. BOOKING SYSTEM (Currently Building)

### Database Schema (Migration 003)
```sql
-- Tables created:
booking_settings     -- Per-store settings (slots, fees, deposits)
working_hours        -- Day-by-day schedule
blocked_dates        -- Holidays, personal days
bookings            -- Customer bookings
service_packages    -- Package options per service
```

### Key Features Planned
- **Calendar picker** (storefront) - Available dates/times
- **Working hours** - Provider sets schedule per day
- **Slot management** - Duration, max per slot, max per day
- **Advance booking rules** - Min notice (24hr), max advance (30 days)
- **Jump the Line** - Premium fee to skip wait time
- **Deposits** - Configurable percentage
- **Inquiry fee** - Reduce tire-kickers
- **Reminders** - SMS/WhatsApp (5hr, 2hr, 30min before)
- **Multi-select categories** - Services appear in multiple filters

### API Endpoints (bookings.js)
```
GET    /bookings/settings         - Get store's booking settings
PUT    /bookings/settings         - Update booking settings
GET    /bookings/working-hours    - Get working hours
PUT    /bookings/working-hours/:day - Update day's hours
GET    /bookings/blocked-dates    - Get blocked dates
POST   /bookings/blocked-dates    - Add blocked date
DELETE /bookings/blocked-dates/:id - Remove blocked date
GET    /bookings/availability     - Get available slots for date
GET    /bookings                  - Get all bookings
POST   /bookings                  - Create new booking
PUT    /bookings/:id/status       - Update booking status
```

### Dashboard API Client (client.js)
```javascript
export const bookingsAPI = {
  getSettings: () => api.get('/bookings/settings'),
  updateSettings: (data) => api.put('/bookings/settings', data),
  getWorkingHours: () => api.get('/bookings/working-hours'),
  updateWorkingHours: (day, data) => api.put(`/bookings/working-hours/${day}`, data),
  getBlockedDates: () => api.get('/bookings/blocked-dates'),
  addBlockedDate: (data) => api.post('/bookings/blocked-dates', data),
  removeBlockedDate: (id) => api.delete(`/bookings/blocked-dates/${id}`),
  getAvailability: (date) => api.get(`/bookings/availability?date=${date}`),
  getAll: () => api.get('/bookings'),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status })
};
```

---

## 6. CURRENT BUILD STATUS

### ✅ Completed
- [x] Migration 003_booking_system.sql
- [x] API routes (bookings.js) - All endpoints
- [x] Dashboard API client (bookingsAPI)
- [x] BookingsPage.jsx (683 lines) - Calendar tab, Settings tab

### ❌ Not Done Yet
- [ ] Wire BookingsPage into App.jsx routes
- [ ] Add Bookings to sidebar navigation
- [ ] Run migration on Railway DB
- [ ] Test dashboard booking settings UI
- [ ] Storefront calendar picker component
- [ ] Storefront booking checkout flow (2-4 steps)
- [ ] Portfolio template page structure
- [ ] Multi-select categories for products

### 🎯 Immediate Next Steps
1. Add `import BookingsPage` to App.jsx
2. Add route: `<Route path="bookings" element={<BookingsPage />} />`
3. Add "Bookings" to sidebar navigation in Layout.jsx
4. Run migration 003 on Railway
5. Test BookingsPage UI in browser
6. Build storefront booking flow

---

## 7. METHODOLOGY: JTBD/ODI APPROACH

We use Jobs-to-be-Done (JTBD) and Outcome-Driven Innovation (ODI) frameworks.

### Core Job for Portfolio/Booking Template
**"Help service providers (photographers, consultants, trainers) get booked by clients with minimal friction"**

### 8 Job Steps (ODI Framework)
1. **Define** - Client understands what service is offered
2. **Locate** - Client finds the right package/option
3. **Prepare** - Client gathers info needed to book
4. **Confirm** - Client selects date/time
5. **Execute** - Client completes booking/payment
6. **Monitor** - Client receives confirmation + reminders
7. **Modify** - Client can reschedule if needed
8. **Conclude** - Service delivered, review requested

### Checkout Flow (2-4 Steps Max)
```
Step 1: Select Service/Package
Step 2: Pick Date & Time (Calendar)
Step 3: Your Details (Name, Phone, Notes)
Step 4: Pay (Deposit/Full) OR Inquire (WhatsApp)
```

---

## 8. CATEGORIES STRATEGY

Categories remain as-is (working system, don't break it).

### Current Behavior
- Provider creates categories in dashboard
- Categories filter products/services on collection page
- Each product has single category

### Enhancement: Multi-Select Categories
- Allow multiple categories per service
- "Wedding Photography" appears in BOTH "Weddings" AND "Outdoor" filters
- Implementation: Add `categories` array to products.data JSONB

---

## 9. DEBUG FORMULAS (Lessons Learned)

### Formula 1: API Response Structure
**Problem:** `Cannot read property 'slug' of undefined`
**Cause:** Accessing `response.data.store.slug` instead of `response.data.slug`
**Fix:** API returns store object directly at `response.data`

### Formula 2: CSS Parse Errors
**Problem:** Build fails with CSS syntax error
**Cause:** Orphaned CSS rules from incomplete edits
**Fix:** Search for orphaned selectors, remove duplicates

### Formula 3: Mobile Layout Breaking
**Problem:** Cards overlap, horizontal scroll appears
**Cause:** CSS Grid doesn't stack properly on mobile
**Fix:** Use flexbox with `flex-direction: column` for mobile

### Formula 4: Z-Index Issues
**Problem:** Dropdowns hidden behind other elements
**Fix:** Use `z-index: 9999` for dropdowns/modals

### Formula 5: Git on Windows
**Problem:** Commands fail with `&&`
**Fix:** Use semicolons instead: `cd path; git add -A; git commit -m "msg"`

---

## 10. ENVIRONMENT URLS

| Environment | URL |
|-------------|-----|
| Dashboard (Netlify) | https://jari-dashboard.netlify.app |
| Store (Netlify) | https://jari-store.netlify.app |
| API (Railway) | https://jari-api-production.up.railway.app |
| GitHub Repo | https://github.com/[username]/jari-ecom-v2 |

---

## 11. COMMIT HISTORY (Recent)

```
e4d0e78 ✨ Add bookingsAPI client for dashboard
76ffb75 ✨ Add booking API routes: settings, working hours, blocked dates, availability, create booking
105ba88 ✨ Add booking system migration: booking_settings, working_hours, blocked_dates, bookings, service_packages
8372be4 🎨 Lightbox description: Smaller text (10-12px), 85% width for design balance
b847622 ✨ Lightbox overlay: Caption pulled from corner, description in overlay
23cd8b4 🎯 Lightbox: Center image vertically for balanced look
3778f6a 🎨 Lightbox: Breathing room around image, description below
961324a ✨ Deep Dive: Full-screen lightbox, rule-of-thirds caption, intelligent text split
f6710fe 🎨 Deep Dive: KES stacked, magazine overlay INSIDE image
36d3f51 ✨ Deep Dive: Social icons bottom-right, centered mobile CTA
68cecff ✨ Deep Dive theme: Title+stars above image, premium typography
```

---

## 12. WORKING WITH CLAUDE

### Preferred Workflow
1. **Read before editing** - Always `read_file` to see current state
2. **Surgical edits** - Small, focused changes with `edit_block`
3. **Commit often** - After each successful change
4. **Test incrementally** - Don't build 5 features before testing 1

### When Context is Lost
1. Check git log: `git log --oneline -20`
2. Read recent files to recover state
3. Reference this document for architecture
4. Continue from last commit

### File Editing Commands
```javascript
// Read specific section
read_file(path, { offset: 100, length: 50 })

// Surgical edit (exact string match required)
edit_block(path, { old_string: "exact match", new_string: "replacement" })

// Search for patterns
start_search(path, { pattern: "searchTerm", searchType: "content" })
```

---

## 13. QUICK REFERENCE

### Key Files to Know
| File | Purpose |
|------|---------|
| `api/src/routes/bookings.js` | Booking API endpoints |
| `api/migrations/003_booking_system.sql` | Booking tables |
| `dashboard/src/pages/BookingsPage.jsx` | Booking dashboard UI |
| `dashboard/src/api/client.js` | API client (all endpoints) |
| `dashboard/src/App.jsx` | React routing |
| `dashboard/src/components/Layout.jsx` | Sidebar navigation |
| `store/src/render.js` | Storefront template rendering |
| `store/src/styles/base.css` | All storefront CSS |

### Common Tasks
```powershell
# Check project status
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -5

# Commit changes
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "message"; git push origin main

# Run migration (via Railway CLI or dashboard)
# Check Railway dashboard for DB access
```

---

## 14. NEXT SESSION CHECKLIST

When starting a new chat:
1. ✅ Confirm access to Desktop Commander
2. ✅ Run `git log --oneline -10` to see latest commits
3. ✅ Check what's wired vs not wired
4. ✅ Reference this document for architecture
5. ✅ Continue from "Immediate Next Steps" section

---

**End of Project Instructions**
