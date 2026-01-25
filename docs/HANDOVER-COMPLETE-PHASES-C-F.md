# 🎯 JARI.ECOM V2 - COMPLETE PROJECT HANDOVER
## For Next Chat Session - Phase C through Final Phase

**Date:** January 25, 2026  
**Current Status:** Phase B Complete, Ready for Phase C  
**Last Commit:** `bcfaf78`

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Current State - What's Complete](#current-state)
3. [Phase B Summary](#phase-b-summary)
4. [Remaining Phases (C-F)](#remaining-phases)
5. [Critical Technical Patterns](#critical-technical-patterns)
6. [Database Schema](#database-schema)
7. [API Endpoints Available](#api-endpoints-available)
8. [Environment Configuration](#environment-configuration)
9. [Design System](#design-system)
10. [Known Issues & Workarounds](#known-issues)
11. [Next Session Start Guide](#next-session-start)

---

## 1. PROJECT OVERVIEW

### What is Jari.Ecom V2?
E-commerce platform for Kenyan solo entrepreneurs and small teams. Specifically built for Instagram/WhatsApp sellers who need professional online stores with M-Pesa integration.

### Core Tech Stack
```
Frontend (Dashboard): React + Vite → Netlify
Frontend (Storefront): Vanilla JS → Netlify
Backend (API): Node.js + Express → Railway
Database: PostgreSQL → Railway
Images: Cloudinary
Payments: M-Pesa (Daraja API) + IntaSend (WaaS)
SMS: Africa's Talking (OTP, notifications)
```

### Live URLs
```
Storefront: https://jarisolutionsecom.store
Dashboard: https://dashboard.jarisolutionsecom.store
API: https://jari-api-production.up.railway.app
```

### Team
- **Mesh:** Technical Lead (that's you!)
- **Charles:** CEO

---

## 2. CURRENT STATE - WHAT'S COMPLETE ✅

### ✅ Phase A: Database Foundation (100%)
**Commit:** `93e4e03`

**Tables Created (Migration 008):**
```sql
-- Pricing & Plans
pricing_config              -- Base prices, add-ons, card bundles, themes

-- Merchant Verification (4-tier system)
merchant_verification       -- BASIC/VERIFIED/BUSINESS/PREMIUM
settlement_rules            -- Per-merchant payout rules
merchant_badges            -- Trust scores: Bronze/Silver/Gold/Platinum

-- Security & Fraud
fraud_thresholds           -- Graduated detection (beta/early_growth/scale)
customer_complaints        -- Order confirmation link only
complaint_metrics          -- Per-merchant complaint stats
chargebacks               -- Chargeback tracking

-- Purchases
card_purchases            -- Card limit unlocks (add not set)
theme_purchases           -- Template purchases
```

**Key Business Rules:**
- IntaSend partnership: 3% transaction fee
- Jari commission: 2% of transaction
- Merchant payout: 95%
- Base subscription: KES 1,200/month
- M-Pesa add-on: +KES 300/month
- WhatsApp auto-reply: +KES 80/month

**Verification Tiers:**
```
BASIC:
  - Limits: KES 50k/month, KES 10k/transaction
  - Settlement: 3-day hold
  - Required: Phone + Email verification

VERIFIED:
  - Limits: KES 500k/month, KES 50k/transaction
  - Settlement: 2-day hold
  - Required: National ID (front + back)

BUSINESS:
  - Limits: KES 2M/month, KES 200k/transaction
  - Settlement: 1-day hold
  - Required: Business Registration, KRA PIN, Business Permit

PREMIUM:
  - Limits: Unlimited
  - Settlement: Instant (whitelisted)
  - Required: CR12 Certificate, Incorporation Docs, Bank Statements
```

---

### ✅ Phase B: Backend APIs (100%)
**Commits:** `2e1f5a4` through `15b2a58`

**B1: Enhanced Signup API**
```
POST /api/auth/signup/business-type
  → Returns: defaultTemplate, smartAddons based on business type
  
POST /api/auth/signup/complete
  → Creates: user, store, merchant_verification, settlement_rules,
             complaint_metrics, merchant_badges
  → Returns: JWT + store details
```

**Business Type → Template Mapping:**
```javascript
food      → vm  (Visual Menu)     + [mpesa_stk, whatsapp_auto]
services  → pbk (Portfolio/Booking) + [mpesa_stk]
products  → qd  (Quick Decision)   + [mpesa_stk, whatsapp_auto]
premium   → dd  (Deep Dive)        + [mpesa_stk, priority_support]
events    → events (Event Landing) + [mpesa_stk, whatsapp_auto]
```

**B2: Cloudinary Organized Folders**
```
POST /api/cloudinary/signature
  → Params: storeId, contentType (products/verification/branding/temp)
  → Returns: Upload signature + folder path

DELETE /api/cloudinary/product/:productId
  → Deletes: Entire product gallery folder

Folder Structure:
jari-ecom/
  └── store-{id}/
      ├── products/
      │   └── product-{id}/
      ├── verification/
      ├── branding/
      └── temp/
```

**B3: Phone OTP Verification (Africa's Talking)**
```
POST /api/otp/send
  → Sends: 6-digit OTP via SMS
  → Rate limit: 3 per hour per phone
  → Expiration: 10 minutes

POST /api/otp/verify
  → Verifies: OTP code

POST /api/otp/verify-merchant
  → Verifies OTP + updates merchant_verification.phone_verified
```

**SMS Functions Available:**
```javascript
sendOTP(phone, code)
sendOrderConfirmation(phone, orderNumber, total)
sendBookingConfirmation(phone, bookingDetails)
sendBookingReminder(phone, timeUntil)
sendComplaintLink(phone, orderNumber, complaintUrl)
```

**⚠️ IMPORTANT:** Africa's Talking credentials NOT configured yet. API uses graceful degradation:
- Missing credentials → Logs warning, returns mock response
- System doesn't crash
- Set these when ready: `AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME`, `AFRICASTALKING_SHORTCODE`

---

### ✅ Phase B: Frontend Signup Wizard (100%)
**Commits:** `442e027`, `466f3a6`, `31742d4`, `860522f`, `a913192`, `40bfe42`, `edbd19a`

**Design System: Apple-Inspired Aesthetic**
```
Colors:
  Primary Text: #1d1d1f
  Muted Text: #86868b
  Borders: #d2d2d7
  Background: #f5f5f7
  
Gradients:
  Food: #f59e0b → #ea580c
  Services: #8b5cf6 → #7c3aed
  Products: #3b82f6 → #2563eb
  Premium: #ec4899 → #db2777
  Events: #10b981 → #059669
  
Typography:
  Font: -apple-system, BlinkMacSystemFont, "Inter"
  Letter Spacing: -0.01em to -0.02em (tight)
  
Border Radius:
  Cards: 16-20px
  Inputs: 12px
  Buttons: 12px (pills: 980px)
```

**Signup Wizard Steps:**
```
Step 1: Business Type Selection
  - Real Unsplash images (no emojis!)
  - Auto-advance on selection
  - Maps to template + smart add-ons

Step 2: Template Preview
  - Currently: Auto-skips (template config pending)
  - Future: Show template screenshots

Step 3: Basic Info Form
  - Apple-style inputs
  - Real-time validation
  - Phone normalization (+254)
  - Password show/hide

Step 4: Plan Selector
  - Base plan: KES 1,200/month
  - SVG icons for add-ons (no emojis!)
  - Live total calculator
  - Pre-selected smart add-ons

Step 5: Verification Tier
  - BASIC/VERIFIED/BUSINESS options
  - Clean design (no emojis!)
  - Document requirements listed

Step 6: Payment + OTP
  - M-Pesa STK Push integration
  - OTP verification
  - ⚠️ Currently bypassed (Africa's Talking not configured)

Step 7: Success
  - Store URL provided
  - Dashboard access link
```

**User Flow:**
```
Landing Page (jarisolutionsecom.store)
  → Click "Start Your Store Now"
  → Signup Wizard (/signup)
  → 7 Steps
  → Store Created
  → Dashboard Access
```

---

## 3. PHASE B SUMMARY

### What Was Built
1. ✅ Enhanced signup API with JTBD-driven flow
2. ✅ Cloudinary organized folder structure
3. ✅ OTP verification system (graceful degradation)
4. ✅ 7-step signup wizard (Apple aesthetic)
5. ✅ Design unification (Landing → Signup → Dashboard)
6. ✅ Real images instead of emojis/icons
7. ✅ Auto-skip template preview (pending screenshots)

### Bugs Fixed During Phase B
1. ✅ Migration 008: UUID foreign keys (was INTEGER)
2. ✅ Missing npm package: `africastalking`
3. ✅ SDK initialization: Lazy init pattern
4. ✅ Netlify build: Missing `initLandingHandlers` export
5. ✅ LoginPage: Linked to old `/register` instead of `/signup`

### Documentation Created
```
docs/DEBUG-FORMULAS.md           - 10 debugging patterns
docs/PHASE-B-COMPLETE.md         - Comprehensive backend handover
docs/DESIGN-UNIFICATION.md       - Landing→Signup flow docs
docs/SIGNUP-UX-UPGRADE.md        - Frontend upgrade summary
docs/RECOVERY-PHASE-B-FRONTEND.md - Power disruption recovery
```

---

## 4. REMAINING PHASES (C-F)

### 🔶 Phase C: Card & Template System
**Goal:** Implement product card purchases and template management

**C1: Product Card Purchase System**
```sql
-- Table already exists: card_purchases
CREATE TABLE card_purchases (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  quantity INTEGER NOT NULL,
  price_paid DECIMAL(10,2),
  purchase_date TIMESTAMP DEFAULT NOW(),
  payment_ref VARCHAR(255)
);
```

**API Endpoints to Build:**
```
POST /api/cards/purchase
  → Body: { storeId, quantity, paymentRef }
  → Logic: ADD to current limit (not SET)
  → Update: stores.card_limit += quantity

GET /api/cards/balance/:storeId
  → Returns: { cardLimit, cardsUsed, cardsRemaining }

POST /api/cards/check-limit
  → Before adding product
  → Returns: { canAdd: boolean, reason: string }
```

**Business Logic:**
```
Card Bundles:
  - Starter Pack: 10 cards for KES 350 (KES 35/card)
  - Growth Pack: 25 cards for KES 550 (KES 22/card)
  - Pro Pack: 50 cards for KES 850 (KES 17/card)

Rules:
  - Base plan includes 3 cards
  - Purchases ADD to limit (not replace)
  - Used cards = COUNT(products WHERE store_id = X)
  - Remaining = card_limit - used cards
  - Block product creation if remaining = 0
```

**C2: Template Assignment System**
```sql
-- Already in products table:
ALTER TABLE products ADD COLUMN assigned_template VARCHAR(50);
-- Values: 'qd', 'dd', 'vm', 'pbk', 'events'
```

**API Endpoints:**
```
PUT /api/products/:id/template
  → Body: { template: 'qd' | 'dd' | 'vm' | 'pbk' | 'events' }
  → Validation: Check if template is unlocked

GET /api/templates/available/:storeId
  → Returns: List of unlocked templates
  → Logic: First template free, others purchased
```

**Dashboard UI:**
```
ProductsPage.jsx:
  - Add template selector dropdown per product
  - Show "Unlock Template" button for locked ones
  - Visual preview of how product will look in each template
```

**C3: Theme Purchase System**
```sql
-- Table already exists: theme_purchases
CREATE TABLE theme_purchases (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  theme_name VARCHAR(100),
  price_paid DECIMAL(10,2),
  purchase_date TIMESTAMP DEFAULT NOW(),
  payment_ref VARCHAR(255)
);

-- Store tracking:
ALTER TABLE stores ADD COLUMN unlocked_themes JSONB DEFAULT '["qd"]';
-- First template free based on business type
```

**Template Pricing:**
```
First template: FREE (assigned based on business type)
Additional templates: KES 500-1000 each depending on complexity
  - Quick Decision: KES 500
  - Visual Menu: KES 750
  - Deep Dive: KES 1000
  - Portfolio/Booking: KES 1000
  - Event Landing: KES 750
```

---

### 🔶 Phase D: Pricing & Subscriptions
**Goal:** Implement subscription management and M-Pesa integration

**D1: Subscription Management**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id) UNIQUE,
  plan VARCHAR(50) DEFAULT 'base',
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  amount DECIMAL(10,2),
  add_ons JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
```
POST /api/subscriptions/create
  → After signup completion
  → Creates initial subscription

GET /api/subscriptions/:storeId
  → Returns current subscription details

PUT /api/subscriptions/:storeId/add-ons
  → Body: { addons: ['mpesa_stk', 'whatsapp_auto'] }
  → Updates subscription.add_ons

POST /api/subscriptions/:storeId/renew
  → Triggered by M-Pesa payment
  → Extends current_period_end by 30 days
```

**D2: M-Pesa STK Push Integration**
```javascript
// api/src/services/mpesa.js
const initiateSTKPush = async (phone, amount, reference) => {
  // Use Daraja API
  // Endpoint: https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
  // Production: https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest
};

const checkPaymentStatus = async (checkoutRequestId) => {
  // Query payment status
};
```

**Environment Variables Needed:**
```
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://jari-api-production.up.railway.app/api/mpesa/callback
```

**Payment Flow:**
```
1. User clicks "Pay" in signup wizard
2. Frontend calls: POST /api/payments/stk-push
3. Backend initiates STK Push to user's phone
4. User enters M-Pesa PIN on phone
5. Safaricom sends callback to /api/mpesa/callback
6. Backend updates payment status
7. Frontend polls: GET /api/payments/status/:ref
8. On success: Complete signup, create store
```

**D3: Add-On Pricing Calculator**
```javascript
const calculateMonthlyTotal = (basePrice, addons) => {
  const addonPrices = {
    mpesa_stk: 300,
    whatsapp_auto: 80,
    advanced_analytics: 200,
    priority_support: 500
  };
  
  const total = basePrice + addons.reduce((sum, addon) => {
    return sum + (addonPrices[addon] || 0);
  }, 0);
  
  return total;
};
```

---

### 🔶 Phase E: M-Pesa & Payment Processing
**Goal:** Full M-Pesa integration for subscriptions and orders

**E1: M-Pesa Configuration**
```
Get credentials from:
1. Go to https://developer.safaricom.co.ke
2. Create app (sandbox first, then production)
3. Get consumer key + secret
4. Generate passkey
5. Register callback URL
```

**E2: Payment Endpoints**
```
POST /api/payments/stk-push
  → Body: { phone, amount, reference, type }
  → Returns: { checkoutRequestId, message }

POST /api/mpesa/callback
  → Safaricom hits this after payment
  → Updates payment records
  → Triggers webhooks/notifications

GET /api/payments/status/:reference
  → Returns: { status: 'pending' | 'success' | 'failed', amount, timestamp }

GET /api/payments/history/:storeId
  → Returns payment history for merchant
```

**E3: Payment Records**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  type VARCHAR(50), -- 'subscription', 'card_purchase', 'theme_purchase'
  amount DECIMAL(10,2),
  phone VARCHAR(20),
  mpesa_receipt VARCHAR(255),
  checkout_request_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

### 🔶 Phase F: Security & Fraud Detection
**Goal:** Implement graduated fraud detection and merchant safeguards

**F1: Fraud Detection Phases**
```
Phase 1: Beta (0-50 merchants)
  - Manual review of all transactions > KES 10,000
  - Email alerts for suspicious patterns
  - No automated blocking

Phase 2: Early Growth (50-500 merchants)
  - Automated velocity checks
  - Flag transactions > 3x average ticket
  - Temporary holds on suspicious accounts

Phase 3: Scale (500+ merchants)
  - ML-based fraud scoring
  - Real-time risk assessment
  - Automated blocking with appeal process
```

**F2: Fraud Detection Rules**
```javascript
const detectSuspiciousActivity = (transaction, merchant) => {
  const flags = [];
  
  // Velocity check
  if (transaction.amount > merchant.avg_transaction * 3) {
    flags.push('HIGH_AMOUNT');
  }
  
  // Frequency check
  const recentTxCount = getRecentTransactions(merchant.id, '1 hour');
  if (recentTxCount > 10) {
    flags.push('HIGH_FREQUENCY');
  }
  
  // New merchant check
  const merchantAge = Date.now() - merchant.created_at;
  if (merchantAge < 7 * 24 * 60 * 60 * 1000 && transaction.amount > 50000) {
    flags.push('NEW_MERCHANT_HIGH_VALUE');
  }
  
  return flags;
};
```

**F3: Customer Complaints System**
```
Only verified customers can complain:
1. Customer receives order confirmation SMS
2. SMS includes unique complaint link
3. Link valid for 30 days
4. Complaint form: reason, description, evidence
5. Merchant gets notification
6. Admin reviews if needed
```

**Complaint Metrics Tracking:**
```sql
UPDATE complaint_metrics SET
  total_complaints = total_complaints + 1,
  complaint_rate = total_complaints / total_orders
WHERE store_id = X;

-- Auto-downgrade merchant if complaint_rate > 0.05 (5%)
```

---

## 5. CRITICAL TECHNICAL PATTERNS

### ⚠️ API Response Pattern (MEMORIZE THIS!)
```javascript
// settingsAPI.getAll() returns store object DIRECTLY
const response = await settingsAPI.getAll();
const store = response.data;  // ✅ CORRECT
const slug = store.slug;      // ✅ CORRECT

// WRONG patterns that cause bugs:
const store = response.data.store;     // ❌ WRONG
const store = response.data.settings;  // ❌ WRONG
```

### Git Commands (Windows PowerShell)
```powershell
# Use semicolons, NOT &&
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "message"; git push origin main

# Check status + recent commits
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -5
```

### Debug Workflow (Surgical Edits)
```
1. read_file with offset/length to examine specific sections
2. edit_block with exact old_string match for surgical changes
3. git commit immediately after each fix
4. Small, focused commits prevent context loss
```

### Package Management on Railway
```bash
# ALWAYS commit BOTH files when adding packages:
npm install package-name
git add package.json package-lock.json
git commit -m "Add package-name"

# Railway uses `npm ci` which requires package-lock.json in sync
```

### Third-Party SDK Initialization
```javascript
// Use lazy initialization to prevent crashes
let sdk = null;

const getSdk = () => {
  if (!sdk) {
    if (!process.env.API_KEY) {
      console.warn('API key missing, using mock');
      return mockSdk;
    }
    sdk = initializeSdk(process.env.API_KEY);
  }
  return sdk;
};

// Call only when needed:
const result = await getSdk().doSomething();
```

---

## 6. DATABASE SCHEMA

### Core Tables (Already Exist)
```sql
users                  -- Merchant accounts
stores                 -- Store settings
products               -- Product catalog
orders                 -- Customer orders
booking_settings       -- Calendar/booking config
working_hours          -- Service provider schedule
blocked_dates          -- Holidays, unavailable days
bookings               -- Customer bookings
service_packages       -- Package options
```

### Pricing & Security Tables (Migration 008)
```sql
pricing_config         -- Platform pricing
merchant_verification  -- KYC tiers
settlement_rules       -- Payout configuration
fraud_thresholds       -- Risk management
customer_complaints    -- Feedback system
complaint_metrics      -- Per-merchant stats
chargebacks           -- Dispute tracking
merchant_badges       -- Trust scores
card_purchases        -- Card limit expansions
theme_purchases       -- Template unlocks
```

### Tables to Create in Phase D
```sql
subscriptions         -- Monthly billing
payments              -- Payment records
```

---

## 7. API ENDPOINTS AVAILABLE

### Auth
```
POST /api/auth/signup/business-type
POST /api/auth/signup/complete
POST /api/auth/login
POST /api/auth/refresh
```

### Stores
```
GET /api/stores/:slug (public)
PUT /api/stores/:id (protected)
```

### Products
```
GET /api/products/store/:storeId
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

### Orders
```
GET /api/orders/store/:storeId
POST /api/orders
PUT /api/orders/:id/status
```

### Bookings
```
GET /api/bookings/settings
PUT /api/bookings/settings
GET /api/bookings/working-hours
PUT /api/bookings/working-hours/:day
GET /api/bookings/blocked-dates
POST /api/bookings/blocked-dates
DELETE /api/bookings/blocked-dates/:id
GET /api/bookings/availability?date=YYYY-MM-DD
GET /api/bookings
POST /api/bookings
PUT /api/bookings/:id/status
```

### Cloudinary
```
POST /api/cloudinary/signature
DELETE /api/cloudinary/product/:productId
```

### OTP (Africa's Talking - Not Configured Yet)
```
POST /api/otp/send
POST /api/otp/verify
POST /api/otp/verify-merchant
```

### Settings
```
GET /api/settings (returns store for logged-in user)
PUT /api/settings
```

### Tracking
```
GET /api/tracking/pixel/:storeId
GET /api/tracking/stats/:storeId
GET /api/tracking/abandoned/:storeId
```

---

## 8. ENVIRONMENT CONFIGURATION

### Railway (Production API)
```bash
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=dmfrtzgkv
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# M-Pesa (TO BE CONFIGURED)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://jari-api-production.up.railway.app/api/mpesa/callback

# Africa's Talking (TO BE CONFIGURED)
AFRICASTALKING_API_KEY=
AFRICASTALKING_USERNAME=
AFRICASTALKING_SHORTCODE=

# IntaSend (WaaS - TO BE CONFIGURED)
INTASEND_PUBLIC_KEY=
INTASEND_SECRET_KEY=
INTASEND_WALLET_ID=
```

### Netlify (Dashboard + Storefront)
```bash
# Dashboard
VITE_API_URL=https://jari-api-production.up.railway.app

# Storefront
VITE_API_URL=https://jari-api-production.up.railway.app
```

---

## 9. DESIGN SYSTEM

### Color Palette
```css
/* Apple-Inspired */
--dark: #1d1d1f;
--gray-900: #1d1d1f;
--gray-700: #424245;
--gray-500: #86868b;
--gray-300: #d2d2d7;
--gray-100: #f5f5f7;
--white: #ffffff;

/* Brand */
--primary: #667eea;
--primary-dark: #764ba2;
--accent: #f97316;
--accent-dark: #ea580c;

/* Status */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

### Typography Scale
```css
/* Font Families */
font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;

/* Sizes */
--fs-xs: 12px;
--fs-sm: 14px;
--fs-base: 16px;
--fs-lg: 18px;
--fs-xl: 21px;
--fs-2xl: 24px;
--fs-3xl: 28px;
--fs-4xl: 40px;
--fs-5xl: 48px;

/* Weights */
--fw-normal: 400;
--fw-medium: 500;
--fw-semibold: 600;
--fw-bold: 700;

/* Letter Spacing (Apple-style tight) */
letter-spacing: -0.01em; /* standard */
letter-spacing: -0.02em; /* headlines */
```

### Spacing Scale (8px base)
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
--space-4xl: 96px;
```

### Border Radius
```css
--radius-sm: 8px;   /* small elements */
--radius-md: 12px;  /* inputs, buttons */
--radius-lg: 16px;  /* cards */
--radius-xl: 20px;  /* large cards */
--radius-pill: 980px; /* fully rounded */
```

### Shadows
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.15);

/* Colored shadows for CTAs */
--shadow-primary: 0 4px 12px rgba(102, 126, 234, 0.25);
--shadow-accent: 0 4px 12px rgba(249, 115, 22, 0.25);
```

### Transitions
```css
/* Standard */
transition: all 0.2s ease;

/* Spring (Apple-style) */
transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

/* Smooth */
transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
```

---

## 10. KNOWN ISSUES & WORKAROUNDS

### Issue 1: Africa's Talking Not Configured
**Problem:** OTP verification endpoints exist but SMS won't send  
**Workaround:** Step 6 (Payment + OTP) currently bypassed in signup wizard  
**Fix in Phase E:** Configure AT credentials, enable Step 6

### Issue 2: Template Preview Missing
**Problem:** Step 2 shows loading spinner then auto-skips  
**Workaround:** Auto-advance to Step 3 immediately  
**Fix in Phase C:** Add template screenshots, build preview UI

### Issue 3: M-Pesa Not Integrated
**Problem:** Payment flow incomplete  
**Workaround:** Signup completes without payment verification  
**Fix in Phase D:** Integrate Daraja API, implement STK Push

### Issue 4: Dashboard Dark Mode Default
**Problem:** LoginPage and some components default to dark theme  
**Workaround:** None yet  
**Fix Next Session:** Change default theme to light mode

### Issue 5: Document Upload Not Implemented
**Problem:** Verification tier selection exists but can't upload docs  
**Workaround:** Tier selection works, doc upload skipped  
**Fix in Phase F:** Build document upload UI using Cloudinary

---

## 11. NEXT SESSION START GUIDE

### Step 1: Verify Context
```bash
cd C:\Users\ADMIN\Desktop\jari-ecom-v2
git log --oneline -10
git status
```

### Step 2: Check Current Branch
```bash
# Should be on main
git branch
```

### Step 3: Test Current Signup Flow
```
1. Visit: https://dashboard.jarisolutionsecom.store/signup
2. Complete Steps 1-5
3. Note: Step 6 is bypassed (OTP not configured)
4. Verify: Can create account successfully
```

### Step 4: Review This Document
Read sections:
- Remaining Phases (C-F)
- Critical Technical Patterns
- API Endpoints Available

### Step 5: Choose Starting Point

**Option A: Continue with Phase C (Card & Template System)**
```
Priority: High
Complexity: Medium
Dependencies: None
Estimated: 4-6 hours
```

**Option B: Start with Phase D (Pricing & Subscriptions)**
```
Priority: High
Complexity: High
Dependencies: M-Pesa integration
Estimated: 6-8 hours
```

**Option C: Quick Fixes First**
```
1. Fix LoginPage dark mode default
2. Fix Step 6 bypass messaging
3. Update verification tier docs requirements
Then proceed to Phase C
```

### Recommended: Option C → Phase C → Phase D → Phase E → Phase F

---

## 12. QUICK REFERENCE COMMANDS

### Git Operations
```bash
# Status check
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git status; git log --oneline -5

# Commit changes
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git add -A; git commit -m "message"; git push origin main

# Check specific file
cd C:\Users\ADMIN\Desktop\jari-ecom-v2; git log --oneline --follow path/to/file
```

### Railway Database Access
```bash
# Via Railway dashboard
# OR via CLI (if installed):
railway link
railway run psql $DATABASE_URL
```

### Run Migrations
```bash
# Manually via Railway dashboard SQL editor
# OR programmatically:
node api/migrations/run.js
```

### Local Development
```bash
# API
cd api
npm install
npm run dev

# Dashboard
cd dashboard
npm install
npm run dev

# Storefront
cd store
npm install
npm run dev
```

---

## 13. IMPORTANT REMINDERS

### Always Remember
1. ✅ Use surgical edits (read → edit → commit)
2. ✅ Commit package.json AND package-lock.json together
3. ✅ Test locally before pushing to Railway
4. ✅ API responses: `response.data` not `response.data.store`
5. ✅ Use semicolons in PowerShell git commands
6. ✅ Check Railway logs after deployment
7. ✅ Graceful degradation for missing credentials
8. ✅ Document as you build

### Never Do
1. ❌ Push without committing package-lock.json
2. ❌ Use `&&` in Windows PowerShell
3. ❌ Initialize SDKs at module load time
4. ❌ Mix INTEGER and UUID foreign keys
5. ❌ Hardcode values instead of CSS variables
6. ❌ Skip testing signup flow after changes
7. ❌ Forget to update handover docs

---

## 14. FILE STRUCTURE REFERENCE

```
jari-ecom-v2/
├── api/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js          ✅ Enhanced signup
│   │   │   ├── cloudinary.js    ✅ Upload signatures
│   │   │   ├── otp.js           ✅ SMS verification
│   │   │   ├── bookings.js      ✅ Calendar system
│   │   │   ├── stores.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── settings.js
│   │   │   └── tracking.js
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   └── africastalking.js ✅ Lazy init
│   │   └── middleware/
│   ├── migrations/
│   │   ├── 001-007_*.sql       ✅ Core tables
│   │   ├── 008_pricing_security_foundation.sql ✅ Phase A
│   │   └── run.js
│   ├── package.json             ✅ All deps installed
│   └── package-lock.json        ✅ Synced
│
├── dashboard/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SignupWizard.jsx         ✅ Main container
│   │   │   ├── signup/
│   │   │   │   ├── Step1_BusinessType.jsx    ✅ Real images
│   │   │   │   ├── Step2_TemplatePreview.jsx ✅ Auto-skip
│   │   │   │   ├── Step3_BasicInfo.jsx       ✅ Apple forms
│   │   │   │   ├── Step4_PlanSelector.jsx    ✅ SVG icons
│   │   │   │   ├── Step5_VerificationTier.jsx ✅ Clean design
│   │   │   │   ├── Step6_Payment.jsx         ⚠️ Bypassed
│   │   │   │   └── Step7_Success.jsx         ✅ Complete
│   │   │   ├── LoginPage.jsx            ✅ Links to /signup
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   └── ...other pages
│   │   ├── api/
│   │   │   └── client.js                ✅ All API methods
│   │   └── App.jsx                      ✅ /signup route wired
│
├── store/
│   ├── src/
│   │   ├── landing/
│   │   │   ├── landing.js               ✅ Fixed CTAs
│   │   │   └── landing.css              ✅ Apple aesthetic
│   │   ├── render.js
│   │   ├── main.js
│   │   └── styles/
│
└── docs/
    ├── HANDOVER-CONTEXT.md              🆕 THIS FILE
    ├── PROJECT-INSTRUCTIONS.md
    ├── DEBUG-FORMULAS.md
    ├── PHASE-B-COMPLETE.md
    ├── DESIGN-UNIFICATION.md
    └── SIGNUP-UX-UPGRADE.md
```

---

## 15. SUCCESS METRICS

### Phase B Completion Checklist ✅
- [x] Database foundation (10 tables)
- [x] Enhanced signup API
- [x] Cloudinary folders
- [x] OTP system (graceful)
- [x] 7-step wizard
- [x] Design unification
- [x] Real images (no emojis)
- [x] Auto-skip template
- [x] All bugs fixed
- [x] Documentation complete

### Phase C Goals
- [ ] Card purchase API
- [ ] Template assignment
- [ ] Theme purchase
- [ ] Dashboard UI for purchases
- [ ] Product limit enforcement

### Phase D Goals
- [ ] Subscription management
- [ ] M-Pesa STK Push
- [ ] Payment records
- [ ] Add-on management
- [ ] Billing dashboard

### Phase E Goals
- [ ] M-Pesa callback handling
- [ ] Payment status tracking
- [ ] Transaction history
- [ ] Receipt generation
- [ ] Refund system

### Phase F Goals
- [ ] Fraud detection rules
- [ ] Complaint system UI
- [ ] Merchant badge calculation
- [ ] Document upload
- [ ] Risk scoring

---

## 16. CONTACT & RESOURCES

### Internal
- **Mesh (You):** Technical Lead
- **Charles:** CEO

### External Services
- **Cloudinary:** https://cloudinary.com/console
- **Railway:** https://railway.app
- **Netlify:** https://app.netlify.com
- **Safaricom Developer:** https://developer.safaricom.co.ke
- **Africa's Talking:** https://account.africastalking.com
- **IntaSend:** https://intasend.com

### Documentation
- **React:** https://react.dev
- **Vite:** https://vitejs.dev
- **Express:** https://expressjs.com
- **PostgreSQL:** https://www.postgresql.org/docs
- **M-Pesa API:** https://developer.safaricom.co.ke/docs

---

## 🎯 READY FOR NEXT SESSION!

**This document contains everything needed to continue from Phase C through completion.**

**Key Points:**
1. ✅ Phase B is 100% complete
2. ✅ All foundation work done
3. ✅ Clean codebase, good documentation
4. ⏭️ Ready to start Phase C (Card & Template System)
5. 📝 All critical patterns documented
6. 🐛 Known issues listed with workarounds

**Next Chat Should Start With:**
1. Review this handover document
2. Test current signup flow
3. Choose: Quick fixes first OR dive into Phase C
4. Continue building! 🚀

---

**Document Version:** 1.0  
**Last Updated:** January 25, 2026, 11:30 PM EAT  
**Git Commit:** `bcfaf78`  
**Status:** ✅ COMPLETE & READY
