# JARI.ECOM V2 - SYSTEM AUDIT REPORT
**Date:** January 13, 2026
**Status:** CRITICAL ISSUES FOUND

---

## 🔴 CRITICAL ISSUE #1: ProductsPage → API Mismatch

### Problem:
ProductsPage.jsx sends data in V1 format (flat fields), but API expects V2 format (JSONB)

### Dashboard ProductsPage sends:
```javascript
{
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  stockQuantity: 1000,
  isActive: true,
  templateType: 'quick-decision',
  category: '',
  galleryImages: [],
  storyMedia: [],
  testimonials: []
}
```

### API products.js expects (V2 schema):
```javascript
{
  template: 'quick-decision',   // NOT templateType
  data: {                       // JSONB - all product data goes here
    name, description, price, stock, category, testimonials, etc.
  },
  media: {                      // JSONB - all media goes here
    images: [],
    stories: []
  },
  status: 'active'              // NOT isActive boolean
}
```

### FIX NEEDED:
Rewrite ProductsPage.jsx to use V2 JSONB structure

---

## 🔴 CRITICAL ISSUE #2: SettingsPage → API Works BUT Field Mismatch

### Problem:
Settings saves correctly but public.js reads different field names

### SettingsPage saves (snake_case):
```javascript
{
  store_name: '',
  tagline: '',
  logo_url: '',
  hero_title: '',
  theme_slug: '',
  ...
}
```

### Public.js reads:
```javascript
store.config?.name        // NOT store_name
store.config?.logo        // NOT logo_url
store.config?.hero        // expects object, not hero_title
```

### FIX NEEDED:
Align field names across SettingsPage, stores route, and public route

---

## 🔴 CRITICAL ISSUE #3: Store Frontend Missing Template Renderers

### Problem:
render.js only has ONE generic product renderer.
No template-specific renderers for:
- Portfolio + Booking (service packages, booking form)
- Visual Menu (dietary tags, prep time, menu grid)
- Deep Dive (specifications, warranty, trust badges)
- Event Landing (date/time, venue, tickets)

### Current render.js:
- renderHeader() ✅
- renderProductsGrid() ✅
- renderSingleProduct() - GENERIC ONLY ❌
- renderGallery() ✅
- renderStories() ✅
- renderTestimonials() ✅

### FIX NEEDED:
Create template-specific renderers

---

## 🟡 ISSUE #4: Missing Template Field Definitions

### V1 had specific fields per template:
- **Quick Decision:** basic fields only
- **Portfolio + Booking:** service_packages[], booking_availability
- **Visual Menu:** dietary_tags[], prep_time, calories, allergens
- **Deep Dive:** specifications[], warranty_info, trust_badges[]
- **Event Landing:** event_date, venue, ticket_tiers[]

### V2 status:
ProductsPage.jsx only has:
- name, description, price, stock ✅
- galleryImages ✅
- storyMedia ✅
- testimonials ✅
- category ✅

**MISSING:**
- Service packages
- Dietary tags
- Specifications
- Event details
- Trust badges
- Warranty info
- Booking availability

---

## 🟡 ISSUE #5: API getAll Response Format

### productsAPI.getAll() expects:
```javascript
response.data?.products || []
```

### API returns:
```javascript
result.rows  // Direct array, NO .products wrapper
```

### FIX NEEDED:
Either change API to return `{ products: result.rows }` or change client expectation

---

## 📋 ACTION PLAN (In Order)

### Phase 1: Fix API Response Format
1. Update products.js GET / to return `{ products: result.rows }`
2. Update orders.js GET / to return `{ orders: result.rows }`
3. Test API responses

### Phase 2: Fix ProductsPage Data Structure
1. Rewrite form to use `data` and `media` JSONB fields
2. Add template-specific field sections
3. Fix handleSubmit to send correct format
4. Fix handleEdit to parse JSONB data

### Phase 3: Fix SettingsPage Field Names
1. Align with what public.js expects
2. Test save/load cycle

### Phase 4: Add Template-Specific Renderers to Store
1. Create renderQuickDecision()
2. Create renderPortfolioBooking()
3. Create renderVisualMenu()
4. Create renderDeepDive()
5. Create renderEventLanding()
6. Update renderSingleProduct() to dispatch by template

### Phase 5: Test Full Flow
1. Create product in dashboard
2. View in store
3. Test checkout
4. Verify order in dashboard

---

## 🗂️ FILE CHANGES REQUIRED

| File | Changes |
|------|---------|
| api/src/routes/products.js | Return `{ products: rows }` wrapper |
| api/src/routes/orders.js | Return `{ orders: rows }` wrapper |
| dashboard/src/pages/ProductsPage.jsx | Complete rewrite for V2 JSONB |
| dashboard/src/pages/SettingsPage.jsx | Align field names |
| api/src/routes/public.js | Align field name reads |
| store/src/render.js | Add 5 template renderers |

---

## ✅ WHAT'S WORKING

1. Authentication (login/register) ✅
2. JWT middleware ✅
3. Database connection ✅
4. Basic store creation on register ✅
5. Theme loading ✅
6. Dashboard navigation ✅
7. Dashboard styling ✅
