# DEBUG FORMULAS - Jari.Ecom V2
## Lessons Learned from Production Issues

**Last Updated:** January 27, 2026

---

## FORMULA 1: API Response Structure (CRITICAL)

**Problem:** `Cannot read property 'slug' of undefined`

**Cause:** Accessing `response.data.store.slug` instead of `response.data.slug`

**Fix:** API returns store object DIRECTLY at `response.data`

```javascript
// ✅ CORRECT
const response = await settingsAPI.getAll();
const store = response.data;  // Store object is HERE
const slug = store.slug;

// ❌ WRONG
const store = response.data.store;  // NOPE
const store = response.data.settings;  // NOPE
```

---

## FORMULA 2: CSS Parse Errors

**Problem:** Build fails with CSS syntax error

**Cause:** Orphaned CSS rules from incomplete edits

**Fix:** Search for orphaned selectors, remove duplicates

```bash
# Find orphaned rules
grep -n "selector-name {" base.css
```

---

## FORMULA 3: Mobile Layout Breaking

**Problem:** Cards overlap, horizontal scroll appears

**Cause:** CSS Grid doesn't stack properly on mobile

**Fix:** Use flexbox with `flex-direction: column` for mobile

```css
/* Mobile first */
.container {
  display: flex;
  flex-direction: column;
}

/* Desktop */
@media (min-width: 768px) {
  .container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## FORMULA 4: Z-Index Issues

**Problem:** Dropdowns hidden behind other elements

**Fix:** Use `z-index: 9999` for dropdowns/modals

---

## FORMULA 5: Git on Windows

**Problem:** Commands fail with `&&`

**Fix:** Use semicolons instead

```powershell
# ❌ WRONG (cmd doesn't support &&)
cd path && git add -A && git commit

# ✅ CORRECT (PowerShell with semicolons)
cd path; git add -A; git commit -m 'message'; git push
```

---

## FORMULA 6: Foreign Key Type Mismatch (NEW!)

**Problem:** Migration fails with `foreign key constraint cannot be implemented`

**Cause:** Foreign key data type doesn't match referenced primary key

**Example Error:**
```
❌ Migration failed: foreign key constraint "merchant_verification_store_id_fkey" cannot be implemented
```

**Root Cause:**
```sql
-- stores table uses UUID
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- But migration used INTEGER (WRONG!)
CREATE TABLE merchant_verification (
  store_id INTEGER REFERENCES stores(id)  -- ❌ Type mismatch!
);
```

**Fix:** Match data types exactly
```sql
-- ✅ CORRECT
CREATE TABLE merchant_verification (
  store_id UUID REFERENCES stores(id)
);
```

**Debug Steps:**
1. Check referenced table's primary key type
2. Ensure ALL foreign keys use the same type
3. In Jari V2: ALL store references must be UUID

---

## FORMULA 7: Missing npm Package (NEW!)

**Problem:** `Cannot find package 'X' imported from...`

**Cause:** Created import statement but forgot to install package

**Fix:** Add to package.json AND regenerate package-lock.json

```bash
# 1. Add to package.json dependencies
"africastalking": "^0.7.3"

# 2. Install locally to update lock file
npm install

# 3. Commit BOTH files
git add package.json package-lock.json
git commit -m 'Add package X'
```

**Railway uses `npm ci` which requires package-lock.json to be in sync!**

---

## FORMULA 8: Third-Party SDK Initialization Error (NEW!)

**Problem:** App crashes on startup with validation error from SDK

**Example:**
```
[Error [ValidationError]: "username" is required]
```

**Cause:** SDK initializes immediately on module load, but env vars not set

**Fix:** Use lazy initialization pattern

```javascript
// ❌ WRONG - Initializes immediately
const sdk = SDK({
  apiKey: process.env.API_KEY  // Undefined on import!
});

// ✅ CORRECT - Lazy initialization
let sdkInstance = null;

const initSDK = () => {
  if (sdkInstance) return sdkInstance;
  
  if (!process.env.API_KEY) {
    console.warn('SDK not configured');
    return null;
  }
  
  sdkInstance = SDK({ apiKey: process.env.API_KEY });
  return sdkInstance;
};

export const useSDK = async () => {
  const sdk = initSDK();
  if (!sdk) {
    // Return mock or throw error
    return mockResponse;
  }
  return sdk.doSomething();
};
```

**Benefits:**
- App doesn't crash on missing env vars
- Features gracefully disabled
- Easy to add credentials later

---

## FORMULA 9: Railway Deployment Debug Workflow (NEW!)

**Problem:** Deployment fails but unclear why

**Debug Steps:**

1. **Check Build Logs:**
   - Look for npm errors (missing packages, lock file sync)
   - Look for migration errors (foreign keys, syntax)

2. **Check Runtime Logs:**
   - Look for module not found errors
   - Look for initialization errors

3. **Common Railway Issues:**
   - `npm ci` fails → package-lock.json out of sync → Run `npm install` locally
   - Migration fails → Check foreign key types match
   - Module not found → Package missing from package.json
   - Validation error on start → SDK needs lazy init

4. **Fix Pattern:**
   ```bash
   # 1. Fix the issue locally
   # 2. Test if possible
   # 3. Commit with clear message
   git add <files>
   git commit -m 'Fix: <specific issue>'
   git push origin main
   # 4. Railway auto-deploys
   # 5. Check logs again
   ```

---

## FORMULA 10: Cloudinary Folder Organization (NEW!)

**Problem:** Images pile up with no organization

**Fix:** Use hierarchical folder structure per merchant

```javascript
// Generate signature with folder path
const folder = `jari-ecom/store-${storeId}/${contentType}`;

// Examples:
// jari-ecom/store-123/products/
// jari-ecom/store-123/verification/
// jari-ecom/store-123/branding/
```

**Benefits:**
- Easy to find merchant's images
- Easy to delete merchant's data
- Clean organization at scale

---

## DEBUGGING CHECKLIST

When something breaks, check in this order:

### Backend Errors:
1. ✅ Check migration logs (foreign key types?)
2. ✅ Check package.json vs package-lock.json sync
3. ✅ Check environment variables are set
4. ✅ Check SDK initialization (lazy vs immediate)
5. ✅ Check API response structure (data vs data.store)

### Frontend Errors:
1. ✅ Check CSS syntax (orphaned rules?)
2. ✅ Check mobile responsiveness (grid vs flex?)
3. ✅ Check z-index hierarchy
4. ✅ Check API response destructuring

### Git/Deployment:
1. ✅ Use PowerShell with semicolons (not cmd with &&)
2. ✅ Commit package.json AND package-lock.json together
3. ✅ Test locally before pushing (when possible)

---

## QUICK REFERENCE: Railway Deployment Errors

| Error Message | Likely Cause | Fix |
|---------------|--------------|-----|
| `npm ci` failed | package-lock.json out of sync | Run `npm install` locally, commit lock file |
| `foreign key constraint cannot be implemented` | Type mismatch (UUID vs INTEGER) | Change foreign key to match primary key type |
| `Cannot find package 'X'` | Package in import but not in package.json | Add to package.json, run npm install |
| `ValidationError: "X" is required` | SDK initializing before env vars loaded | Use lazy initialization pattern |
| `Migration failed` | SQL syntax or constraint error | Check migration file for typos, FK types |

---

## Formula 11: Signup Failures - Two-Layer Check

**Problem:** "Failed to create account" during signup  
**Layers to Check:**

**Layer 1 - Backend (Database/Tables):**
```javascript
// Check if required tables exist
const tableCheck = await client.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'merchant_verification'
  );
`);

// Use graceful degradation if tables missing
if (tableCheck.rows[0].exists) {
  // Create Phase A records
} else {
  // Skip Phase A, create basic user + store only
}
```

**Layer 2 - Frontend (API Client Methods):**
```javascript
// Ensure authAPI has all required methods
export const authAPI = {
  post: (endpoint, data) => api.post(endpoint, data), // Generic
  signupComplete: (data) => api.post('/auth/signup/complete', data), // Specific
};

// Common error: "Co.post is not a function"
// Fix: Add missing method to authAPI object
```

**Testing Checklist:**
1. ✅ Backend: Migration tables exist? Check Railway DB
2. ✅ Backend: Graceful degradation working? Check logs
3. ✅ Frontend: authAPI methods defined? Check client.js
4. ✅ Frontend: Hard refresh after deploy (Ctrl+Shift+R)
5. ✅ Network: Check browser DevTools Network tab
6. ✅ Console: Check for JavaScript errors

**Quick Fixes:**
- Backend missing tables → Add graceful degradation
- Frontend missing methods → Add to authAPI
- Both deployed? → Wait 2-3 min, hard refresh

---

## Formula 12: API Route Import Errors (NEW - Jan 25, 2026)

**Problem:** Railway fails with `SyntaxError: The requested module '../middleware/auth.js' does not provide an export named 'authenticateToken'`

**Cause:** New route files copy-pasted or assumed wrong import names

**Investigation Pattern:**
```javascript
// 1. Check what the middleware ACTUALLY exports
// File: api/src/middleware/auth.js
export function auth(req, res, next) { ... }  // ✅ Exports "auth", NOT "authenticateToken"

// 2. Check how working routes import it
// File: api/src/routes/products.js
import { auth } from '../middleware/auth.js';  // ✅ CORRECT
import db from '../config/database.js';         // ✅ "db" default export

// 3. Common wrong patterns:
import { authenticateToken } from '../middleware/auth.js';  // ❌ WRONG
import { query } from '../config/database.js';               // ❌ WRONG
```

**Fix Pattern:**
```javascript
// Correct imports for Jari API routes:
import express from 'express';
import db from '../config/database.js';    // Default export
import { auth } from '../middleware/auth.js';  // Named export "auth"

// Correct middleware usage:
router.get('/endpoint', auth, async (req, res) => {
  const userId = req.user.userId;  // ✅ "userId" NOT "id"
  await db.query('SELECT ...', [userId]);  // ✅ "db.query" NOT "query"
});
```

**User Object Properties:**
```javascript
// After auth middleware, req.user contains:
req.user.userId   // ✅ The user's ID
req.user.email    // ✅ The user's email
// NOT:
req.user.id       // ❌ WRONG - this doesn't exist
```

**Prevention Checklist for New Routes:**
1. ✅ Check middleware exports: `import { auth } from '../middleware/auth.js'`
2. ✅ Check database exports: `import db from '../config/database.js'`
3. ✅ Use `auth` not `authenticateToken` in route handlers
4. ✅ Use `db.query()` not `query()`
5. ✅ Use `req.user.userId` not `req.user.id`
6. ✅ Look at existing working routes (products.js, stores.js) as reference

---

## Formula 13: Migration Partial State Errors (NEW - Jan 26, 2026)

**Problem:** Migration fails with `column "X" of relation "Y" does not exist`

**Cause:** `CREATE TABLE IF NOT EXISTS` doesn't add missing columns to existing tables. Previous run may have created table with incomplete schema.

**Example Error:**
```
❌ Migration failed: column "complaint_rate" of relation "complaint_metrics" does not exist
```

**Root Cause:**
```sql
-- First run: Table created but migration failed midway
CREATE TABLE IF NOT EXISTS complaint_metrics (
  id SERIAL PRIMARY KEY,
  store_id UUID,
  total_complaints INTEGER
  -- Migration failed here, complaint_rate never added
);

-- Second run: IF NOT EXISTS skips table creation
-- But code expects complaint_rate column that doesn't exist!
```

**Fix Pattern:**
```sql
-- Option 1: DROP and recreate (safe for NEW tables with no data)
DROP TABLE IF EXISTS tablename CASCADE;
CREATE TABLE tablename (
  -- all columns
);

-- Option 2: ALTER for adding columns to existing tables (preserves data)
ALTER TABLE tablename ADD COLUMN IF NOT EXISTS new_column TYPE;
```

**When to use which:**
- **DROP + CREATE**: New tables, no production data yet
- **ALTER ADD COLUMN**: Existing tables with data you need to keep

**Prevention:**
1. Always test migrations locally before pushing
2. Use transactions in migrations when possible
3. For complex migrations, split into multiple files
4. Add `CASCADE` to DROP to handle foreign key dependencies

---

**End of Debug Formulas**


---

## FORMULA 8: Git Commands on Windows (PowerShell vs CMD)

**Problem:** Git commands fail with `&&` operator

**Cause:** PowerShell handles `&&` differently than bash

**Fix:** Use semicolons OR git -C flag

```powershell
# ✅ CORRECT - Using semicolons
cd C:\path\to\repo; git add -A; git commit -m "message"; git push origin main

# ✅ CORRECT - Using git -C flag
git -C C:\path\to\repo add -A
git -C C:\path\to\repo commit -m "message"
git -C C:\path\to\repo push origin main

# ✅ CORRECT - Hyphenated messages (no spaces)
git commit -m "Fix-breadcrumb-styling"

# ❌ WRONG - && in PowerShell
cd path && git add -A && git commit  # FAILS
```

---

## FORMULA 9: Sticky CTA Overlapping Footer

**Problem:** Sticky CTA button covers footer content

**Cause:** Fixed positioning doesn't account for footer visibility

**Fix:** Use scroll listener to dynamically adjust CTA position

```javascript
function initSmartStickyCTA() {
  const stickyCTA = document.querySelector('.sticky-cta, .pbk-sticky-cta, .vm-sticky-cta, .dd-sticky-cta');
  const footer = document.querySelector('.store-footer-enhanced, .store-footer, footer');
  
  if (!stickyCTA || !footer) return;
  
  const handleScroll = () => {
    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const bottomOffset = 24;
    
    if (footerRect.top < windowHeight) {
      const footerVisibleHeight = windowHeight - footerRect.top;
      stickyCTA.style.bottom = `${footerVisibleHeight + bottomOffset}px`;
      stickyCTA.style.transition = 'bottom 0.15s ease';
    } else {
      stickyCTA.style.bottom = '';
      stickyCTA.style.transition = '';
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}
```

**Key:** Call this after rendering product view in `renderProductView()`.

---

## FORMULA 10: CSS Override Not Working

**Problem:** New CSS styles not applying to elements

**Cause:** Specificity issues or styles defined earlier taking precedence

**Fix:** Use `!important` strategically OR append new CSS at end of file

```css
/* When overriding existing styles, append at END of base.css */
/* Use !important only when necessary */

.related-card {
    flex: 0 0 220px !important;  /* Override earlier definition */
    display: flex !important;
}
```

**Better approach:** Create a new section like "REDESIGN V3" appended to file.

---

## FORMULA 11: React State Not Persisting

**Problem:** Collapsed nav state resets on page change

**Cause:** Component re-renders, useState resets

**Fix:** Use localStorage OR keep state minimal

```javascript
// For simple UI state, useState is fine (resets on nav is acceptable)
const [collapsedSections, setCollapsedSections] = useState({});

// For persistent state, use localStorage
const [collapsed, setCollapsed] = useState(() => {
  const saved = localStorage.getItem('navCollapsed');
  return saved ? JSON.parse(saved) : {};
});

useEffect(() => {
  localStorage.setItem('navCollapsed', JSON.stringify(collapsed));
}, [collapsed]);
```

---

## FORMULA 12: Import Path Issues

**Problem:** Module not found errors

**Cause:** Wrong relative path depths

**Fix:** Count directory levels carefully

```javascript
// From store/src/templates/deep-dive/dd-render.js
import { renderBreadcrumb } from '../../render.js';     // Up 2 levels to src/
import { formatPrice } from '../../shared/utils.js';    // Up 2, then into shared/

// From store/src/templates/portfolioBooking.js
import { renderBreadcrumb } from '../render.js';        // Up 1 level to src/
import { renderRelatedProducts } from '../shared/related-products.js';

// From store/src/render.js
import { state } from './state.js';                     // Same directory
```

---

## FORMULA 13: Invisible Characters in Files

**Problem:** edit_block fails with "100% similarity but not exact match"

**Cause:** Hidden characters (BOM, CRLF, zero-width spaces)

**Fix:** Append new CSS instead of replacing, let cascade handle it

```bash
# Instead of trying to replace problematic text:
# 1. Read the file to understand current state
# 2. Append new styles at the end (CSS cascade will apply last rule)
# 3. Use !important if needed for specificity
```

---

## FORMULA 14: Template-Specific Code Not Running

**Problem:** Handler code doesn't execute for specific template

**Cause:** Template check uses wrong string comparison

**Fix:** Verify exact template name strings

```javascript
// Template names (exact strings):
'deep-dive'        // NOT 'deepDive' or 'DeepDive'
'quick-decision'   // NOT 'quickDecision'
'portfolio-booking'// NOT 'portfolioBooking'
'visual-menu'      // NOT 'visualMenu'
'event-landing'    // NOT 'eventLanding'

// Correct check:
if (product.template === 'portfolio-booking') {
  initPortfolioBookingHandlers();
}
```

---

## FORMULA 15: Navigation Functions Not Available

**Problem:** `window.showCollection is not a function`

**Cause:** Global function not attached to window object

**Fix:** Ensure functions are assigned to window in main.js

```javascript
// In main.js - Must use window assignment
window.showCollection = function() {
  setProductId(null);
  render();
};

window.filterByCategory = function(categoryName) {
  setProductId(null);
  render();
  setTimeout(() => {
    const pill = document.querySelector(`.category-pill[data-category="${categoryName}"]`);
    if (pill) pill.click();
  }, 100);
};

window.viewRelatedProduct = function(productId) {
  setProductId(productId);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

---

## QUICK REFERENCE: File Locations

| Component | File |
|-----------|------|
| Breadcrumb | `store/src/render.js` |
| Product Nav | `store/src/render.js` |
| Related Products | `store/src/shared/related-products.js` |
| Footer | `store/src/render.js` |
| Smart Sticky CTA | `store/src/main.js` |
| Global Nav Functions | `store/src/main.js` |
| Dashboard Nav | `dashboard/src/components/Layout.jsx` |
| Store CSS | `store/src/styles/base.css` |
| Footer CSS | `store/src/styles/footer.css` |
| Dashboard CSS | `dashboard/src/styles/globals.css` |

---

## FORMULA 16: Duplicate Express Routes (NEW - Jan 27, 2026)

**Problem:** API endpoint returns old/wrong response, new code not executing

**Cause:** Two routes with same path - Express uses FIRST match

**Example:**
```javascript
// Route A (line 299) - OLD CODE
router.get('/abandoned/:storeId', async (req, res) => {
  // Returns old format
  res.json({ error: 'Failed to fetch abandoned data' });
});

// Route B (line 525) - NEW CODE (never reached!)
router.get('/abandoned/:storeId', async (req, res) => {
  // Returns new format with detailed data
  res.json({ abandonments: [...], funnel: {...} });
});
```

**Symptoms:**
- New features don't work
- Old error messages appear
- Console shows correct URL being called
- Backend logs don't show new debug messages

**Fix:** Remove or comment out the old duplicate route

**Prevention:**
- Before adding new routes, search file for existing routes with same path
- Use unique route names or version prefixes (`/v2/abandoned/:storeId`)

---

## FORMULA 17: sendBeacon Content-Type (NEW - Jan 27, 2026)

**Problem:** Backend receives empty body from `sendBeacon()`

**Cause:** sendBeacon sends as `text/plain`, not `application/json`

**Fix - Backend must parse string:**
```javascript
// Express setup - add text parser
app.use(express.text()); // For sendBeacon which sends as text/plain

// In route handler
let body = req.body;
if (typeof body === 'string') {
  try {
    body = JSON.parse(body);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
}
const { field1, field2 } = body;
```

**Frontend sendBeacon:**
```javascript
// sendBeacon always sends as text/plain
navigator.sendBeacon(endpoint, JSON.stringify(payload));

// Fallback with fetch uses proper JSON
fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  keepalive: true
});
```

---

## FORMULA 18: UUID vs Slug Resolution (NEW - Jan 27, 2026)

**Problem:** API works with UUID but fails with slug (or vice versa)

**Cause:** Frontend sends slug, backend expects UUID (or vice versa)

**Fix - Handle both in API:**
```javascript
router.get('/endpoint/:storeId', async (req, res) => {
  const { storeId } = req.params;
  let actualStoreId = storeId;
  
  // If it looks like a slug (not UUID format), resolve it
  if (isNaN(storeId) && !storeId.includes('-')) {
    const result = await db.query(
      'SELECT id FROM stores WHERE slug = $1',
      [storeId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    actualStoreId = result.rows[0].id;
  }
  
  // Now use actualStoreId (always UUID)
  const data = await db.query(
    'SELECT * FROM table WHERE store_id = $1::uuid',
    [actualStoreId]
  );
});
```

**Detection Logic:**
- Contains `-` → UUID (e.g., `7bb50c0a-d9a6-4e7c-a38c-5b5b2779c5d5`)
- Is numeric → Legacy integer ID
- Neither → Slug (e.g., `lanixkenya`)

---

## FORMULA 19: PostgreSQL UUID Casting (NEW - Jan 27, 2026)

**Problem:** Query fails with type mismatch on UUID columns

**Cause:** PostgreSQL strict typing - string not auto-cast to UUID

**Fix - Explicit casting:**
```sql
-- ✅ CORRECT - Explicit UUID cast
SELECT * FROM abandoned_checkouts WHERE store_id = $1::uuid

-- ❌ MAY FAIL - No cast
SELECT * FROM abandoned_checkouts WHERE store_id = $1
```

**When to use:**
- Always cast when comparing UUID columns with string parameters
- Especially important in dynamic queries with template literals

---

## FORMULA 20: Body Overflow for Modals (NEW - Jan 27, 2026)

**Problem:** Page scroll doesn't restore after closing modal/gallery

**Cause:** Modal sets `body.style.overflow = 'hidden'` but doesn't restore

**Fix - Always restore in close handler:**
```javascript
function openModal() {
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';  // Prevent scroll
}

function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = '';  // ✅ RESTORE scroll
}

// Also handle escape key and backdrop click
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display !== 'none') {
    closeModal();  // This will restore overflow
  }
});
```

**Common Mistake:**
```javascript
// ❌ WRONG - Forgets to restore
function closeModal() {
  modal.style.display = 'none';
  // Missing: document.body.style.overflow = '';
}
```

---

## FORMULA 21: DROP TABLE in Migrations (CRITICAL - Jan 27, 2026)

**Problem:** Production data disappears after every deployment

**Cause:** Migration has `DROP TABLE IF EXISTS` which wipes data on every redeploy

**Example Bad Migration:**
```sql
-- ❌ DANGER - This wipes data EVERY TIME Railway deploys!
DROP TABLE IF EXISTS abandoned_checkouts;
CREATE TABLE abandoned_checkouts (...);
```

**Fix - Make migrations IDEMPOTENT:**
```sql
-- ✅ SAFE - Only creates if doesn't exist
CREATE TABLE IF NOT EXISTS abandoned_checkouts (...);
CREATE INDEX IF NOT EXISTS idx_name ON table(column);
```

**Also implement migration tracking:**
```javascript
// Check if migration already ran
const executed = await db.query('SELECT name FROM _migrations WHERE name = $1', [filename]);
if (executed.rows.length > 0) {
  console.log('Already executed, skipping');
  return;
}

// Run migration then record it
await db.query(sql);
await db.query('INSERT INTO _migrations (name) VALUES ($1)', [filename]);
```

**Prevention Checklist:**
1. ✅ NEVER use DROP TABLE in production migrations
2. ✅ Always use IF NOT EXISTS for CREATE TABLE
3. ✅ Always use IF NOT EXISTS for CREATE INDEX
4. ✅ Implement migration tracking table (_migrations)
5. ✅ Test migrations locally before pushing


---

## FORMULA 22: DNS Propagation Delays (Jan 29, 2026)

**Problem:** Domain verification fails immediately after DNS setup

**Cause:** DNS changes take time to propagate globally (can be up to 48 hours)

**Symptoms:**
- User adds DNS records correctly
- Clicks "Verify" immediately
- Verification fails with "TXT record not found"

**Fix - Communicate Wait Time:**
```javascript
// Show clear messaging about propagation delay
if (dnsErr.code === 'ENODATA' || dnsErr.code === 'ENOTFOUND') {
  errorMessage = 'TXT record not found. Please add the DNS record and wait up to 48 hours for propagation.';
}
```

**User-Facing Tips:**
1. DNS propagation typically takes 15 minutes to 48 hours
2. Recommend waiting at least 30 minutes before first verify attempt
3. Provide "Check Again" button instead of failing hard
4. Show last attempt time so users know when to retry

**Debugging DNS:**
```bash
# Check if TXT record exists
dig TXT _jari-verify.yourdomain.com

# Or use nslookup
nslookup -type=TXT _jari-verify.yourdomain.com
```

---

## FORMULA 23: Domain Case Sensitivity (Jan 29, 2026)

**Problem:** Custom domain lookup fails for mixed-case domains

**Cause:** User enters "LanixKenya.com" but database has "lanixkenya.com"

**Example Bug:**
```javascript
// ❌ WRONG - Case mismatch
const domain = req.params.domain; // "LanixKenya.COM"
const result = await db.query('SELECT * FROM stores WHERE custom_domain = $1', [domain]);
// Returns 0 rows because database has lowercase
```

**Fix - Always normalize to lowercase:**
```javascript
// ✅ CORRECT - Normalize everything
function normalizeDomain(domain) {
  if (!domain) return null;
  let normalized = domain.toLowerCase().trim();
  normalized = normalized.replace(/^https?:\/\//, ''); // Remove protocol
  normalized = normalized.split('/')[0]; // Remove path
  return normalized;
}

// Use in all domain operations
const domain = normalizeDomain(req.params.domain);
const result = await db.query('SELECT * FROM stores WHERE custom_domain = $1', [domain]);
```

**Database Constraint (extra safety):**
```sql
-- Force lowercase in database
ALTER TABLE stores 
ADD CONSTRAINT valid_custom_domain 
CHECK (custom_domain IS NULL OR custom_domain = LOWER(custom_domain));
```

---

## FORMULA 24: Multi-Part TLD Detection (Jan 29, 2026)

**Problem:** Root vs Subdomain detection fails for .co.ke, .co.uk domains

**Cause:** Simple split('.').length check doesn't account for multi-part TLDs

**Example Bug:**
```javascript
// ❌ WRONG - Treats lanixkenya.co.ke as subdomain (3 parts)
function detectDomainType(domain) {
  const parts = domain.split('.');
  return parts.length > 2 ? 'subdomain' : 'root';
}

detectDomainType('lanixkenya.co.ke'); // Returns 'subdomain' - WRONG!
detectDomainType('shop.lanixkenya.co.ke'); // Also returns 'subdomain' - At least this is right
```

**Fix - Account for multi-part TLDs:**
```javascript
// ✅ CORRECT
function detectDomainType(domain) {
  const parts = domain.split('.');
  
  // Common multi-part TLDs (add more as needed)
  const multiPartTLDs = ['co.ke', 'co.uk', 'com.au', 'co.za', 'ac.ke', 'or.ke'];
  
  for (const tld of multiPartTLDs) {
    if (domain.endsWith(`.${tld}`)) {
      const withoutTLD = domain.slice(0, -(tld.length + 1));
      return withoutTLD.includes('.') ? 'subdomain' : 'root';
    }
  }
  
  // Standard TLDs (.com, .net, etc.)
  return parts.length > 2 ? 'subdomain' : 'root';
}

detectDomainType('lanixkenya.co.ke'); // Returns 'root' ✓
detectDomainType('shop.lanixkenya.co.ke'); // Returns 'subdomain' ✓
```

---

## FORMULA 25: Custom Domain Skip Logic (Jan 29, 2026)

**Problem:** Custom domain lookup runs on main domain, causing unnecessary API calls

**Cause:** Not checking if current hostname is a known main domain before lookup

**Example Bug:**
```javascript
// ❌ WRONG - Tries to lookup 'jarisolutionsecom.store' as custom domain
async function checkCustomDomain() {
  const hostname = window.location.hostname;
  const response = await fetch(`/domain/lookup/${hostname}`);
  // Makes unnecessary API call for main domain
}
```

**Fix - Skip known main domains:**
```javascript
// ✅ CORRECT
const MAIN_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'jariecommstore.netlify.app',
  'jarisolutionsecom.store',
  'jari-store.netlify.app'
];

async function checkCustomDomain() {
  const hostname = window.location.hostname.toLowerCase();
  
  // Skip if already have slug in URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('store')) return;
  
  // Skip if on main domains
  if (MAIN_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
    return;
  }
  
  // Only now do the lookup
  const response = await fetch(`/domain/lookup/${hostname}`);
  // ...
}
```

---
