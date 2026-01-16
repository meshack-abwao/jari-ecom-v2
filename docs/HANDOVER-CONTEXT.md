# JARI.ECOM V2 - HANDOVER DOCUMENT
### *Full Context for Continuation*

**Last Updated:** January 16, 2026
**Last Commit:** `26d7b6c` - Mobile layout fix for overview stats grid

---

## PROJECT OVERVIEW

**Jari.Ecom** is an e-commerce platform for Instagram/WhatsApp sellers in Kenya and East Africa. Built for solo entrepreneurs and small teams who sell via social media but need professional storefronts with M-Pesa integration.

**Target Users:** Instagram sellers, WhatsApp merchants, small business owners
**Key Differentiator:** JTBD-driven themes with checkout styles optimized for specific business types

---

## PROJECT STRUCTURE

```
C:\Users\ADMIN\Desktop\jari-ecom-v2\
├── api/                    # Backend (Node.js/Express)
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation
│   │   └── index.js        # Entry point
│   ├── migrations/         # Database migrations
│   └── .env                # API environment vars
│
├── dashboard/              # Admin dashboard (React/Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js   # API client (settingsAPI, ordersAPI, etc.)
│   │   ├── components/
│   │   │   └── Layout.jsx  # Main layout with sidebar, modals
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx   # Overview/stats
│   │   │   ├── OrdersPage.jsx      # Order management
│   │   │   ├── ProductsPage.jsx    # Product CRUD
│   │   │   ├── AdsPage.jsx         # UTM link generator
│   │   │   ├── TemplatesPage.jsx   # Store templates
│   │   │   ├── AddOnsPage.jsx      # Subscription add-ons
│   │   │   └── SettingsPage.jsx    # Store settings
│   │   ├── styles/
│   │   │   └── globals.css         # Global styles + responsive
│   │   └── contexts/               # Auth, Theme contexts
│   └── .env                        # Dashboard environment vars
│
├── store/                  # Customer-facing storefront (React/Vite)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── themes/         # Theme components (TO BE BUILT)
│   └── .env
│
├── shared/                 # Shared config
│   ├── templates.json
│   └── themes.json
│
└── docs/                   # Documentation
    └── sales-materials/    # Pricing, field guide, worksheets
```

---

## KEY TECHNICAL PATTERNS

### API Response Pattern (CRITICAL)
```javascript
// settingsAPI.getAll() returns store object DIRECTLY
const response = await settingsAPI.getAll();
const store = response.data;  // Direct access
const slug = store?.slug;     // NOT response.data.store.slug
const id = store?.id;         // NOT response.data.settings.id
```

### Git Commands (PowerShell)
```powershell
# Use semicolons, NOT &&
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git status
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git commit -m "message"; git push origin main
```

### Debug Workflow
1. `read_file` - Examine current code (use offset/length for large files)
2. `edit_block` - Surgical edit with exact old_string match
3. `git commit` - Commit immediately after each successful edit
4. Test in browser → If error, check Netlify logs

### CSS Responsive Breakpoints
```css
/* Desktop: default styles */
/* Tablet: @media (max-width: 900px) */
/* Mobile: @media (max-width: 600px) */
```

---

## CURRENT STATE - DASHBOARD

### Overview Page (DashboardPage.jsx)
**Layout:** New wireframe-based grid
- Row 1: Total Revenue (large) + 3 cards horizontal (Orders, Completed, Pending Revenue)
- Row 2: Traffic (50%) + Share Your Store (50%)

**CSS Classes:**
- `.overview-stats-grid` - Main grid container
- `.overview-stat-large` - Revenue card
- `.overview-stat-row` - Container for 3 small cards
- `.overview-stat-small` - Individual small cards
- `.overview-stat-half` - Traffic/Share cards

**Responsive:** Mobile uses flexbox stacking, 2-col grid for small cards

### Sidebar (Layout.jsx)
- User card is clickable → Opens Account & Billing modal
- Theme toggle at bottom
- Nav links: Overview, Orders, Products, Ads, Templates, Add-Ons, Settings

### Orders Page (OrdersPage.jsx)
- Period filter (Today/Week/Month/All) updates stats cards
- Stats reflect filtered data, not global
- Filter positioned below cards, minimal pill styling

---

## WHAT'S NEXT - THEMES

### Theme System Architecture (To Build)

**Core Concept:** Themes = Checkout styles optimized for specific JTBDs

| Theme | Job-to-be-Done | Checkout Style |
|-------|----------------|----------------|
| Quick Sell | Fast simple purchases | Minimal steps, impulse buy |
| Visual Menu | Food/bakery display | Grid, quick add, cart |
| Deep Dive | Premium/complex products | Gallery, specs, storytelling |
| Events/Booking | Classes/appointments | Date picker, capacity |
| Services | Consulting/freelance | Packages, inquiry flow |
| Catalog | Browse-only | No checkout, WhatsApp inquiry |

### Implementation Plan

1. **Theme Selection in Dashboard**
   - TemplatesPage.jsx shows available themes
   - Preview each theme's checkout style
   - Purchase/unlock themes (one-time)
   - First theme FREE based on signup JTBD

2. **Store Rendering**
   - store/src/themes/ folder with theme components
   - Each theme: ProductCard, ProductDetail, Checkout components
   - Theme loaded based on store settings

3. **Product-Theme Assignment**
   - Each product card can use any owned theme
   - Same store can have multiple themes (bakery cakes + classes)
   - Flexible reassignment

### Files to Create/Modify

**Dashboard:**
- `TemplatesPage.jsx` - Theme marketplace UI
- `api/client.js` - Theme purchase endpoints

**Store:**
- `store/src/themes/QuickSell/` - Components
- `store/src/themes/VisualMenu/` - Components
- `store/src/themes/DeepDive/` - Components
- `store/src/themes/EventsBooking/` - Components
- `store/src/themes/Services/` - Components
- `store/src/themes/Catalog/` - Components

**API:**
- Theme ownership/purchase endpoints
- Product-theme assignment

---

## PRICING MODEL (Finalized)

### Subscription
| Component | Price/Month |
|-----------|-------------|
| Base Platform | KES 1,200 |
| + M-Pesa STK | +KES 300 |
| + WhatsApp Auto | +KES 80 |
| + Advanced Analytics | +KES 200 |

### Product Cards
| Bundle | Cards | Price |
|--------|-------|-------|
| Included | 3 | FREE |
| Starter | 7 | KES 350 |
| Growth | 10 | KES 550 |
| Pro | 15 | KES 850 |

**Beyond 15:**
- 16-30 cards: +KES 200/month
- 31-60 cards: +KES 500/month

### Themes
| Theme | Price |
|-------|-------|
| Quick Sell | KES 500 |
| Visual Menu | KES 600 |
| Deep Dive | KES 800 |
| Events/Booking | KES 1,000 |
| Services | KES 800 |
| Catalog | KES 400 |

**First theme FREE** (based on signup JTBD)

---

## DEBUG FORMULAS & LESSONS LEARNED

### 1. CSS Syntax Errors
**Problem:** Orphaned braces after refactoring
**Solution:** After any CSS edit, verify all media queries close properly
**Check:** Count opening `{` and closing `}` in affected section

### 2. API Response Structure
**Problem:** `response.data.store.slug` returns undefined
**Solution:** API returns flat object: `response.data.slug`
**Memory:** Add to userMemories for future reference

### 3. Mobile Layout Breaks
**Problem:** Grid items overlap on small screens
**Solution:** Use `display: flex; flex-direction: column` for mobile
**Pattern:** Desktop=grid, Mobile=flexbox stacking

### 4. Large File Edits
**Problem:** edit_block fails on large replacements
**Solution:** Break into smaller surgical edits
**Rule:** Keep old_string and new_string under 50 lines each

### 5. Git in PowerShell
**Problem:** `&&` doesn't work in PowerShell
**Solution:** Use semicolons: `cd path; git add -A; git commit -m "msg"`

---

## ENVIRONMENT URLS

| Service | URL |
|---------|-----|
| Dashboard (Netlify) | https://jariecomdash.netlify.app |
| Store (Netlify) | https://jariecommstore.netlify.app |
| API (Railway) | [Check .env for VITE_API_URL] |
| GitHub Repo | https://github.com/meshack-abwao/jari-ecom-v2 |

---

## TOOLS & ACCESS

### Desktop Commander (Windows MCP)
- Full filesystem access to project
- Git commands via PowerShell
- Process management

### Key Commands
```powershell
# Check git status
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status

# View recent commits
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git log --oneline -5

# Push changes
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "msg"; git push origin main
```

---

## IMMEDIATE NEXT STEPS

1. **Verify mobile layout** - Check Overview page on mobile after latest fix
2. **Begin theme system** - Start with TemplatesPage.jsx UI
3. **Create theme components** - Quick Sell first (simplest)
4. **Wire up theme selection** - Dashboard → API → Store rendering

---

## CONTACTS

- **Mesh** - Developer, technical decisions
- **Charles** - CEO, business/pricing decisions

---

## DOCUMENTS CREATED THIS SESSION

Located in `C:\Users\ADMIN\Desktop\jari-ecom-v2\docs\sales-materials\`:
1. `01-JARI-PRICING-STRUCTURE.md`
2. `02-JARI-FIELD-GUIDE.md`
3. `03-JARI-AFFILIATE-WORKSHEET.md`

---

*"Start with read_file, make surgical edits, commit immediately, test in browser"*
