import { state } from './state.js';
import { createOrder } from './api.js';

let selectedPaymentMethod = null;

// ===========================================
// CHECKOUT MODAL HTML
// ===========================================
export function renderCheckoutModal() {
  return `
    <div class="modal-overlay" id="checkoutModal">
      <div class="modal-content">
        <button class="modal-close" id="checkoutClose">×</button>
        
        <!-- Step 1: Order Summary -->
        <div class="checkout-step active" id="step1">
          <h2 class="step-title">Confirm Order</h2>
          <div class="order-summary">
            <div class="summary-row">
              <span>Product</span>
              <span id="summaryProduct">-</span>
            </div>
            <div class="summary-row">
              <span>Quantity</span>
              <span id="summaryQty">1</span>
            </div>
            <div class="summary-row">
              <span>Unit Price</span>
              <span>KES <span id="summaryPrice">0</span></span>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span>KES <span id="summaryTotal">0</span></span>
            </div>
          </div>
          <button class="btn btn-primary" id="toStep2">Continue to Delivery</button>
        </div>
        
        <!-- Step 2: Customer Info -->
        <div class="checkout-step" id="step2">
          <h2 class="step-title">Delivery Details</h2>
          <form class="customer-form" id="customerForm">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="customerName" placeholder="John Doe" required>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" id="customerPhone" placeholder="0712345678" required>
            </div>
            <div class="form-group">
              <label>Delivery Location</label>
              <input type="text" id="customerLocation" placeholder="Westlands, Nairobi" required>
            </div>
            <button type="button" class="btn btn-primary" id="toStep3">Continue to Payment</button>
            <button type="button" class="btn btn-secondary" id="backToStep1">Back</button>
          </form>
        </div>
        
        <!-- Step 3: Payment -->
        <div class="checkout-step" id="step3">
          <h2 class="step-title">Choose Payment</h2>
          <div class="payment-options">
            <div class="payment-option mpesa" id="mpesaOption" data-method="mpesa">
              <div class="payment-icon">💚</div>
              <div class="payment-text-container">
                <div class="payment-text">M-Pesa Payment</div>
                <div class="payment-subtext">Instant & Secure</div>
              </div>
              <div class="payment-checkmark">✓</div>
            </div>
            <div class="payment-option" id="codOption" data-method="cod">
              <div class="payment-icon">💵</div>
              <div class="payment-text-container">
                <div class="payment-text">Cash on Delivery</div>
                <div class="payment-subtext">Pay when you receive</div>
              </div>
              <div class="payment-checkmark">✓</div>
            </div>
          </div>
          <div class="cta-helper-text" id="ctaHelper">
            <span id="paymentMethodText"></span>
          </div>
          <button class="complete-order-btn" id="completeOrderBtn">
            <span id="ctaButtonText">Complete Order</span>
          </button>
          <button class="btn btn-secondary" id="backToStep2">Back</button>
        </div>
        
        <!-- Step 4: Loading -->
        <div class="checkout-step" id="stepLoading">
          <div class="loading-spinner"></div>
          <p class="loading-text">Processing your order...</p>
        </div>
        
        <!-- Step 5: Success -->
        <div class="checkout-step" id="stepSuccess">
          <div class="success-icon">✓</div>
          <h2 class="success-title">Order Confirmed!</h2>
          <p class="success-order">Order #<span id="orderNumber">-</span></p>
          <div class="success-message" id="successMessage">Your order has been confirmed.</div>
          <button class="btn btn-primary" id="successClose">Done</button>
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
  
  // Close button
  document.getElementById('checkoutClose')?.addEventListener('click', closeCheckout);
  document.getElementById('successClose')?.addEventListener('click', closeCheckout);
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeCheckout();
  });
  
  // Step navigation
  document.getElementById('toStep2')?.addEventListener('click', () => goToStep('step2'));
  document.getElementById('backToStep1')?.addEventListener('click', () => goToStep('step1'));
  document.getElementById('toStep3')?.addEventListener('click', validateAndGoToStep3);
  document.getElementById('backToStep2')?.addEventListener('click', () => goToStep('step2'));
  
  // Payment options
  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => selectPayment(option.dataset.method));
  });
  
  // Complete order
  document.getElementById('completeOrderBtn')?.addEventListener('click', completeOrder);
}

// ===========================================
// OPEN CHECKOUT
// ===========================================
export function openCheckout() {
  const { currentProduct, quantity, selectedPrice } = state;
  if (!currentProduct) return;
  
  const data = currentProduct.data || {};
  // Use selectedPrice if set (from package/ticket selection), otherwise use base price
  const price = selectedPrice || Number(data.price || 0);
  const total = price * quantity;
  
  // Update summary
  document.getElementById('summaryProduct').textContent = data.name || 'Product';
  document.getElementById('summaryQty').textContent = quantity;
  document.getElementById('summaryPrice').textContent = price.toLocaleString();
  document.getElementById('summaryTotal').textContent = total.toLocaleString();
  
  // Reset state
  selectedPaymentMethod = null;
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  document.getElementById('completeOrderBtn')?.classList.remove('show');
  document.getElementById('ctaHelper')?.classList.remove('show');
  
  // Show modal
  goToStep('step1');
  document.getElementById('checkoutModal')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ===========================================
// CLOSE CHECKOUT
// ===========================================
function closeCheckout() {
  document.getElementById('checkoutModal')?.classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset form after animation
  setTimeout(() => {
    document.getElementById('customerForm')?.reset();
    goToStep('step1');
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
    alert('Please fill in all fields');
    return;
  }
  
  if (phone.length < 10) {
    alert('Please enter a valid phone number');
    return;
  }
  
  goToStep('step3');
}

// ===========================================
// PAYMENT SELECTION
// ===========================================
function selectPayment(method) {
  selectedPaymentMethod = method;
  
  // Update UI
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  
  const ctaButton = document.getElementById('ctaButtonText');
  const helperText = document.getElementById('paymentMethodText');
  const ctaHelper = document.getElementById('ctaHelper');
  const completeBtn = document.getElementById('completeOrderBtn');
  
  if (method === 'mpesa') {
    document.getElementById('mpesaOption')?.classList.add('selected');
    if (ctaButton) ctaButton.textContent = '✓ Complete Order with M-Pesa';
    if (helperText) helperText.textContent = 'Check your phone for M-Pesa prompt';
  } else {
    document.getElementById('codOption')?.classList.add('selected');
    if (ctaButton) ctaButton.textContent = '✓ Complete Order - Pay on Delivery';
    if (helperText) helperText.textContent = 'Prepare exact cash for delivery';
  }
  
  completeBtn?.classList.add('show');
  ctaHelper?.classList.add('show');
}

// ===========================================
// COMPLETE ORDER
// ===========================================
async function completeOrder() {
  if (!selectedPaymentMethod) {
    alert('Please select a payment method');
    return;
  }
  
  goToStep('stepLoading');
  
  const { store, currentProduct, quantity, selectedPrice } = state;
  const data = currentProduct.data || {};
  // Use selectedPrice if set (from package/ticket selection), otherwise use base price
  const price = selectedPrice || Number(data.price || 0);
  const total = price * quantity;
  
  const orderData = {
    customer: {
      name: document.getElementById('customerName')?.value.trim(),
      phone: document.getElementById('customerPhone')?.value.trim(),
      location: document.getElementById('customerLocation')?.value.trim()
    },
    items: [{
      product_id: currentProduct.id,
      product_name: data.name || 'Product',
      quantity: quantity,
      unit_price: price,
      total: total
    }],
    payment: {
      method: selectedPaymentMethod,
      status: 'pending'
    },
    total_amount: total
  };
  
  try {
    const result = await createOrder(store.slug, orderData);
    
    if (result.success) {
      // Show success
      document.getElementById('orderNumber').textContent = result.order_number;
      
      const message = selectedPaymentMethod === 'mpesa'
        ? `🎉 Order confirmed!\n\n📱 Check ${orderData.customer.phone} for M-Pesa prompt to pay KES ${total.toLocaleString()}.\n\n💬 WhatsApp confirmation coming soon.`
        : `🎉 Order confirmed!\n\n💵 Prepare KES ${total.toLocaleString()} for payment on delivery.\n\n💬 WhatsApp confirmation coming soon.`;
      
      document.getElementById('successMessage').textContent = message;
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
