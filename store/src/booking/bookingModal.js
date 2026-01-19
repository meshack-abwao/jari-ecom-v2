// ===========================================
// BOOKING MODAL RENDER
// Prefix: bkm- (booking modal)
// 3-Step Perception: SELECT → DETAILS → PAY
// ===========================================
import { bookingState } from './bookingState.js';

// Map internal steps (1-5) to perceived steps (1-3)
function getPerceivedStep(internalStep) {
  if (internalStep <= 2) return 1;      // Package + Date/Time = SELECT
  if (internalStep <= 4) return 2;      // Details + Review = DETAILS  
  return 3;                              // Payment = PAY
}

const STEP_LABELS = ['SELECT', 'DETAILS', 'PAY'];

export function renderBookingModal() {
  const { isOpen, step, product, selectedPackage, loading, storeConfig, paymentType } = bookingState;
  if (!isOpen) return '';
  
  const data = product?.data || {};
  const packages = data.packages || [];
  
  // Check if we need payment step
  const payment = storeConfig?.payment || {};
  const hasPaymentConfig = payment.type && (payment.paybill_number || payment.till_number);
  const needsPaymentStep = hasPaymentConfig && paymentType !== 'inquiry';
  
  // Always show 3 perceived steps (or 2 if no payment)
  const totalPerceivedSteps = needsPaymentStep ? 3 : 2;
  const currentPerceivedStep = getPerceivedStep(step);
  
  return `
    <div class="bkm-overlay" id="bkmOverlay">
      <div class="bkm-modal">
        <button class="bkm-close" id="bkmClose">✕</button>
        
        <!-- Progress: 3 Steps Perception -->
        <div class="bkm-progress">
          ${Array.from({length: totalPerceivedSteps}, (_, i) => i + 1).map(s => `
            <div class="bkm-step-group ${currentPerceivedStep >= s ? 'active' : ''} ${currentPerceivedStep === s ? 'current' : ''}">
              <div class="bkm-step-dot">${currentPerceivedStep > s ? '✓' : s}</div>
              <span class="bkm-step-label">${STEP_LABELS[s-1]}</span>
            </div>
            ${s < totalPerceivedSteps ? `<div class="bkm-line ${currentPerceivedStep > s ? 'active' : ''}"></div>` : ''}
          `).join('')}
        </div>
        
        <!-- Content -->
        <div class="bkm-content" id="bkmContent">
          ${loading ? renderLoading() : renderStep(step)}
        </div>
      </div>
    </div>
  `;
}

function renderLoading() {
  return `<div class="bkm-loading">Loading...</div>`;
}

export function renderStep(step) {
  switch (step) {
    case 1: return renderStep1();
    case 2: return renderStep2();
    case 3: return renderStep3();
    case 4: return renderStep4();
    case 5: return renderStep5();
    default: return renderStep1();
  }
}

// Step 1: Select Package
function renderStep1() {
  const { product, selectedPackage } = bookingState;
  const data = product?.data || {};
  const packages = data.packages || [];
  
  if (packages.length === 0) {
    // No packages, just show service
    return `
      <div class="bkm-step-content">
        <h3 class="bkm-title">Select Service</h3>
        <div class="bkm-service selected" data-price="${data.price || 0}" data-name="${data.name}">
          <div class="bkm-service-info">
            <span class="bkm-service-name">${data.name}</span>
            <span class="bkm-service-price">KES ${parseInt(data.price || 0).toLocaleString()}</span>
          </div>
          <span class="bkm-check">✓</span>
        </div>
        <div class="bkm-actions">
          <button class="bkm-btn bkm-btn-primary" id="bkmNext">Continue →</button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="bkm-step-content">
      <h3 class="bkm-title">Select Package</h3>
      <div class="bkm-packages">
        ${packages.map((pkg, i) => `
          <div class="bkm-service ${selectedPackage?.name === pkg.name ? 'selected' : ''}" 
               data-index="${i}" data-price="${pkg.price}" data-name="${pkg.name}" data-duration="${pkg.duration || ''}">
            <div class="bkm-service-info">
              <span class="bkm-service-name">${pkg.name}</span>
              ${pkg.duration ? `<span class="bkm-service-duration">${pkg.duration}</span>` : ''}
              <span class="bkm-service-price">KES ${parseInt(pkg.price || 0).toLocaleString()}</span>
            </div>
            <span class="bkm-check">✓</span>
          </div>
        `).join('')}
      </div>
      <div class="bkm-actions">
        <button class="bkm-btn bkm-btn-primary" id="bkmNext" ${!selectedPackage ? 'disabled' : ''}>Continue →</button>
      </div>
    </div>
  `;
}


// Step 2: Select Date & Time
function renderStep2() {
  const { selectedDate, selectedTime, availableSlots } = bookingState;
  
  return `
    <div class="bkm-step-content">
      <h3 class="bkm-title">Pick Date & Time</h3>
      
      <div class="bkm-calendar">
        <div class="bkm-cal-header">
          <button class="bkm-cal-nav" id="bkmPrevMonth">‹</button>
          <span class="bkm-cal-title" id="bkmCalTitle">${getMonthYear()}</span>
          <button class="bkm-cal-nav" id="bkmNextMonth">›</button>
        </div>
        <div class="bkm-cal-weekdays">
          ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<span>${d}</span>`).join('')}
        </div>
        <div class="bkm-cal-days" id="bkmCalDays">
          ${renderCalendarDays()}
        </div>
      </div>
      
      ${selectedDate ? `
        <div class="bkm-slots" id="bkmSlots">
          <h4 class="bkm-slots-title">Available Times</h4>
          <div class="bkm-slots-grid">
            ${renderTimeSlots()}
          </div>
        </div>
      ` : ''}
      
      <div class="bkm-actions">
        <button class="bkm-btn bkm-btn-secondary" id="bkmBack">← Back</button>
        <button class="bkm-btn bkm-btn-primary" id="bkmNext" ${!selectedTime ? 'disabled' : ''}>Continue →</button>
      </div>
    </div>
  `;
}

export function renderCalendarDays() {
  const { viewMonth, viewYear, selectedDate, workingHours, blockedDates, settings } = bookingState;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  
  const minNotice = settings.min_notice_hours || 0;
  const maxAdvance = settings.max_advance_days || 60;
  const minDate = new Date(today.getTime() + minNotice * 60 * 60 * 1000);
  const maxDate = new Date(today.getTime() + maxAdvance * 24 * 60 * 60 * 1000);
  
  let html = '';
  
  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    html += '<span class="bkm-day empty"></span>';
  }
  
  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear, viewMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    const workingDay = workingHours.find(w => w.day_of_week === dayOfWeek);
    const isWorkingDay = workingDay?.is_open !== false;
    const isBlocked = blockedDates.some(b => b.blocked_date?.split('T')[0] === dateStr);
    const isPast = date < minDate;
    const isTooFar = date > maxDate;
    const isSelected = dateStr === selectedDate;
    const isToday = date.toDateString() === today.toDateString();
    
    const available = isWorkingDay && !isBlocked && !isPast && !isTooFar;
    
    let classes = 'bkm-day';
    if (!available) classes += ' disabled';
    if (isSelected) classes += ' selected';
    if (isToday) classes += ' today';
    
    html += `<span class="${classes}" data-date="${dateStr}" ${available ? '' : 'data-disabled="true"'}>${day}</span>`;
  }
  
  return html;
}

export function renderTimeSlots() {
  const { availableSlots, selectedTime, dayFullyBooked, settings } = bookingState;
  
  if (dayFullyBooked && settings.jump_line_enabled) {
    return `
      <div class="bkm-fully-booked">
        <p class="bkm-fully-booked-msg">⚡ This day is fully booked</p>
        <p class="bkm-jump-hint">Enable "Jump the Line" at checkout for priority booking</p>
      </div>
    `;
  }
  
  if (!availableSlots || availableSlots.length === 0) {
    return '<p class="bkm-no-slots">No available times for this day</p>';
  }
  
  // Check if slot availability is a number or boolean
  return availableSlots.map(slot => {
    const isAvailable = typeof slot.available === 'number' ? slot.available > 0 : slot.available;
    const spotsText = typeof slot.available === 'number' && slot.available > 0 ? 
      `${slot.available} spot${slot.available > 1 ? 's' : ''}` : '';
    
    return `
      <button class="bkm-slot ${selectedTime === slot.time ? 'selected' : ''} ${!isAvailable ? 'disabled full' : ''}"
              data-time="${slot.time}" ${!isAvailable ? 'disabled' : ''}>
        <span class="bkm-slot-time">${slot.time}</span>
        ${!isAvailable ? '<span class="bkm-slot-full">Full</span>' : ''}
        ${spotsText && isAvailable ? `<span class="bkm-slot-spots">${spotsText}</span>` : ''}
      </button>
    `;
  }).join('');
}

function getMonthYear() {
  const { viewMonth, viewYear } = bookingState;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[viewMonth]} ${viewYear}`;
}


// Step 3: Customer Details + Inline Review Summary
function renderStep3() {
  const { customerName, customerPhone, customerEmail, notes,
          product, selectedPackage, selectedDate, selectedTime } = bookingState;
  const data = product?.data || {};
  const serviceName = selectedPackage?.name || data.name || 'Service';
  const price = selectedPackage?.price || data.price || 0;
  
  // Format date for display
  const dateDisplay = selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  }) : '';
  
  return `
    <div class="bkm-step-content">
      <h3 class="bkm-title">Your Details</h3>
      
      <!-- Inline Booking Summary -->
      <div class="bkm-inline-summary">
        <div class="bkm-summary-item">
          <span class="bkm-summary-label">Service</span>
          <span class="bkm-summary-value">${serviceName}</span>
        </div>
        <div class="bkm-summary-item">
          <span class="bkm-summary-label">When</span>
          <span class="bkm-summary-value">${dateDisplay} at ${selectedTime || ''}</span>
        </div>
        <div class="bkm-summary-item bkm-summary-price">
          <span class="bkm-summary-label">Price</span>
          <span class="bkm-summary-value">KES ${Number(price).toLocaleString()}</span>
        </div>
      </div>
      
      <div class="bkm-form">
        <div class="bkm-field">
          <label>Full Name *</label>
          <input type="text" id="bkmName" value="${customerName}" placeholder="Your name">
        </div>
        <div class="bkm-field">
          <label>Phone Number *</label>
          <input type="tel" id="bkmPhone" value="${customerPhone}" placeholder="07XX XXX XXX">
        </div>
        <div class="bkm-field">
          <label>Email (optional)</label>
          <input type="email" id="bkmEmail" value="${customerEmail}" placeholder="your@email.com">
        </div>
        <div class="bkm-field">
          <label>Special Requests (optional)</label>
          <textarea id="bkmNotes" placeholder="Any special requirements...">${notes}</textarea>
        </div>
      </div>
      
      <div class="bkm-actions">
        <button class="bkm-btn bkm-btn-secondary" id="bkmBack">← Back</button>
        <button class="bkm-btn bkm-btn-primary" id="bkmNext">Continue →</button>
      </div>
    </div>
  `;
}

// Step 4: Review & Confirm (JTBD: Clear pricing, flexible payment, priority option)
function renderStep4() {
  const { 
    product, selectedPackage, selectedDate, selectedTime, 
    customerName, customerPhone, settings, storeConfig,
    paymentType, jumpLine, discountCode, discountAmount, submitting,
    dayFullyBooked, mpesaCode, paymentConfirmed
  } = bookingState;
  const data = product?.data || {};
  
  // Payment config from store
  const payment = storeConfig?.payment || {};
  const hasPaymentConfig = payment.type && (payment.paybill_number || payment.till_number);
  
  // Price calculation - FORCE ALL VALUES TO NUMBERS using Number() and ||0
  const basePrice = Number(selectedPackage?.price) || Number(data.price) || 0;
  const jumpLineFee = Number(settings.jump_line_fee) || 0;
  const jumpLineEnabled = settings.jump_line_enabled && jumpLineFee > 0 && dayFullyBooked;
  const depositEnabled = settings.deposit_enabled;
  const depositPercent = Number(settings.deposit_percentage) || 20;
  const inquiryFee = Number(settings.inquiry_fee) || 0;
  const discount = Number(discountAmount) || 0;
  
  // Calculate totals - explicit number math
  const jumpFeeApplied = (jumpLine && jumpLineEnabled) ? Number(jumpLineFee) : 0;
  const subtotal = Number(basePrice) + Number(jumpFeeApplied) - Number(discount);
  const depositAmount = Math.round(subtotal * depositPercent / 100);
  
  // What customer pays now
  let payNow = subtotal;
  let payLater = 0;
  if (paymentType === 'deposit' && depositEnabled) {
    payNow = depositAmount;
    payLater = subtotal - depositAmount;
  } else if (paymentType === 'inquiry') {
    payNow = Number(inquiryFee);
    payLater = subtotal - Number(inquiryFee);
  }
  
  // Debug log (remove after testing)
  console.log('[Booking] Price calc:', { basePrice, jumpLineFee, jumpFeeApplied, discount, subtotal, payNow });
  
  return `
    <div class="bkm-step-content">
      <h3 class="bkm-title">Review & Confirm</h3>
      
      <!-- Booking Summary -->
      <div class="bkm-review">
        <div class="bkm-review-row">
          <span>Service</span>
          <strong>${selectedPackage?.name || data.name}</strong>
        </div>
        <div class="bkm-review-row">
          <span>Date & Time</span>
          <strong>${formatDate(selectedDate)} at ${selectedTime}</strong>
        </div>
        <div class="bkm-review-row">
          <span>Contact</span>
          <strong>${customerName} · ${customerPhone}</strong>
        </div>
      </div>
      
      <!-- Jump the Line Option - Only shows when day is fully booked -->
      ${jumpLineEnabled ? `
        <div class="bkm-option bkm-jump-line ${jumpLine ? 'selected' : ''}" id="bkmJumpLine">
          <div class="bkm-option-info">
            <span class="bkm-option-icon">⚡</span>
            <div>
              <strong>Jump the Line</strong>
              <p>Get priority booking confirmation</p>
            </div>
          </div>
          <div class="bkm-option-price">
            <span>+KES ${Number(jumpLineFee).toLocaleString()}</span>
            <span class="bkm-checkbox ${jumpLine ? 'checked' : ''}"></span>
          </div>
        </div>
      ` : ''}
      
      <!-- Discount Code -->
      <div class="bkm-discount">
        <input type="text" id="bkmDiscountCode" value="${discountCode}" placeholder="Discount code">
        <button class="bkm-btn-sm" id="bkmApplyDiscount">Apply</button>
      </div>
      ${discountAmount > 0 ? `<p class="bkm-discount-applied">-KES ${discountAmount.toLocaleString()} discount applied</p>` : ''}
      
      <!-- Payment Options -->
      <div class="bkm-payment-options">
        <label class="bkm-payment-option ${paymentType === 'full' ? 'selected' : ''}">
          <input type="radio" name="paymentType" value="full" ${paymentType === 'full' ? 'checked' : ''}>
          <div class="bkm-payment-option-content">
            <strong>Pay Full Amount</strong>
            <span class="bkm-payment-amount">KES ${Number(subtotal).toLocaleString()}</span>
          </div>
        </label>
        
        ${depositEnabled ? `
          <label class="bkm-payment-option ${paymentType === 'deposit' ? 'selected' : ''}">
            <input type="radio" name="paymentType" value="deposit" ${paymentType === 'deposit' ? 'checked' : ''}>
            <div class="bkm-payment-option-content">
              <strong>Pay Deposit (${depositPercent}%)</strong>
              <span class="bkm-payment-amount">KES ${Number(depositAmount).toLocaleString()}</span>
              <small>Pay KES ${Number(subtotal - depositAmount).toLocaleString()} on arrival</small>
            </div>
          </label>
        ` : ''}
        
        ${inquiryFee >= 0 ? `
          <label class="bkm-payment-option ${paymentType === 'inquiry' ? 'selected' : ''}">
            <input type="radio" name="paymentType" value="inquiry" ${paymentType === 'inquiry' ? 'checked' : ''}>
            <div class="bkm-payment-option-content">
              <strong>Inquiry Only</strong>
              <span class="bkm-payment-amount">${Number(inquiryFee) > 0 ? `KES ${Number(inquiryFee).toLocaleString()}` : 'Free'}</span>
              <small>Request booking, pay later</small>
            </div>
          </label>
        ` : ''}
      </div>
      
      <!-- Price Breakdown -->
      <div class="bkm-price-breakdown">
        <div class="bkm-price-row">
          <span>Service</span>
          <span>KES ${Number(basePrice).toLocaleString()}</span>
        </div>
        ${jumpLine && jumpLineEnabled ? `
          <div class="bkm-price-row">
            <span>Jump the Line</span>
            <span>+KES ${Number(jumpLineFee).toLocaleString()}</span>
          </div>
        ` : ''}
        ${Number(discount) > 0 ? `
          <div class="bkm-price-row discount">
            <span>Discount</span>
            <span>-KES ${Number(discount).toLocaleString()}</span>
          </div>
        ` : ''}
        <div class="bkm-price-row total">
          <strong>Pay Now</strong>
          <strong>KES ${Number(payNow).toLocaleString()}</strong>
        </div>
        ${Number(payLater) > 0 ? `
          <div class="bkm-price-row later">
            <span>Pay on arrival</span>
            <span>KES ${Number(payLater).toLocaleString()}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="bkm-actions">
        <button class="bkm-btn bkm-btn-secondary" id="bkmBack" ${submitting ? 'disabled' : ''}>← Back</button>
        ${hasPaymentConfig && paymentType !== 'inquiry' ? `
          <button class="bkm-btn bkm-btn-primary" id="bkmNext">Continue to Payment →</button>
        ` : `
          <button class="bkm-btn bkm-btn-primary bkm-btn-confirm" id="bkmConfirm" ${submitting ? 'disabled' : ''}>
            ${submitting ? 'Booking...' : paymentType === 'inquiry' ? 'Send Inquiry' : 'Confirm Booking'}
          </button>
        `}
      </div>
    </div>
  `;
}

// Step 5: Payment Confirmation - Trust & Confidence
function renderStep5() {
  const { 
    product, selectedPackage, storeConfig, customerPhone,
    paymentType, jumpLine, discountAmount, settings,
    mpesaCode, paymentConfirmed, submitting
  } = bookingState;
  const data = product?.data || {};
  
  // Payment config
  const payment = storeConfig?.payment || {};
  const businessName = payment.business_name || storeConfig?.name || 'Business';
  
  // Price calculation
  const basePrice = Number(selectedPackage?.price) || Number(data.price) || 0;
  const jumpLineFee = Number(settings.jump_line_fee) || 0;
  const totalPrice = basePrice + (jumpLine ? jumpLineFee : 0) - (Number(discountAmount) || 0);
  
  let payNow = totalPrice;
  if (paymentType === 'deposit') {
    payNow = Math.round(totalPrice * (Number(settings.deposit_percentage) || 20) / 100);
  }
  
  const acct = payment.paybill_account || customerPhone || 'Your Phone';
  
  return `
    <div class="bkm-step-content bkm-step-compact">
      <!-- Trust Header -->
      <div class="bkm-trust-header">
        <span class="bkm-secure-badge">🔒 Secure Payment</span>
        <h3 class="bkm-title">Pay via M-Pesa</h3>
        <p class="bkm-paying-to">Paying to: <strong>${businessName}</strong></p>
      </div>
      
      <!-- Compact M-Pesa Details - Golden Ratio Layout -->
      <div class="bkm-mpesa-compact">
        ${payment.type === 'paybill' ? `
          <div class="bkm-mpesa-grid">
            <div class="bkm-mpesa-grid-row">
              <div class="bkm-mpesa-item">
                <span class="bkm-label">Paybill</span>
                <strong>${payment.paybill_number}</strong>
              </div>
              <div class="bkm-mpesa-item">
                <span class="bkm-label">Account</span>
                <strong>${acct}</strong>
              </div>
            </div>
            <div class="bkm-mpesa-item bkm-mpesa-highlight">
              <span class="bkm-label">Amount</span>
              <strong>KES ${Number(payNow).toLocaleString()}</strong>
            </div>
          </div>
          <p class="bkm-mpesa-hint">M-Pesa → Lipa na M-Pesa → Paybill → ${payment.paybill_number}</p>
        ` : `
          <div class="bkm-mpesa-grid">
            <div class="bkm-mpesa-grid-row">
              <div class="bkm-mpesa-item">
                <span class="bkm-label">Till No</span>
                <strong>${payment.till_number}</strong>
              </div>
            </div>
            <div class="bkm-mpesa-item bkm-mpesa-highlight">
              <span class="bkm-label">Amount</span>
              <strong>KES ${Number(payNow).toLocaleString()}</strong>
            </div>
          </div>
          <p class="bkm-mpesa-hint">M-Pesa → Lipa na M-Pesa → Buy Goods → ${payment.till_number}</p>
        `}
      </div>
      
      <!-- Confirmation Required -->
      <div class="bkm-confirm-row">
        <label class="bkm-confirm-checkbox ${paymentConfirmed ? 'checked' : ''}" id="bkmPaymentConfirm">
          <span class="bkm-checkbox-icon">${paymentConfirmed ? '✓' : ''}</span>
          <span>I've sent the payment</span>
        </label>
        <input type="text" id="bkmMpesaCode" class="bkm-code-input" value="${mpesaCode || ''}" placeholder="M-Pesa code" maxlength="20" />
      </div>
      
      <div class="bkm-actions">
        <button class="bkm-btn bkm-btn-secondary" id="bkmBack" ${submitting ? 'disabled' : ''}>← Back</button>
        <button class="bkm-btn bkm-btn-primary bkm-btn-confirm" id="bkmConfirm" ${!paymentConfirmed || submitting ? 'disabled' : ''}>
          ${submitting ? 'Completing...' : 'Complete Booking'}
        </button>
      </div>
    </div>
  `;
}

// Success screen - JTBD: "Give me confidence my booking is secured"
export function renderBookingSuccess(booking = {}) {
  const { product, selectedPackage, selectedDate, selectedTime, 
          customerName, customerPhone, paymentType, jumpLine,
          settings } = bookingState;
  const data = product?.data || {};
  
  // Use API response as backup if state was cleared
  const serviceName = selectedPackage?.name || data.name || booking?.service_name || 'Your Service';
  const bookingDate = selectedDate || booking?.booking_date || '';
  const bookingTime = selectedTime || booking?.booking_time || '';
  const clientName = customerName || booking?.customer_name || '';
  const clientPhone = customerPhone || booking?.customer_phone || '';
  
  // Calculate what was paid/owed
  const basePrice = Number(selectedPackage?.price) || Number(data.price) || Number(booking?.total_amount) || 0;
  const jumpLineFee = jumpLine ? (Number(settings?.jump_line_fee) || 0) : 0;
  const total = basePrice + jumpLineFee;
  const depositPercent = Number(settings?.deposit_percentage) || 20;
  
  let amountPaid = total;
  let amountDue = 0;
  let paymentLabel = 'Paid in Full';
  
  if (paymentType === 'deposit') {
    amountPaid = Math.round(total * depositPercent / 100);
    amountDue = total - amountPaid;
    paymentLabel = 'Deposit Paid';
  } else if (paymentType === 'inquiry') {
    amountPaid = Number(settings?.inquiry_fee) || 0;
    amountDue = total - amountPaid;
    paymentLabel = amountPaid > 0 ? 'Inquiry Fee Paid' : 'Inquiry Sent';
  }
  
  const storePhone = data.store_phone || '';
  
  // Build receipt HTML
  let priorityFeeHtml = '';
  if (jumpLineFee > 0) {
    priorityFeeHtml = '<div class="bkm-receipt-row"><span>⚡ Priority Fee</span><span>KES ' + Number(jumpLineFee).toLocaleString() + '</span></div>';
  }
  
  let amountDueHtml = '';
  if (amountDue > 0) {
    amountDueHtml = '<div class="bkm-receipt-row bkm-receipt-due"><span>Due on Arrival</span><span>KES ' + Number(amountDue).toLocaleString() + '</span></div>';
  }
  
  let balanceNote = '';
  if (amountDue > 0) {
    balanceNote = '<li>💰 Bring the remaining balance to your appointment</li>';
  }
  
  let phoneNote = '';
  if (storePhone) {
    phoneNote = '<li>📞 Questions? Contact: ' + storePhone + '</li>';
  }
  
  return '<div class="bkm-success">' +
    '<div class="bkm-success-header">' +
      '<div class="bkm-success-icon">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">' +
          '<polyline points="20 6 9 17 4 12"></polyline>' +
        '</svg>' +
      '</div>' +
      '<h3 class="bkm-success-title">Booking Confirmed!</h3>' +
      '<p class="bkm-success-subtitle">Your appointment has been scheduled</p>' +
    '</div>' +
    '<div class="bkm-receipt">' +
      '<div class="bkm-receipt-section">' +
        '<span class="bkm-receipt-label">Service</span>' +
        '<span class="bkm-receipt-value">' + serviceName + '</span>' +
      '</div>' +
      '<div class="bkm-receipt-section">' +
        '<span class="bkm-receipt-label">Date & Time</span>' +
        '<span class="bkm-receipt-value">' + formatDate(bookingDate) + '</span>' +
        '<span class="bkm-receipt-value bkm-receipt-time">' + (bookingTime || '') + '</span>' +
      '</div>' +
      '<div class="bkm-receipt-section">' +
        '<span class="bkm-receipt-label">Your Details</span>' +
        '<span class="bkm-receipt-value">' + clientName + '</span>' +
        '<span class="bkm-receipt-value bkm-receipt-phone">' + clientPhone + '</span>' +
      '</div>' +
      '<div class="bkm-receipt-divider"></div>' +
      '<div class="bkm-receipt-section bkm-receipt-payment">' +
        '<div class="bkm-receipt-row"><span>Service Total</span><span>KES ' + Number(basePrice).toLocaleString() + '</span></div>' +
        priorityFeeHtml +
        '<div class="bkm-receipt-row bkm-receipt-total"><span>' + paymentLabel + '</span><span>KES ' + Number(amountPaid).toLocaleString() + '</span></div>' +
        amountDueHtml +
      '</div>' +
    '</div>' +
    '<div class="bkm-next-steps">' +
      '<h4>What\'s Next?</h4>' +
      '<ul>' +
        '<li>📧 You\'ll receive a confirmation message</li>' +
        balanceNote +
        '<li>📍 Arrive 5-10 minutes before your scheduled time</li>' +
        phoneNote +
      '</ul>' +
    '</div>' +
    '<div class="bkm-success-actions">' +
      '<button class="bkm-btn bkm-btn-secondary" id="bkmAddToCalendar">📅 Add to Calendar</button>' +
      '<button class="bkm-btn bkm-btn-primary" id="bkmDone">Done</button>' +
    '</div>' +
  '</div>';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
  });
}
