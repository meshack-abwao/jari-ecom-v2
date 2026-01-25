# MIGRATION FIX: INTEGER → UUID Foreign Keys

**Date:** January 25, 2026  
**Issue:** Migration 008 failing on Railway  
**Error:** `foreign key constraint "merchant_verification_store_id_fkey" cannot be implemented`

---

## ROOT CAUSE

The `stores` table uses `UUID` primary keys (from migration 001):
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);
```

But migration 008 was referencing `stores(id)` with `INTEGER` foreign keys:
```sql
-- ❌ WRONG
store_id INTEGER REFERENCES stores(id)
```

---

## THE FIX

Changed ALL foreign key references in migration 008 from `INTEGER` to `UUID`:

### Tables Fixed:
1. ✅ `merchant_verification` - `store_id UUID` (was INTEGER)
2. ✅ `settlement_rules` - `store_id UUID` (was INTEGER)
3. ✅ `customer_complaints` - `store_id UUID`, `order_id UUID`, `booking_id UUID`
4. ✅ `complaint_metrics` - `store_id UUID`
5. ✅ `chargebacks` - `store_id UUID`
6. ✅ `merchant_badges` - `store_id UUID`
7. ✅ `card_purchases` - `store_id UUID`
8. ✅ `theme_purchases` - `store_id UUID`

Also changed primary keys from `SERIAL` to `UUID DEFAULT gen_random_uuid()` for consistency.

---

## FILES CHANGED

- `api/migrations/008_pricing_security_foundation.sql` - Fixed all FK constraints
- **Commit:** `c62d75d - Fix: Migration 008 - Change INTEGER to UUID for all foreign keys`

---

## VERIFICATION STEPS

After Railway redeploys:

1. **Check migration success:**
   ```
   Railway logs should show:
   ✅ 008_pricing_security_foundation.sql complete
   ```

2. **Verify tables created:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'pricing_config',
     'merchant_verification',
     'settlement_rules',
     'fraud_thresholds',
     'customer_complaints',
     'complaint_metrics',
     'chargebacks',
     'merchant_badges',
     'badge_criteria',
     'card_purchases',
     'theme_purchases'
   );
   ```

3. **Verify foreign keys:**
   ```sql
   SELECT 
     conname AS constraint_name,
     conrelid::regclass AS table_name,
     a.attname AS column_name,
     confrelid::regclass AS foreign_table
   FROM pg_constraint c
   JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
   WHERE contype = 'f' 
   AND conrelid::regclass::text LIKE '%merchant_verification%';
   ```

---

## NEXT DEPLOYMENT

Railway should auto-deploy commit `c62d75d`.

**Expected outcome:**
- ✅ All migrations run successfully
- ✅ API starts on port 3000
- ✅ Health check passes: `GET /health` → `200 OK`

---

## LESSON LEARNED

**Always match data types between foreign keys and referenced primary keys!**

When the schema uses UUIDs, ALL references must also use UUIDs:
- ✅ `store_id UUID REFERENCES stores(id)`
- ❌ `store_id INTEGER REFERENCES stores(id)`

---

**Status:** Fix committed and pushed. Awaiting Railway deployment.
