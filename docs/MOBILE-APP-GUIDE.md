# Jari.Ecom V2 - Mobile App Guide
## Capacitor Implementation for Native Android/iOS
## Created: January 21, 2026
## Status: PHASE 1 COMPLETE ✅

---

## CURRENT STATUS

### ✅ Completed (January 21, 2026)
- Capacitor core and CLI installed
- Android platform added (53 files)
- SDK path configured
- Debug APK built successfully (4.2MB)
- npm scripts added
- Documentation complete

### 📱 APK Ready for Testing
```
C:\Users\ADMIN\Desktop\jari-ecom-v2\dashboard\android\app\build\outputs\apk\debug\app-debug.apk
```

### ⏳ Pending
- Test on physical Android phone
- Fix emulator hypervisor (Hyper-V)
- Custom app icon
- Custom splash screen
- DUNS number approval
- Play Store submission

---

## 1. ARCHITECTURE OVERVIEW

### The Hybrid Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     SINGLE REACT CODEBASE                       │
│                      dashboard/src/                             │
├─────────────────────────────────────────────────────────────────┤
│                             │                                   │
│              ┌──────────────┴──────────────┐                    │
│              ▼                             ▼                    │
│    ┌─────────────────┐           ┌─────────────────┐           │
│    │   WEB BUILD     │           │  NATIVE BUILD   │           │
│    │                 │           │                 │           │
│    │  npm run build  │           │  npm run build  │           │
│    │       ↓         │           │       ↓         │           │
│    │    dist/        │           │  npx cap sync   │           │
│    │       ↓         │           │       ↓         │           │
│    │   Netlify       │           │  android/ios/   │           │
│    │                 │           │       ↓         │           │
│    │  Web Users      │           │  APK / IPA      │           │
│    │  (Browser)      │           │  (App Stores)   │           │
│    └─────────────────┘           └─────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What Stays Web-Only
- **Storefronts** (`store/`) - Customer-facing stores remain web + PWA
- Customers access via browser or "Add to Home Screen"
- No app download required for buyers

### What Gets Native App
- **Dashboard** (`dashboard/`) - Merchant admin panel
- Available as: Web + Android APK + iOS App
- Native features: Push notifications, camera, deep links

---

## 2. PROJECT STRUCTURE (After Capacitor)

```
dashboard/
├── src/                    # React source (UNCHANGED)
│   ├── App.jsx
│   ├── pages/
│   ├── components/
│   ├── api/
│   └── hooks/
│
├── dist/                   # Web build output
│   └── (Netlify deploys this)
│
├── android/                # NEW - Android native project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/jari/dashboard/
│   │   │   └── res/
│   │   └── build.gradle
│   ├── gradle/
│   └── build.gradle
│
├── ios/                    # NEW - iOS native project (Mac required)
│   ├── App/
│   │   ├── App/
│   │   │   ├── Info.plist
│   │   │   └── Assets.xcassets/
│   │   └── App.xcodeproj/
│   └── Podfile
│
├── resources/              # NEW - App assets source
│   ├── icon.png           # 1024x1024 app icon
│   ├── splash.png         # 2732x2732 splash screen
│   └── adaptive-icon/     # Android adaptive icon
│       ├── foreground.png
│       └── background.png
│
├── capacitor.config.ts     # NEW - Capacitor configuration
├── package.json            # Updated with Capacitor deps
└── vite.config.js          # May need base URL adjustment
```

---

## 3. SETUP INSTRUCTIONS

### Step 1: Install Capacitor

```bash
cd C:\Users\ADMIN\Desktop\jari-ecom-v2\dashboard

# Install core Capacitor packages
npm install @capacitor/core @capacitor/cli

# Install platform packages
npm install @capacitor/android
# npm install @capacitor/ios  # Only if Mac available

# Initialize Capacitor
npx cap init "Jari Dashboard" "com.jarisolutions.dashboard"
```

### Step 2: Configure Capacitor

Create `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jarisolutions.dashboard',
  appName: 'Jari Dashboard',
  webDir: 'dist',
  server: {
    // For development - connects to live API
    // Remove or change for production
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    }
  }
};

export default config;
```

### Step 3: Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "cap:sync": "npx cap sync",
    "cap:android": "npx cap open android",
    "cap:ios": "npx cap open ios",
    "build:android": "npm run build && npx cap sync android",
    "build:ios": "npm run build && npx cap sync ios"
  }
}
```

### Step 4: Add Android Platform

```bash
# Add Android platform (creates android/ folder)
npx cap add android

# Build web and sync to Android
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 5: Configure Android

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">Jari Dashboard</string>
    <string name="title_activity_main">Jari Dashboard</string>
    <string name="package_name">com.jarisolutions.dashboard</string>
</resources>
```

---

## 4. BUILD COMMANDS

### Development Workflow

```bash
# Web development (unchanged)
npm run dev

# Build for all platforms
npm run build

# Sync to native projects
npx cap sync

# Or combined:
npm run build:android
```

### Creating APK for Testing

**Option A: Android Studio (GUI)**
1. `npx cap open android`
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. Find APK in `android/app/build/outputs/apk/debug/`

**Option B: Command Line**
```bash
cd android
./gradlew assembleDebug
# APK at: app/build/outputs/apk/debug/app-debug.apk
```

### Creating Release APK (For Play Store)

```bash
cd android

# Generate signing key (one time)
keytool -genkey -v -keystore jari-release.keystore -alias jari -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
./gradlew assembleRelease

# Or build AAB (Android App Bundle - preferred for Play Store)
./gradlew bundleRelease
```

---

## 5. DEPLOYMENT MATRIX

| Target | Build Command | Output | Distribution |
|--------|---------------|--------|--------------|
| Web | `npm run build` | `dist/` | Netlify auto-deploy |
| Android Debug | `./gradlew assembleDebug` | `.apk` | Direct install/share |
| Android Release | `./gradlew bundleRelease` | `.aab` | Play Store |
| iOS | Xcode Archive | `.ipa` | App Store / TestFlight |

### APK Distribution (Before Play Store)

1. **Direct Share:** Send APK via WhatsApp, email, Google Drive
2. **QR Code:** Host APK, generate QR for download link
3. **Firebase App Distribution:** Free beta testing platform
4. **Internal Testing Track:** Play Store internal testing (once account ready)

---

## 6. NATIVE FEATURES ROADMAP

### Phase 1: Basic Wrapper (Week 1)
- [x] Capacitor setup
- [x] Android project generation
- [ ] App icon and splash screen
- [ ] Status bar configuration
- [ ] Safe area handling
- [ ] Basic APK build

### Phase 2: Essential Features (Week 2)
- [ ] **Push Notifications** - New orders, bookings
  - Package: `@capacitor/push-notifications`
  - Backend: Firebase Cloud Messaging (FCM)
  
- [ ] **Camera Access** - Product photos
  - Package: `@capacitor/camera`
  - Usage: Dashboard product upload
  
- [ ] **Share** - Share store link
  - Package: `@capacitor/share`

### Phase 3: Enhanced Features (Week 3)
- [ ] **Deep Links** - Open specific pages from notifications
  - Package: `@capacitor/app`
  - Example: `jari://orders/123`
  
- [ ] **Biometric Auth** - Fingerprint/Face login
  - Package: `capacitor-native-biometric`
  
- [ ] **Local Storage** - Offline data caching
  - Package: `@capacitor/preferences`

### Phase 4: M-Pesa Integration (Week 4)
- [ ] **App Links** - M-Pesa app deep links
  - Open M-Pesa directly for payment
  - Return to Jari after payment
  
- [ ] **Intent Handling** - Receive payment confirmations

---

## 7. APP STORE REQUIREMENTS

### Google Play Store

**Account Requirements:**
- Google Play Developer Account ($25 one-time)
- DUNS number for organization account ⏳ (in progress)

**App Requirements:**
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: Min 2, recommended 8
  - Phone: 1080x1920 or similar
  - Tablet: 1200x1920 (optional)
- Short description: 80 chars max
- Full description: 4000 chars max
- Privacy policy URL (required)
- App category: Business
- Content rating questionnaire

**Technical Requirements:**
- Target API level 34+ (Android 14)
- 64-bit support
- App signing by Google Play

### Apple App Store

**Account Requirements:**
- Apple Developer Account ($99/year)
- DUNS number for organization
- Mac computer with Xcode

**App Requirements:**
- App icon: 1024x1024 PNG (no transparency)
- Screenshots for each device size
- App preview video (optional)
- Description, keywords, support URL
- Privacy policy URL
- Age rating questionnaire

---

## 8. STORE LISTING DRAFT

### App Name
**Jari Dashboard** or **Jari Seller** or **Jari Business**

### Short Description (80 chars)
"Manage your online store, orders, and bookings from anywhere."

### Full Description
```
Jari Dashboard puts your entire online business in your pocket.

📦 MANAGE PRODUCTS
• Add, edit, and organize your products
• Upload photos directly from your phone
• Set prices, descriptions, and inventory

📋 TRACK ORDERS
• Real-time order notifications
• View customer details and delivery info
• Update order status on the go

📅 HANDLE BOOKINGS
• Accept and manage service bookings
• Set your availability and working hours
• Block dates for holidays or personal time

💰 M-PESA PAYMENTS
• Receive payments via M-Pesa
• Track payment confirmations
• Generate sales reports

🏪 CUSTOMIZE YOUR STORE
• Choose from multiple templates
• Set your store colors and branding
• Configure payment and delivery options

Perfect for:
• Online sellers on Instagram and WhatsApp
• Service providers (photographers, consultants, trainers)
• Small businesses in Kenya and East Africa

Get started free at jari.eco
```

### Keywords
`online store, e-commerce, M-Pesa, Kenya, sell online, small business, booking, orders`

---

## 9. PRIVACY POLICY REQUIREMENTS

Required sections for app stores:
1. What data we collect
2. How we use the data
3. Data storage and security
4. Third-party services (M-Pesa, Cloudinary, etc.)
5. User rights (access, deletion)
6. Contact information
7. Policy updates

**Action:** Create page at `https://jari.eco/privacy` or `https://jari-dashboard.netlify.app/privacy`

---

## 10. TIMELINE ESTIMATE

### With DUNS Pending (~4 weeks)

| Week | Tasks | Deliverable |
|------|-------|-------------|
| **1** | Capacitor setup, Android build | APK for testing |
| **2** | Native features, polish | Feature-complete APK |
| **3** | Store assets, privacy policy | Submission-ready |
| **4** | Testing, bug fixes | Stable release |
| **DUNS** | Submit to Play Store | 🚀 Live! |

### iOS Timeline (Additional)
- Requires Mac + Apple Developer account
- Add 1-2 weeks after Android
- Can use cloud build services if no Mac

---

## 11. TESTING CHECKLIST

### Functionality
- [ ] All pages load correctly
- [ ] API calls work (login, data fetch)
- [ ] Navigation works (back button, deep links)
- [ ] Forms submit properly
- [ ] Images load from Cloudinary
- [ ] Pull-to-refresh (if implemented)

### Native Feel
- [ ] Status bar styled correctly
- [ ] Safe areas respected (notch, home indicator)
- [ ] Splash screen displays
- [ ] App icon appears correctly
- [ ] Keyboard doesn't cover inputs
- [ ] Back button behavior correct

### Performance
- [ ] App launches in < 3 seconds
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Reasonable battery usage

### Edge Cases
- [ ] Offline behavior (error message)
- [ ] Session expiry handling
- [ ] Large data sets (many products)
- [ ] Slow network conditions

---

## 12. QUICK REFERENCE COMMANDS

```bash
# === SETUP ===
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Jari Dashboard" "com.jarisolutions.dashboard"
npx cap add android

# === DAILY WORKFLOW ===
npm run build              # Build web
npx cap sync               # Sync to native
npx cap open android       # Open Android Studio

# === BUILD APK ===
cd android
./gradlew assembleDebug    # Debug APK
./gradlew assembleRelease  # Release APK
./gradlew bundleRelease    # AAB for Play Store

# === COMMON ISSUES ===
npx cap doctor             # Check setup
npx cap sync --inline      # Force sync
adb devices                # Check connected devices
adb install app.apk        # Install via ADB
```

---

## 13. FILES TO GITIGNORE

Add to `.gitignore`:
```
# Capacitor
android/app/build/
android/.gradle/
android/local.properties
android/*.iml
ios/App/Pods/
ios/App/build/

# Signing keys (NEVER commit!)
*.keystore
*.jks
```

---

## 14. COST SUMMARY

| Item | Cost | Frequency |
|------|------|-----------|
| Google Play Developer | $25 | One-time |
| Apple Developer | $99 | Annual |
| Firebase (push notifications) | Free tier | - |
| Capacitor | Free | - |
| Android Studio | Free | - |
| Xcode | Free | - |

**Total to launch Android:** $25
**Total to launch iOS:** $99/year additional

---

*Document created: January 21, 2026*
*Status: Planning phase - DUNS application pending*
