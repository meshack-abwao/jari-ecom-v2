# PHASE A: DATABASE FOUNDATION - COMPLETE ✅

**Date Completed:** January 25, 2026  
**Git Commit:** `93e4e03 - A1-A10: Database foundation complete`

---

## WHAT WAS BUILT

### Migration File
`api/migrations/008_pricing_security_foundation.sql`

---

## A1: PRICING CONFIGURATION

**Table:** `pricing_config`

**Purpose:** Flexible pricing system stored in database (subject to change for early bird pricing)

**Seed Data:**
- **Subscriptions:** Base (KES 1,200/mo)
- **Add-ons:** M-Pesa STK (+300), WhatsApp Auto (+80), Analytics (+200), Priority Support (+500)
- **Card Bundles:** Starter (+4 cards, KES 350), Growth (+7 cards, KES 550), Pro (+12 cards, KES 850)
- **Themes:** QD (FREE), VM (KES 600), DD (KES 800), PBK (KES 1,000), Events (KES 1,000)

**Processing Fee:** 3.5% (IntaSend 3% + Jari 0.5%) - **included in final price, no breakdown shown**

---

## A2: MERCHANT VERIFICATION (4 TIERS)

**Table:** `merchant_verification`

### Tiers:

| Tier | Requirements | Monthly Limit | Settlement Delay |
|------|--------------|---------------|------------------|
| **BASIC** | Phone + Email | KES 50k | 3 days |
| **VERIFIED** | + National ID | KES 500k | 2 days |
| **BUSINESS** | + Bus Reg + KRA | Unlimited | 0 days (instant) |
| **PREMIUM** | + Bank + Tax | Unlimited | 0 days |

### Special Flags:
- **is_whitelisted:** Manual whitelist (master password required) - bypass delays, minimize fraud checks
- **is_beta_merchant:** First 50 merchants - no auto-suspend

**Key Decision:** Documents (Business Reg, KRA) optional at signup - can upgrade to BUSINESS tier later in Settings

---

## A3: SETTLEMENT RULES

**Table:** `settlement_rules`

**Default:** 3-day hold for all new merchants  
**Whitelist:** Instant settlement for known brands with all docs

**Features:**
- Risk assessment (LOW/MEDIUM/HIGH)
- Early settlement option: 2% fee to settle immediately
- Auto-approve threshold: KES 10k (transactions under this auto-settle after hold period)

---

## A4: FRAUD DETECTION THRESHOLDS

**Table:** `fraud_thresholds`

### Graduated Security (Scales with Platform Growth):

| Phase | Merchants | Tx/Hour | Tx/Day | Auto-Suspend |
|-------|-----------|---------|--------|--------------|
| **Beta** | 0-50 | 200 | 1000 | ❌ No |
| **Early Growth** | 51-100 | 100 | 500 | ❌ No |
| **Scale** | 101+ | 50 | 200 | ✅ Yes |

**Key Decision:** Light fraud detection for first 100 merchants, tighten as we scale

---

## A5: CUSTOMER COMPLAINTS

**Tables:** `customer_complaints`, `complaint_metrics`

**Access:** Complaint link sent ONLY in order confirmation (WhatsApp/SMS/Email) - verified customers only

**Anti-Sabotage:** Check if customer phone matches actual order/booking for that store

**Auto-Suspend Trigger:** 5 verified complaints in 30 days with <50% response rate

---

## A6: CHARGEBACK TRACKING

**Table:** `chargebacks`

**Purpose:** Track M-Pesa/IntaSend chargebacks separately from complaints

**Statuses:** pending → won/lost/refunded

---

## A7: BADGE SYSTEM (Trust Scores)

**Tables:** `merchant_badges`, `badge_criteria`

**Badges:**
- **Bronze:** Trusted Seller (KES 10k sales, 10 txns, <5% disputes)
- **Silver:** Verified Merchant (KES 50k sales, 50 txns, <3% disputes)
- **Gold:** Premium Merchant (KES 200k sales, 200 txns, <1% disputes)
- **Platinum:** Elite Partner (KES 1M sales, 1000 txns, <0.5% disputes)

**Frontend:** Badges displayed on storefront to build trust

---

## A8 & A9: STORES & PRODUCTS TABLE UPDATES

### Stores Table (New Columns):
```sql
business_type VARCHAR(50)           -- 'food', 'services', 'products', 'premium', 'events'
card_limit INTEGER DEFAULT 3        -- Current card limit (starts at 3)
unlocked_themes JSONB DEFAULT '[]'  -- ['qd', 'vm', 'dd']
onboarding_completed BOOLEAN        -- Signup flow completion
```

### Products Table (New Column):
```sql
assigned_template VARCHAR(20)       -- 'qd', 'vm', 'dd', 'pbk', 'events'
```

**Key Decision:** Each product can be assigned a different template - merchants can mix templates on same store

---

## A10: CARD & THEME PURCHASES

**Tables:** `card_purchases`, `theme_purchases`

**Card Logic - CRITICAL:**
- **ADD** not SET - Growth Pack (+7) adds to existing, doesn't replace
- Example: Merchant has 3 cards → Buys Growth Pack → Now has 10 cards (3 + 7)

**Theme Unlock:**
- Immediately shows dashboard tab when unlocked (e.g., unlock VM → "Food Orders" tab appears)
- Can assign templates to products even if no products yet

**Payment:** M-Pesa STK integration (to be built in Phase E)

---

## NEXT STEPS (PHASE B)

**Ready to Build:**
1. Multi-step signup wizard (5 steps)
2. Phone OTP verification
3. Document upload UI (Cloudinary)
4. Template assignment on signup
5. Environment variable: `WHITELIST_MASTER_PASSWORD`

---

## TECHNICAL NOTES

### Database Migration Status:
- ✅ Migration 008 created
- ❌ Not yet run on Railway DB (pending)

### Environment Variables Needed:
```
WHITELIST_MASTER_PASSWORD=[to be set]
INTASEND_API_KEY=[from Wednesday approval]
INTASEND_SECRET=[from Wednesday approval]
```

### Git History:
```
93e4e03 A1-A10: Database foundation complete
52d0847 Debug: Add pixel init logging
afebe36 Fix: Include pixel config in public API
```

---

## HANDOVER TO NEXT CHAT

**Context Preserved:**
1. All 10 database tables created and seeded
2. Card purchase logic: ADD (+7, +12) not SET
3. Template assignment: Per-product (can mix on same store)
4. Complaints: Order confirmation link only
5. Processing fee: Included in price (no breakdown)
6. Signup docs: Optional (can upgrade later)
7. Whitelist: Environment variable

**Ready for Phase B:** Signup flow build starts next

---

**End of Phase A** 🎯
