# Jari.Ecom V2 - Clean Architecture

## THE PROBLEM WITH V1

### Current Database (30+ columns on products table!)
```
products:
  - id, user_id, name, description, price, image_url, stock_quantity, is_active
  - template_type, story_media, story_title, additional_images, gallery_images
  - service_packages, dietary_tags, prep_time, calories, ingredients
  - specifications, trust_badges, warranty_info, return_policy_days
  - rich_description, privacy_policy, terms_of_service, refund_policy
  - availability_notes, video_url, event_date, event_location
  - blocks, images, checkout_type, price_note, customization_options
  - booking_config, testimonials, category
  ... MESS!
```

### Current Files (Monolithic)
- server.js: 913 lines (ALL routes, ALL logic, ALL migrations)
- app.js: 1330 lines (ALL templates, ALL checkout, ALL rendering)
- ProductList.jsx: 1406 lines (ALL form fields for ALL templates)

## V2 PHILOSOPHY: "DATA LIVES IN JSON, SCHEMA STAYS LEAN"

### Core Principle
Instead of 30 columns for every possible field, we use:
- **5 core columns** that EVERY product needs
- **1 JSONB column** (`data`) for template-specific fields
- **1 JSONB column** (`media`) for all images/videos

### Why This Works
1. **Adding a new template field** = Add key to JSON, no migration
2. **Adding a new template** = Create config file, no schema change
3. **Query performance** = PostgreSQL JSONB is indexed and fast
4. **Flexibility** = Each product type stores only what it needs

---

## V2 DATABASE SCHEMA (6 Tables, ~15 Columns Total)

### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile JSONB DEFAULT '{}',  -- business_name, phone, instagram, etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. stores (replaces store_settings)
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(100) UNIQUE NOT NULL,  -- subdomain
  config JSONB DEFAULT '{}',          -- ALL settings in one place
  created_at TIMESTAMP DEFAULT NOW()
);

-- config JSONB structure:
{
  "name": "My Fashion Store",
  "tagline": "Premium fashion for everyone",
  "logo": { "type": "text", "value": "MF" },
  "theme": "warm-sunset",
  "hero": { "type": "gradient", "title": "...", "subtitle": "..." },
  "footer": { "powered_by": true },
  "policies": { "privacy": "...", "terms": "...", "refund": "..." },
  "features": { "testimonials": true, "categories": ["Dresses", "Shoes"] }
}
```

### 3. products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  template VARCHAR(50) NOT NULL DEFAULT 'quick-decision',
  status VARCHAR(20) DEFAULT 'active',  -- active, draft, archived
  data JSONB NOT NULL DEFAULT '{}',     -- ALL product fields
  media JSONB DEFAULT '[]',             -- ALL images/videos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- data JSONB structure (varies by template):
{
  "name": "Premium Dress",
  "price": 2500,
  "description": "Beautiful handcrafted dress",
  "stock": 100,
  "category": "Dresses",
  -- Template-specific fields:
  "dietary_tags": ["vegan", "gluten-free"],  -- visual-menu only
  "specifications": { "material": "Cotton" }, -- deep-dive only
  "packages": [{ "name": "Basic", "price": 500 }]  -- portfolio only
}

-- media JSONB structure:
[
  { "type": "image", "url": "...", "alt": "Main photo", "role": "hero" },
  { "type": "image", "url": "...", "role": "gallery" },
  { "type": "video", "url": "...", "role": "story" }
]
```

### 4. orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  product_id UUID REFERENCES products(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  customer JSONB NOT NULL,              -- name, phone, location
  items JSONB NOT NULL,                 -- products, quantities, prices
  payment JSONB DEFAULT '{}',           -- method, status, transaction_id
  created_at TIMESTAMP DEFAULT NOW()
);

-- customer JSONB:
{ "name": "John Doe", "phone": "254712345678", "location": "Westlands" }

-- items JSONB:
[{ "product_id": "...", "name": "Dress", "price": 2500, "qty": 1 }]

-- payment JSONB:
{ "method": "mpesa", "status": "pending", "amount": 2500 }
```

### 5. templates (reference table)
```sql
CREATE TABLE templates (
  slug VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 500,
  schema JSONB NOT NULL,  -- Field definitions for validation
  created_at TIMESTAMP DEFAULT NOW()
);

-- schema JSONB defines what fields are allowed:
{
  "required": ["name", "price"],
  "optional": ["description", "dietary_tags", "prep_time"],
  "media_roles": ["hero", "gallery", "story"]
}
```

### 6. sessions (for auth - optional, can use JWT only)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
```

---

## V2 FILE STRUCTURE

```
jari-ecom-v2/
├── api/                          # Backend (Node.js + Express)
│   ├── package.json
│   ├── src/
│   │   ├── index.js              # Entry point (~30 lines)
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL connection
│   │   │   └── env.js            # Environment variables
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verification
│   │   │   ├── cors.js           # CORS config
│   │   │   └── error.js          # Error handler
│   │   ├── routes/
│   │   │   ├── index.js          # Route aggregator
│   │   │   ├── auth.js           # /auth/*
│   │   │   ├── stores.js         # /stores/*
│   │   │   ├── products.js       # /products/*
│   │   │   ├── orders.js         # /orders/*
│   │   │   └── public.js         # /s/:slug (public store)
│   │   ├── services/
│   │   │   ├── auth.service.js   # Auth logic
│   │   │   ├── store.service.js  # Store CRUD
│   │   │   └── order.service.js  # Order logic
│   │   └── utils/
│   │       ├── jwt.js            # Token helpers
│   │       └── validation.js     # Input validation
│   └── migrations/
│       └── 001_initial.sql       # Single migration file
│
├── dashboard/                    # Admin Panel (React)
│   ├── package.json
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx               # Router only (~50 lines)
│   │   ├── api/
│   │   │   └── client.js         # Axios instance
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── Settings.jsx
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Header.jsx
│   │   │   ├── Products/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductModal.jsx
│   │   │   │   └── TemplateFields/
│   │   │   │       ├── QuickDecision.jsx
│   │   │   │       ├── Portfolio.jsx
│   │   │   │       └── Menu.jsx
│   │   │   └── Shared/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       └── Modal.jsx
│   │   └── styles/
│   │       └── globals.css
│   └── vite.config.js
│
├── store/                        # Customer Store (Vanilla JS)
│   ├── package.json
│   ├── index.html
│   ├── src/
│   │   ├── main.js               # Entry (~50 lines)
│   │   ├── api.js                # Fetch wrapper
│   │   ├── router.js             # URL handling
│   │   ├── state.js              # Global state
│   │   ├── templates/
│   │   │   ├── index.js          # Template registry
│   │   │   ├── quick-decision/
│   │   │   │   ├── render.js     # HTML generation
│   │   │   │   └── style.css
│   │   │   ├── portfolio/
│   │   │   └── menu/
│   │   ├── components/
│   │   │   ├── checkout.js
│   │   │   ├── gallery.js
│   │   │   └── stories.js
│   │   └── styles/
│   │       └── base.css
│   └── vite.config.js
│
└── shared/                       # Shared configs
    ├── templates.json            # Template definitions
    └── themes.json               # Theme colors/fonts
```

---

## KEY DESIGN DECISIONS

### 1. UUIDs Instead of Serial IDs
- **Why**: Better for distributed systems, no sequential ID leaking
- **How**: `gen_random_uuid()` is built into PostgreSQL 13+

### 2. JSONB for Flexibility
- **Why**: Add fields without migrations, indexed queries
- **Performance**: PostgreSQL JSONB is highly optimized
- **Querying**: `data->>'name'`, `data->'price'`, GIN indexes

### 3. Single Config Object per Entity
- **stores.config**: ALL store settings (theme, hero, policies, features)
- **products.data**: ALL product fields (varies by template)
- **orders.customer**: ALL customer info
- **orders.items**: ALL line items

### 4. Template-as-Plugin Pattern
Each template is self-contained:
```
templates/quick-decision/
├── schema.json      # Validation rules
├── render.js        # Store rendering
├── fields.jsx       # Dashboard form fields
└── style.css        # Template-specific styles
```

### 5. Lean API Responses
Instead of returning 30 columns:
```json
{
  "id": "uuid",
  "template": "quick-decision",
  "data": { "name": "...", "price": "..." },
  "media": [...]
}
```

---

## MIGRATION PATH FROM V1

### Phase 1: Deploy V2 Parallel
1. Create new Railway project for V2 API
2. Create new PostgreSQL database
3. Deploy V2 to different URLs

### Phase 2: Data Migration Script
```javascript
// migrate-v1-to-v2.js
// 1. Read V1 products with 30 columns
// 2. Transform to V2 shape (data + media JSONB)
// 3. Insert into V2 database
```

### Phase 3: Test & Switch
1. Test all templates work
2. Update DNS/environment variables
3. Deprecate V1

---

## PERFORMANCE OPTIMIZATIONS

### 1. Database Indexes
```sql
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_data_gin ON products USING GIN(data);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_stores_slug ON stores(slug);
```

### 2. Connection Pooling
- Use `pg` with pooling (20-50 connections)
- Consider PgBouncer for 1000+ users

### 3. Caching Strategy
- Redis for session tokens
- Cache store configs (changes rarely)
- Cache public product lists (1-5 min TTL)

### 4. Query Optimization
```sql
-- Instead of: SELECT * FROM products WHERE store_id = $1
-- Use specific fields:
SELECT id, template, data->>'name' as name, data->>'price' as price, media
FROM products WHERE store_id = $1 AND status = 'active'
```

---

## READY FOR APP STORES

### API Design Principles
- RESTful endpoints
- Proper HTTP status codes
- Consistent error format
- Rate limiting ready
- API versioning (/v1/, /v2/)

### Security
- JWT with refresh tokens
- Input validation (Joi/Zod)
- SQL injection protection (parameterized queries)
- XSS protection (sanitize outputs)
- CORS properly configured

### Scalability
- Stateless API (horizontal scaling)
- Database connection pooling
- Background job support (Bull/Agenda)
- Webhook-ready architecture

---

## ESTIMATED LINE COUNTS

| Component | V1 Lines | V2 Lines | Reduction |
|-----------|----------|----------|-----------|
| API server.js | 913 | ~30 | 97% |
| API total | 913 | ~400 | 56% |
| Store app.js | 1330 | ~50 | 96% |
| Store total | 1330 | ~600 | 55% |
| Dashboard ProductList | 1406 | ~300 | 79% |
| Dashboard total | 3000+ | ~1500 | 50% |

**Total: ~5000 lines → ~2500 lines (50% reduction)**

But more importantly: **Each file is now 50-150 lines, not 900-1400!**
