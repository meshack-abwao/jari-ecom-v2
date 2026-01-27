# JARI.ECOM V2 - Freemium Feature Model
## Abandoned Checkouts & Premium Features Pricing

---

## PRICING TIERS

### Abandoned Checkouts Recovery (After 1 Month Free Trial)

| Tier | Monthly Orders | Price (KES) | Price (USD) |
|------|----------------|-------------|-------------|
| **Starter** | 0-50 orders | 300/month | ~$2.50 |
| **Growth** | 51-200 orders | 700/month | ~$5.50 |
| **Pro** | 200+ orders | 1,500/month | ~$12 |

### Other Premium Features

| Feature | Price | Description |
|---------|-------|-------------|
| Custom Cards | KES 200/month | Digital business cards |
| Premium Templates | KES 500/month | Access to all templates |
| Priority Support | KES 300/month | WhatsApp support line |

---

## FREE VS PAID BREAKDOWN

### Marketing Tab - Free Forever
- Overview tab always accessible
- Basic stats (visits, orders)
- Shows "X abandoned this week" teaser
- UTM link generation

### Marketing Tab - Abandoned Checkouts (Paid)
- Full funnel visualization (Step 1/2/3)
- Detailed customer data (name, phone, location)
- WhatsApp follow-up buttons
- CSV export
- Insights & Alerts
- Recovery tracking

---

## USER EXPERIENCE FLOW

### First-Time User
1. Signs up → Gets 1 month free trial of ALL features
2. Can see full Abandoned Checkouts data
3. At day 25, sees "Trial ending in 5 days" banner
4. After 30 days, clicks "Abandoned Checkouts" tab
5. Sees paywall modal with tier options

### Returning Unpaid User
1. Clicks "Abandoned Checkouts" tab
2. Sees attractive paywall:
   - "Unlock Abandoned Cart Recovery"
   - Shows value: "Recover 10-15% of lost sales"
   - Shows their data: "You had X abandonments this week"
   - Tier options based on their order count
   - "Subscribe" button

### Paid User
1. Full access to Abandoned Checkouts
2. No interruptions
3. Shows current tier in settings

---

## DATABASE SCHEMA ADDITIONS

```sql
-- Add to stores table or create new table
CREATE TABLE store_subscriptions (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  feature VARCHAR(50),  -- 'abandoned_checkouts', 'premium_templates', etc.
  tier VARCHAR(20),     -- 'starter', 'growth', 'pro'
  status VARCHAR(20),   -- 'trial', 'active', 'expired', 'cancelled'
  trial_started_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  subscribed_at TIMESTAMP,
  expires_at TIMESTAMP,
  monthly_price INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track monthly order counts for tier determination
CREATE TABLE store_order_counts (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  month VARCHAR(7),  -- '2026-01'
  order_count INTEGER DEFAULT 0,
  UNIQUE(store_id, month)
);
```

---

## API ENDPOINTS NEEDED

```
GET  /api/subscriptions/status/:feature
     Returns: { status, tier, trialEndsAt, canAccess }

POST /api/subscriptions/start-trial
     Body: { feature }
     Returns: { trialEndsAt }

POST /api/subscriptions/subscribe
     Body: { feature, tier, paymentMethod }
     Returns: { success, expiresAt }

GET  /api/subscriptions/order-count
     Returns: { thisMonth, recommendedTier }
```

---

## FRONTEND COMPONENTS NEEDED

### PaywallModal Component
- Shows feature benefits
- Shows user's abandonment count (teaser)
- Tier selection cards
- M-Pesa payment integration
- "Start Free Trial" for first-timers

### TrialBanner Component
- Shows days remaining
- "Your trial ends in X days"
- "Upgrade now" button

### FeatureGate Component (Wrapper)
```jsx
<FeatureGate feature="abandoned_checkouts">
  <AbandonedCheckoutsTab />
</FeatureGate>
```

---

## IMPLEMENTATION PHASES

### Phase 1: Basic Paywall (This Session)
- [ ] Add `feature_access` check in AdsPage
- [ ] Create PaywallModal component
- [ ] Show modal when clicking Abandoned tab (if not paid)
- [ ] Store trial status in localStorage (temporary)

### Phase 2: Database & Trial (Next Session)
- [ ] Create subscriptions table
- [ ] Track trial start/end dates
- [ ] Auto-start trial on first access
- [ ] Show trial banner

### Phase 3: Payment Integration
- [ ] M-Pesa STK Push for subscription
- [ ] Payment confirmation webhook
- [ ] Auto-renewal logic

### Phase 4: Order-Based Tiers
- [ ] Track monthly order counts
- [ ] Recommend tier based on count
- [ ] Auto-upgrade prompts

---

## UI COPY

### Paywall Modal
**Title:** "Unlock Abandoned Cart Recovery"

**Subtitle:** "You had {count} abandoned checkouts this week. Recover 10-15% of lost sales."

**Tier Cards:**
- **Starter (KES 300/mo)**: "Perfect for stores with up to 50 orders/month"
- **Growth (KES 700/mo)**: "For growing stores with 51-200 orders/month"  
- **Pro (KES 1,500/mo)**: "For high-volume stores with 200+ orders/month"

**CTA:** "Start 30-Day Free Trial" or "Subscribe Now"

### Trial Banner
"🎁 Your free trial ends in {days} days. [Upgrade Now]"

---

*Document created: January 27, 2026*
