# JARI.ECOM V2 - DEEP DIVE HANDOVER
## Session: January 24, 2026
## Focus: Domain Setup, Landing Page, Story Functionality Fixes

---

## 🎯 SESSION SUMMARY

This session accomplished:
1. **Custom domain setup** for jarisolutionsecom.store
2. **Landing page creation** with updated pricing structure
3. **Critical bug fixes** for story functionality across templates
4. **Progress bar animation fix** for Instagram-style stories

---

## 🌐 DOMAIN CONFIGURATION (COMPLETED)

### Current DNS Setup (Netlify DNS)

| Custom Domain | Points To | Purpose |
|---------------|-----------|---------|
| `jarisolutionsecom.store` | jariecommstore.netlify.app | Store + Landing Page |
| `www.jarisolutionsecom.store` | jariecommstore.netlify.app | Store + Landing Page |
| `dashboard.jarisolutionsecom.store` | jariecomm.netlify.app | Admin Dashboard |

### Netlify Sites

| Site | Content | Custom Domain |
|------|---------|---------------|
| `jariecommstore.netlify.app` | Store frontend + Landing page | jarisolutionsecom.store |
| `jariecomm.netlify.app` | React Dashboard | dashboard.jarisolutionsecom.store |

### Railway API
- URL: `https://jari-ecom-v2-production.up.railway.app`
- CORS configured for all domains

### Environment Variables (Both Netlify Sites)
```
VITE_API_URL=https://jari-ecom-v2-production.up.railway.app
```

**IMPORTANT:** Do NOT set `VITE_STORE_SLUG` on the store site - this breaks the landing page routing!

---

## 🏠 LANDING PAGE

### How It Works
- When visiting `jarisolutionsecom.store` WITHOUT `?store=` parameter → Shows landing page
- When visiting `jarisolutionsecom.store/?store=xxx` → Shows that store

### Files Created
```
store/src/landing/
├── landing.js    # HTML template + handlers
└── landing.css   # Apple-inspired styles
```

### Key Changes to Existing Files
- `store/src/main.js` - Added landing page import and routing logic
- `store/src/state.js` - Changed `getSlug()` to return `null` instead of `'demo'`

### Routing Logic (in main.js)
```javascript
const slug = getSlug();

if (!slug) {
  // Render landing page
  document.title = 'Jari.Ecom - E-commerce Made Simple for Kenyan Sellers';
  app.innerHTML = renderLandingPage();
  initLandingHandlers();
  return;
}
// ... rest handles store rendering
```

---

## 💰 UPDATED PRICING STRUCTURE

### Monthly Subscription
| Component | Price |
|-----------|-------|
| Base Platform | KES 1,200/mo |
| + M-Pesa STK Push | +KES 300/mo |
| + WhatsApp Auto-Reply | +KES 80/mo |
| + Advanced Analytics | +KES 200/mo |
| + Priority Support | +KES 500/mo |

**Most common:** KES 1,500/mo (Base + M-Pesa)

### One-Time Purchases

**Product Cards:**
| Bundle | Cards | Price |
|--------|-------|-------|
| Included | 3 | FREE |
| Starter Pack | 7 total | KES 350 |
| Growth Pack | 10 total | KES 550 |
| Pro Pack | 15 total | KES 850 |

**Themes:**
| Theme | Price |
|-------|-------|
| First Theme | FREE |
| Quick Sell | KES 500 |
| Visual Menu | KES 600 |
| Deep Dive | KES 800 |
| Events/Booking | KES 1,000 |

---

## 🐛 BUGS FIXED THIS SESSION

### Bug 1: Landing Page CSS Not Loading
**Symptom:** Landing page HTML rendered but no styles
**Cause:** Dynamic CSS loading (`link.href = '/src/landing/landing.css'`) doesn't work in Vite production build
**Fix:** Import CSS directly in main.js so Vite bundles it
```javascript
import './landing/landing.css';
```

### Bug 2: Landing Page Not Showing
**Symptom:** Store showing instead of landing page when visiting root URL
**Cause:** `getSlug()` returned `'demo'` as fallback, and Netlify had `VITE_STORE_SLUG` env var set
**Fix:** 
1. Changed `getSlug()` to return `null` instead of `'demo'`
2. Removed `VITE_STORE_SLUG` from Netlify environment variables

### Bug 3: Stories Not Working (Deep Dive, Quick Decision, Visual Menu)
**Symptom:** Story bubbles rendered but clicking did nothing
**Cause:** Multiple issues:
1. `initStoryHandlers(product)` was passing whole product instead of stories array
2. Click handler was looking for `data-story-index` on wrong element (`.story-bubble` instead of `.story-item`)
3. `initDeepDiveHandlers()` and `initQuickDecisionHandlers()` were NEVER being called in main.js

**Fix:**
1. Changed to `initStoryHandlers(product.media?.stories || [])`
2. Changed click target from `.story-bubble` to `.story-item`
3. Added template-specific handler imports and calls in main.js

### Bug 4: All Progress Bars Animating Together
**Symptom:** When viewing stories, all progress bars animated simultaneously
**Cause:** Not resetting transition property on non-active bars before setting width
**Fix:** Complete rewrite of `showStory()` function:
- Reset ALL bars with `transition: none` first
- Set viewed bars to 100%, unviewed to 0%
- Only THEN animate current bar with transition
- Added auto-advance timer (5 seconds)

---

## 📁 KEY FILES MODIFIED

### main.js Changes
```javascript
// Added imports
import { initDeepDiveHandlers } from './templates/deep-dive/dd-handlers.js';
import { initQuickDecisionHandlers } from './templates/quick-decision/qd-handlers.js';
import './landing/landing.css';

// Added template handler calls
if (product.template === 'deep-dive') {
  initDeepDiveHandlers(product);
}
if (product.template === 'quick-decision') {
  initQuickDecisionHandlers(product);
}
```

### state.js Changes
```javascript
// Before (broken)
return params.get('store') || import.meta.env.VITE_STORE_SLUG || 'demo';

// After (fixed)
return params.get('store') || import.meta.env.VITE_STORE_SLUG || null;
```

### media-components.js Changes
- Fixed click target selector
- Complete rewrite of progress bar logic
- Added auto-advance timer
- Added proper cleanup on close

---

## 🔧 DEBUG FORMULAS

### Formula 1: API Response Structure
```javascript
// ✅ CORRECT
const response = await settingsAPI.getAll();
const store = response.data;
const slug = store.slug;

// ❌ WRONG
const store = response.data.store;     // undefined
const store = response.data.settings;  // undefined
```

### Formula 2: Template Handler Pattern
Every template needs THREE things:
1. **Import** in main.js: `import { initXxxHandlers } from './templates/xxx/xxx-handlers.js'`
2. **Conditional call** in main.js: `if (product.template === 'xxx') { initXxxHandlers(product); }`
3. **Handler function** that calls shared handlers: `initStoryHandlers(media.stories || [])`

### Formula 3: Vite CSS in Production
```javascript
// ❌ WRONG - Dynamic link doesn't work in production
const link = document.createElement('link');
link.href = '/src/styles/something.css';

// ✅ CORRECT - Import at top so Vite bundles it
import './styles/something.css';
```

### Formula 4: Progress Bar Animation
```javascript
// ❌ WRONG - All bars animate
progressBars.forEach((bar, i) => {
  if (i === index) {
    bar.style.transition = 'width 5s linear';
    bar.style.width = '100%';
  }
});

// ✅ CORRECT - Reset first, then animate only current
progressBars.forEach((bar, i) => {
  bar.style.transition = 'none';  // Reset ALL
  bar.style.width = i < index ? '100%' : '0%';
});
const currentBar = progressBars[index];
currentBar.offsetHeight; // Force reflow
currentBar.style.transition = 'width 5s linear';
setTimeout(() => currentBar.style.width = '100%', 50);
```

### Formula 5: Landing Page Routing
```javascript
// In getSlug()
return params.get('store') || import.meta.env.VITE_STORE_SLUG || null;
// Returns null if no store param → triggers landing page

// In init()
if (!slug) {
  // Show landing page
  return;
}
// Show store
```

### Formula 6: Git on Windows
```powershell
# Use semicolons, NOT &&
cd C:\path; git add -A; git commit -m "message"; git push origin main
```

---

## 📊 COMMITS THIS SESSION

```
aa4691a Fix-story-progress-bar-animate-only-current-bar-add-auto-advance
c059f9a Fix-add-missing-template-handler-calls-for-DeepDive-and-QuickDecision
257ce27 Fix-story-handlers-pass-stories-array-and-fix-click-target
5032b8c Add-Cloudflare-migration-and-domain-notes-to-idea-shelf
101be40 Fix-landing-CSS-import-for-Vite-build
7e1f9e7 Fix-getSlug-to-return-null-for-landing-page
bfd1dd9 Add-landing-page-with-updated-pricing-structure
a66e86d Update-store-URLs-to-custom-domain
```

---

## 🚀 CURRENT STATE

### Working ✅
- [x] Landing page at jarisolutionsecom.store
- [x] Dashboard at dashboard.jarisolutionsecom.store
- [x] Stories working on ALL templates (PBK, Deep Dive, Quick Decision, Visual Menu)
- [x] Progress bar animating correctly (one at a time)
- [x] Auto-advance after 5 seconds
- [x] Custom domain SSL certificates

### Pending / Future 📋
- [ ] 3D elements for landing page (discussed but not implemented)
- [ ] Cloudflare migration for better Africa CDN (on idea shelf)
- [ ] Custom domains for end-user stores (planned feature)

---

## 🗂️ FILE STRUCTURE REFERENCE

```
store/src/
├── main.js                    # Main entry - routing & handler init
├── state.js                   # Global state + getSlug()
├── landing/
│   ├── landing.js             # Landing page HTML
│   └── landing.css            # Landing page styles
├── shared/
│   └── media-components.js    # Gallery, Stories, Story Viewer
└── templates/
    ├── deep-dive/
    │   ├── dd-render.js       # Template HTML
    │   └── dd-handlers.js     # Event handlers
    ├── quick-decision/
    │   ├── qd-render.js
    │   └── qd-handlers.js
    ├── visual-menu/
    │   ├── vm-render.js
    │   └── vm-handlers.js
    ├── portfolioBooking.js    # PBK render (self-contained)
    └── portfolioBookingHandlers.js  # PBK handlers
```

---

## 🔑 CRITICAL REMINDERS

1. **Never set VITE_STORE_SLUG on Netlify store site** - breaks landing page
2. **Always call template-specific handlers** in main.js for each template
3. **Import CSS at top level** for Vite to bundle it
4. **Stories need both render AND handler init** to work
5. **Progress bars need transition:none reset** before animating

---

## 📞 CONTACTS & URLS

- **Store:** https://jarisolutionsecom.store
- **Dashboard:** https://dashboard.jarisolutionsecom.store
- **API:** https://jari-ecom-v2-production.up.railway.app
- **GitHub:** https://github.com/meshack-abwao/jari-ecom-v2
- **WhatsApp:** +254 751 433 625
- **Email:** support@jarisolutions.com

---

*Last Updated: January 24, 2026*
*Session Duration: ~3 hours*
