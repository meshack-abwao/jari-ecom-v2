# Jari.Ecom V2 - Handover Context
## Session: January 22, 2026 (Evening)
## Status: PBK TEMPLATE REFINEMENTS COMPLETE ✅

---

## 🎯 TODAY'S PROGRESS (January 22, Evening)

### PBK Template - What's Included Section
| Fix | Description |
|-----|-------------|
| **2-col grid layout** | Description + What's Included side-by-side on desktop |
| **Title inside card** | Matches Deep Dive Specs card pattern |
| **Single column list** | Removed 2-col grid inside card |
| **Breathing room** | Added spacing from hero and between sections |
| **Typography legibility** | Font sizes updated to match DD specs (fs-body = 15px) |
| **CTA icon position** | Calendar icon now AFTER "Check Availability" text |

### Design Principles Applied
- **JTBD/ODI:** Trust-building before purchase decision
- **Typography Psychology:** Processing fluency = easier to read = more trust
- **Grid System:** 2-column balanced layout on desktop, stacked on mobile

### Commits This Session
```
d2b4447 PBK-mobile-breathing-room-CTA-icon-after-text
5ffad26 PBK-description-top-padding-content-grid-breathing-room
b8096ca docs-update-formula4-commit-as-you-go-phases
f09cabe PBK-typography-legibility-match-DD-specs-card-style
438758f PBK-WhatsIncluded-single-col-compact-remove-grid-override
0823be0 PBK-WhatsIncluded-title-inside-card-single-col-breathing-room
cb39ce3 PBK-2col-grid-Description-WhatsIncluded-side-by-side-desktop
```

---

## 1. PROJECT OVERVIEW

### What is Jari.Ecom?
E-commerce platform for solo entrepreneurs and small teams in Kenya/East Africa.
- Instagram/WhatsApp-focused sellers
- M-Pesa integration for payments
- Multiple store templates for different business types
- **NEW: Native Android app via Capacitor**

### Tech Stack
| Layer | Technology |
|-------|------------|
| Dashboard | React + Vite + **Capacitor** |
| Storefront | Vanilla JS + CSS |
| API | Node.js + Express |
| Database | PostgreSQL (Railway) |
| Hosting | Netlify (frontend), Railway (API + DB) |
| Mobile | **Capacitor (Android ready, iOS pending)** |

### Repository Structure
```
C:\Users\ADMIN\Desktop\jari-ecom-v2\
├── api/                    # Express backend
├── dashboard/              # React admin + Capacitor
│   ├── src/                # React source
│   ├── dist/               # Web build (Netlify)
│   ├── android/            # NEW: Android native project
│   ├── resources/          # NEW: App icon/splash sources
│   └── capacitor.config.json
├── store/                  # Public storefront (web only)
├── shared/                 # Utilities
└── docs/                   # Documentation
    ├── HANDOVER-CONTEXT.md
    ├── MOBILE-APP-GUIDE.md # NEW: Complete mobile guide
    └── PROJECT-INSTRUCTIONS.md
```

---

## 2. MOBILE APP STATUS (NEW!)

### ✅ COMPLETED - January 21, 2026
| Task | Status | Notes |
|------|--------|-------|
| Capacitor core installed | ✅ | @capacitor/core, @capacitor/cli |
| Android platform added | ✅ | 53 files in dashboard/android/ |
| SDK path configured | ✅ | local.properties created |
| Debug APK built | ✅ | 4.2MB, ready to install |
| npm scripts added | ✅ | build:android, cap:sync, etc. |
| Documentation | ✅ | MOBILE-APP-GUIDE.md |

### APK Location
```
C:\Users\ADMIN\Desktop\jari-ecom-v2\dashboard\android\app\build\outputs\apk\debug\app-debug.apk
```

### New npm Scripts
```bash
npm run build:android    # Build web + sync to Android
npm run cap:sync         # Sync web changes to native
npm run cap:android      # Open in Android Studio
npm run apk:debug        # Build debug APK (run from android folder)
npm run apk:release      # Build release APK
```

### Build Commands (Git Bash)
```bash
# Full rebuild
cd /c/Users/ADMIN/Desktop/jari-ecom-v2/dashboard
npm run build
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug
```

### Known Issue: Emulator Hypervisor
- Android Studio shows "Install Android Emulator hypervisor driver"
- **Workaround:** Use physical Android phone via USB debugging
- **Fix:** Enable Hyper-V in Windows Features, restart PC

### Pending for Mobile
- [ ] Test APK on physical phone
- [ ] Fix emulator hypervisor issue
- [ ] Custom app icon (1024x1024 PNG)
- [ ] Custom splash screen
- [ ] DUNS number approval (in progress)
- [ ] Play Store submission

---

## 3. DEBUG FORMULAS (CRITICAL)

### Formula 1: API Response Pattern
```javascript
// ✅ CORRECT - API returns store object directly
const response = await settingsAPI.getAll();
const store = response.data;
const slug = store.slug;

// ❌ WRONG - These cause "Cannot read property of undefined"
const store = response.data.store;
const store = response.data.settings;
```

### Formula 2: CSS Isolation
- Template prefixes: `pbk-` (Portfolio/Booking), `bkm-` (Booking Modal), `dd-` (Deep Dive)
- Use CSS vars: `--fs-*`, `--space-*`
- Never use generic class names that could conflict

### Formula 3: Git on Windows
```bash
# Git Bash (PREFERRED - set as default shell)
cd /c/Users/ADMIN/Desktop/jari-ecom-v2
git add -A && git commit -m "message" && git push origin main

# CMD (use hyphens in commit messages, no spaces)
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2
git add -A && git commit -m "message-no-spaces"
```

### Formula 4: Surgical Edits + Commit As You Go
1. `read_file` with offset/length to see current state
2. `edit_block` with exact old_string match
3. **COMMIT IMMEDIATELY after each logical change** - prevents memory loss!
4. Build in phases - don't make 10 changes before committing
5. Small, focused commits = easy rollback + context preservation

### Formula 5: Store Config Access (Storefront)
```javascript
window.JARI_STORE_CONFIG = data.store;
const payment = window.JARI_STORE_CONFIG?.payment || {};
```

### Formula 6: Database Migrations - Keep Both in Sync!
```javascript
// Update BOTH when adding columns:
// 1. api/migrations/00X_name.sql
// 2. api/src/index.js runMigrations()
```

### Formula 7: Capacitor Workflow
```bash
# After ANY React code change:
npm run build          # Build web
npx cap sync android   # Sync to Android

# Then rebuild APK:
cd android && ./gradlew assembleDebug
```

### Formula 8: Android SDK Path
```properties
# dashboard/android/local.properties
sdk.dir=C:\\Users\\ADMIN\\AppData\\Local\\Android\\Sdk
```

### Formula 9: Mobile Elements - Responsive Shrink with clamp()
```css
/* ❌ PROBLEM: Fixed-size elements get cut off at screen edges on narrow mobiles */
.story-bubble {
    width: 54px;
    min-width: 54px;  /* Forces cutoff */
}

/* ✅ FIX: Use clamp() for responsive shrinking */
.story-bubble {
    width: clamp(44px, 12vw, 54px);  /* min, preferred, max */
    height: clamp(44px, 12vw, 54px);
    min-width: 44px;  /* Smaller min allows shrink */
}

/* Also add horizontal padding to container */
.stories-row {
    padding: 0 var(--space-lg);  /* Breathing room from edges */
}
```

---

## 4. TEMPLATE SYSTEM

### Available Templates
| Template | Purpose | Status |
|----------|---------|--------|
| Quick Decision | Fast impulse buys | ✅ Complete |
| Deep Dive | High-value items, specs | ✅ Complete |
| Visual Menu | Food/menu items | ✅ Complete |
| Event Landing | Events/tickets | ✅ Complete |
| Portfolio/Booking | Services, photographers | ✅ Complete |

### Two Checkout Flows
1. **Product Checkout** (`store/src/checkout.js`) - Products
2. **Booking Modal** (`store/src/booking/`) - Services

Both support M-Pesa payment instructions!

---

## 5. M-PESA STATUS

### Phase 1: Manual Instructions ✅ COMPLETE
- Dashboard: Payment settings (Paybill/Till)
- Storefront: Shows payment instructions
- Tracks M-Pesa codes in database

### Phase 2: STK Push (SHELVED)
- Partner: IntaSend WaaS
- Status: Awaiting partnership confirmation

---

## 6. SHELVED IDEAS (Future Work)

### 🔴 HIGH PRIORITY

#### Mobile App Polish
- Custom app icon and splash screen
- Push notifications for new orders/bookings
- Camera integration for product photos
- Play Store submission (when DUNS ready)

#### M-Pesa WaaS Integration (Phase 2)
- IntaSend partnership
- Automatic STK Push

#### User Accounts & Authentication
- Customer registration/login
- Order history, saved addresses

### 🟡 MEDIUM PRIORITY

#### SMS/WhatsApp Reminders
- 5hr, 2hr, 30min before booking
- Africa's Talking or Twilio

#### Real Discount Codes
- Dashboard UI to create codes
- Validation on checkout

#### Multi-Select Categories
- Services in multiple categories

### 🟢 LOW PRIORITY
- iOS app (requires Mac)
- Dashboard debouncing
- Confirmation emails
- PWA for storefronts

---

## 7. ENVIRONMENT URLS

| Service | URL |
|---------|-----|
| Dashboard (Web) | https://jari-dashboard.netlify.app |
| Store | https://jariecommstore.netlify.app |
| API | https://jari-api-production.up.railway.app |
| GitHub | github.com/meshack-abwao/jari-ecom-v2 |

**Note:** Store URL is `jariecommstore` (double-m)

---

## 8. RECENT COMMITS (January 22, 2026)

```
e52c336 Checkout-JTBD-redesign-3-steps-progress-bar-product-image-trust-badges
27eae8e DD-desktop-CTA-pill-shape-border-radius-100px
9c0aca6 DD-share-icon-paper-plane-thumbnails-responsive-shrink-clamp-padding
402c4e4 DD-CTA-pill-container-better-copy-theme-price-KES-above-paper-plane-icon
edbbda3 DD-stories-responsive-shrink-clamp-prevent-edge-cutoff
64be6ab docs-update-handover-formula9-responsive-clamp-stories-fix
2d16511 docs-complete-handover-mobile-phase1-complete
```

---

## 9. KEY FILES FOR MOBILE

| File | Purpose |
|------|---------|
| `dashboard/capacitor.config.json` | Capacitor settings |
| `dashboard/android/` | Android native project |
| `dashboard/android/local.properties` | SDK path |
| `dashboard/android/app/build/outputs/apk/debug/` | APK output |
| `dashboard/resources/` | Icon/splash sources |
| `docs/MOBILE-APP-GUIDE.md` | Complete mobile guide |

---

## 10. NEXT SESSION PRIORITIES

### PBK Template (COMPLETE ✅)
- [x] 2-col grid Description + What's Included
- [x] Title inside card (like DD Specs)
- [x] Single column list items
- [x] Typography legibility (fs-body = 15px)
- [x] CTA icon after text
- [x] Mobile breathing room

### Checkout Flow Trust Pills (NEXT)
- [ ] Extend pill design across checkout steps
- [ ] Apply JTBD/ODI trust-building principles
- [ ] Typography Psychology for confidence
- [ ] Theme-consistent styling

### Mobile App
- [ ] Test APK on physical phone - Connect via USB, enable USB debugging
- [ ] Fix emulator - Enable Hyper-V in Windows Features
- [ ] App icon - Create 1024x1024 Jari logo PNG
- [ ] Splash screen - Create 2732x2732 splash PNG

---

## 11. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                     SINGLE REACT CODEBASE                       │
│                      dashboard/src/                             │
├─────────────────────────────────────────────────────────────────┤
│                             │                                   │
│              ┌──────────────┴──────────────┐                   │
│              ▼                             ▼                    │
│    ┌─────────────────┐           ┌─────────────────┐          │
│    │   WEB BUILD     │           │  NATIVE BUILD   │          │
│    │  npm run build  │           │  npx cap sync   │          │
│    │       ↓         │           │       ↓         │          │
│    │    dist/        │           │   android/      │          │
│    │       ↓         │           │       ↓         │          │
│    │   Netlify       │           │  APK / Play     │          │
│    └─────────────────┘           └─────────────────┘          │
│                                                                │
│    STOREFRONTS (Web Only)                                      │
│    ┌─────────────────────────────────────────────┐            │
│    │  store/ → Netlify → yourstore.jari.eco      │            │
│    └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. QUICK REFERENCE

### Start Development
```bash
# Dashboard (web)
cd /c/Users/ADMIN/Desktop/jari-ecom-v2/dashboard
npm run dev

# API
cd /c/Users/ADMIN/Desktop/jari-ecom-v2/api
npm run dev

# Store
cd /c/Users/ADMIN/Desktop/jari-ecom-v2/store
npm run dev
```

### Build & Deploy Mobile
```bash
cd /c/Users/ADMIN/Desktop/jari-ecom-v2/dashboard
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
# APK at: app/build/outputs/apk/debug/app-debug.apk
```

### Git Workflow
```bash
cd /c/Users/ADMIN/Desktop/jari-ecom-v2
git add -A
git commit -m "prefix: description"
git push origin main
```

---

*Last updated: January 21, 2026 ~22:30 EAT*
*Author: Claude (AI Assistant)*
*Session: Mobile App Phase 1 Complete*
