# 🚧 Remove Payment Walls - Enable M-Pesa Payments

## Files to Fix:
1. ✅ **ProductsPage.jsx** - Card bundles + Template unlocks
2. ✅ **TemplatesPage.jsx** - Template unlocks
3. ✅ **AddOnsPage.jsx** - Already working!

---

## ✅ CHANGES NEEDED:

### **1. ProductsPage.jsx - Card Bundle Purchase**

**LINE ~265-274: Replace fake alert with real M-Pesa**

```javascript
// ❌ BEFORE (Coming Soon Alert)
const handleCardPurchase = async () => {
  if (!selectedBundle) return;
  
  alert('🚧 Payment Coming Soon!\n\nM-Pesa and IntaSend integration is being configured...');
  
  setShowCardPaymentModal(false);
  setSelectedBundle(null);
  setCardPaymentPhone('');
};

// ✅ AFTER (Real M-Pesa Payment)
const handleCardPurchase = async () => {
  if (!selectedBundle || !cardPaymentPhone) return;
  
  setProcessing(true);
  
  try {
    // Initiate STK Push
    const response = await mpesaAPI.stkPush(
      cardPaymentPhone,
      selectedBundle.price,
      'cards',
      selectedBundle.id,
      selectedBundle.name
    );
    
    if (!response.data.success) {
      alert('❌ Payment failed to initiate');
      return;
    }
    
    alert(`📱 STK Push sent to ${cardPaymentPhone}! Enter your M-Pesa PIN.`);
    
    // Poll for payment status
    const paymentId = response.data.paymentId;
    const pollInterval = setInterval(async () => {
      const result = await mpesaAPI.getStatus(paymentId);
      
      if (result.data.status === 'completed') {
        clearInterval(pollInterval);
        alert('✅ Payment successful! Cards added to your balance.');
        setShowCardPaymentModal(false);
        setSelectedBundle(null);
        setCardPaymentPhone('');
        loadCardBalance(); // Refresh card balance
      } else if (result.data.status === 'failed') {
        clearInterval(pollInterval);
        alert('❌ Payment failed. Please try again.');
      }
    }, 3000); // Poll every 3 seconds
    
    // Stop polling after 60 seconds
    setTimeout(() => clearInterval(pollInterval), 60000);
    
  } catch (error) {
    console.error('Card purchase error:', error);
    alert('❌ Payment failed. Please try again.');
  } finally {
    setProcessing(false);
  }
};
```

### **2. ProductsPage.jsx - Template Unlock**

**LINE ~324-333: Replace fake alert with real M-Pesa**

```javascript
// ❌ BEFORE (Coming Soon Alert)
const handleUnlockTemplate = async () => {
  if (!templateToUnlock) return;
  
  alert('🚧 Payment Coming Soon!\n\nM-Pesa and IntaSend integration is being configured...');
  
  setShowUnlockModal(false);
  setTemplateToUnlock(null);
  window.unlockPhoneNumber = '';
};

// ✅ AFTER (Real M-Pesa Payment)
const handleUnlockTemplate = async () => {
  if (!templateToUnlock || !window.unlockPhoneNumber) {
    alert('Please enter your M-Pesa phone number');
    return;
  }
  
  setProcessing(true);
  
  try {
    // Initiate STK Push
    const response = await mpesaAPI.stkPush(
      window.unlockPhoneNumber,
      templateToUnlock.price,
      'template',
      templateToUnlock.id,
      templateToUnlock.name
    );
    
    if (!response.data.success) {
      alert('❌ Payment failed to initiate');
      return;
    }
    
    alert(`📱 STK Push sent! Enter your M-Pesa PIN.`);
    
    // Poll for payment status
    const paymentId = response.data.paymentId;
    const pollInterval = setInterval(async () => {
      const result = await mpesaAPI.getStatus(paymentId);
      
      if (result.data.status === 'completed') {
        clearInterval(pollInterval);
        alert('✅ Template unlocked! You can now use it.');
        setShowUnlockModal(false);
        setTemplateToUnlock(null);
        window.unlockPhoneNumber = '';
        loadAvailableTemplates(); // Refresh templates
      } else if (result.data.status === 'failed') {
        clearInterval(pollInterval);
        alert('❌ Payment failed. Please try again.');
      }
    }, 3000);
    
    setTimeout(() => clearInterval(pollInterval), 60000);
    
  } catch (error) {
    console.error('Template unlock error:', error);
    alert('❌ Payment failed. Please try again.');
  } finally {
    setProcessing(false);
  }
};
```

### **3. TemplatesPage.jsx - Template Unlock**

**LINE ~270-279: Same fix as ProductsPage**

---

## 🎨 UI CHANGES NEEDED:

### **ProductsPage - Card Payment Modal**

**LINE ~1949-1956: Replace "Coming Soon" div with phone input**

```jsx
{/* ❌ REMOVE THIS */}
<div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', marginBottom: '20px' }}>
  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚧</div>
  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>Payment Coming Soon</h4>
  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
    M-Pesa and IntaSend integration is being configured. Card purchases will be available shortly.
  </p>
</div>

{/* ✅ ADD THIS */}
<div style={{ textAlign: 'left', marginBottom: '20px' }}>
  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
    M-PESA PHONE NUMBER
  </label>
  <input
    type="tel"
    value={cardPaymentPhone}
    onChange={(e) => setCardPaymentPhone(e.target.value)}
    placeholder="e.g. 0712345678"
    className="dashboard-input"
    style={{ width: '100%', padding: '14px', fontSize: '16px' }}
  />
</div>

<button 
  onClick={handleCardPurchase} 
  disabled={processing || !cardPaymentPhone}
  className="btn btn-primary" 
  style={{ width: '100%', padding: '14px', fontSize: '16px' }}
>
  {processing ? 'Processing...' : `Pay KES ${selectedBundle.price.toLocaleString()} via M-Pesa`}
</button>
```

### **TemplatesPage - Unlock Modal**

**LINE ~524-531: Same fix - replace coming soon div with active payment button**

```jsx
{/* ❌ REMOVE "Coming Soon" div */}

{/* ✅ Payment button already exists, just needs to work! */}
```

---

## 🔧 ADD MISSING STATE:

**ProductsPage.jsx - Add processing state:**

```javascript
// Near line ~150 with other useState declarations:
const [processing, setProcessing] = useState(false);
```

**TemplatesPage.jsx - Add processing state:**

```javascript
// Near top with other useState declarations:
const [processing, setProcessing] = useState(false);
```

---

## 📋 IMPORT CHECK:

**Both ProductsPage.jsx and TemplatesPage.jsx need:**

```javascript
import { mpesaAPI } from '../api/client';
```

---

## ✅ TESTING CHECKLIST:

After implementing:

1. [ ] ProductsPage → Buy Cards → Shows phone input → Click Pay → STK Push sent
2. [ ] ProductsPage → Unlock Template (in product modal) → Shows phone input → Click Pay → STK Push sent
3. [ ] TemplatesPage → Unlock Template → Shows phone input → Click Pay → STK Push sent
4. [ ] AddOnsPage → Activate M-Pesa STK addon → Already working → Verify still works

---

**Result:** All payment walls removed, all M-Pesa flows active! 🎉
