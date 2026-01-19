# JARI.ECOM V2 - Template Isolation Project
## Comprehensive Handover Document v1.0
### Date: January 19, 2026

---

## 🎯 PROJECT OBJECTIVE

Surgically separate the monolithic storefront code into isolated, independent template modules. Each template (Quick Decision, Deep Dive, Visual Menu, Portfolio-Booking) should be able to evolve independently without affecting others.

---

## 📊 CURRENT STATE ANALYSIS

### File Sizes (The Problem)
| File | Lines | Size | Contains |
|------|-------|------|----------|
| `store/src/render.js` | 926 lines | 39KB | ALL template rendering logic |
| `store/src/styles/base.css` | 3,716 lines | 84KB | ALL template CSS |

### Current Architecture
```
store/src/
├── render.js              # MONOLITH - All templates mixed together
│   ├── renderHeader()     # Shared
│   ├── renderFooter()     # Shared
│   ├── renderProductCard()# Shared (with template conditionals)
│   ├── renderQuickDecision()    # Lines ~265-321
│   ├── renderVisualMenu()       # Lines ~326-461
│   ├── renderDeepDive()         # Lines ~466-926
│   └── renderSingleProduct()    # Dispatcher (switch statement)
│
├── styles/base.css        # MONOLITH - All CSS
│   ├── CSS Variables      # Lines 1-100 (SHARED)
│   ├── Base/Reset         # Lines 100-300 (SHARED)
│   ├── Header/Footer      # Lines 300-600 (SHARED)
│   ├── Product Cards      # Lines 600-1000 (SHARED)
│   ├── Quick Decision     # Lines 1000-1400
│   ├── Visual Menu        # Lines 1400-1840
│   ├── Deep Dive          # Lines 1840-3200 (LARGEST)
│   └── Lightbox           # Lines 3200-3716
│
├── templates/
│   ├── portfolioBooking.js      # ✅ ALREADY ISOLATED
│   ├── portfolioBooking.css     # ✅ ALREADY ISOLATED
│   └── portfolioBookingHandlers.js
│
└── booking/               # ✅ ALREADY ISOLATED
    ├── bookingModal.js
    ├── bookingHandlers.js
    ├── bookingApi.js
    ├── bookingModal.css
    └── bookingState.js
```

### Template Detection Logic (render.js lines 246-259)
```javascript
export function renderSingleProduct(product) {
  const template = state.store?.template || 'quick-decision';
  
  if (template === 'portfolio-booking') {
    return renderPortfolioBookingTemplate(product);  // Already isolated!
  }
  
  switch (template) {
    case 'visual-menu': return renderVisualMenu(product);
    case 'deep-dive': return renderDeepDive(product);
    case 'event-landing': return renderEventLanding(product);
    case 'quick-decision':
    default:
      return renderQuickDecision(product);
  }
}
```

---

## 🏗️ TARGET ARCHITECTURE

```
store/src/
├── render.js              # SLIM DISPATCHER (~100 lines)
│   ├── renderHeader()     # Keep shared
│   ├── renderFooter()     # Keep shared  
│   ├── renderProductCard()# Keep shared
│   └── renderSingleProduct() # Just dispatches to template modules
│
├── styles/
│   ├── base.css           # SLIM - Only shared (~800 lines)
│   │   ├── CSS Variables
│   │   ├── Base/Reset
│   │   ├── Header/Footer
│   │   └── Product Cards (shared)
│   └── lightbox.css       # Shared lightbox if multiple templates use it
│
├── templates/
│   ├── quick-decision/
│   │   ├── qd-render.js   # ~100 lines
│   │   └── qd-styles.css  # ~400 lines
│   │
│   ├── deep-dive/
│   │   ├── dd-render.js   # ~460 lines (largest template)
│   │   └── dd-styles.css  # ~1400 lines (most CSS)
│   │
│   ├── visual-menu/
│   │   ├── vm-render.js   # ~135 lines
│   │   └── vm-styles.css  # ~440 lines
│   │
│   └── portfolio-booking/ # ✅ ALREADY DONE
│       ├── pbk-render.js
│       ├── pbk-collection.js
│       ├── pbk-product.js
│       └── pbk-styles.css
│
├── shared/
│   ├── utils.js           # formatPrice, formatDate, truncateText
│   ├── lightbox.js        # If shared across templates
│   └── policy-modals.js   # Policy modal rendering
│
└── booking/               # ✅ ALREADY DONE
```

---

## 📋 CSS CLASS PREFIXES

Each template MUST use its own prefix to prevent conflicts:

| Template | CSS Prefix | Example Classes |
|----------|------------|-----------------|
| Quick Decision | `.qd-` | `.qd-card`, `.qd-price`, `.qd-cta` |
| Deep Dive | `.dd-` | `.dd-hero`, `.dd-gallery`, `.dd-specs` |
| Visual Menu | `.vm-` | `.vm-card`, `.vm-menu`, `.vm-item` |
| Portfolio-Booking | `.pbk-` | `.pbk-hero`, `.pbk-packages`, `.pbk-calendar` |

**Current State:** Deep Dive uses `.deep-dive-*` prefix (good but verbose)
**Action:** Keep existing prefixes, don't rename (too risky)

---

## 🔬 SURGICAL MIGRATION PLAN

### Phase 0: Preparation (DO FIRST)
1. Create git branch: `feature/template-isolation`
2. Create `shared/` directory
3. Create `templates/quick-decision/`, `templates/deep-dive/`, `templates/visual-menu/` directories
4. **DO NOT DELETE ANY CODE YET**

### Phase 1: Extract Shared Utilities (SAFE - No behavior change)
**Goal:** Identify and extract truly shared code

**Shared Functions to Extract:**
```javascript
// shared/utils.js
export function formatPrice(price) { ... }
export function formatDate(date) { ... }
export function truncateText(text, maxLength) { ... }
export function generateWhatsAppLink(phone, message) { ... }
```

**Shared from render.js:**
- `renderHeader()` - Keep in render.js (truly shared)
- `renderFooter()` - Keep in render.js
- `renderProductCard()` - Keep in render.js (used by collection page)
- `renderHeroCTAs()` - Keep in render.js
- `renderStorePolicyModals()` - Move to shared/policy-modals.js

### Phase 2: Extract Deep Dive (MEDIUM RISK)
**Why First:** It's the largest and most complex. If this works, others are easier.

**Step 2.1: Create dd-render.js**
```javascript
// templates/deep-dive/dd-render.js
import { state } from '../../state.js';

export function renderDeepDive(product) {
  // Copy entire renderDeepDive function from render.js
  // Copy all helper functions it uses:
  // - renderDeepDiveGallery()
  // - renderDeepDiveSpecs()
  // - renderDeepDiveShowcase()
  // - renderDeepDiveCTA()
  // - splitTextIntelligently()
}
```

**Step 2.2: Create dd-styles.css**
- Extract lines 1840-3200 from base.css
- All classes starting with `.deep-dive-`
- Include lightbox styles if DD-specific

**Step 2.3: Update render.js**
```javascript
import { renderDeepDive } from './templates/deep-dive/dd-render.js';

// In renderSingleProduct():
case 'deep-dive': return renderDeepDive(product);
```

**Step 2.4: Load CSS dynamically**
```javascript
// In main.js or render.js
function loadTemplateCSS(template) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/src/templates/${template}/${template.replace('-','')}-styles.css`;
  document.head.appendChild(link);
}
```

**Step 2.5: TEST THOROUGHLY**
- Load a Deep Dive store
- Check all gallery features
- Check lightbox
- Check sticky CTA
- Check specs section
- Check mobile layout

### Phase 3: Extract Visual Menu (MEDIUM RISK)
**Same pattern as Phase 2**

**Functions to Extract:**
- `renderVisualMenu()`
- `renderMenuGallery()`
- `renderSimilarItems()`

**CSS to Extract:**
- Lines 1400-1840 from base.css
- Classes: `.food-card`, `.vm-*`, menu-specific styles

### Phase 4: Extract Quick Decision (MEDIUM RISK)
**Same pattern**

**Functions to Extract:**
- `renderQuickDecision()`

**CSS to Extract:**
- Lines 1000-1400 from base.css
- The "default" product card styles

### Phase 5: Clean Up (FINAL)
1. Remove extracted code from render.js (now ~200 lines)
2. Remove extracted CSS from base.css (now ~800 lines)
3. Verify all templates still work
4. Merge branch to main

---

## 🐛 DEBUG FORMULAS

### Formula 1: CSS Not Loading
**Symptom:** Template renders but looks unstyled
**Cause:** CSS file not loaded or wrong path
**Fix:**
```javascript
// Check if CSS loaded
const links = document.querySelectorAll('link[rel="stylesheet"]');
console.log('Loaded stylesheets:', [...links].map(l => l.href));
```

### Formula 2: Function Not Found
**Symptom:** `renderDeepDive is not a function`
**Cause:** Import path wrong or export missing
**Fix:**
```javascript
// Verify export exists
import * as ddModule from './templates/deep-dive/dd-render.js';
console.log('DD exports:', Object.keys(ddModule));
```

### Formula 3: State Not Available
**Symptom:** `Cannot read property 'store' of undefined`
**Cause:** State not imported in new module
**Fix:**
```javascript
// Each template module needs state import
import { state } from '../../state.js';
```

### Formula 4: CSS Conflicts After Extraction
**Symptom:** Styles from one template bleeding into another
**Cause:** Class names not properly prefixed
**Fix:** Search for unprefixed classes:
```bash
grep -E "^\.[a-z]+-[a-z]+" dd-styles.css | head -20
```

### Formula 5: Lightbox Broken
**Symptom:** Lightbox doesn't open or closes immediately
**Cause:** Event listeners not attached after dynamic load
**Fix:** Re-attach listeners after template renders:
```javascript
// After rendering template
document.querySelectorAll('.dd-gallery-thumb').forEach(thumb => {
  thumb.addEventListener('click', openLightbox);
});
```

### Formula 6: Build Fails After Extraction
**Symptom:** Vite/build error
**Cause:** Circular imports or missing exports
**Fix:**
```javascript
// Check for circular imports
// A imports B, B imports A = CIRCULAR
// Solution: Extract shared code to C, both import from C
```

---

## 📁 FILE LOCATION REFERENCE

### Render.js Function Locations (CURRENT)
| Function | Start Line | End Line | Template |
|----------|------------|----------|----------|
| `renderHeader()` | 7 | 30 | Shared |
| `renderFooter()` | 54 | 95 | Shared |
| `renderProductCard()` | 140 | 240 | Shared |
| `renderSingleProduct()` | 246 | 260 | Dispatcher |
| `renderQuickDecision()` | 265 | 321 | Quick Decision |
| `renderVisualMenu()` | 326 | 461 | Visual Menu |
| `renderDeepDive()` | 466 | ~800 | Deep Dive |
| `renderDeepDiveGallery()` | ~500 | ~550 | Deep Dive |
| `renderDeepDiveSpecs()` | ~550 | ~600 | Deep Dive |
| `renderDeepDiveCTA()` | ~700 | ~800 | Deep Dive |
| `splitTextIntelligently()` | ~800 | ~850 | Deep Dive |
| Lightbox functions | ~850 | 926 | Deep Dive (or shared?) |

### Base.css Section Locations (CURRENT)
| Section | Start Line | End Line | Approx Size |
|---------|------------|----------|-------------|
| CSS Variables | 1 | 100 | 100 lines |
| Base/Reset | 100 | 300 | 200 lines |
| Header/Footer | 300 | 600 | 300 lines |
| Product Cards (shared) | 600 | 1000 | 400 lines |
| Quick Decision | 1000 | 1400 | 400 lines |
| Visual Menu | 1400 | 1840 | 440 lines |
| **Deep Dive** | 1840 | 3200 | **1360 lines** |
| Lightbox | 3200 | 3716 | 516 lines |

---

## ⚠️ CRITICAL WARNINGS

### DO NOT:
1. ❌ Delete code before verifying new code works
2. ❌ Extract multiple templates at once
3. ❌ Change class names during extraction
4. ❌ Modify CSS properties during extraction
5. ❌ Skip testing after each phase

### DO:
1. ✅ Work on feature branch
2. ✅ Commit after each successful extraction
3. ✅ Test on actual store after each phase
4. ✅ Keep old code commented until verified
5. ✅ Check mobile AND desktop

---

## 🧪 TESTING CHECKLIST

### After Each Phase:
- [ ] Store loads without console errors
- [ ] Correct template renders
- [ ] All images display
- [ ] Gallery/lightbox works
- [ ] CTA buttons work
- [ ] Mobile layout correct
- [ ] No CSS bleeding between templates
- [ ] Cart functionality works
- [ ] Checkout flow works

### Template-Specific Tests:

**Deep Dive:**
- [ ] Title + stars above image
- [ ] Social icons (share/heart) work
- [ ] Gallery thumbnails work
- [ ] Lightbox opens/closes
- [ ] Caption overlay displays
- [ ] Specs section renders
- [ ] Sticky CTA on desktop
- [ ] Mobile CTA at bottom

**Visual Menu:**
- [ ] Food card layout
- [ ] Menu gallery
- [ ] Similar items section
- [ ] Price display

**Quick Decision:**
- [ ] Simple card layout
- [ ] Price and CTA visible
- [ ] Image display

**Portfolio-Booking:**
- [ ] Already isolated - should still work
- [ ] Booking modal opens
- [ ] Calendar works

---

## 📝 GIT COMMANDS

```bash
# Create feature branch
git checkout -b feature/template-isolation

# After each successful phase
git add -A
git commit -m "Phase X: Extract [template] to isolated module"

# If something breaks, rollback
git checkout -- .
# Or rollback to last commit
git reset --hard HEAD

# When all done
git checkout main
git merge feature/template-isolation
git push origin main
```

---

## 🔄 RECOVERY PROCEDURE

If extraction breaks something:

1. **Check console for errors**
   ```javascript
   // Open browser console, look for:
   // - Import errors
   // - Function not found
   // - CSS not loading
   ```

2. **Verify file paths**
   ```javascript
   // In browser network tab, check:
   // - Is CSS file loading? (200 status)
   // - Is JS file loading?
   ```

3. **Rollback if needed**
   ```bash
   git checkout -- store/src/render.js
   git checkout -- store/src/styles/base.css
   ```

4. **Start smaller**
   - If full function extraction fails
   - Try extracting just one helper function first
   - Build up incrementally

---

## 📊 SUCCESS METRICS

| Metric | Before | After Target |
|--------|--------|--------------|
| render.js lines | 926 | ~200 |
| base.css lines | 3716 | ~800 |
| Templates isolated | 1 (PBK) | 4 |
| CSS conflicts risk | High | Zero |
| Independent deployability | No | Yes |

---

## 🎯 NEXT STEPS FOR NEW CHAT

1. Read this document completely
2. Run `git status` to see current state
3. Create feature branch if not exists
4. Start with Phase 1 (shared utilities)
5. Test after each change
6. Commit frequently
7. Ask user to test on actual store

---

## 📞 CONTEXT FOR AI ASSISTANT

**Project:** JARI.ECOM V2 - E-commerce platform for Kenya/East Africa
**Tech Stack:** Vanilla JS storefront, React dashboard, Express API, PostgreSQL
**Current Task:** Template isolation for maintainability
**Risk Level:** Medium - Working on production code
**Approach:** Surgical, incremental, test-driven

**Key Files:**
- `store/src/render.js` - Main rendering (926 lines)
- `store/src/styles/base.css` - All CSS (3716 lines)
- `store/src/templates/` - Isolated templates
- `store/src/booking/` - Booking system (already isolated)

**Working Pattern:**
1. `read_file` with offset/length to examine sections
2. `edit_block` for surgical changes
3. `git commit` after each successful change
4. Test in browser before proceeding

---

*Document Created: January 19, 2026*
*Last Updated: January 19, 2026*
*Version: 1.0*
