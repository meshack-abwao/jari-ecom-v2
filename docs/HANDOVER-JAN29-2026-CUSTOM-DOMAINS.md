# HANDOVER: Custom Domain Feature - January 29, 2026

## 🎉 FEATURE COMPLETE: Custom Domain Masking

### What Was Built
Store owners can now use their own domain (e.g., `lanixkenya.com`) instead of the default URL (`jarisolutionsecom.store/?store=lanixkenya`).

### Live Example
- **Custom Domain:** https://lanixkenya.com ✅ Working!
- **Default URL:** https://jarisolutionsecom.store/?store=lanixkenya ✅ Still works!

---

## 📁 Files Created/Modified

### New Files
| File | Purpose |
|------|---------|
| `api/migrations/012_custom_domains.sql` | Database schema for custom domains |
| `api/src/routes/domains.js` | API endpoints for domain management |
| `store/src/config.js` | Centralized configuration (SINGLE SOURCE OF TRUTH) |
| `docs/NEW-DEBUG-FORMULAS-27-28.md` | New debug formulas for CORS and WWW handling |

### Modified Files
| File | Changes |
|------|---------|
| `api/src/routes/index.js` | Added domains routes registration |
| `api/src/index.js` | Changed CORS to `origin: true` for custom domain support |
| `api/src/config/env.js` | Updated CORS config comment |
| `dashboard/src/api/client.js` | Added `domainsAPI` client |
| `dashboard/src/pages/SettingsPage.jsx` | Added Custom Domain section with DNS instructions |
| `store/src/main.js` | Added custom domain detection logic |
| `store/src/state.js` | Added `setCustomDomainSlug` function |
| `store/src/api.js` | Import API_URL from config.js |

---

## 🗄️ Database Schema

### Stores Table Additions
```sql
custom_domain VARCHAR(255) UNIQUE
domain_verified BOOLEAN DEFAULT false
domain_ssl_status VARCHAR(50) DEFAULT 'pending'
domain_type VARCHAR(20) DEFAULT 'subdomain'
domain_added_at TIMESTAMP
domain_verified_at TIMESTAMP
```

### New Table: domain_verifications
```sql
CREATE TABLE domain_verifications (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id),
  domain VARCHAR(255) NOT NULL,
  verification_token VARCHAR(255) NOT NULL,
  verification_method VARCHAR(50) DEFAULT 'dns_txt',
  status VARCHAR(50) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  verified_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(store_id, domain)
);
```

---

## 🔌 API Endpoints

### Public (No Auth)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/domain/lookup/:domain` | Lookup store by custom domain |

### Authenticated
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/domains/settings` | Get current domain settings |
| POST | `/api/domains/setup` | Add/setup custom domain |
| POST | `/api/domains/verify` | Verify DNS records |
| DELETE | `/api/domains/remove` | Remove custom domain |
| POST | `/api/domains/manual-verify` | Manual verification (admin/beta) |

---

## 🔄 User Flow (Complete)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Dashboard → Settings → Custom Domain                │
│         Enter: "lanixkenya.com" or "shop.lanixkenya.com"    │
│         Click: "Add Domain"                                  │
├─────────────────────────────────────────────────────────────┤
│ STEP 2: At Namecheap/GoDaddy, add DNS records:              │
│                                                             │
│   For ROOT DOMAIN (lanixkenya.com):                         │
│   • TXT: _jari-verify → jari-verify-xxxxx                   │
│   • A: @ → 75.2.60.5                                        │
│   • A: @ → 99.83.190.102                                    │
│   • CNAME: www → jarisolutionsecom.store                    │
│                                                             │
│   For SUBDOMAIN (shop.lanixkenya.com):                      │
│   • TXT: _jari-verify → jari-verify-xxxxx                   │
│   • CNAME: shop → jarisolutionsecom.store                   │
├─────────────────────────────────────────────────────────────┤
│ STEP 3: Wait 15-30 minutes for DNS propagation              │
├─────────────────────────────────────────────────────────────┤
│ STEP 4: Dashboard → Click "Verify Now"                      │
│                                                             │
│         BEHIND THE SCENES (automatic):                      │
│         ✓ Check DNS TXT record                              │
│         ✓ Auto-add domain to Netlify via API                │
│         ✓ SSL provisioned by Netlify                        │
│         ✓ Mark as verified in database                      │
├─────────────────────────────────────────────────────────────┤
│ STEP 5: Done! 🎉                                            │
│         • lanixkenya.com → Shows Lanix Kenya store          │
│         • Default URL still works too!                      │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Variables Required

### Railway (API)
| Variable | Purpose |
|----------|---------|
| `NETLIFY_ACCESS_TOKEN` | Netlify API token for auto-provisioning |
| `NETLIFY_SITE_ID` | Store site ID (`cf6a58bd-1b7d-437a-a854-1a01c4f26fc9`) |

### How to get Netlify Access Token
1. Go to: https://app.netlify.com/user/applications#personal-access-tokens
2. Click "New access token"
3. Name it: `jari-domain-automation`
4. Copy the token

---

## 🐛 Debug Formulas Added

### Formula 22: DNS Propagation Delays
- DNS changes take 15 min to 48 hours
- Show "wait" messaging to users

### Formula 23: Domain Case Sensitivity
- Always normalize to lowercase
- Use `.toLowerCase()` on all domain operations

### Formula 24: Multi-Part TLD Detection
- Handle `.co.ke`, `.co.uk`, etc.
- Check if domain ends with known multi-part TLDs

### Formula 25: Custom Domain Skip Logic
- Skip API lookup for known main domains
- Maintain list in `config.js`

### Formula 26: Hardcoded URLs
- NEVER hardcode URLs except in `config.js`
- Always import from centralized config

### Formula 27: CORS with Credentials ⚠️ CRITICAL
- Use `origin: true` not `origin: '*'`
- `*` doesn't work with `credentials: true`

### Formula 28: WWW vs Non-WWW
- Strip `www.` prefix in normalization
- Both should resolve to same store

---

## 🔧 Key Technical Decisions

### 1. Centralized Config (`store/src/config.js`)
All URLs in one place. Never hardcode elsewhere.

### 2. CORS `origin: true`
Reflects any requesting origin. Required because we can't predict what custom domains users will add.

### 3. WWW Normalization
Strip `www.` prefix so `lanixkenya.com` and `www.lanixkenya.com` resolve to the same store.

### 4. Netlify Auto-Provisioning
After DNS verification, automatically add domain to Netlify via their API. User never needs to touch Netlify.

### 5. Store Independence
Each store's custom domain is independent. Adding a domain for Lanix Kenya doesn't affect Nimoration or any other store.

---

## 📋 Store Independence Explained

```
LANIX KENYA:
├── Default: jarisolutionsecom.store/?store=lanixkenya ✅ Always works
└── Custom:  lanixkenya.com ✅ After setup

NIMORATION:
├── Default: jarisolutionsecom.store/?store=nimoration ✅ Always works
└── Custom:  (none yet - until she decides to add one)

OTHER STORES:
├── Default: jarisolutionsecom.store/?store=slug ✅ Always works
└── Custom:  (their own domain when ready)
```

---

## 🚀 Future Enhancements (Idea Shelf)

1. **Subdomain of main domain** - e.g., `lanixkenya.jarisolutionsecom.store`
2. **White-label option** - Remove all Jari branding
3. **Domain health monitoring** - Alert if SSL expires or DNS breaks
4. **Bulk domain management** - For agencies managing multiple stores

---

## 📊 Pricing (Planned)

| Tier | Price | Features |
|------|-------|----------|
| Subdomain | KES 500/mo | shop.yourdomain.com |
| Root Domain | KES 1,000/mo | yourdomain.com |
| White Label | KES 2,000/mo | Full rebranding |

---

## ✅ Testing Checklist

- [x] Add domain in dashboard
- [x] DNS instructions displayed correctly
- [x] TXT record verification works
- [x] A record / CNAME routing works
- [x] Netlify auto-provisioning works
- [x] SSL certificate provisioned
- [x] Custom domain loads correct store
- [x] WWW and non-WWW both work
- [x] Default URL still works after custom domain
- [x] Remove domain works
- [x] Other stores unaffected

---

## 📝 Git Commits (This Session)

```
5e26029 Migration-012-Add-custom-domains-schema
0d8adcc API-Add-domains-routes-lookup-setup-verify-remove-endpoints
e41ddf1 Dashboard-Add-domainsAPI-client
797130f Dashboard-Add-custom-domain-section-to-SettingsPage
f37c0ec Storefront-Add-custom-domain-detection
74f678c Docs-Add-debug-formulas-22-25
69945ce API-Add-Netlify-auto-provisioning
f279e47 Security-Remove-hardcoded-Netlify-credentials
78ae392 Fix-Store-API-URL-fallback (wrong URL)
b687c52 Fix-Use-correct-Railway-URL
1117218 Refactor-Centralize-all-URLs-in-config-js
7d414e2 Fix-Strip-www-prefix-in-domain-lookup
[latest] Fix-CORS-use-origin-true-to-allow-all-origins
```

---

## 🎯 Next Steps

1. **Restore DEBUG-FORMULAS.md** from git and append new formulas
2. **Add to AddOnsPage.jsx** as premium feature with pricing
3. **Test with another store** (e.g., Nimoration) to confirm independence
4. **Document for affiliates** - Simple guide for store owners

---

*Handover complete. Custom domains are live and working!*
