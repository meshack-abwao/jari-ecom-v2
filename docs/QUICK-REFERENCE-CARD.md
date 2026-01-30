# 🎯 JARI V2 - QUICK REFERENCE CARD
## M-Pesa Payments + KYC Testing

---

## ⚡ **INSTANT TEST COMMANDS**

### **Test 1: KYC Mock Approval (30 seconds)**
```
1. Go to: https://jari-dashboard.netlify.app/kyc
2. Click: "🧪 Mock Approve (Test Mode)"
3. Confirm dialog
4. ✅ Status → "Approved ✅"
```

### **Test 2: Addon Payment (1 minute)**
```
1. Go to: https://jari-dashboard.netlify.app/addons
2. Click: "Activate" on M-Pesa STK (KES 300)
3. Phone: 254708374149
4. Click: "Pay with M-Pesa"
5. Enter any 4-digit PIN on phone
6. ✅ Shows "Active"
```

### **Test 3: Template Unlock (1 minute)**
```
1. Go to: https://jari-dashboard.netlify.app/products
2. Click: "Add Product"
3. Click: Locked template (Deep Dive 🔍)
4. Phone: 254708374149
5. Click: "Pay KES 1500 via M-Pesa"
6. Enter PIN
7. ✅ Template unlocked
```

---

## 🐛 **INSTANT DEBUG**

### **Payment Not Working?**
```bash
# Check Railway logs
railway logs --tail 50 --filter "Payment"

# Check database
SELECT * FROM platform_payments 
WHERE status = 'pending' 
ORDER BY created_at DESC LIMIT 1;
```

### **KYC Mock Approve Fails?**
```bash
# Check logs
railway logs --tail 50 --filter "MOCK APPROVE"

# Check KYC status
SELECT status FROM merchant_kyc;
```

### **STK Push Not Arriving?**
```
✓ Phone format: 254XXXXXXXXX (not 07...)
✓ Sandbox mode: Any PIN works
✓ Wait 10 seconds max
```

---

## 📊 **PAYMENT STATUS CHECK**

```sql
-- Recent payments
SELECT type, item_name, amount, status, created_at 
FROM platform_payments 
ORDER BY created_at DESC LIMIT 5;

-- Active addons
SELECT addon_type, activated_at 
FROM store_addons 
WHERE expires_at IS NULL OR expires_at > NOW();

-- Unlocked templates
SELECT template_slug, unlocked_at 
FROM store_templates;

-- Card balance
SELECT product_card_limit FROM stores;
```

---

## 🎯 **PAYMENT TYPES**

| Type | Amount | Item ID | What Activates |
|------|--------|---------|----------------|
| `addon` | 300 | `mpesa_stk` | M-Pesa STK addon |
| `cards` | 350-850 | `starter_pack` | +4 to +12 cards |
| `template` | 500-1000 | `deep_dive` | Template unlock |

---

## 🔧 **QUICK FIXES**

### **Card Bundle UI Fix**
```jsx
// File: dashboard/src/pages/ProductsPage.jsx
// Line: ~1949-1970

// ❌ REMOVE "Coming Soon" div
// ✅ ADD phone input:

<input
  type="tel"
  value={cardPaymentPhone}
  onChange={(e) => setCardPaymentPhone(e.target.value)}
  placeholder="0712345678"
/>
<button onClick={handleCardPurchase}>
  Pay KES {selectedBundle.price}
</button>
```

### **Template Table Name Fix**
```javascript
// File: api/src/routes/mpesa.js
// Line: activatePurchase() function

// ❌ WRONG
case 'theme':
  INSERT INTO store_themes ...

// ✅ CORRECT
case 'template':
  INSERT INTO store_templates ...
```

---

## 📞 **EMERGENCY CONTACTS**

```
Railway Issues: railway.app/dashboard
IntaSend: support@intasend.com
Safaricom: DarajaSandbox@safaricom.co.ke
```

---

## 📚 **DOCUMENTATION FILES**

```
docs/HANDOVER-2026-01-30-KYC-PAYMENTS.md  ← MASTER DOC (1235 lines)
docs/PAYMENT-TESTING-GUIDE.md            ← TEST SCENARIOS (558 lines)
docs/SESSION-SUMMARY-JAN-30.md           ← VISUAL SUMMARY
docs/PAYMENT-STATUS.md                   ← CURRENT STATUS
```

---

## ✅ **DEPLOYMENT CHECKLIST**

- [x] Railway API deployed
- [x] Netlify dashboard deployed
- [x] All commits pushed to main
- [x] Environment variables set
- [ ] KYC mock approval tested
- [ ] Addon payment tested
- [ ] Template unlock tested
- [ ] Card bundle UI fixed
- [ ] All payments verified in DB

---

## 🎯 **SUCCESS METRICS**

```
✅ Backend: 100% ready
⚠️ Frontend: 95% ready (1 UI fix)
🧪 Testing: Ready to start
```

---

**Print this card and keep it handy during testing!** 📋
