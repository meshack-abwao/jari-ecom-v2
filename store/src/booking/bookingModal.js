// ===========================================
// BOOKING MODAL RENDER
// Prefix: bkm- (booking modal)
// ===========================================
import { bookingState } from './bookingState.js';

export function renderBookingModal() {
  const { isOpen, step, product, selectedPackage, loading } = bookingState;
  if (!isOpen) return '';
  
  const data = product?.data || {};
  const packages = data.packages || [];
  
  return `
    <div class="bkm-overlay" id="bkmOverlay">
      <div class="bkm-modal">
        <button class="bkm-close" id="bkmClose">✕</button>
        
        <!-- Progress -->
        <div class="bkm-progress">
          ${[1, 2, 3, 4].map(s => `
            <div class="bkm-step ${step >= s ? 'active' : ''}">${s}</div>
            ${s < 4 ? `<div class="bkm-line ${step > s ? 'active' : ''}"></div>` : ''}
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
  const { availableSlots, selectedTime } = bookingState;
  
  if (!availableSlots || availableSlots.length === 0) {
    return '<p class="bkm-no-slots">No available times</p>';
  }
  
  return availableSlots.map(slot => `
    <button class="bkm-slot ${selectedTime === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}"
            data-time="${slot.time}" ${!slot.available ? 'disabled' : ''}>
      ${slot.time}
    </button>
  `).join('');
}

function getMonthYear() {
  const { viewMonth, viewYear } = bookingState;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[viewMonth]} ${viewYear}`;
}


// Step 3: Customer Details
function renderStep3() {
  const { customerName, customerPhone, customerEmail, notes } = bookingState;
  
  return `
    <div class="bkm-step-content">
      <h3 class="bkm-title">Your Details</h3>
      
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

// Step 4: Review & Confirm
function renderStep4() {
  const { product, selectedPackage, selectedDate, selectedTime, customerName, customerPhone, settings } = bookingState;
  const data = product?.data || {};
  
  const price = selectedPackage?.price || data.price || 0;
  const depositEnabled = settings.deposit_enabled;
  const depositPercent = settings.deposit_percentage || 20;
  const depositAmount = depositEnabled ? Math.round(price * depositPercent / 100) : price;
  
  return `
    <div class="bkm-step-content">
      <h3 class="bkm-title">Review & Confirm</h3>
      
      <div class="bkm-review">
        <div class="bkm-review-row">
          <span>Service</span>
          <strong>${selectedPackage?.name || data.name}</strong>
        </div>
        <div class="bkm-review-row">
          <span>Date</span>
          <strong>${formatDate(selectedDate)}</strong>
        </div>
        <div class="bkm-review-row">
          <span>Time</span>
          <strong>${selectedTime}</strong>
        </div>
        <div class="bkm-review-row">
          <span>Name</span>
          <strong>${customerName}</strong>
        </div>
        <div class="bkm-review-row">
          <span>Phone</span>
          <strong>${customerPhone}</strong>
        </div>
      </div>
      
      <div class="bkm-payment">
        <div class="bkm-payment-row total">
          <span>Total</span>
          <span>KES ${parseInt(price).toLocaleString()}</span>
        </div>
        ${depositEnabled ? `
          <div class="bkm-payment-row deposit">
            <span>Deposit (${depositPercent}%)</span>
            <span>KES ${depositAmount.toLocaleString()}</span>
          </div>
          <p class="bkm-deposit-note">Pay remaining KES ${(price - depositAmount).toLocaleString()} on arrival</p>
        ` : ''}
      </div>
      
      <div class="bkm-actions">
        <button class="bkm-btn bkm-btn-secondary" id="bkmBack">← Back</button>
        <button class="bkm-btn bkm-btn-primary bkm-btn-confirm" id="bkmConfirm">Confirm Booking</button>
      </div>
    </div>
  `;
}

// Success screen
export function renderBookingSuccess(booking) {
  return `
    <div class="bkm-success">
      <div class="bkm-success-icon">✓</div>
      <h3>Booking Confirmed!</h3>
      <p>Your appointment has been scheduled.</p>
      <div class="bkm-success-details">
        <p><strong>${booking.package_name || 'Service'}</strong></p>
        <p>${formatDate(booking.booking_date)} at ${booking.booking_time}</p>
      </div>
      <button class="bkm-btn bkm-btn-primary" id="bkmDone">Done</button>
    </div>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
  });
}
