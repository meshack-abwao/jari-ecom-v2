// ===========================================
// BOOKING SYSTEM - Calendar & Checkout Flow
// Completely isolated from other templates
// ===========================================
import { state } from './state.js';

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
            <div class="service-price-section">
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
  
  return `
    <div class="booking-step step-2">
      <h3 class="step-title">Pick a Date & Time</h3>
      
      <!-- Calendar -->
      <div class="calendar-container">
        <div class="calendar-header">
          <button class="calendar-nav-btn" onclick="changeMonth(-1)">‹</button>
          <span class="calendar-month" id="calendarMonth">${getMonthYear()}</span>
          <button class="calendar-nav-btn" onclick="changeMonth(1)">›</button>
        </div>
        <div class="calendar-grid" id="calendarGrid">
          ${renderCalendarMonth()}
        </div>
      </div>
      
      <!-- Time Slots (shown after date selected) -->
      <div class="time-slots-container" id="timeSlotsContainer" style="${booking.selectedDate ? '' : 'display:none'}">
        <h4 class="time-slots-title">Available Times</h4>
        <div class="time-slots" id="timeSlots">
          ${booking.selectedDate ? renderTimeSlots([]) : '<p class="slots-loading">Select a date first</p>'}
        </div>
      </div>
      
      <div class="booking-actions">
        <button class="booking-btn secondary" onclick="bookingPrevStep()">← Back</button>
        <button class="booking-btn primary" onclick="bookingNextStep()" ${!booking.selectedTime ? 'disabled' : ''}>
          Continue <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;
}

// Step 3: Customer Details
function renderBookingStep3(product) {
  const { booking } = state;
  
  return `
    <div class="booking-step step-3">
      <h3 class="step-title">Your Details</h3>
      
      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input type="text" class="form-input" id="customerName" value="${booking.customerName || ''}" placeholder="Enter your name" onchange="updateBookingField('customerName', this.value)">
      </div>
      
      <div class="form-group">
        <label class="form-label">Phone Number *</label>
        <input type="tel" class="form-input" id="customerPhone" value="${booking.customerPhone || ''}" placeholder="07XX XXX XXX" onchange="updateBookingField('customerPhone', this.value)">
      </div>
      
      <div class="form-group">
        <label class="form-label">Email (optional)</label>
        <input type="email" class="form-input" id="customerEmail" value="${booking.customerEmail || ''}" placeholder="your@email.com" onchange="updateBookingField('customerEmail', this.value)">
      </div>
      
      <div class="form-group">
        <label class="form-label">Special Requests (optional)</label>
        <textarea class="form-textarea" id="customerNotes" placeholder="Any special requirements..." onchange="updateBookingField('notes', this.value)">${booking.notes || ''}</textarea>
      </div>
      
      <div class="booking-actions">
        <button class="booking-btn secondary" onclick="bookingPrevStep()">← Back</button>
        <button class="booking-btn primary" onclick="bookingNextStep()" ${!booking.customerName || !booking.customerPhone ? 'disabled' : ''}>
          Continue <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;
}

// Step 4: Review & Confirm
function renderBookingStep4(product) {
  const { booking, store } = state;
  const data = product?.data || {};
  const settings = booking.settings || {};
  
  const selectedPrice = parseInt(booking.selectedPackage?.price || data.price || 0);
  const depositPercent = settings.deposit_percentage || 20;
  const depositEnabled = settings.deposit_enabled;
  const depositAmount = depositEnabled ? Math.round(selectedPrice * depositPercent / 100) : selectedPrice;
  
  return `
    <div class="booking-step step-4">
      <h3 class="step-title">Review & Confirm</h3>
      
      <div class="review-section">
        <div class="review-row">
          <span class="review-label">Service</span>
          <span class="review-value">${booking.selectedPackage?.name || data.name}</span>
        </div>
        <div class="review-row">
          <span class="review-label">Date</span>
          <span class="review-value">${formatBookingDate(booking.selectedDate)}</span>
        </div>
        <div class="review-row">
          <span class="review-label">Time</span>
          <span class="review-value">${booking.selectedTime}</span>
        </div>
        <div class="review-row">
          <span class="review-label">Name</span>
          <span class="review-value">${booking.customerName}</span>
        </div>
        <div class="review-row">
          <span class="review-label">Phone</span>
          <span class="review-value">${booking.customerPhone}</span>
        </div>
        ${booking.notes ? `
          <div class="review-row">
            <span class="review-label">Notes</span>
            <span class="review-value">${booking.notes}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="payment-summary">
        <div class="payment-row total">
          <span>Total</span>
          <span>KES ${selectedPrice.toLocaleString()}</span>
        </div>
        ${depositEnabled ? `
          <div class="payment-row deposit">
            <span>Deposit (${depositPercent}%)</span>
            <span>KES ${depositAmount.toLocaleString()}</span>
          </div>
          <p class="deposit-note">Pay remaining KES ${(selectedPrice - depositAmount).toLocaleString()} on arrival</p>
        ` : ''}
      </div>
      
      <!-- WhatsApp Inquiry Option -->
      ${store?.contact_phone ? `
        <a href="https://wa.me/${store.contact_phone.replace(/\\D/g, '')}?text=${encodeURIComponent(`Hi! I'd like to book:\n\nService: ${booking.selectedPackage?.name || data.name}\nDate: ${formatBookingDate(booking.selectedDate)}\nTime: ${booking.selectedTime}\nName: ${booking.customerName}\nPhone: ${booking.customerPhone}`)}" 
           class="whatsapp-btn" target="_blank">
          💬 Inquire via WhatsApp
        </a>
      ` : ''}
      
      <div class="booking-actions">
        <button class="booking-btn secondary" onclick="bookingPrevStep()">← Back</button>
        <button class="booking-btn primary confirm-btn" id="confirmBookingBtn" onclick="confirmBooking()">
          Confirm Booking <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;
}


// Render success screen
export function renderBookingSuccess(bookingData) {
  return `
    <div class="booking-success">
      <div class="success-icon">✓</div>
      <h2 class="success-title">Booking Confirmed!</h2>
      <p class="success-message">Your appointment has been scheduled. You'll receive a confirmation shortly.</p>
      <div class="success-details">
        <p><strong>${bookingData?.service || 'Service'}</strong></p>
        <p>${formatBookingDate(bookingData?.date)} at ${bookingData?.time}</p>
      </div>
      <button class="booking-btn primary" onclick="closeBookingModal()">Done</button>
    </div>
  `;
}

// Calendar rendering
export function renderCalendarMonth() {
  const { booking } = state;
  const viewMonth = booking.viewMonth || new Date().getMonth();
  const viewYear = booking.viewYear || new Date().getFullYear();
  const workingHours = booking.workingHours || [];
  const blockedDates = booking.blockedDates || [];
  const settings = booking.settings || {};
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  
  // Min/max booking dates
  const minNotice = settings.min_notice_hours || 0;
  const maxAdvance = settings.max_advance_days || 60;
  const minDate = new Date(today.getTime() + minNotice * 60 * 60 * 1000);
  const maxDate = new Date(today.getTime() + maxAdvance * 24 * 60 * 60 * 1000);
  
  let html = '<div class="calendar-weekdays">';
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
    html += `<span class="weekday">${d}</span>`;
  });
  html += '</div><div class="calendar-days">';
  
  // Empty cells for days before month start
  for (let i = 0; i < firstDay; i++) {
    html += '<span class="calendar-day empty"></span>';
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear, viewMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Check if day is available
    const workingDay = workingHours.find(w => w.day_of_week === dayOfWeek);
    const isWorkingDay = workingDay?.is_open !== false;
    const isBlocked = blockedDates.some(b => b.blocked_date?.split('T')[0] === dateStr);
    const isPast = date < minDate;
    const isTooFar = date > maxDate;
    const isSelected = dateStr === booking.selectedDate;
    
    const available = isWorkingDay && !isBlocked && !isPast && !isTooFar;
    
    let classes = 'calendar-day';
    if (!available) classes += ' disabled';
    if (isSelected) classes += ' selected';
    if (date.toDateString() === today.toDateString()) classes += ' today';
    
    html += `<span class="${classes}" data-date="${dateStr}" ${available ? `onclick="selectDate('${dateStr}')"` : ''}>${day}</span>`;
  }
  
  html += '</div>';
  return html;
}

// Time slots rendering
export function renderTimeSlots(slots) {
  const { booking } = state;
  
  if (!slots || slots.length === 0) {
    return '<p class="no-slots">No available times for this date</p>';
  }
  
  return slots.map(slot => `
    <button class="time-slot ${booking.selectedTime === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}" 
            data-time="${slot.time}"
            ${slot.available ? `onclick="selectTime('${slot.time}')"` : 'disabled'}>
      ${slot.time}
      ${!slot.available ? '<span class="slot-full">Full</span>' : ''}
    </button>
  `).join('');
}

// Helper: Get current month/year string
function getMonthYear() {
  const { booking } = state;
  const viewMonth = booking.viewMonth ?? new Date().getMonth();
  const viewYear = booking.viewYear ?? new Date().getFullYear();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[viewMonth]} ${viewYear}`;
}

// Helper: Format booking date
function formatBookingDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
