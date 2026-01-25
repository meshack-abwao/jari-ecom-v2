# PHASE B: SIGNUP & ONBOARDING - IN PROGRESS ⏳

**Date Started:** January 25, 2026  
**Latest Commit:** `7168618 - B3: Phone OTP verification`

---

## WHAT'S BEEN BUILT SO FAR

### ✅ B1: Enhanced Signup API (JTBD-Driven)

**File:** `api/src/routes/auth.js`

**New Endpoints:**
- `POST /api/auth/signup/business-type` - Step 1: Select business type, get template recommendations
- `POST /api/auth/signup/complete` - Step 2-7: Complete registration with all data

**Smart Features:**
- Business type → Template mapping (food→VM, services→PBK, etc.)
- Smart add-on recommendations based on business type
- Creates full merchant profile including:
  - `merchant_verification` record (4 tiers)
  - `settlement_rules` (3-day default)
  - `complaint_metrics` (initialized)
  - `merchant_badges` (initialized)

**Commit:** `2e1f5a4`

---

### ✅ B2: Cloudinary Organized Folder Structure

**Files:**
- `api/src/config/cloudinary.js` - Enhanced with signature generation
- `api/src/routes/cloudinary.js` - NEW endpoint for upload signatures
- `api/src/routes/index.js` - Wired into server

**Folder Structure:**
```
cloudinary://jari-ecom/
├── store-{id}/
│   ├── products/              - Product images
│   │   └── galleries/
│   │       └── product-{id}/  - Product-specific galleries
│   ├── verification/          - KYC documents
│   │   ├── national-id-front.jpg
│   │   ├── national-id-back.jpg
│   │   ├── business-reg.pdf
│   │   └── kra-pin.pdf
│   ├── branding/              - Logo, hero banners
│   └── temp/                  - Temporary uploads
```

**API Endpoints:**
- `POST /api/cloudinary/signature` - Get upload signature with folder path
- `DELETE /api/cloudinary/product/:productId` - Delete product gallery folder

**Commit:** `9efd017`

---

### ✅ B3: Phone OTP Verification (Africa's Talking)

**Files:**
- `api/src/config/africastalking.js` - SMS functions
- `api/src/routes/otp.js` - OTP endpoints
- `api/src/routes/index.js` - Wired into server

**Features:**
- 6-digit OTP generation
- SMS via Africa's Talking
- Rate limiting: Max 3 OTP requests per phone per hour
- 10-minute OTP expiration
- In-memory storage (production TODO: Redis)

**API Endpoints:**
- `POST /api/otp/send` - Send OTP to phone
- `POST /api/otp/verify` - Verify OTP
- `POST /api/otp/verify-merchant` - Verify OTP + update merchant_verification

**SMS Functions:**
- `sendOTP(phone, otp)` - Verification codes
- `sendOrderConfirmation(phone, storeName, orderRef, amount)` - Order confirmations
- `sendBookingConfirmation(phone, storeName, serviceName, dateTime)` - Booking confirmations
- `sendBookingReminder(phone, storeName, serviceName, timeUntil)` - Reminders (5hr, 2hr, 30min)
- `sendComplaintLink(phone, complaintLink)` - Complaint submission links

**Environment Variables Needed:**
```
AFRICASTALKING_API_KEY=[your key]
AFRICASTALKING_USERNAME=[sandbox or production username]
AFRICASTALKING_SHORTCODE=[optional sender ID]
```

**Commit:** `7168618`

---

## 🚧 STILL TO BUILD (Phase B)

### B4: Signup Wizard UI (Frontend)

**Dashboard Signup Pages:**
```
/signup
├── /step1 - Business type selector (visual cards)
├── /step2 - Live template preview
├── /step3 - Basic info form
├── /step4 - Plan selector (smart defaults)
├── /step5 - Verification tier
├── /step6 - Payment (M-Pesa STK)
└── /step7 - Success + onboarding
```

**Components Needed:**
- `SignupWizard.jsx` - Main container with step navigation
- `BusinessTypeSelector.jsx` - Visual cards for food/services/products/etc
- `TemplatePreview.jsx` - LIVE preview of chosen template
- `BasicInfoForm.jsx` - Name, email, phone, password
- `PlanSelector.jsx` - Subscription + add-ons with smart recommendations
- `VerificationTierSelector.jsx` - BASIC/VERIFIED/BUSINESS with trust messaging
- `PaymentStep.jsx` - M-Pesa STK integration
- `SuccessScreen.jsx` - Store URL + next steps

**JTBD Principles to Apply:**
- **Step 1:** "Help me discover which template fits my business" (Show examples, not just names)
- **Step 2:** "Help me confirm this is the right choice" (Live preview builds confidence)
- **Step 3:** "Make signup frictionless" (Minimal fields, auto-generate slug)
- **Step 4:** "Help me choose the right plan" (Smart defaults, clear value propositions)
- **Step 5:** "Help me understand security tiers" (Trust messaging, not technical jargon)
- **Step 6:** "Make payment effortless" (M-Pesa STK Push, no manual entry)
- **Step 7:** "Help me get started immediately" (Store URL, first action guidance)

---

### B5: Document Upload UI Components

**Components:**
- `DocumentUploader.jsx` - Drag & drop for National ID, Business Reg, KRA
- Uses `/api/cloudinary/signature` with `contentType='verification'`
- Shows upload progress
- Previews uploaded documents
- Stores URLs in `merchant_verification` table

---

### B6: Template Preview System

**Options:**
1. **Live Iframe:** Render actual store with sample data
   - Pro: Real experience
   - Con: Slower to load
   
2. **Screenshot Gallery:** Pre-rendered template screenshots
   - Pro: Fast, clean
   - Con: Less interactive

**Decision Needed:** Which approach for Step 2 preview?

---

## TECHNICAL NOTES

### Smart Add-On Recommendations (Already Built in API)

| Business Type | Recommended Add-ons | Reasoning |
|---------------|---------------------|-----------|
| Food | M-Pesa + WhatsApp | Need payments + customer comms |
| Services | M-Pesa | Need payments (booking system built-in) |
| Products | M-Pesa + WhatsApp | Retail needs payments + support |
| Premium | M-Pesa + Priority Support | Premium wants fast support |
| Events | M-Pesa + WhatsApp | Events need payments + reminders |

### Environment Variables Still Needed

```env
# Africa's Talking (For OTP + SMS)
AFRICASTALKING_API_KEY=your_key_here
AFRICASTALKING_USERNAME=sandbox  # or your production username
AFRICASTALKING_SHORTCODE=your_shortcode  # optional

# Cloudinary (Already set, no changes)
CLOUDINARY_CLOUD_NAME=existing
CLOUDINARY_API_KEY=existing
CLOUDINARY_API_SECRET=existing

# Whitelist (For Phase F)
WHITELIST_MASTER_PASSWORD=to_be_set
```

---

## NEXT STEPS (Continue Building)

**Immediate Priority:**
1. Build `SignupWizard.jsx` with 7-step flow
2. Build `BusinessTypeSelector.jsx` (Step 1)
3. Build `TemplatePreview.jsx` (Step 2) - decide on iframe vs screenshots
4. Wire signup API to frontend
5. Test full signup flow end-to-end

**After Signup UI:**
6. Build `DocumentUploader.jsx` for verification documents
7. Create OTP input component
8. Test OTP flow (send → verify → update merchant_verification)

---

## GIT HISTORY

```
7168618 B3: Phone OTP verification - Africas Talking integration
9efd017 B2: Cloudinary organized folder structure
2e1f5a4 B1.1: Enhanced signup API - JTBD-driven multi-step
eb0b758 Docs: Phase A handover
93e4e03 A1-A10: Database foundation complete
```

---

## HANDOVER TO NEXT CHAT

**Backend Complete:**
- ✅ Enhanced signup API with JTBD flow
- ✅ Cloudinary per-merchant folders
- ✅ OTP verification via Africa's Talking

**Frontend Pending:**
- ❌ Signup wizard UI (7 steps)
- ❌ Live template preview
- ❌ Document upload components
- ❌ OTP input component

**Next chat should:**
1. Build SignupWizard.jsx starting with Step 1
2. Decide: Live iframe preview or screenshot gallery?
3. Wire frontend to `/api/auth/signup/*` endpoints
4. Test full signup → OTP → merchant creation flow

---

**End of Phase B Progress** 📝
