# Jari.Ecom V2 - Complete Data Flow Audit
Generated: 2026-01-13

## 1. DATABASE SCHEMA

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | Unique email |
| password_hash | VARCHAR | bcrypt hash |
| profile | JSONB | { business_name, phone, etc } |
| created_at | TIMESTAMP | |

### stores
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| slug | VARCHAR | Unique store URL slug |
| config | JSONB | All store settings (see below) |
| created_at | TIMESTAMP | |

### store.config JSONB fields:
- store_name / storeName / name
- tagline
- logo_text / logoText
- logo_url / logoUrl
- hero_title / heroTitle
- hero_subtitle / heroSubtitle
- hero_photo_url / heroPhotoUrl
- header_bg_url / headerBgUrl
- hero_cta_primary_text / heroCtaPrimaryText
- hero_cta_primary_link / heroCtaPrimaryLink
- hero_cta_secondary_text / heroCtaSecondaryText
- hero_cta_secondary_link / heroCtaSecondaryLink
- show_testimonials
- testimonials: [{ name, role, quote }]
- privacy_policy / privacyPolicy
- terms_of_service / termsOfService
- refund_policy / refundPolicy
- font_family / fontFamily
- theme_slug / themeSlug / theme / theme_color

### products
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| store_id | UUID | Foreign key to stores |
| template | VARCHAR | Template type |
| data | JSONB | Product data (see below) |
| media | JSONB | Images/stories |
| sort_order | INTEGER | Display order |
| status | VARCHAR | 'active' / 'draft' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### product.data JSONB fields (varies by template):
Common:
- name
- price
- description
- stock
- category

Template-specific:
- quick-decision: storyTitle, testimonials, policies
- portfolio-booking: packages[], bookingInstructions
- visual-menu: menuItems[], displayStyle
- deep-dive: specs, faqs, comparisons
- catalog-navigator: variants[], filters

### product.media JSONB:
- images: [url, url, ...]
- stories: [{ url, type, caption }, ...]

### orders
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| store_id | UUID | Foreign key to stores |
| product_id | UUID | Foreign key to products |
| order_number | VARCHAR | e.g. "JE-MKBY40BO-UIAE" |
| status | VARCHAR | 'pending'/'paid'/'delivered'/'cancelled' |
| customer | JSONB | { name, phone, location } |
| items | JSONB | [{ product_id, product_name, quantity, unit_price, total }] |
| payment | JSONB | { method, status } |
| notes | TEXT | Optional notes |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## 2. API ENDPOINTS

### Public Routes (no auth)

#### GET /s/:slug
Returns store data for customer-facing store
```json
{
  "store": {
    "slug": "nimoration",
    "name": "Store Name",
    "tagline": "...",
    "logo_text": "S",
    "logo_url": null,
    "hero": { "title", "subtitle", "photo_url", "background_url", "cta_primary", "cta_secondary" },
    "show_testimonials": true,
    "testimonials": [],
    "policies": { "privacy", "terms", "refund" },
    "font_family": "Inter"
  },
  "theme": {
    "slug": "warm-sunset",
    "name": "Warm Sunset",
    "colors": { "primary", "gradient" }
  },
  "products": [
    { "id", "template", "data", "media" }
  ]
}
```

#### GET /s/:slug/products/:productId
Returns single product

#### POST /api/orders
Create order (public)
Request:
```json
{
  "slug": "store-slug",
  "productId": "uuid",
  "customer": { "name", "phone", "location" },
  "items": [{ "product_id", "product_name", "quantity", "unit_price", "total" }],
  "payment": { "method": "mpesa|cod", "status": "pending" }
}
```
Response:
```json
{
  "id": "uuid",
  "order_number": "JE-XXXX-XXXX",
  "status": "pending",
  ...
}
```

### Auth Routes

#### POST /api/auth/register
Request: { email, password, business_name }
Response: { token, user }

#### POST /api/auth/login
Request: { email, password }
Response: { token, user }

#### GET /api/auth/me (requires auth)
Response: { id, email, profile }

### Protected Routes (require auth header)

#### GET /api/stores
Get user's stores

#### PUT /api/stores/:id
Update store config

#### GET /api/products
Get products for user's store

#### POST /api/products
Create product

#### PUT /api/products/:id
Update product

#### DELETE /api/products/:id
Delete product

#### GET /api/orders
Get orders for user's store

#### PUT /api/orders/:id
Update order status

#### GET /api/orders/stats
Get order statistics

---

## 3. FRONTEND DATA FLOW

### Store Frontend (customer-facing)

1. **init()** in main.js
   - Gets slug from URL param or env var
   - Calls fetchStore(slug)
   - Stores result in state: { store, theme, products }
   - IMPORTANT: store.slug is added manually!

2. **state.js**
   ```js
   state = {
     store: null,      // { slug, name, tagline, ... }
     theme: null,      // { slug, colors }
     products: [],     // [{ id, template, data, media }]
     currentProduct: null,
     quantity: 1,
     selectedPrice: null,  // For package/ticket selection
     paymentMethod: null
   }
   ```

3. **checkout.js - completeOrder()**
   - Gets { store, currentProduct, quantity, selectedPrice } from state
   - Builds orderData
   - Calls createOrder(store.slug, orderData)

4. **api.js - createOrder(slug, orderData)**
   - Builds payload with slug, productId, customer, items, payment
   - POSTs to /api/orders
   - Returns { success, order_number }

---

## 4. POTENTIAL ISSUES IDENTIFIED

### Issue 1: snake_case vs camelCase
API returns snake_case, some frontend code expects camelCase.
SOLUTION: API public.js handles both with fallbacks.

### Issue 2: store.slug not in API response
The public API doesn't include slug in the response!
SOLUTION: main.js adds it: `store: { ...data.store, slug }`

### Issue 3: Missing validation
Frontend doesn't validate before sending order.
SOLUTION: Added validation in checkout.js

### Issue 4: Error handling
Errors not properly surfaced to user.
SOLUTION: Added console.log and better error messages.

---

## 5. VERIFIED WORKING

✅ Store loads correctly from API
✅ Products display correctly
✅ Checkout modal opens with correct data
✅ Order creation works when called with correct payload
✅ Dashboard login/logout
✅ Dashboard products CRUD
✅ Dashboard orders display
✅ Settings save

---

## 6. TESTING COMMANDS

### Test store API
```bash
curl https://jari-ecom-v2-production.up.railway.app/s/nimoration
```

### Test order creation
```bash
curl -X POST https://jari-ecom-v2-production.up.railway.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{"slug":"nimoration","productId":"uuid","customer":{"name":"Test","phone":"0712345678","location":"Nairobi"},"items":[{"product_id":"uuid","product_name":"Test","quantity":1,"unit_price":100,"total":100}],"payment":{"method":"mpesa","status":"pending"}}'
```
