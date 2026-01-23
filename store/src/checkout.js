import { state } from './state.js';
import { createOrder, createFoodOrder } from './api.js';
import { pixel } from './pixel.js';

let selectedPaymentMethod = null;
let mpesaCode = '';
let paymentConfirmed = false;

// ===========================================
// CHECKOUT MODAL HTML - JTBD Optimized (3 Steps)
// Apple Design System + Trust Architecture
// ===========================================
export function renderCheckoutModal() {
  return `
    <div class="modal-overlay" id="checkoutModal">
      <div class="modal-content checkout-modal">
        <button class="modal-close" id="checkoutClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <!-- Progress Bar -->
        <div class="checkout-progress">
          <div class="progress-track">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="progress-steps">
            <span class="progress-step active" data-step="1">Review</span>
            <span class="progress-step" data-step="2">Delivery</span>
            <span class="progress-step" data-step="3">Payment</span>
          </div>
        </div>
        
        <!-- Step 1: Review Order (JTBD: Define & Confirm) -->
        <div class="checkout-step active" id="step1">
          <h2 class="step-title">Review Your Order</h2>
          
          <div class="order-product-card">
            <div class="product-thumb" id="checkoutProductThumb">
              <div class="thumb-placeholder">📦</div>
            </div>
            <div class="product-details">
              <h3 class="product-name" id="checkoutProductName">Product</h3>
              <div class="product-meta">
                <span class="product-qty">Qty: <span id="checkoutQty">1</span></span>
              </div>
            </div>
          </div>
          
          <div class="order-breakdown">
            <div class="breakdown-row">
              <span>Subtotal</span>
              <span>KES <span id="checkoutSubtotal">0</span></span>
            </div>
            <!-- VM Extras (hidden by default, shown for visual-menu template) -->
            <div class="breakdown-extras" id="checkoutExtras" style="display: none;">
              <!-- Populated dynamically -->
            </div>
            <div class="breakdown-row">
              <span>Delivery</span>
              <span class="delivery-free">FREE</span>
            </div>
            <div class="breakdown-divider"></div>
            <div class="breakdown-row total">
              <span>Total</span>
              <span>KES <span id="checkoutTotal">0</span></span>
            </div>
          </div>
          
          <div class="trust-badges-row">
            <div class="trust-badge-mini">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Secure</span>
            </div>
            <div class="trust-badge-mini">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              <span>Warranty</span>
            </div>
            <div class="trust-badge-mini">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
              <span>Returns</span>
            </div>
          </div>
          
          <button class="btn-primary-checkout" id="toStep2">
            Continue to Delivery
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <!-- Step 2: Delivery Details (JTBD: Locate) -->
        <div class="checkout-step" id="step2">
          <h2 class="step-title">Delivery Details</h2>
          
          <form class="checkout-form" id="customerForm">
            <div class="form-field">
              <label for="customerName">Full Name</label>
              <input type="text" id="customerName" placeholder="John Doe" required autocomplete="name">
            </div>
            <div class="form-field">
              <label for="customerPhone">Phone Number (M-Pesa)</label>
              <input type="tel" id="customerPhone" placeholder="0712 345 678" required autocomplete="tel">
            </div>
            <div class="form-field">
              <label for="customerLocation">Delivery Location</label>
              <input type="text" id="customerLocation" placeholder="Westlands, Nairobi" required>
            </div>
          </form>
          
          <div class="delivery-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/>
            </svg>
            <span>Delivery within 2-5 business days</span>
          </div>
          
          <div class="step-buttons">
            <button class="btn-secondary-checkout" id="backToStep1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <button class="btn-primary-checkout" id="toStep3">
              Continue to Payment
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Step 3: Payment (JTBD: Execute) -->
        <div class="checkout-step" id="step3">
          <h2 class="step-title">Payment Method</h2>
          
          <div class="payment-options">
            <div class="payment-card mpesa" id="mpesaOption" data-method="mpesa">
              <div class="payment-radio">
                <div class="radio-dot"></div>
              </div>
              <div class="payment-icon-wrap mpesa-icon">
                <span>M</span>
              </div>
              <div class="payment-info">
                <span class="payment-title">M-Pesa</span>
                <span class="payment-desc">Instant & Secure</span>
              </div>
            </div>
            
            <div class="payment-card" id="codOption" data-method="cod">
              <div class="payment-radio">
                <div class="radio-dot"></div>
              </div>
              <div class="payment-icon-wrap cod-icon">
                <span>💵</span>
              </div>
              <div class="payment-info">
                <span class="payment-title">Cash on Delivery</span>
                <span class="payment-desc">Pay when you receive</span>
              </div>
            </div>
          </div>
          
          <!-- M-Pesa Instructions (shown when M-Pesa selected) -->
          <div class="mpesa-instructions" id="mpesaInstructions">
            <div class="mpesa-box" id="mpesaPaymentBox">
              <!-- Populated dynamically -->
            </div>
            <div class="mpesa-confirm">
              <label class="confirm-checkbox" id="mpesaConfirmCheckbox">
                <div class="checkbox-box" id="confirmIcon"></div>
                <span>I've completed the payment</span>
              </label>
              <input type="text" id="mpesaCodeInput" class="mpesa-code-input" placeholder="M-Pesa Code (optional)" maxlength="20">
            </div>
          </div>
          
          <div class="order-total-final">
            <span>Total</span>
            <span class="total-amount">KES <span id="finalTotal">0</span></span>
          </div>
          
          <button class="btn-complete-order" id="completeOrderBtn" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span id="completeButtonText">Select Payment Method</span>
          </button>
          
          <button class="btn-secondary-checkout" id="backToStep2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          
          <div class="secure-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span>Your payment is secure and encrypted</span>
          </div>
        </div>
        
        <!-- Loading State -->
        <div class="checkout-step" id="stepLoading">
          <div class="loading-state">
            <div class="loading-spinner-checkout"></div>
            <p>Processing your order...</p>
          </div>
        </div>
        
        <!-- Success State (JTBD: Monitor & Conclude) -->
        <div class="checkout-step" id="stepSuccess">
          <div class="success-state">
            <div class="success-icon-big">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 class="success-title">Order Confirmed!</h2>
            <p class="order-number">Order #<span id="orderNumber">-</span></p>
            <div class="success-message" id="successMessage"></div>
            
            <!-- Track Order Link (for food orders) -->
            <div class="success-track-order" id="trackOrderSection" style="display: none;">
              <a href="#" id="trackOrderLink" class="btn-track-order" target="_blank">
                📍 Track Your Order
              </a>
            </div>
            
            <div class="success-next-steps">
              <div class="next-step-item">
                <span class="step-num">1</span>
                <span>Confirmation SMS sent</span>
              </div>
              <div class="next-step-item">
                <span class="step-num">2</span>
                <span>Seller will contact you</span>
              </div>
              <div class="next-step-item">
                <span class="step-num">3</span>
                <span>Track via WhatsApp</span>
              </div>
            </div>
            <button class="btn-primary-checkout" id="successClose">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===========================================
// INIT CHECKOUT
// ===========================================
export function initCheckout() {
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;
  
  // Close handlers
  document.getElementById('checkoutClose')?.addEventListener('click', closeCheckout);
  document.getElementById('successClose')?.addEventListener('click', closeCheckout);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeCheckout();
  });
  
  // Step navigation
  document.getElementById('toStep2')?.addEventListener('click', () => {
    goToStep('step2');
    updateProgress(2);
  });
  document.getElementById('backToStep1')?.addEventListener('click', () => {
    goToStep('step1');
    updateProgress(1);
  });
  document.getElementById('toStep3')?.addEventListener('click', validateAndGoToStep3);
  document.getElementById('backToStep2')?.addEventListener('click', () => {
    goToStep('step2');
    updateProgress(2);
  });
  
  // Payment selection
  document.querySelectorAll('.payment-card').forEach(card => {
    card.addEventListener('click', () => selectPayment(card.dataset.method));
  });
  
  // M-Pesa confirmation
  document.getElementById('mpesaConfirmCheckbox')?.addEventListener('click', togglePaymentConfirmed);
  document.getElementById('mpesaCodeInput')?.addEventListener('input', (e) => {
    mpesaCode = e.target.value.toUpperCase();
  });
  
  // Complete order
  document.getElementById('completeOrderBtn')?.addEventListener('click', handleCompleteOrder);
}

// ===========================================
// PROGRESS BAR
// ===========================================
function updateProgress(step) {
  const fill = document.getElementById('progressFill');
  const steps = document.querySelectorAll('.progress-step');
  
  if (fill) {
    fill.style.width = `${((step - 1) / 2) * 100}%`;
  }
  
  steps.forEach((s, i) => {
    s.classList.toggle('active', i < step);
    s.classList.toggle('current', i === step - 1);
  });
}

// ===========================================
// OPEN CHECKOUT
// ===========================================
export function openCheckout() {
  const { currentProduct, quantity, selectedPrice } = state;
  if (!currentProduct) return;
  
  const data = currentProduct.data || {};
  const media = currentProduct.media || {};
  const isVisualMenu = currentProduct.template === 'visual-menu';
  
  // Get VM-specific data from window globals
  const vmQuantity = window.JARI_VM_QUANTITY || quantity;
  const vmExtras = window.JARI_SELECTED_ADDONS || [];
  
  // Calculate base price and extras
  const basePrice = selectedPrice || Number(data.price || 0);
  let extrasTotal = 0;
  
  if (isVisualMenu && vmExtras.length > 0) {
    extrasTotal = vmExtras.reduce((sum, extra) => sum + (extra.subtotal || 0), 0);
  }
  
  const subtotal = basePrice * vmQuantity;
  const total = subtotal + extrasTotal;
  
  // Track checkout start
  pixel.checkoutStart(total);
  
  // Update Step 1 - Product card with image
  const thumbEl = document.getElementById('checkoutProductThumb');
  if (thumbEl && media.images?.[0]) {
    thumbEl.innerHTML = `<img src="${media.images[0]}" alt="${data.name || 'Product'}">`;
  }
  document.getElementById('checkoutProductName').textContent = data.name || 'Product';
  document.getElementById('checkoutQty').textContent = vmQuantity;
  document.getElementById('checkoutSubtotal').textContent = subtotal.toLocaleString();
  
  // Handle VM extras display
  const extrasEl = document.getElementById('checkoutExtras');
  if (extrasEl) {
    if (isVisualMenu && vmExtras.length > 0) {
      extrasEl.style.display = 'block';
      extrasEl.innerHTML = vmExtras.map(extra => `
        <div class="breakdown-row extras-row">
          <span class="extras-label">+ ${extra.name}${extra.quantity > 1 ? ` ×${extra.quantity}` : ''}</span>
          <span class="extras-price">KES ${extra.subtotal.toLocaleString()}</span>
        </div>
      `).join('');
    } else {
      extrasEl.style.display = 'none';
      extrasEl.innerHTML = '';
    }
  }
  
  document.getElementById('checkoutTotal').textContent = total.toLocaleString();
  document.getElementById('finalTotal').textContent = total.toLocaleString();
  
  // Store extras in state for order creation
  if (isVisualMenu) {
    state.vmExtras = vmExtras;
    state.vmTotal = total;
  }
  
  // Reset state
  selectedPaymentMethod = null;
  paymentConfirmed = false;
  mpesaCode = '';
  document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('mpesaInstructions')?.classList.remove('show');
  document.getElementById('completeOrderBtn').disabled = true;
  document.getElementById('completeButtonText').textContent = 'Select Payment Method';
  document.getElementById('mpesaCodeInput').value = '';
  updateConfirmCheckbox();
  
  // Show modal
  goToStep('step1');
  updateProgress(1);
  document.getElementById('checkoutModal')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ===========================================
// CLOSE CHECKOUT
// ===========================================
function closeCheckout() {
  document.getElementById('checkoutModal')?.classList.remove('active');
  document.body.style.overflow = '';
  
  setTimeout(() => {
    document.getElementById('customerForm')?.reset();
    goToStep('step1');
    updateProgress(1);
  }, 300);
}

// ===========================================
// STEP NAVIGATION
// ===========================================
function goToStep(stepId) {
  document.querySelectorAll('.checkout-step').forEach(step => {
    step.classList.remove('active');
  });
  document.getElementById(stepId)?.classList.add('active');
}

function validateAndGoToStep3() {
  const name = document.getElementById('customerName')?.value.trim();
  const phone = document.getElementById('customerPhone')?.value.trim();
  const location = document.getElementById('customerLocation')?.value.trim();
  
  if (!name || !phone || !location) {
    // Highlight empty fields
    if (!name) document.getElementById('customerName')?.classList.add('error');
    if (!phone) document.getElementById('customerPhone')?.classList.add('error');
    if (!location) document.getElementById('customerLocation')?.classList.add('error');
    return;
  }
  
  // Remove error states
  document.querySelectorAll('.checkout-form input').forEach(i => i.classList.remove('error'));
  
  if (phone.length < 10) {
    document.getElementById('customerPhone')?.classList.add('error');
    return;
  }
  
  // Populate M-Pesa instructions
  populateMpesaInstructions();
  
  goToStep('step3');
  updateProgress(3);
}

// ===========================================
// PAYMENT SELECTION
// ===========================================
function selectPayment(method) {
  selectedPaymentMethod = method;
  
  // Update UI
  document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
  
  const btn = document.getElementById('completeOrderBtn');
  const btnText = document.getElementById('completeButtonText');
  const mpesaInstructions = document.getElementById('mpesaInstructions');
  const { selectedPrice, currentProduct, quantity } = state;
  const price = selectedPrice || Number(currentProduct?.data?.price || 0);
  const total = price * quantity;
  
  if (method === 'mpesa') {
    document.getElementById('mpesaOption')?.classList.add('selected');
    mpesaInstructions?.classList.add('show');
    
    // Check if store has M-Pesa config
    const storeConfig = window.JARI_STORE_CONFIG || {};
    const payment = storeConfig.payment || {};
    const hasPaymentConfig = payment.type && (payment.paybill_number || payment.till_number);
    
    if (hasPaymentConfig) {
      btnText.textContent = `Pay KES ${total.toLocaleString()} with M-Pesa`;
      btn.disabled = !paymentConfirmed;
    } else {
      btnText.textContent = `Complete Order - KES ${total.toLocaleString()}`;
      btn.disabled = false;
    }
  } else {
    document.getElementById('codOption')?.classList.add('selected');
    mpesaInstructions?.classList.remove('show');
    btnText.textContent = `Pay on Delivery - KES ${total.toLocaleString()}`;
    btn.disabled = false;
  }
}

// ===========================================
// M-PESA INSTRUCTIONS
// ===========================================
function populateMpesaInstructions() {
  const storeConfig = window.JARI_STORE_CONFIG || {};
  const payment = storeConfig.payment || {};
  const { currentProduct, quantity, selectedPrice } = state;
  const price = selectedPrice || Number(currentProduct?.data?.price || 0);
  const total = price * quantity;
  const phone = document.getElementById('customerPhone')?.value || '';
  const acct = payment.paybill_account || phone || 'Your Phone';
  
  const mpesaBox = document.getElementById('mpesaPaymentBox');
  if (!mpesaBox) return;
  
  const hasConfig = payment.type && (payment.paybill_number || payment.till_number);
  
  if (!hasConfig) {
    mpesaBox.innerHTML = `
      <p class="mpesa-no-config">M-Pesa details will be sent via SMS after order.</p>
    `;
    return;
  }
  
  if (payment.type === 'paybill') {
    mpesaBox.innerHTML = `
      <div class="mpesa-steps">
        <div class="mpesa-step">
          <span class="mpesa-step-num">1</span>
          <span>Go to M-Pesa → Lipa na M-Pesa → Paybill</span>
        </div>
        <div class="mpesa-step">
          <span class="mpesa-step-num">2</span>
          <span>Business No: <strong>${payment.paybill_number}</strong></span>
        </div>
        <div class="mpesa-step">
          <span class="mpesa-step-num">3</span>
          <span>Account: <strong>${acct}</strong></span>
        </div>
        <div class="mpesa-step">
          <span class="mpesa-step-num">4</span>
          <span>Amount: <strong>KES ${total.toLocaleString()}</strong></span>
        </div>
      </div>
      ${payment.business_name ? `<p class="mpesa-to">Pay to: ${payment.business_name}</p>` : ''}
    `;
  } else {
    mpesaBox.innerHTML = `
      <div class="mpesa-steps">
        <div class="mpesa-step">
          <span class="mpesa-step-num">1</span>
          <span>Go to M-Pesa → Lipa na M-Pesa → Buy Goods</span>
        </div>
        <div class="mpesa-step">
          <span class="mpesa-step-num">2</span>
          <span>Till Number: <strong>${payment.till_number}</strong></span>
        </div>
        <div class="mpesa-step">
          <span class="mpesa-step-num">3</span>
          <span>Amount: <strong>KES ${total.toLocaleString()}</strong></span>
        </div>
      </div>
      ${payment.business_name ? `<p class="mpesa-to">Pay to: ${payment.business_name}</p>` : ''}
    `;
  }
}

// ===========================================
// M-PESA CONFIRMATION
// ===========================================
function togglePaymentConfirmed() {
  paymentConfirmed = !paymentConfirmed;
  updateConfirmCheckbox();
  
  // Update button state
  if (selectedPaymentMethod === 'mpesa') {
    const storeConfig = window.JARI_STORE_CONFIG || {};
    const payment = storeConfig.payment || {};
    const hasPaymentConfig = payment.type && (payment.paybill_number || payment.till_number);
    
    if (hasPaymentConfig) {
      document.getElementById('completeOrderBtn').disabled = !paymentConfirmed;
    }
  }
}

function updateConfirmCheckbox() {
  const checkbox = document.getElementById('mpesaConfirmCheckbox');
  const icon = document.getElementById('confirmIcon');
  if (checkbox) {
    checkbox.classList.toggle('checked', paymentConfirmed);
  }
  if (icon) {
    icon.innerHTML = paymentConfirmed ? `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ` : '';
  }
}

// ===========================================
// COMPLETE ORDER
// ===========================================
async function handleCompleteOrder() {
  if (!selectedPaymentMethod) return;
  
  goToStep('stepLoading');
  
  const { store, currentProduct, quantity, selectedPrice, vmExtras, vmTotal } = state;
  
  if (!store?.slug || !currentProduct?.id) {
    alert('Missing information. Please refresh and try again.');
    goToStep('step3');
    return;
  }
  
  const data = currentProduct.data || {};
  const isVisualMenu = currentProduct.template === 'visual-menu';
  const vmQuantity = window.JARI_VM_QUANTITY || quantity;
  
  // Calculate totals based on template type
  const basePrice = selectedPrice || Number(data.price || 0);
  let extrasTotal = 0;
  
  if (isVisualMenu && vmExtras?.length > 0) {
    extrasTotal = vmExtras.reduce((sum, extra) => sum + (extra.subtotal || 0), 0);
  }
  
  const subtotal = basePrice * vmQuantity;
  const total = isVisualMenu ? (vmTotal || subtotal + extrasTotal) : basePrice * quantity;
  
  const orderData = {
    customer: {
      name: document.getElementById('customerName')?.value.trim(),
      phone: document.getElementById('customerPhone')?.value.trim(),
      location: document.getElementById('customerLocation')?.value.trim()
    },
    items: [{
      product_id: currentProduct.id,
      product_name: data.name || 'Product',
      quantity: isVisualMenu ? vmQuantity : quantity,
      unit_price: basePrice,
      total: subtotal,
      // VM-specific: include extras
      extras: isVisualMenu && vmExtras?.length > 0 ? vmExtras : undefined
    }],
    payment: {
      method: selectedPaymentMethod,
      status: 'pending',
      mpesa_code: mpesaCode || null,
      payment_confirmed: paymentConfirmed
    },
    total_amount: total,
    // VM-specific metadata
    order_type: isVisualMenu ? 'food' : 'product',
    template: currentProduct.template
  };
  
  try {
    // Route to correct API based on template
    const result = isVisualMenu 
      ? await createFoodOrder(store.slug, orderData)
      : await createOrder(store.slug, orderData);
    
    if (result.success) {
      pixel.purchase(result.order_number, total, currentProduct.id);
      
      document.getElementById('orderNumber').textContent = result.order_number;
      
      const message = selectedPaymentMethod === 'mpesa'
        ? `Payment of KES ${total.toLocaleString()} received. Your order is being prepared!`
        : `Prepare KES ${total.toLocaleString()} for payment on delivery.`;
      
      document.getElementById('successMessage').textContent = message;
      
      // Show tracking link for food orders (Visual Menu template)
      if (isVisualMenu) {
        const trackSection = document.getElementById('trackOrderSection');
        const trackLink = document.getElementById('trackOrderLink');
        if (trackSection && trackLink) {
          trackSection.style.display = 'block';
          trackLink.href = `/order/${result.order_number}`;
        }
      }
      
      goToStep('stepSuccess');
    } else {
      alert(result.error || 'Order failed. Please try again.');
      goToStep('step3');
    }
  } catch (error) {
    console.error('Order error:', error);
    alert('Failed to place order. Please try again.');
    goToStep('step3');
  }
}
