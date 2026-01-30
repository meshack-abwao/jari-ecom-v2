# 💰 JARI V2 - Complete Payment Testing Guide

> **Purpose:** Systematically test all M-Pesa payment flows before production
> **Environment:** Sandbox/Test Mode with IntaSend Test API
> **Last Updated:** January 30, 2026

---

## 🎯 **TESTING OBJECTIVES**

1. ✅ Verify all payment endpoints work correctly
2. ✅ Confirm proper payment → activation flow
3. ✅ Test subscription renewals
4. ✅ Validate failed payment handling
5. ✅ Check database state after payments

---

## 🔧 **PREREQUISITES**

### **1. Environment Setup**
```bash
# Ensure test mode is enabled in Railway
INTASEND_TEST=true
INTASEND_PUBLISHABLE_KEY=ISPubKey_test_...
INTASEND_SECRET_KEY=ISSecretKey_test_...
```

### **2. Test Phone Number**
Use Safaricom test numbers (M-Pesa Sandbox):
- `254708374149` (Test number 1)
- `254711222333` (Test number 2)
- Format: Always use international format

### **3. Test PIN**
- Enter any 4-digit PIN when STK Push appears
- Sandbox auto-approves all test payments

---

## 💳 **PAYMENT FLOW CATEGORIES**

### **CATEGORY 1: PLATFORM SUBSCRIPTIONS**
**Status:** 🚧 Not Yet Implemented (Future Feature)

When implemented:
- Monthly platform fee: KES 500/month
- Starter tier (0-50 orders): KES 500
- Growth tier (51-200 orders): KES 1200
- Pro tier (201+ orders): KES 2500

**Test Cases:**
- [ ] New subscription
- [ ] Renewal before expiry
- [ ] Renewal after expiry (grace period)
- [ ] Failed renewal handling

---

### **CATEGORY 2: ADDON PURCHASES**

#### **Available Addons:**

| Addon | Price | Type | Database Field |
|-------|-------|------|----------------|
| M-Pesa STK Push | KES 300/mo | Recurring | `mpesa_stk` |
| WhatsApp Automation | KES 800/mo | Recurring | `whatsapp_auto` |
| Advanced Analytics | KES 600/mo | Recurring | `advanced_analytics` |
| Priority Support | KES 1000/mo | Recurring | `priority_support` |

#### **Test Flow:**

**Test 1: Purchase M-Pesa STK Addon (KES 300)**

**Steps:**
1. Navigate to `/addons` page
2. Find "M-Pesa STK Push" card
3. Click "Activate" button
4. Modal appears with payment details
5. Enter test phone: `254708374149`
6. Click "Pay with M-Pesa"
7. Wait for STK Push prompt on phone
8. Enter any 4-digit PIN
9. Wait 5-10 seconds for callback
10. Verify success message
11. Check addon shows "Active" status

**Expected API Flow:**
```
POST /api/mpesa/stk-push
Body: {
  phone: "254708374149",
  amount: 300,
  type: "addon",
  itemId: "mpesa_stk",
  itemName: "M-Pesa STK Push"
}

Response: {
  success: true,
  paymentId: "uuid",
  checkoutRequestId: "ws_CO_...",
  message: "STK Push sent..."
}
```

**Database Verification:**
```sql
-- Check payment record
SELECT * FROM platform_payments 
WHERE type = 'addon' AND item_id = 'mpesa_stk' 
ORDER BY created_at DESC LIMIT 1;

-- Expected: status = 'completed', mpesa_receipt_number populated

-- Check addon activation
SELECT * FROM store_addons 
WHERE addon_type = 'mpesa_stk' 
AND (expires_at IS NULL OR expires_at > NOW());

-- Expected: activated_at = recent timestamp
```

**Test 2: Addon Renewal (After 30 Days)**

**Steps:**
1. Manually update `expires_at` to past date:
   ```sql
   UPDATE store_addons 
   SET expires_at = NOW() - INTERVAL '1 day'
   WHERE addon_type = 'mpesa_stk';
   ```
2. Try to use addon feature (should be gated)
3. Go to `/addons` → Click "Renew"
4. Complete payment flow
5. Verify `expires_at` extended by 1 month

---

### **CATEGORY 3: PRODUCT CARD BUNDLES**

#### **Available Bundles:**

| Bundle | Cards | Price | Expected Result |
|--------|-------|-------|-----------------|
| Starter Pack | +4 cards | KES 350 | Total: 7 cards (3 default + 4) |
| Growth Pack | +7 cards | KES 550 | Total: 10 cards (3 + 7) |
| Pro Pack | +12 cards | KES 850 | Total: 15 cards (3 + 12) |

#### **Test Flow:**

**Test 3: Purchase Growth Pack (KES 550)**

**Steps:**
1. Navigate to `/products` page
2. Note current product count (e.g., 2/3 cards used)
3. Click "Buy More Cards" button
4. Select "Growth Pack (+7 cards)"
5. Enter test phone: `254711222333`
6. Complete M-Pesa payment
7. Verify success message
8. Check product limit updated to 10 cards

**Expected API Flow:**
```
POST /api/mpesa/stk-push
Body: {
  phone: "254711222333",
  amount: 550,
  type: "cards",
  itemId: "growth_pack",
  itemName: "Growth Pack (+7 cards)"
}
```

**Database Verification:**
```sql
-- Check payment
SELECT * FROM platform_payments 
WHERE type = 'cards' AND amount = 550 
ORDER BY created_at DESC LIMIT 1;

-- Check card limit
SELECT product_card_limit FROM stores 
WHERE id = 'your-store-id';

-- Expected: product_card_limit = 10 (3 + 7)
```

**Test 4: Hit Card Limit → Gate → Purchase → Unlock**

**Steps:**
1. Create products until limit reached (10/10)
2. Try to create 11th product → blocked
3. Error message: "Card limit reached. Purchase more cards."
4. Click "Buy Cards" → Purchase Pro Pack
5. Verify can now create products (0/15 used)

---

### **CATEGORY 4: TEMPLATE UNLOCKS**

#### **Available Templates:**

| Template | Price | Database Field | Features |
|----------|-------|----------------|----------|
| Quick Decision | FREE | `quick_decision` | Default, always unlocked |
| Deep Dive | KES 1500 | `deep_dive` | Magazine-style, lightbox gallery |
| Portfolio/Booking | KES 2000 | `portfolio_booking` | Calendar, bookings, services |
| Visual Menu | KES 1800 | `visual_menu` | Food/restaurant optimized |
| Event Landing | KES 1500 | `event_landing` | Single-event pages |

#### **Test Flow:**

**Test 5: Unlock Deep Dive Template (KES 1500)**

**Steps:**
1. Navigate to `/templates` page
2. Find "Deep Dive" card → shows "Locked 🔒"
3. Click "Unlock for KES 1500"
4. Enter test phone: `254708374149`
5. Complete payment
6. Verify template now shows "Unlocked ✅"
7. Create product → Select Deep Dive in template dropdown
8. Preview storefront → Verify uses Deep Dive layout

**Expected API Flow:**
```
POST /api/mpesa/stk-push
Body: {
  phone: "254708374149",
  amount: 1500,
  type: "template",
  itemId: "deep_dive",
  itemName: "Deep Dive Template"
}
```

**Database Verification:**
```sql
-- Check payment
SELECT * FROM platform_payments 
WHERE type = 'template' AND item_id = 'deep_dive' 
ORDER BY created_at DESC LIMIT 1;

-- Check template unlock
SELECT * FROM store_templates 
WHERE template_slug = 'deep_dive';

-- Expected: unlocked_at = recent timestamp

-- Check product using template
SELECT id, name, template FROM products 
WHERE template = 'deep_dive';
```

---

### **CATEGORY 5: CUSTOM DOMAIN (Annual)**

**Test 6: Purchase Custom Domain (KES 3000/year)**

**Steps:**
1. Navigate to `/settings` → Custom Domain tab
2. Enter domain: `test-store.jari.eco`
3. Click "Setup Custom Domain"
4. Payment modal appears
5. Enter test phone: `254711222333`
6. Complete payment
7. Verify domain status: "Pending DNS Verification"

**Expected API Flow:**
```
POST /api/mpesa/stk-push
Body: {
  phone: "254711222333",
  amount: 3000,
  type: "domain",
  itemId: "custom_domain",
  itemName: "Custom Domain (Annual)"
}
```

**Database Verification:**
```sql
-- Check payment
SELECT * FROM platform_payments 
WHERE type = 'domain' 
ORDER BY created_at DESC LIMIT 1;

-- Check domain record
SELECT * FROM custom_domains 
WHERE store_id = 'your-store-id';

-- Expected: status = 'pending', expires_at = NOW() + 1 year
```

---

## 🧪 **CATEGORY 6: KYC MOCK APPROVAL**

**Purpose:** Test merchant wallet + customer checkout without waiting 3-7 days

#### **Test 7: Mock Approve KYC**

**Prerequisites:**
- KYC documents uploaded (`status = 'docs_uploaded'`)
- Status changed to `submitted_to_intasend`

**Steps:**
1. Navigate to `/kyc` page
2. Status shows "Under Review" screen
3. Click **"🧪 Mock Approve (Test Mode)"** button
4. Confirm dialog
5. Wait 2-3 seconds
6. Verify status changes to "Approved ✅"
7. Check wallet ID shows: `MOCK_WALLET_xxxxx`

**Expected API Flow:**
```
POST /api/kyc/mock-approve

Response: {
  success: true,
  message: "🎉 KYC MOCK APPROVED! (Test Mode)",
  wallet_id: "MOCK_WALLET_abc12345",
  wallet_label: "JARI_My_Store_TEST",
  note: "This is a MOCK wallet for testing. Real payments will fail."
}
```

**Database Verification:**
```sql
-- Check KYC status
SELECT status, intasend_wallet_id, intasend_wallet_label, approved_at 
FROM merchant_kyc 
WHERE store_id = 'your-store-id';

-- Expected: status = 'approved', wallet_id = 'MOCK_WALLET_...'

-- Check M-Pesa STK addon auto-activated
SELECT * FROM store_addons 
WHERE store_id = 'your-store-id' AND addon_type = 'mpesa_stk';

-- Expected: activated_at = recent timestamp
```

---

## 📊 **CATEGORY 7: MERCHANT CHECKOUT (Customer Pays)**

**Purpose:** Test customer payments flow to merchant's wallet

#### **Test 8: Customer Product Purchase**

**Prerequisites:**
- KYC approved (real or mock)
- M-Pesa STK addon active
- At least 1 product published

**Steps:**
1. Open storefront in incognito: `https://jari-store.netlify.app/{your-slug}`
2. Click on a product
3. Click "Buy Now" (KES 2000 example)
4. Checkout page appears
5. Enter customer details:
   - Name: Test Customer
   - Phone: `254708374149`
   - Delivery: Optional
6. Click "Pay with M-Pesa"
7. STK Push appears on phone
8. Enter PIN
9. Wait for success redirect

**Expected API Flow:**
```
POST /api/orders/checkout
Body: {
  storeId: "uuid",
  items: [{ productId: "uuid", quantity: 1, price: 2000 }],
  customer: {
    name: "Test Customer",
    phone: "254708374149",
    delivery_address: "..."
  },
  payment_method: "mpesa_stk"
}

→ Internal STK Push to merchant's wallet
→ Create order with status 'paid'
→ Trigger order confirmation (future: WhatsApp/SMS)
```

**Database Verification:**
```sql
-- Check order created
SELECT * FROM orders 
WHERE store_id = 'your-store-id' 
ORDER BY created_at DESC LIMIT 1;

-- Expected: payment_status = 'paid', mpesa_ref populated

-- Check merchant wallet received funds (check IntaSend dashboard)
```

---

## ❌ **CATEGORY 8: FAILED PAYMENT HANDLING**

#### **Test 9: Failed STK Push (User Cancels)**

**Steps:**
1. Initiate any payment (addon, cards, etc.)
2. When STK Push appears → Click "Cancel"
3. Wait 30 seconds
4. Query payment status: GET `/api/mpesa/status/{paymentId}`
5. Verify status shows "failed"
6. Check addon/cards/template NOT activated

**Database Verification:**
```sql
SELECT status, result_desc FROM platform_payments 
WHERE id = 'payment-id';

-- Expected: status = 'failed', result_desc = 'Request cancelled by user'
```

#### **Test 10: Insufficient Balance**

**Steps:**
1. Use test phone with KES 0 balance
2. Initiate payment
3. Enter PIN
4. M-Pesa returns insufficient funds error
5. Verify payment status = 'failed'

---

## 🔄 **PAYMENT POLLING STRATEGY**

### **Frontend Polling Pattern:**
```javascript
// After initiating STK Push
const paymentId = response.data.paymentId;

// Poll every 2 seconds for 60 seconds (30 attempts)
const checkStatus = async () => {
  for (let i = 0; i < 30; i++) {
    const status = await mpesaAPI.getStatus(paymentId);
    
    if (status.data.status === 'completed') {
      // Success! Show success message
      handlePaymentSuccess();
      return;
    }
    
    if (status.data.status === 'failed') {
      // Failed - show error
      handlePaymentFailed(status.data.message);
      return;
    }
    
    // Still pending - wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Timeout after 60 seconds
  handlePaymentTimeout();
};
```

---

## 📋 **TESTING CHECKLIST**

### **Phase 1: Platform Payments**
- [ ] Test 1: M-Pesa STK Addon Purchase (KES 300)
- [ ] Test 2: Addon Renewal After Expiry
- [ ] Test 3: Growth Pack Purchase (KES 550)
- [ ] Test 4: Card Limit Gating
- [ ] Test 5: Deep Dive Template Unlock (KES 1500)
- [ ] Test 6: Custom Domain Purchase (KES 3000)

### **Phase 2: KYC Mock Approval**
- [ ] Test 7: Mock Approve KYC Instantly
- [ ] Verify wallet ID created
- [ ] Verify M-Pesa STK auto-activated

### **Phase 3: Merchant Checkout**
- [ ] Test 8: Customer Product Purchase
- [ ] Verify order created with payment
- [ ] Check funds in merchant wallet (IntaSend dashboard)

### **Phase 4: Failure Scenarios**
- [ ] Test 9: User Cancels STK Push
- [ ] Test 10: Insufficient Balance
- [ ] Test 11: Network Timeout
- [ ] Test 12: Invalid Phone Number

---

## 🐛 **DEBUGGING TIPS**

### **Check Railway Logs:**
```bash
# Search for payment logs
railway logs --filter "Payment" --tail 100

# Search for M-Pesa callbacks
railway logs --filter "M-Pesa Callback" --tail 100

# Search for activation logs
railway logs --filter "Activate" --tail 100
```

### **Database Queries:**
```sql
-- Recent platform payments
SELECT id, type, item_name, amount, status, mpesa_receipt_number, created_at 
FROM platform_payments 
ORDER BY created_at DESC 
LIMIT 10;

-- Active addons
SELECT * FROM store_addons 
WHERE store_id = 'your-store-id' 
AND (expires_at IS NULL OR expires_at > NOW());

-- Recent orders (merchant checkout)
SELECT id, payment_method, payment_status, total, mpesa_ref 
FROM orders 
WHERE store_id = 'your-store-id' 
ORDER BY created_at DESC 
LIMIT 10;
```

### **IntaSend Dashboard Checks:**
- Login: https://sandbox.intasend.com/account/signin
- Check Collections → Recent transactions
- Verify wallet balance after test purchases

---

## 🚀 **NEXT STEPS AFTER TESTING**

1. ✅ Fix any bugs found during testing
2. ✅ Document edge cases
3. ✅ Add error handling for common failures
4. ✅ Implement payment retry logic
5. ✅ Add email/SMS notifications
6. ✅ Create admin payment reconciliation dashboard
7. ✅ Switch to production IntaSend keys

---

**Last Updated:** January 30, 2026  
**Version:** 1.0  
**Status:** Ready for Testing 🚀
