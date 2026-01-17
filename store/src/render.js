

// ===========================================
// BOOKING SYSTEM - Calendar & Checkout Flow
// ===========================================

// Render the booking modal with multi-step flow
export function renderBookingModal(product) {
  const data = product?.data || {};
  const packages = data.packages || [];
  const { booking } = state;
  
  return `
    <div class="booking-modal-overlay" id="bookingModal">
      <div class="booking-modal">
        <button class="booking-close" onclick="closeBookingModal()">✕</button>
        
        <!-- Progress Steps -->
        <div class="booking-progress">
          <div class="progress-step ${booking.step >= 1 ? 'active' : ''}" data-step="1">
            <span class="step-number">1</span>
            <span class="step-label">Service</span>
          </div>
          <div class="progress-line ${booking.step >= 2 ? 'active' : ''}"></div>
          <div class="progress-step ${booking.step >= 2 ? 'active' : ''}" data-step="2">
            <span class="step-number">2</span>
            <span class="step-label">Date & Time</span>
          </div>
          <div class="progress-line ${booking.step >= 3 ? 'active' : ''}"></div>
          <div class="progress-step ${booking.step >= 3 ? 'active' : ''}" data-step="3">
            <span class="step-number">3</span>
            <span class="step-label">Details</span>
          </div>
          <div class="progress-line ${booking.step >= 4 ? 'active' : ''}"></div>
          <div class="progress-step ${booking.step >= 4 ? 'active' : ''}" data-step="4">
            <span class="step-number">4</span>
            <span class="step-label">Confirm</span>
          </div>
        </div>
        
        <!-- Step Content Container -->
        <div class="booking-content" id="bookingContent">
          ${renderBookingStep(booking.step, product)}
        </div>
      </div>
    </div>
  `;
}

// Render individual booking step
export function renderBookingStep(step, product) {
  switch(step) {
    case 1: return renderBookingStep1(product);
    case 2: return renderBookingStep2();
    case 3: return renderBookingStep3(product);
    case 4: return renderBookingStep4(product);
    default: return renderBookingStep1(product);
  }
}

// Step 1: Select Service/Package
function renderBookingStep1(product) {
  const data = product?.data || {};
  const packages = data.packages || [];
  const { booking } = state;
  
  // If no packages, use base price
  if (packages.length === 0) {
    return `
      <div class="booking-step step-1">
        <h3 class="step-title">Select Service</h3>
        <div class="service-card selected" data-price="${data.price || 0}" data-name="${data.name || 'Service'}">
          <div class="service-info">
            <span class="service-name">${data.name || 'Service'}</span>
            <span class="service-price">KES ${parseInt(data.price || 0).toLocaleString()}</span>
          </div>
          <div class="service-check">✓</div>
        </div>
        <div class="booking-actions">
          <button class="booking-btn primary" onclick="bookingNextStep()">
            Continue <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="booking-step step-1">
      <h3 class="step-title">Select a Package</h3>
      <div class="packages-list">
        ${packages.map((pkg, i) => `
          <div class="service-card ${booking.selectedPackage?.name === pkg.name ? 'selected' : ''}" 
               data-price="${pkg.price}" 
               data-name="${pkg.name}"
               data-duration="${pkg.duration || ''}"
               onclick="selectPackage(this)">
            <div class="service-info">
              <span class="service-name">${pkg.name}</span>
              ${pkg.duration ? `<span class="service-duration">⏱️ ${pkg.duration}</span>` : ''}
              ${pkg.description ? `<p class="service-desc">${pkg.description}</p>` : ''}
            </div>
            <div class="service-price-col">
              <span class="service-price">KES ${parseInt(pkg.price || 0).toLocaleString()}</span>
              <div class="service-check">✓</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="booking-actions">
        <button class="booking-btn primary" onclick="bookingNextStep()" ${!booking.selectedPackage ? 'disabled' : ''}>
          Continue <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;
}

// Step 2: Select Date & Time
function renderBookingStep2() {
  const { booking } = state;
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  return `
    <div class="booking-step step-2">
      <h3 class="step-title">Pick a Date & Time</h3>
      
      <!-- Calendar -->
      <div class="booking-calendar" id="bookingCalendar" data-month="${currentMonth}" data-year="${currentYear}">
        ${renderCalendarMonth(currentYear, currentMonth)}
      </div>
      
      <!-- Time Slots (shown after date selection) -->
      <div class="time-slots-container" id="timeSlotsContainer" style="${booking.selectedDate ? '' : 'display:none'}">
        <h4 class="slots-title">Available Times</h4>
        <div class="time-slots" id="timeSlots">
          <div class="slots-loading">Loading available times...</div>
        </div>
      </div>
      
      <div class="booking-actions">
        <button class="booking-btn secondary" onclick="bookingPrevStep()">
          <span class="btn-arrow">←</span> Back
        </button>
        <button class="booking-btn primary" onclick="bookingNextStep()" ${!booking.selectedDate || !booking.selectedTime ? 'disabled' : ''}>
          Continue <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;
}

// Render calendar month
export function renderCalendarMonth(year, month) {
  const { booking } = state;
  const blockedDates = booking.blockedDates || [];
  const workingHours = booking.workingHours || [];
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get settings for advance booking
  const settings = booking.settings || {};
  const minNoticeHours = settings.min_notice_hours || 24;
  const maxAdvanceDays = settings.max_advance_days || 30;
  
  const minDate = new Date(today);
  minDate.setHours(minDate.getHours() + minNoticeHours);
  
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
  
  // Build days array
  let days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push('<span class="calendar-day empty"></span>');
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Check if day is working day
    const dayHours = workingHours.find(h => h.day_of_week === dayOfWeek);
    const isWorkingDay = dayHours?.is_working !== false;
    
    // Check if date is blocked
    const isBlocked = blockedDates.some(b => b.date === dateStr);
    
    // Check if date is in valid range
    const isPast = date < minDate;
    const isTooFar = date > maxDate;
    
    // Check if selected
    const isSelected = booking.selectedDate === dateStr;
    const isToday = date.toDateString() === today.toDateString();
    
    let classes = ['calendar-day'];
    if (isPast || isTooFar || !isWorkingDay || isBlocked) classes.push('disabled');
    if (isSelected) classes.push('selected');
    if (isToday) classes.push('today');
    
    const clickable = !isPast && !isTooFar && isWorkingDay && !isBlocked;
    
    days.push(`
      <span class="${classes.join(' ')}" 
            data-date="${dateStr}"
            ${clickable ? `onclick="selectDate('${dateStr}')"` : ''}>
        ${day}
      </span>
    `);
  }
  
  return `
    <div class="calendar-header">
      <button class="calendar-nav" onclick="changeMonth(-1)">‹</button>
      <span class="calendar-title">${monthNames[month]} ${year}</span>
      <button class="calendar-nav" onclick="changeMonth(1)">›</button>
    </div>
    <div class="calendar-weekdays">
      ${dayNames.map(d => `<span>${d}</span>`).join('')}
    </div>
    <div class="calendar-days">
      ${days.join('')}
    </div>
  `;
}

// Render time slots
export function renderTimeSlots(slots) {
  const { booking } = state;
  
  if (!slots || slots.length === 0) {
    return `<div class="no-slots">No available times for this date</div>`;
  }
  
  return slots.map(slot => {
    const isSelected = booking.selectedTime === slot.time;
    const isAvailable = slot.available;
    
    return `
      <button class="time-slot ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}"
              data-time="${slot.time}"
              ${isAvailable ? `onclick="selectTime('${slot.time}')"` : ''}>
        ${slot.time}
        ${!isAvailable ? '<span class="slot-full">Full</span>' : ''}
      </button>
    `;
  }).join('');
}

// Step 3: Customer Details
function renderBookingStep3(product) {
  const { booking, store } = state;
  const settings = booking.settings || {};
  
  return `
    <div class="booking-step step-3">
      <h3 class="step-title">Your Details</h3>
      
      <div class="booking-form">
        <div class="form-group">
          <label for="customerName">Full Name *</label>
          <input type="text" id="customerName" placeholder="John Doe" 
                 value="${booking.customerName || ''}"
                 onchange="updateBookingField('customerName', this.value)">
        </div>
        
        <div class="form-group">
          <label for="customerPhone">Phone Number *</label>
          <input type="tel" id="customerPhone" placeholder="0712 345 678"
                 value="${booking.customerPhone || ''}"
                 onchange="updateBookingField('customerPhone', this.value)">
        </div>
        
        <div class="form-group">
          <label for="customerEmail">Email (optional)</label>
          <input type="email" id="customerEmail" placeholder="john@example.com"
                 value="${booking.customerEmail || ''}"
                 onchange="updateBookingField('customerEmail', this.value)">
        </div>
        
        <div class="form-group">
          <label for="bookingNotes">Additional Notes</label>
          <textarea id="bookingNotes" rows="3" placeholder="Any special requests..."
                    onchange="updateBookingField('notes', this.value)">${booking.notes || ''}</textarea>
        </div>
      </div>
      
      <div class="booking-actions">
        <button class="booking-btn secondary" onclick="bookingPrevStep()">
          <span class="btn-arrow">←</span> Back
        </button>
        <button class="booking-btn primary" onclick="bookingNextStep()" 
                ${!booking.customerName || !booking.customerPhone ? 'disabled' : ''}>
          Review Booking <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;
}

// Step 4: Review & Confirm
function renderBookingStep4(product) {
  const { booking, store } = state;
  const settings = booking.settings || {};
  const data = product?.data || {};
  
  const selectedPackage = booking.selectedPackage || { name: data.name, price: data.price };
  const price = parseInt(selectedPackage.price || 0);
  
  // Calculate deposit if enabled
  const depositEnabled = settings.deposit_enabled;
  const depositPercentage = settings.deposit_percentage || 20;
  const depositAmount = depositEnabled ? Math.round(price * depositPercentage / 100) : 0;
  
  // Jump the line fee
  const jumpLineEnabled = settings.jump_line_enabled;
  const jumpLineFee = settings.jump_line_fee || 0;
  
  // Format date nicely
  const dateObj = new Date(booking.selectedDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  return `
    <div class="booking-step step-4">
      <h3 class="step-title">Review Your Booking</h3>
      
      <div class="booking-summary">
        <div class="summary-section">
          <h4>📦 Service</h4>
          <p class="summary-value">${selectedPackage.name}</p>
          <p class="summary-price">KES ${price.toLocaleString()}</p>
        </div>
        
        <div class="summary-section">
          <h4>📅 Date & Time</h4>
          <p class="summary-value">${formattedDate}</p>
          <p class="summary-value">${booking.selectedTime}</p>
        </div>
        
        <div class="summary-section">
          <h4>👤 Your Details</h4>
          <p class="summary-value">${booking.customerName}</p>
          <p class="summary-value">${booking.customerPhone}</p>
          ${booking.customerEmail ? `<p class="summary-value">${booking.customerEmail}</p>` : ''}
          ${booking.notes ? `<p class="summary-notes">"${booking.notes}"</p>` : ''}
        </div>
        
        ${depositEnabled ? `
          <div class="summary-section payment-section">
            <h4>💰 Payment</h4>
            <div class="payment-row">
              <span>Service Total</span>
              <span>KES ${price.toLocaleString()}</span>
            </div>
            <div class="payment-row deposit">
              <span>Deposit Required (${depositPercentage}%)</span>
              <span class="deposit-amount">KES ${depositAmount.toLocaleString()}</span>
            </div>
            <div class="payment-row balance">
              <span>Balance (pay on day)</span>
              <span>KES ${(price - depositAmount).toLocaleString()}</span>
            </div>
          </div>
        ` : ''}
        
        ${jumpLineEnabled && jumpLineFee > 0 ? `
          <div class="jump-line-option">
            <label class="jump-line-checkbox">
              <input type="checkbox" id="jumpLineCheck" onchange="toggleJumpLine(this.checked)">
              <span class="checkmark"></span>
              <span class="jump-label">
                ⚡ Jump the Line (+KES ${jumpLineFee.toLocaleString()})
                <small>Skip the wait and get priority booking</small>
              </span>
            </label>
          </div>
        ` : ''}
      </div>
      
      <div class="booking-actions">
        <button class="booking-btn secondary" onclick="bookingPrevStep()">
          <span class="btn-arrow">←</span> Back
        </button>
        <button class="booking-btn primary confirm" onclick="confirmBooking()">
          ${depositEnabled ? `Pay Deposit KES ${depositAmount.toLocaleString()}` : 'Confirm Booking'} <span class="btn-arrow">→</span>
        </button>
      </div>
      
      <p class="booking-note">
        ${store?.contact_phone ? `Questions? Call us at ${store.contact_phone}` : ''}
      </p>
    </div>
  `;
}

// Booking Success Screen
export function renderBookingSuccess(bookingRef) {
  const { booking, store } = state;
  
  return `
    <div class="booking-step booking-success">
      <div class="success-icon">✅</div>
      <h3>Booking Confirmed!</h3>
      <p class="booking-ref">Reference: <strong>${bookingRef}</strong></p>
      
      <div class="success-details">
        <p>📅 ${booking.selectedDate} at ${booking.selectedTime}</p>
        <p>📦 ${booking.selectedPackage?.name || 'Service'}</p>
      </div>
      
      <p class="success-note">
        We've sent a confirmation to ${booking.customerPhone}. 
        You'll receive a reminder before your appointment.
      </p>
      
      ${store?.contact_phone ? `
        <a href="https://wa.me/${store.contact_phone.replace(/\D/g, '')}?text=Hi! I just booked (Ref: ${bookingRef})" 
           class="whatsapp-btn" target="_blank">
          💬 Message Us on WhatsApp
        </a>
      ` : ''}
      
      <button class="booking-btn secondary" onclick="closeBookingModal()">
        Done
      </button>
    </div>
  `;
}
