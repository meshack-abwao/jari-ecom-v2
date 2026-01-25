# JARI.ECOM V2 - COMPREHENSIVE HANDOVER DOCUMENT
## Visual Menu Template Session - January 23, 2026

---

## 🎯 SESSION SUMMARY

This session focused on redesigning the Visual Menu (VM) template sticky CTA to match PBK style, fixing backend migration issues, and implementing Apple-style ingredients display.

### Commits Made This Session
```
165cf5b VM-fix-qty-handlers-ingredients-apple-card-style
369843f Fix-migration-004-UUID-type-mismatch
3c8c77b VM-sticky-cta-PBK-style-stacked-mobile-inline-desktop
```

---

## 📁 PROJECT STRUCTURE (Key Files)

```
C:\Users\ADMIN\Desktop\jari-ecom-v2\
├── api/
│   ├── migrations/
│   │   ├── 001_initial.sql           # Users, stores, products, orders (UUID types)
│   │   ├── 002_pixel_tracking.sql
│   │   ├── 003_booking_system.sql
│   │   ├── 004_mpesa_tracking.sql
│   │   └── 004_platform_payments.sql # FIXED: UUID type for store_id/user_id
│   └── src/
│       └── routes/
│           └── bookings.js
│
├── dashboard/
│   └── src/
│       ├── pages/
│       │   └── ProductsPage.jsx      # Product management + templates
│       └── api/
│           └── client.js             # API client (settingsAPI, bookingsAPI, etc.)
│
├── store/
│   └── src/
│       ├── main.js                   # UPDATED: Added initVisualMenuHandlers import + call
│       ├── styles/
│       │   └── base.css              # All storefront CSS including VM styles
│       └── templates/
│           ├── visual-menu/
│           │   ├── vm-render.js      # UPDATED: Apple-style ingredients
│           │   ├── vm-handlers.js    # Quantity, add-ons, gallery handlers
│           │   └── index.js
│           ├── deep-dive/
│           ├── portfolio-booking/
│           └── quick-decision/
│
└── docs/
    ├── PROJECT-INSTRUCTIONS.md       # Main project context
    └── HANDOVER-VM-SESSION.md        # THIS FILE
```

---

## ✅ WHAT WAS COMPLETED

### 1. VM Sticky CTA - PBK Style Implementation

**File:** `store/src/templates/visual-menu/vm-render.js`
```html
<!-- Sticky CTA - PBK Style (Stacked mobile, inline desktop) -->
<div class="vm-sticky-cta">
  <div class="vm-cta-glass">
    <div class="vm-cta-price-row">
      <span class="vm-cta-label">Total</span>
      <span class="vm-cta-amount">KES <span id="displayPrice">${price}</span></span>
    </div>
    <div class="vm-cta-qty">
      <button class="vm-qty-btn" id="decreaseQty">−</button>
      <span class="vm-qty-value" id="quantity">1</span>
      <button class="vm-qty-btn" id="increaseQty">+</button>
    </div>
    <button class="vm-cta-order" id="buyBtn">Add to Order</button>
  </div>
</div>
```

**File:** `store/src/styles/base.css` (Lines ~4584-4700)
- **Mobile:** Stacked layout, 280px max-width, 20px border-radius
- **Desktop:** Inline row, 420px max-width, pill shape (100px radius)
- Glass morphism effect with backdrop blur
- Price row with separator on desktop

### 2. Quantity Handlers Fixed

**File:** `store/src/main.js`
```javascript
// Added import
import { initVisualMenuHandlers } from './templates/visual-menu/vm-handlers.js';

// In renderProductView():
if (product.template === 'visual-menu') {
  initVisualMenuHandlers(product);
}
```

**File:** `store/src/templates/visual-menu/vm-handlers.js`
- `initStickyCTAHandlers(basePrice, maxStock, addOns)` - handles +/- buttons
- Calculates total: (basePrice + addOnsTotal) × quantity
- Stores in `window.JARI_VM_QUANTITY` and `window.JARI_SELECTED_ADDONS`

### 3. Ingredients - Apple Card Style

**File:** `store/src/templates/visual-menu/vm-render.js`
```javascript
function renderIngredientsSection(ingredients) {
  if (!ingredients) return '';
  
  // Split by comma and clean up
  const ingredientList = ingredients
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0);
  
  return `
    <div class="vm-ingredients-card">
      <h4 class="vm-ingredients-title">
        <span class="vm-ingredients-icon">🥗</span>
        Ingredients
      </h4>
      <div class="vm-ingredients-grid">
        ${ingredientList.map(ingredient => `
          <div class="vm-ingredient-item">
            <span class="vm-ingredient-dot"></span>
            <span class="vm-ingredient-name">${ingredient}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
```

**CSS Classes:**
- `.vm-ingredients-card` - Light gray card (#fafafa)
- `.vm-ingredients-grid` - 2-column grid
- `.vm-ingredient-dot` - Theme-colored bullet
- Responsive: single column on small screens

### 4. Migration 004 Fix - UUID Type Mismatch

**File:** `api/migrations/004_platform_payments.sql`

**Problem:** Foreign keys were using `INTEGER` but `stores.id` and `users.id` are `UUID`

**Fixed:**
```sql
-- BEFORE (broken)
store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

-- AFTER (fixed)
store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
```

---

## 🔧 DEBUG FORMULAS

### Formula 1: API Response Structure
```javascript
// settingsAPI.getAll() returns store object DIRECTLY
const response = await settingsAPI.getAll();
const store = response.data;  // ✅ CORRECT
const slug = store.slug;      // ✅ CORRECT

// WRONG patterns:
const store = response.data.store;     // ❌
const store = response.data.settings;  // ❌
```

### Formula 2: Template Handler Initialization
```javascript
// Each template needs explicit handler init in main.js renderProductView()
if (product.template === 'visual-menu') {
  initVisualMenuHandlers(product);
}
if (product.template === 'portfolio-booking') {
  initPortfolioBookingHandlers();
}
```

### Formula 3: CSS Isolation (Template Prefixes)
```css
/* Each template MUST use unique prefixes */
.vm-*   /* Visual Menu */
.pbk-*  /* Portfolio Booking */
.dd-*   /* Deep Dive */
.qd-*   /* Quick Decision */
```

### Formula 4: Migration UUID Types
```sql
/* All foreign keys to users/stores MUST be UUID */
store_id UUID REFERENCES stores(id) ON DELETE CASCADE
user_id UUID REFERENCES users(id) ON DELETE CASCADE

/* NEVER use INTEGER for these! */
```

### Formula 5: Git on Windows
```powershell
# Use && for chaining, quotes around message
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2 && git add -A && git commit -m "message"
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2 && git push origin main
```

### Formula 6: Surgical Edit Pattern
```
1. read_file with offset/length to examine specific section
2. edit_block with EXACT old_string match
3. git commit IMMEDIATELY after each fix
4. Small focused commits prevent context loss
```

---

## 📍 CURRENT STATE

### Working Features (VM Template)
- ✅ Sticky CTA with PBK-style (stacked mobile, inline desktop)
- ✅ Quantity +/- buttons functional
- ✅ Price updates dynamically
- ✅ Add-ons section with thumbnails
- ✅ Ingredients Apple card style (comma-separated → grid)
- ✅ Gallery with navigation
- ✅ Stories section
- ✅ Testimonials grid

### Backend Status
- ✅ All migrations passing (001-004)
- ✅ Railway health checks passing
- ✅ API endpoints functional

### Test URL
```
https://jariecommstore.netlify.app/store/nimoration/product/[product-id]
```

---

## 🎯 WHAT'S NEXT (Potential Tasks)

### VM Template Enhancements
1. **Add-ons selection UI** - Visual feedback when selected
2. **Checkout integration** - Pass VM quantity + addons to checkout
3. **Theme color integration** - Use store's theme colors throughout

### Other Templates
1. **Deep Dive** - Already complete, may need minor tweaks
2. **Portfolio Booking** - Complete, booking system functional
3. **Quick Decision** - Basic template, may need updates

### Mobile App
- Capacitor setup complete
- First APK built (4.2MB)
- Awaiting DUNS approval for Google Play

---

## 📊 KEY FILES REFERENCE

| Purpose | File Path |
|---------|-----------|
| VM Render | `store/src/templates/visual-menu/vm-render.js` |
| VM Handlers | `store/src/templates/visual-menu/vm-handlers.js` |
| VM CSS | `store/src/styles/base.css` (lines 4584-4800) |
| Main Entry | `store/src/main.js` |
| PBK Reference | `store/src/templates/portfolioBooking.js` |
| PBK CSS | `store/src/templates/portfolioBooking.css` |
| API Migrations | `api/migrations/*.sql` |
| Dashboard Products | `dashboard/src/pages/ProductsPage.jsx` |

---

## 🔍 CSS LOCATIONS IN base.css

| Section | Approximate Line |
|---------|------------------|
| VM Sticky CTA | 4584-4700 |
| VM Ingredients Card | 5347-5410 |
| VM Add-ons Section | 4500-4580 |
| Template Menu Base | 4200-4500 |

---

## ⚠️ KNOWN ISSUES / WATCH OUTS

1. **CSS Order Matters** - Template-specific styles must come after base styles
2. **Handler Imports** - Must import AND call handlers in main.js
3. **UUID vs INTEGER** - All store_id/user_id foreign keys must be UUID
4. **Template Prefix Isolation** - Never use generic class names, always prefix

---

## 🚀 QUICK START FOR NEXT SESSION

```powershell
# 1. Check current state
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2 && git status && git log --oneline -5

# 2. Test VM template
# Visit: https://jariecommstore.netlify.app/store/nimoration

# 3. Key files to read for context
# - store/src/templates/visual-menu/vm-render.js
# - store/src/templates/visual-menu/vm-handlers.js
# - store/src/styles/base.css (search for "vm-" classes)
```

---

## 📝 SESSION TRANSCRIPT LOCATION

Full conversation transcript available at:
```
/mnt/transcripts/2026-01-22-22-00-11-vm-template-redesign-revert-sticky-cta.txt
```

---

*Last Updated: January 23, 2026*
*Session: VM Template Sticky CTA + Ingredients Redesign*
