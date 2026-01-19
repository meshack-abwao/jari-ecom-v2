# JARI.ECOM V2 - Template Isolation Project
## Comprehensive Handover Document v2.1
### Last Updated: January 19, 2026

---

## 🎯 PROJECT OBJECTIVE

Surgically separate the monolithic storefront code into isolated, independent template modules. Each template (Quick Decision, Deep Dive, Visual Menu, Portfolio-Booking, Event Landing) should be able to evolve independently without affecting others.

---

## ✅ COMPLETED PHASES (as of Jan 19, 2026)

| Phase | Description | Commit | Status |
|-------|-------------|--------|--------|
| Phase 1 | Extract shared utilities | `749c133` | ✅ Done |
| Phase 2a | Create Deep Dive module | `7aa3f2e` | ✅ Done |
| Phase 2b | Wire Deep Dive to dispatcher | `89c3215` | ✅ Done |
| Phase 2c | Add missing imports | `7f809c2` | ✅ Done |
| Phase 3 | Create Visual Menu module | `eb4014b` | ✅ Done |
| Phase 4 | Create Quick Decision module | `5baeedc` | ✅ Done |
| Phase 5a | Remove old renderQuickDecision | `f157e41` | ✅ Done |
| Phase 5b | Remove dead VM+DD code | `83ca6ca` | ✅ Done |
| Phase 6a | Create Event Landing module | `b02c38b` | ✅ Done |
| Phase 6b | Wire Event Landing to dispatcher | `b3caec8` | ✅ Done |
| Phase 6c | Remove old Event Landing code | `18c9468` | ✅ Done |

### 🎉 JS ISOLATION COMPLETE!
- `render.js`: 926 → **289 lines** (-69%)
- Templates isolated: 1 → **5** (QD, DD, VM, EL, PBK)
- Shared modules: **6** (utils, media, policy, testimonials, quantity, index)

---

## 📊 CURRENT STATE (Post Phase 6 - JS Complete)

### File Sizes
| File | Lines | Size | Status |
|------|-------|------|--------|
| `store/src/render.js` | **289 lines** | 12KB | ✅ JS Isolation Complete |
| `store/src/styles/base.css` | 3,716 lines | 84KB | ❌ CSS not yet split |

### Current Architecture
```
store/src/
├── render.js              # SLIM DISPATCHER (~289 lines) ✅
│   ├── renderHeader()           # Shared
│   ├── renderFooter()           # Shared
│   ├── renderProductCard()      # Shared (collection)
│   ├── renderSingleProduct()    # Dispatcher
│   └── renderError()            # Error display
│
├── shared/                # ✅ Extracted utilities
│   ├── index.js
│   ├── utils.js
│   ├── media-components.js
│   ├── policy-modals.js
│   ├── testimonials.js
│   └── quantity-controls.js
│
├── templates/
│   ├── quick-decision/    # ✅ ISOLATED
│   │   ├── index.js
│   │   ├── qd-render.js
│   │   └── qd-handlers.js
│   │
│   ├── deep-dive/         # ✅ ISOLATED
│   │   ├── index.js
│   │   ├── dd-render.js
│   │   ├── dd-handlers.js
│   │   └── dd-showcase-viewer.js
│   │
│   ├── visual-menu/       # ✅ ISOLATED
│   │   ├── index.js
│   │   ├── vm-render.js
│   │   └── vm-handlers.js
│   │
│   ├── event-landing/     # ✅ ISOLATED (NEW)
│   │   ├── index.js
│   │   ├── el-render.js
│   │   └── el-handlers.js
│   │
│   └── portfolio-booking/ # ✅ WAS ALREADY ISOLATED
│       ├── portfolioBooking.js
│       ├── portfolioBooking.css
│       └── portfolioBookingHandlers.js
│
├── styles/
│   └── base.css           # ❌ MONOLITH - 3716 lines (CSS extraction pending)
│
└── booking/               # ✅ ALREADY ISOLATED
```

---

## 🔴 REMAINING WORK

### Phase 7-9: CSS Extraction (OPTIONAL - Lower Priority)
**Goal:** Split base.css (3716 lines) into template-specific files

| Phase | Task | Lines to Extract |
|-------|------|------------------|
| Phase 7 | Extract Deep Dive CSS | ~1360 lines |
| Phase 8 | Extract Visual Menu CSS | ~440 lines |
| Phase 9 | Extract Quick Decision CSS | ~400 lines |

**Target:** base.css reduced to ~800 lines (shared only)

**Note:** CSS extraction is OPTIONAL. The JS isolation is complete and working.
The CSS is already prefixed and working correctly. CSS extraction provides:
- Slightly faster load times (load only needed CSS)
- Easier CSS maintenance
- But also adds complexity (dynamic CSS loading)

### Phase 10: CSS Prefix Audit (OPTIONAL)
Ensure all templates use proper prefixes to prevent conflicts.

---

## 🏗️ TARGET ARCHITECTURE (End Goal)

```
store/src/
├── render.js              # SLIM DISPATCHER (~200 lines)
│
├── shared/                # ✅ DONE
│
├── templates/
│   ├── quick-decision/
│   │   ├── qd-render.js   # ✅ DONE
│   │   ├── qd-handlers.js # ✅ DONE
│   │   └── qd-styles.css  # ❌ TODO
│   │
│   ├── deep-dive/
│   │   ├── dd-render.js   # ✅ DONE
│   │   ├── dd-handlers.js # ✅ DONE
│   │   └── dd-styles.css  # ❌ TODO
│   │
│   ├── visual-menu/
│   │   ├── vm-render.js   # ✅ DONE
│   │   ├── vm-handlers.js # ✅ DONE
│   │   └── vm-styles.css  # ❌ TODO
│   │
│   ├── event-landing/     # ❌ TODO
│   │   ├── el-render.js
│   │   ├── el-handlers.js
│   │   └── el-styles.css
│   │
│   └── portfolio-booking/ # ✅ DONE
│
└── styles/
    └── base.css           # Target: ~800 lines (shared only)
```

---

## 📋 CSS CLASS PREFIXES

Each template MUST use its own prefix to prevent conflicts:

| Template | CSS Prefix | Example Classes |
|----------|------------|-----------------|
| Quick Decision | `.qd-` | `.qd-card`, `.qd-price` |
| Deep Dive | `.deep-dive-` | `.deep-dive-hero`, `.deep-dive-specs` |
| Visual Menu | `.vm-` or `.food-` | `.vm-card`, `.food-card` |
| Portfolio-Booking | `.pbk-` | `.pbk-hero`, `.pbk-packages` |
| Event Landing | `.el-` | `.el-tickets`, `.el-venue` |
| Shared | No prefix | `.header`, `.footer`, `.btn` |

---

## 🐛 DEBUG FORMULAS

### Formula 1: Import Not Found
**Symptom:** `Module not found` or `is not defined`
**Cause:** Wrong import path or missing export
**Fix:**
```javascript
// Verify the export exists
import * as module from './path.js';
console.log('Available exports:', Object.keys(module));
```

### Formula 2: Function Called But Nothing Renders
**Symptom:** White screen, no errors
**Cause:** Function returns undefined or dispatcher not routing correctly
**Fix:**
```javascript
// Add logging to dispatcher
console.log(`[Render] Template: ${template}, Product:`, product.data?.name);
```

### Formula 3: CSS Not Applying
**Symptom:** Elements render but look unstyled
**Cause:** CSS file not loaded or class names don't match
**Fix:**
```javascript
// Check loaded stylesheets
[...document.styleSheets].forEach(s => console.log(s.href));
// Check element classes
console.log(document.querySelector('.deep-dive-hero')?.className);
```

### Formula 4: State Undefined
**Symptom:** `Cannot read property 'store' of undefined`
**Cause:** State not imported in isolated module
**Fix:**
```javascript
// Each template module needs:
import { state } from '../../state.js';
```

### Formula 5: API Response Pattern (CRITICAL)
**Symptom:** `Cannot read property 'slug' of undefined`
**Cause:** Wrong data access pattern
**Fix:**
```javascript
// CORRECT pattern for settingsAPI.getAll()
const response = await settingsAPI.getAll();
const store = response.data;  // ✅ Store is DIRECTLY at response.data
const slug = store.slug;      // ✅ CORRECT

// WRONG patterns:
const store = response.data.store;     // ❌ WRONG
const store = response.data.settings;  // ❌ WRONG
```

### Formula 6: Template Not Switching
**Symptom:** Wrong template renders for product
**Cause:** Product doesn't have `template` field set
**Fix:**
```javascript
// Check product template field
console.log('Product template:', product.template);
// Default is 'quick-decision' if not set
```

### Formula 7: Handlers Not Working After Render
**Symptom:** Buttons don't respond to clicks
**Cause:** Event listeners not attached after dynamic render
**Fix:**
```javascript
// After rendering, re-attach handlers
import { initDeepDiveHandlers } from './templates/deep-dive/dd-handlers.js';
// Call after innerHTML is set
initDeepDiveHandlers();
```

### Formula 8: CSS Bleeding Between Templates
**Symptom:** Styles from one template affecting another
**Cause:** Generic class names without prefix
**Fix:**
```css
/* BAD - generic names */
.card { }
.price { }

/* GOOD - prefixed names */
.dd-card { }
.dd-price { }
```

---

## 🔧 GIT COMMANDS (Windows PowerShell)

```powershell
# Check status
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -5

# Commit (use .bat file for complex messages)
# Create commit.bat with: git add -A && git commit -m "message"

# Rollback single file
git checkout -- store/src/render.js

# Rollback to specific commit
git reset --hard <commit-hash>

# Create feature branch
git checkout -b feature/branch-name

# Merge to main
git checkout main
git merge feature/branch-name
git push origin main
```

---

## 📁 KEY FILE LOCATIONS

### render.js Current Structure (527 lines)
| Function | Lines | Purpose |
|----------|-------|---------|
| Imports | 1-5 | Template imports |
| `renderHeader()` | 10-33 | Shared header |
| `renderHeroCTAs()` | 35-49 | Hero buttons |
| `renderFooter()` | 54-72 | Shared footer |
| `renderStorePolicyModals()` | 74-109 | Store policy modals |
| `renderProductsGrid()` | 114-155 | Collection page |
| `renderProductCard()` | 157-204 | Product card |
| `renderStoreTestimonials()` | 207-244 | Store testimonials |
| `renderSingleProduct()` | 249-263 | **DISPATCHER** |
| `renderEventLanding()` | 273-347 | ⚠️ Not isolated |
| Helper functions | 350-520 | Used by Event Landing |
| `renderError()` | 520-527 | Error display |

### base.css Current Structure (3716 lines)
| Section | Start | End | Lines |
|---------|-------|-----|-------|
| CSS Variables | 1 | ~100 | 100 |
| Base/Reset | ~100 | ~300 | 200 |
| Header/Footer | ~300 | ~600 | 300 |
| Product Cards | ~600 | ~1000 | 400 |
| Quick Decision | ~1000 | ~1400 | 400 |
| Visual Menu | ~1400 | ~1840 | 440 |
| **Deep Dive** | ~1840 | ~3200 | **1360** |
| Lightbox | ~3200 | ~3716 | 516 |

---

## ⚠️ CRITICAL WARNINGS

### DO NOT:
1. ❌ Delete code before verifying new code works
2. ❌ Extract multiple templates at once
3. ❌ Change class names during extraction (breaks CSS)
4. ❌ Modify CSS properties during extraction
5. ❌ Skip testing after each phase
6. ❌ Forget to commit after each successful change

### DO:
1. ✅ Read file before editing (`read_file` with offset/length)
2. ✅ Use surgical edits (`edit_block` with exact string match)
3. ✅ Commit after EVERY successful change
4. ✅ Test on actual store after each phase
5. ✅ Keep old code until new code verified
6. ✅ Check both mobile AND desktop

---

## 🎯 NEXT STEPS FOR NEW CHAT

1. Read this document completely
2. Run `git status` and `git log --oneline -10`
3. Check current render.js line count
4. Continue from next incomplete phase
5. Test after each change
6. Commit frequently
7. Update this document with progress

---

## 📞 QUICK CONTEXT

**Project:** JARI.ECOM V2 - E-commerce for Kenya/East Africa
**Tech Stack:** Vanilla JS storefront, React dashboard, Express API, PostgreSQL
**Current Task:** Template isolation + CSS extraction
**Branch:** main (feature branches merged)

---

*Document Version: 2.0*
*Last Updated: January 19, 2026*
*Phases Completed: 1, 2a, 2b, 2c, 3, 4, 5a, 5b*
