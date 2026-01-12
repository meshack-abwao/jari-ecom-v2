import { state, setState } from './state.js';
import { createOrder } from './api.js';

export function renderCheckoutModal() {
  const { currentProduct, quantity } = state;
  const price = Number(currentProduct?.data?.price || 0);
  const total = price * quantity;
  
  return `
    <div class="jv2-modal-overlay" id="checkoutModal">
      <div class="jv2-modal">
        <button class="jv2-modal-close" id="closeModal">✕</button>
        
        <!-- Step 1: Summary -->
        <div class="jv2-step active" id="step1">
          <h2 class="jv2-step-title">Confirm Order</h2>
          <div class="jv2-summary">
            <div class="jv2-summary-row">
              <span>Product</span>
              <span>${currentProduct?.data?.name}</span>
            </div>
            <div class="jv2-summary-row">
              <span>Quantity</span>
              <span>${quantity}</span>
            </div>
            <div class="jv2-summary-row">
              <span>Unit Price</span>
              <span>KES ${price.toLocaleString()}</span>
            </div>
            <div class="jv2-summary-total">
              <span>Total</span>
              <span>KES ${total.toLocaleString()}</span>
            </div>
          </div>
          <button class="jv2-btn jv2-btn-primary" id="toStep2">Continue →</button>
        </div>
        
        <!-- Step 2: Customer Info -->
        <div class="jv2-step" id="step2">
          <h2 class="jv2-step-title">Delivery Details</h2>
          <form class="jv2-form" id="customerForm">
            <div class="jv2-form-group">
              <label class="jv2-form-label">Full Name</label>
              <input type="text" class="jv2-form-input" id="customerName" placeholder="John Doe" required>
            </div>
            <div class="jv2-form-group">
              <label class="jv2-form-label">Phone Number</label>
              <input type="tel" class="jv2-form-input" id="customerPhone" placeholder="0712345678" required>
            </div>
            <div class="jv2-form-group">
              <label class="jv2-form-label">Delivery Location</label>
              <input type="text" class="jv2-form-input" id="customerLocation" placeholder="Westlands, Nairobi" required>
            </div>
            <button type="submit" class="jv2-btn jv2-btn-primary">Continue →</button>
            <button type="button" class="jv2-btn jv2-btn-secondary" id="backToStep1">Back</button>
          </form>
        </div>
        
        <!-- Step 3: Payment -->
        <div class="jv2-step" id="step3">
          <h2 class="jv2-step-title">Choose Payment</h2>
          <div class="jv2-payment-options">
            <div class="jv2-payment-option" data-method="mpesa">
              <div class="jv2-payment-icon">💚</div>
              <div class="jv2-payment-text">
                <strong>M-Pesa</strong>
                <span>Instant & Secure</span>
              </div>
              <div class="jv2-payment-check">✓</div>
            </div>
            <div class="jv2-payment-option" data-method="cod">
              <div class="jv2-payment-icon">💵</div>
              <div class="jv2-payment-text">
                <strong>Cash on Delivery</strong>
                <span>Pay when you receive</span>
              </div>
              <div class="jv2-payment-check">✓</div>
            </div>
          </div>
          <button class="jv2-btn jv2-btn-primary" id="completeOrder" disabled>Select Payment Method</button>
          <button class="jv2-btn jv2-btn-secondary" id="backToStep2">Back</button>
        </div>
        
        <!-- Step 4: Processing -->
        <div class="jv2-step" id="step4">
          <div style="text-align: center; padding: 40px 0;">
            <div class="jv2-spinner" style="margin: 0 auto 20px;"></div>
            <p>Processing your order...</p>
          </div>
        </div>
        
        <!-- Step 5: Success -->
        <div class="jv2-step" id="step5">
          <div class="jv2-success-icon">✓</div>
          <h2 class="jv2-success-title">Order Confirmed!</h2>
          <p class="jv2-success-order">Order #<strong id="orderNumber"></strong></p>
          <div class="jv2-success-message" id="successMessage"></div>
          <button class="jv2-btn jv2-btn-primary" id="closeSuccess">Done</button>
        </div>
      </div>
    </div>
  `;
}

export function initCheckout() {
  const modal = document.getElementById('checkoutModal');
  const steps = document.querySelectorAll('.jv2-step');
  let customerData = {};
  
  function showStep(num) {
    steps.forEach((s, i) => s.classList.toggle('active', i === num - 1));
  }
  
  // Close modal
  document.getElementById('closeModal')?.addEventListener('click', () => {
    modal.classList.remove('active');
    showStep(1);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      showStep(1);
    }
  });
  
  // Step navigation
  document.getElementById('toStep2')?.addEventListener('click', () => showStep(2));
  document.getElementById('backToStep1')?.addEventListener('click', () => showStep(1));
  document.getElementById('backToStep2')?.addEventListener('click', () => showStep(2));
  
  // Customer form
  document.getElementById('customerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    customerData = {
      name: document.getElementById('customerName').value.trim(),
      phone: document.getElementById('customerPhone').value.trim(),
      location: document.getElementById('customerLocation').value.trim()
    };
    showStep(3);
  });
  
  // Payment selection
  const paymentOptions = document.querySelectorAll('.jv2-payment-option');
  const completeBtn = document.getElementById('completeOrder');
  
  paymentOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      paymentOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      setState({ paymentMethod: opt.dataset.method });
      completeBtn.disabled = false;
      completeBtn.textContent = opt.dataset.method === 'mpesa' 
        ? 'Pay with M-Pesa' 
        : 'Place Order - Pay on Delivery';
    });
  });
  
  // Complete order
  completeBtn?.addEventListener('click', async () => {
    showStep(4);
    
    try {
      const { currentProduct, quantity, paymentMethod, store } = state;
      const price = Number(currentProduct?.data?.price || 0);
      
      const result = await createOrder({
        slug: store?.slug,
        productId: currentProduct?.id,
        customer: customerData,
        items: [{
          product_id: currentProduct?.id,
          name: currentProduct?.data?.name,
          price: price,
          qty: quantity,
          total: price * quantity
        }],
        payment: { method: paymentMethod }
      });
      
      document.getElementById('orderNumber').textContent = result.order_number;
      
      const msg = paymentMethod === 'mpesa'
        ? `📱 Check ${customerData.phone} for M-Pesa prompt.\n\n💬 You'll receive a WhatsApp confirmation shortly.`
        : `💵 Please prepare KES ${(price * quantity).toLocaleString()} for payment on delivery.\n\n💬 You'll receive a WhatsApp confirmation shortly.`;
      
      document.getElementById('successMessage').textContent = msg;
      showStep(5);
      
    } catch (err) {
      alert('Order failed: ' + err.message);
      showStep(3);
    }
  });
  
  // Close success
  document.getElementById('closeSuccess')?.addEventListener('click', () => {
    modal.classList.remove('active');
    showStep(1);
    setState({ quantity: 1, paymentMethod: null });
  });
}

export function openCheckout() {
  document.getElementById('checkoutModal')?.classList.add('active');
}
