# Jari.Ecom V2 - Project Instructions

> **Purpose:** Feed this document into a Claude Project to maintain full context across all conversations.
> **Last Updated:** January 17, 2026 (Session 5)
> **Current Phase:** Portfolio-Booking Template Styling + Dashboard Fields

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
│   │   │   ├── public.js     # Public booking endpoints (no auth)
│   │   │   └── bookings.js   # Booking system API (auth required)
│   │   ├── middleware/
│   │   └── config/
│   └── migrations/
│       ├── 001_initial.sql
│       ├── 002_pixel_tracking.sql
│       ├── 003_booking_system.sql  # ✅ RUN ON RAILWAY
│       └── run.js
│
├── dashboard/                # React Admin Dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProductsPage.jsx    # ✅ Portfolio-booking fields added
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── AdsPage.jsx
│   │   │   ├── TemplatesPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── AddOnsPage.jsx
│   │   │   └── BookingsPage.jsx    # ✅ Calendar + Settings tabs
│   │   ├── components/
│   │   │   ├── Layout.jsx          # ✅ Bookings in sidebar
│   │   │   └── Sidebar.jsx
│   │   ├── api/
│   │   │   └── client.js           # ✅ bookingsAPI added
│   │   └── hooks/
│   └── index.html
│
├── store/                    # Public Storefront (Vanilla JS)
│   ├── src/
│   │   ├── main.js           # Entry point
│   │   ├── render.js         # Template dispatcher
│   │   ├── state.js          # Global state
│   │   ├── api.js            # Store API calls
│   │   ├── checkout.js       # Checkout modal
│   │   ├── pixel.js          # Analytics tracking
│   │   ├── templates/        # ⚠️ ISOLATED TEMPLATES
│   │   │   ├── portfolioBooking.js       # pbk- prefix ✅
│   │   │   ├── portfolioBooking.css      # pbk- prefix ✅
│   │   │   └── portfolioBookingHandlers.js ✅
│   │   ├── booking/          # ⚠️ ISOLATED BOOKING SYSTEM
│   │   │   ├── bookingState.js    # bkm- prefix ✅
│   │   │   ├── bookingModal.js    # bkm- prefix ✅
│   │   │   ├── bookingModal.css   # bkm- prefix ✅
│   │   │   ├── bookingApi.js      # ✅
│   │   │   └── bookingHandlers.js # ✅
│   │   └── styles/
│   │       ├── base.css      # Core + imports
│   │       └── footer.css
│   └── index.html
│
└── docs/
    ├── PROJECT-INSTRUCTIONS.md  # THIS FILE
    └── sales-materials/
```

---

## 3. ⛔ CRITICAL RULES - DO NOT VIOLATE

### Rule 1: Template Isolation (MOST IMPORTANT)
**Each template MUST be completely isolated:**
- Own folder: `store/src/templates/{templateName}/`
- Own CSS file with UNIQUE prefix (e.g., `pbk-`, `ddv-`, `qkd-`)
- Own handlers file
- NEVER share CSS class names between templates
- NEVER edit one template and affect another

**Why:** We nearly destroyed the entire storefront by using shared class names. Deep Dive template broke completely when editing Portfolio-Booking because they shared `.product-name`, `.package-card`, etc.

### Rule 2: CSS Class Naming Convention
```
Template prefixes (MANDATORY):
- portfolio-booking: pbk-   ✅ DONE
- deep-dive: ddv-           ❌ NEEDS ISOLATION
- quick-decision: qkd-      ❌ NEEDS ISOLATION
- visual-menu: vmn-         ❌ NEEDS ISOLATION
- event-landing: evt-       ❌ NEEDS ISOLATION

Booking system: bkm-        ✅ DONE
Checkout system: chk-       ❌ NEEDS ISOLATION
```

### Rule 3: Surgical Commits
- Commit after EVERY successful change
- Small, focused commits (1-3 files max)
- Push after every 2-3 commits
- This prevents losing work on context loss/crashes

### Rule 4: Never Overwrite Entire Files
- Always use `edit_block` for surgical edits
- Never `write_file` to replace an entire working file
- This caused CSS to be wiped (3000+ lines lost)

### Rule 5: Test Before Adding More Features
- Test each phase before moving to next
- Don't build 5 features then test 1

### Rule 6: Read Before Writing
- Always `read_file` to see current state first
- Never assume file contents from memory
- Context can be lost mid-session

---

## 4. TEMPLATE ISOLATION STATUS

| Template | Isolated? | Prefix | Location | Priority |
|----------|-----------|--------|----------|----------|
| portfolio-booking | ✅ Yes | `pbk-` | `templates/portfolioBooking.*` | - |
| booking-modal | ✅ Yes | `bkm-` | `booking/bookingModal.*` | - |
| deep-dive | ❌ No | needs `ddv-` | `render.js` line ~466 | HIGH |
| quick-decision | ❌ No | needs `qkd-` | `render.js` line ~265 | MEDIUM |
| visual-menu | ❌ No | needs `vmn-` | `render.js` line ~326 | LOW |
| event-landing | ❌ No | needs `evt-` | `render.js` line ~674 | LOW |

**⚠️ BEFORE editing any non-isolated template:**
1. Create folder: `store/src/templates/{templateName}/`
2. Extract JS to: `{templateName}.js`
3. Extract CSS to: `{templateName}.css` with prefix
4. Create handlers: `{templateName}Handlers.js`
5. Import in `render.js` and `base.css`
6. Test thoroughly before continuing

---

## 5. CURRENT SESSION STATUS (Jan 17, 2026 - Session 5)

### ✅ Completed This Session

**Portfolio-Booking Template Styling:**
1. `eef84b1` - CTA glass style (Deep Dive match)
2. `0911b0b` - Header typography (32px title, Apple-style buttons)
3. `db481da` - Hero caption overlay (magazine style)
4. `b871f06` - Stories gradient rings + theme colors

**Dashboard Form Fields:**
5. `4bcaa77` - Gallery fallback + Why Choose Us + What's Included sections
6. `ea6961a` - Form data fields (whyChooseUs, whatsIncluded, galleryTitle)
7. `2bc239b` - UI input fields for new sections
8. `f4b421b` - Load fields when editing product
9. `16eaad9` - Enable showcase gallery (with captions) for portfolio-booking

### 🐛 Known Bugs to Debug (Next Session)
- Gallery section may not render if no showcaseImages
- Lightbox functionality needs testing
- Hero image captions need storefront rendering
- Booking modal flow not fully tested

### 📋 TODO (Next Session Priority)
1. **Debug** - Test gallery rendering with showcaseImages
2. **Debug** - Verify lightbox works on gallery tap
3. **Debug** - Test booking modal opens and loads settings
4. **Build** - Storefront calendar picker component
5. **Build** - Complete booking checkout flow

---

## 6. PORTFOLIO-BOOKING TEMPLATE STRUCTURE

### Data Fields (ProductsPage.jsx)
```javascript
// In getInitialFormData():
packages: [{ name: '', description: '', price: '', duration: '' }],
bookingNote: '',
whyChooseUs: [''],      // ✅ Array of reasons
whatsIncluded: [''],    // ✅ Array of items
galleryTitle: 'Gallery', // ✅ Section title

// In media:
showcaseImages: [{ url: '', caption: '', description: '' }], // ✅ From deep-dive
```

### Storefront Sections (portfolioBooking.js)
```
1. Header (title, stars, share/heart)
2. Hero Media (carousel with caption overlay)
3. Intro (starting price, description)
4. Stories (horizontal scroll circles)
5. Gallery (masonry grid → lightbox)
6. Why Choose Us (reasons list)
7. Packages (cards with select buttons)
8. What's Included (checklist)
9. Testimonials (cards grid)
10. Booking Note (info text)
11. Sticky CTA (glass style, book + WhatsApp)
```

### CSS Classes (pbk- prefix)
```css
.pbk-container, .pbk-header, .pbk-title, .pbk-meta
.pbk-hero, .pbk-hero-image, .pbk-hero-caption
.pbk-stories, .pbk-story, .pbk-story-ring
.pbk-gallery, .pbk-gallery-grid, .pbk-gallery-item
.pbk-lightbox, .pbk-lightbox-content
.pbk-why-choose, .pbk-why-item
.pbk-packages, .pbk-package, .pbk-package-btn
.pbk-whats-included, .pbk-included-item
.pbk-testimonials, .pbk-testimonial
.pbk-sticky-cta, .pbk-cta-glass
```

---

## 7. BOOKING SYSTEM STATUS

### Backend (✅ Complete)
- Migration 003 run on Railway
- 5 tables: booking_settings, working_hours, blocked_dates, bookings, service_packages
- API routes: /api/bookings/* (authenticated)
- Public routes: /api/public/:slug/booking/* (no auth)

### Dashboard (✅ Complete)
- BookingsPage.jsx with Calendar + Settings tabs
- Working hours toggles per day
- Blocked dates management
- Slot settings (duration, max per slot/day)
- Advance booking rules
- Deposit and inquiry fee settings

### Storefront (🚧 Partial)
- bookingState.js ✅
- bookingModal.js ✅ (4-step flow structure)
- bookingModal.css ✅ (bkm- prefix)
- bookingApi.js ✅
- bookingHandlers.js ✅
- **NOT TESTED** - Needs live testing

---

## 8. API RESPONSE PATTERNS

### ⚠️ Critical - Memorize This
```javascript
// settingsAPI.getAll() returns store object DIRECTLY
const response = await settingsAPI.getAll();
const store = response.data;  // ✅ CORRECT
const slug = store.slug;      // ✅ CORRECT

// WRONG patterns that cause bugs:
const store = response.data.store;     // ❌ WRONG
const store = response.data.settings;  // ❌ WRONG
```

---

## 9. DEBUG FORMULAS

### Formula 1: API Response Structure
**Problem:** `Cannot read property 'slug' of undefined`
**Fix:** API returns store object directly at `response.data`

### Formula 2: CSS Parse Errors
**Problem:** Build fails with CSS syntax error
**Fix:** Search for orphaned selectors, remove duplicates

### Formula 3: Template Contamination
**Problem:** Editing one template breaks another
**Fix:** Isolate templates with unique CSS prefixes

### Formula 4: Context Loss Recovery
**Problem:** Claude loses context mid-session
**Fix:** Check `git log --oneline -20`, read recent commits, reference this doc

### Formula 5: Git on Windows
**Problem:** Commands fail with `&&`
**Fix:** Use semicolons: `cd path; git add -A; git commit -m "msg"`

---

## 10. ENVIRONMENT URLS

| Environment | URL |
|-------------|-----|
| Dashboard | https://jari-dashboard.netlify.app |
| Store | https://jari-store.netlify.app |
| API | https://jari-api-production.up.railway.app |
| GitHub | https://github.com/meshack-abwao/jari-ecom-v2 |

---

## 11. RECENT COMMITS

```
16eaad9 ✨ Dashboard: Enable showcase gallery (with captions) for portfolio-booking
f4b421b 🔧 Dashboard: Load whyChooseUs, whatsIncluded, galleryTitle when editing
2bc239b ✨ Dashboard: Add UI fields for galleryTitle, whyChooseUs, whatsIncluded
ea6961a ✨ Dashboard: Add whyChooseUs, whatsIncluded, galleryTitle to form data
4bcaa77 ✨ PBK: Gallery fallback to images, add Why Choose Us + Whats Included
b871f06 🎨 PBK Stories: Theme gradient rings, centered layout
db481da ✨ PBK Hero: Caption overlay on images (magazine style)
0911b0b 🎨 PBK Header: Deep Dive typography (32px title, Apple-style buttons)
eef84b1 🎨 PBK CTA: Glass style matching Deep Dive
93c7345 📚 Update PROJECT-INSTRUCTIONS
e8ed828 🔧 Ensure booking modal CSS import
9ba957c ✨ Add booking modal: handlers + CSS (bkm- prefix)
eac0d17 ✨ Add booking modal: state + render (4-step flow)
f881da8 ✨ Add public booking API endpoints
```

---

## 12. NEXT SESSION CHECKLIST

When starting a new chat:

1. **Confirm tools available**
   - Desktop Commander OR Filesystem tools
   - Git access

2. **Check current state**
   ```powershell
   cd C:\Users\ADMIN\Desktop\jari-ecom-v2
   git log --oneline -10
   git status
   ```

3. **Review this document** for:
   - Current phase and status
   - Known bugs to debug
   - TODO priorities

4. **Priority order:**
   - Debug existing features first
   - Test before building more
   - Isolate templates before editing

---

## 13. KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `store/src/templates/portfolioBooking.js` | PBK template render |
| `store/src/templates/portfolioBooking.css` | PBK styles (pbk-) |
| `store/src/templates/portfolioBookingHandlers.js` | PBK event handlers |
| `store/src/booking/bookingModal.js` | Booking modal (bkm-) |
| `store/src/booking/bookingHandlers.js` | Booking event handlers |
| `store/src/render.js` | Template dispatcher |
| `store/src/styles/base.css` | Core CSS + imports |
| `dashboard/src/pages/ProductsPage.jsx` | Product form fields |
| `dashboard/src/pages/BookingsPage.jsx` | Booking settings UI |
| `dashboard/src/api/client.js` | All API clients |
| `api/src/routes/public.js` | Public booking endpoints |
| `api/src/routes/bookings.js` | Auth'd booking endpoints |

---

**End of Project Instructions**
