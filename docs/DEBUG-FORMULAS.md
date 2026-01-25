# DEBUG FORMULAS - Jari.Ecom V2
## Lessons Learned from Production Issues

**Last Updated:** January 25, 2026

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

**End of Debug Formulas**
