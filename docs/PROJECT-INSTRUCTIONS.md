# Jari.Ecom V2 - Project Instructions

> **Purpose:** Feed this document into a Claude Project to maintain full context across all conversations.
> **Last Updated:** January 27, 2026
> **Current Phase:** Navigation Enhancement Complete - Pending Netlify Deploy

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

## 2. CURRENT STATUS (January 27, 2026)

### 🚨 IMPORTANT: PENDING DEPLOY
**All changes committed to GitHub but NOT deployed to Netlify (out of credits).**
**Push tomorrow (Jan 28) when credits reset.**

### ✅ COMPLETED FEATURES

**Templates (5 Complete)**
| Template | Purpose | Status |
|----------|---------|--------|
| Deep Dive | High-value products with specs | ✅ Complete |
| Quick Decision | Impulse buys, simple products | ✅ Complete |
| Portfolio/Booking | Services (photographers, consultants) | ✅ Complete |
| Visual Menu | Food/restaurant ordering | ✅ Complete |
| Event Landing | Events and tickets | ✅ Complete |

**Navigation System (NEW - Jan 27)**
| Feature | Description | Status |
|---------|-------------|--------|
| Breadcrumbs | Sticky pill with back button + trail | ✅ Complete |
| Related Products | Template-aware JTBD cards | ✅ Complete |
| Product Nav | Prev/Next at page bottom | ✅ Complete |
| Enhanced Footer | Contact, social, back-to-top | ✅ Complete |
| Dashboard Nav | Collapsible section groups | ✅ Complete |
| Accessibility | Skip links, ARIA, focus states | ✅ Complete |

---

## 3. NAVIGATION ARCHITECTURE (KALBACH PRINCIPLES)

### Structural Navigation
- **Breadcrumbs** - Shows position: Store > Category > Product
- **Back Button** - Integrated in breadcrumb pill
- **Category Links** - Click to filter collection

### Associative Navigation  
- **Related Products** - Cross-selling by category
- **Product Navigation** - Sequential (Prev/Next) browsing

### Utility Navigation
- **Footer Links** - Contact, social, policies
- **Back to Top** - Quick scroll return
- **Skip Link** - Keyboard accessibility

### Template-Specific JTBD Messaging
| Template | Section Title | CTA Text |
|----------|--------------|----------|
| Deep Dive | "You might also like" | "View Details →" |
| Visual Menu | "More from the menu" | "View Item →" |
| Portfolio Booking | "Other services" | "Learn More →" |
| Quick Decision | "More products" | "Get This →" |

---

## 4. KEY DESIGN PRINCIPLES

### Apple Design Language
- Glassmorphism (backdrop-filter: blur)
- Subtle shadows (0 2px 12px rgba(0,0,0,0.08))
- Smooth transitions (0.2s ease)
- Pill-shaped buttons (border-radius: full)
- SF Pro / Inter typography

### CSS Variable System (MANDATORY)
```css
/* NEVER use hardcoded values - ALWAYS use variables */
--fs-micro: 10px;
--fs-tiny: 11px;
--fs-small: 13px;
--fs-body: 15px;
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--radius-sm: 12px;
--radius: 16px;
--radius-lg: 20px;
--radius-full: 9999px;
```

### Template CSS Prefixes
- Deep Dive: `dd-`
- Quick Decision: (none, uses base)
- Portfolio Booking: `pbk-`
- Visual Menu: `vm-`
- Event Landing: `el-`

---

## 5. CRITICAL TECHNICAL PATTERNS

### API Response Pattern (CRITICAL)
```javascript
// ✅ CORRECT
const response = await settingsAPI.getAll();
const store = response.data;  // Store object is HERE
const slug = store.slug;

// ❌ WRONG
const store = response.data.store;  // NOPE
```

### Git Commands (Windows)
```powershell
# Use semicolons, NOT &&
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "message"

# Or use -C flag
git -C C:\Users\ADMIN\Desktop\jari-ecom-v2 commit -m "Message-With-Hyphens"
```

### Smart Sticky CTA Pattern
```javascript
// Gracefully avoids footer overlap - in main.js
function initSmartStickyCTA() {
  const stickyCTA = document.querySelector('.sticky-cta, .pbk-sticky-cta, .vm-sticky-cta, .dd-sticky-cta');
  const footer = document.querySelector('footer');
  // ... scroll handler adjusts bottom position
}
```

### Global Navigation Functions
```javascript
// Defined in main.js, used in onclick handlers
window.showCollection = function() { ... }
window.filterByCategory = function(categoryName) { ... }
window.viewRelatedProduct = function(productId) { ... }
```

---

## 6. FILE REFERENCE

### Navigation Components
| Component | File |
|-----------|------|
| Breadcrumb | `store/src/render.js` → `renderBreadcrumb()` |
| Product Nav | `store/src/render.js` → `renderProductNav()` |
| Related Products | `store/src/shared/related-products.js` |
| Footer | `store/src/render.js` → `renderFooter()` |
| Smart Sticky | `store/src/main.js` → `initSmartStickyCTA()` |

### CSS Files
| Purpose | File |
|---------|------|
| Store base styles | `store/src/styles/base.css` |
| Footer styles | `store/src/styles/footer.css` |
| Dashboard styles | `dashboard/src/styles/globals.css` |
| PBK template | `store/src/templates/portfolioBooking.css` |
| VM template | `store/src/templates/visual-menu/vm-styles.css` |
| DD template | `store/src/templates/deep-dive/dd-styles.css` |

### Dashboard Navigation
| Component | File |
|-----------|------|
| Layout/Sidebar | `dashboard/src/components/Layout.jsx` |
| Nav styles | `dashboard/src/styles/globals.css` |

---

## 7. RECENT SESSION COMMITS (Jan 27, 2026)

```
d58caae RelatedProducts-Title-overlay-only-content-below-Apple-card-style
c1f619d CTA-Add-smart-sticky-behavior-avoids-footer-all-templates
eff2fa2 ProductNav-Move-to-bottom-before-footer-all-templates
9f9a7d4 Breadcrumb-Center-justify-remove-box-add-back-padding
fd89da7 Dashboard-Add-collapsible-nav-sections
e25433c A11y-Add-ARIA-labels-to-breadcrumb-and-product-nav
711849e A11y-Add-skip-link-CSS-and-focus-states
576ea5d A11y-Add-skip-to-main-content-link
... (33 total commits this session)
```

---

## 8. ENVIRONMENT URLS

| Environment | URL |
|-------------|-----|
| Dashboard | https://dashboard.jarisolutionsecom.store |
| Store Landing | https://jarisolutionsecom.store |
| Test Store | https://jarisolutionsecom.store/nimoration |
| API | https://jari-api-production.up.railway.app |
| GitHub | https://github.com/meshack-abwao/jari-ecom-v2 |

---

## 9. DEBUGGING QUICK REFERENCE

| Problem | Solution |
|---------|----------|
| CSS not applying | Check specificity, append new styles, use !important |
| Git && fails | Use semicolons or git -C flag |
| CTA overlaps footer | Use initSmartStickyCTA() |
| Import not found | Count directory levels carefully |
| Template code not running | Check exact template string names |
| Global function undefined | Ensure assigned to window object |

See `docs/DEBUG-FORMULAS.md` for complete debugging guide.

---

## 10. NEXT SESSION CHECKLIST

1. ✅ Check if Netlify credits reset
2. ✅ Push to deploy: `git push origin main`
3. ✅ Test all navigation features live
4. ✅ Run `git log --oneline -10` to verify state
5. ✅ Check `docs/HANDOVER-JAN-27-2026.md` for full context

---

## 11. DOCUMENTATION INDEX

| Document | Purpose |
|----------|---------|
| `PROJECT-INSTRUCTIONS.md` | This file - main reference |
| `HANDOVER-JAN-27-2026.md` | Latest session handover |
| `DEBUG-FORMULAS.md` | Debugging patterns |
| `IDEA-SHELF.md` | Future feature ideas |
| `ARCHITECTURE.md` | System architecture |

---

**End of Project Instructions**
*Last Updated: January 27, 2026 - Navigation Enhancement Session*
