// ===========================================
// BOOKING MODAL - Trust-Building Checkout Flow
// Applies JTBD/ODI + Typography Psychology
// Prefix: bkm- (booking modal)
// ===========================================

/**
 * DESIGN PRINCIPLES (from "Why Fonts Matter" + JTBD):
 * 
 * 1. PROCESSING FLUENCY - Familiar layouts = trust = purchase
 * 2. ROUNDED SHAPES - Pill buttons don't trigger amygdala threat response
 * 3. PROGRESSIVE DISCLOSURE - Show 3 steps visually, reduce cognitive load
 * 4. TRUST CUES - Security badges, progress, reassurance text at each step
 * 5. JTBD JOURNEY - Define → Confirm → Execute → Monitor
 */

import { state } from '../state.js';

// Modal state
let currentStep = 1;
let bookingData = {
  package: null,
  date: null,
  time: null,
  name: '',
  phone: '',
  email: '',
  notes: ''
};

// Step definitions with JTBD mapping
const STEPS = [
  { id: 1, name: 'Select', icon: '📅', job: 'DEFINE - Choose date & time' },
  { id: 2, name: 'Details', icon: '👤', job: 'PREPARE - Provide your info' },
  { id: 3, name: 'Confirm', icon: '✓', job: 'EXECUTE - Complete booking' }
];

/**
 * Initialize booking modal
 */
export function initBookingModal() {
  // Listen for open event from PBK template
  window.addEventListener('pbk:openBooking', (e) => {
    const { product, selectedPackage } = e.detail;
    openModal(product, selectedPackage);
  });
  
  // Create modal container if not exists
  if (!document.getElementById('bkmModal')) {
    createModalStructure();
  }
}

/**
 * Create the modal HTML structure
 */
function createModalStructure() {
  const modal = document.createElement('div');
  modal.id = 'bkmModal';
  modal.className = 'bkm-overlay';
  modal.innerHTML = `
    <div class="bkm-container">
      <!-- Header with progress -->
      <div class="bkm-header">
        <button class="bkm-close" id="bkmClose" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="bkm-progress" id="bkmProgress"></div>
      </div>
      
      <!-- Step content area -->
      <div class="bkm-content" id="bkmContent"></div>
      
      <!-- Footer with trust badges + CTA -->
      <div class="bkm-footer" id="bkmFooter"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('bkmClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/**
 * Open the booking modal
 */
function openModal(product, selectedPackage) {
  currentStep = 1;
  bookingData = {
    package: selectedPackage || { name: product?.name, price: product?.price },
    date: null,
    time: null,
    name: '',
    phone: '',
    email: '',
    notes: ''
  };
  
  const modal = document.getElementById('bkmModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderStep(currentStep);
  }
}

/**
 * Close the modal
 */
function closeModal() {
  const modal = document.getElementById('bkmModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Render progress indicator
 */
function renderProgress() {
  const container = document.getElementById('bkmProgress');
  if (!container) return;
  
  container.innerHTML = `
    <div class="bkm-steps">
      ${STEPS.map((step, idx) => `
        <div class="bkm-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}">
          <div class="bkm-step-circle">
            ${currentStep > step.id ? '✓' : step.id}
          </div>
          <span class="bkm-step-label">${step.name}</span>
        </div>
        ${idx < STEPS.length - 1 ? '<div class="bkm-step-line"></div>' : ''}
      `).join('')}
    </div>
  `;
}

/**
 * Render current step content
 */
function renderStep(step) {
  renderProgress();
  
  switch(step) {
    case 1:
      renderStep1_DateTime();
      break;
    case 2:
      renderStep2_Details();
      break;
    case 3:
      renderStep3_Confirm();
      break;
  }
}

/**
 * STEP 1: Date & Time Selection
 * JTBD: DEFINE - Help customer choose when
 */
function renderStep1_DateTime() {
  const content = document.getElementById('bkmContent');
  const footer = document.getElementById('bkmFooter');
  
  // Generate next 14 days
  const dates = generateDates(14);
  const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  
  content.innerHTML = `
    <div class="bkm-step-content">
      <div class="bkm-step-header">
        <span class="bkm-step-icon">📅</span>
        <h2 class="bkm-step-title">When works for you?</h2>
        <p class="bkm-step-subtitle">Select your preferred date and time</p>
      </div>
      
      <!-- Package summary card -->
      <div class="bkm-package-card">
        <div class="bkm-package-name">${bookingData.package?.name || 'Service'}</div>
        <div class="bkm-package-price">KES ${(bookingData.package?.price || 0).toLocaleString()}</div>
      </div>
      
      <!-- Date picker -->
      <div class="bkm-section">
        <label class="bkm-label">Select Date</label>
        <div class="bkm-date-grid" id="bkmDates">
          ${dates.map(d => `
            <button class="bkm-date-btn ${bookingData.date === d.value ? 'selected' : ''}" 
                    data-date="${d.value}">
              <span class="bkm-date-day">${d.day}</span>
              <span class="bkm-date-num">${d.num}</span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <!-- Time picker -->
      <div class="bkm-section">
        <label class="bkm-label">Select Time</label>
        <div class="bkm-time-grid" id="bkmTimes">
          ${times.map(t => `
            <button class="bkm-time-btn ${bookingData.time === t ? 'selected' : ''}" 
                    data-time="${t}">
              ${t}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  footer.innerHTML = `
    <div class="bkm-trust-row">
      <span class="bkm-trust-badge">🔒 Secure</span>
      <span class="bkm-trust-badge">📱 Instant confirmation</span>
    </div>
    <button class="bkm-btn-primary" id="bkmNext1" disabled>
      Continue
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9,18 15,12 9,6"></polyline>
      </svg>
    </button>
  `;
  
  // Event listeners
  document.querySelectorAll('.bkm-date-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.bkm-date-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      bookingData.date = btn.dataset.date;
      updateStep1Button();
    });
  });
  
  document.querySelectorAll('.bkm-time-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.bkm-time-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      bookingData.time = btn.dataset.time;
      updateStep1Button();
    });
  });
  
  document.getElementById('bkmNext1')?.addEventListener('click', () => {
    if (bookingData.date && bookingData.time) {
      currentStep = 2;
      renderStep(currentStep);
    }
  });
}

function updateStep1Button() {
  const btn = document.getElementById('bkmNext1');
  if (btn) {
    btn.disabled = !(bookingData.date && bookingData.time);
  }
}

/**
 * STEP 2: Customer Details
 * JTBD: PREPARE - Gather info needed for booking
 */
function renderStep2_Details() {
  const content = document.getElementById('bkmContent');
  const footer = document.getElementById('bkmFooter');
  
  content.innerHTML = `
    <div class="bkm-step-content">
      <div class="bkm-step-header">
        <span class="bkm-step-icon">👤</span>
        <h2 class="bkm-step-title">Your Details</h2>
        <p class="bkm-step-subtitle">We'll send your confirmation here</p>
      </div>
      
      <!-- Booking summary -->
      <div class="bkm-summary-card">
        <div class="bkm-summary-row">
          <span>📅</span>
          <span>${formatDate(bookingData.date)}</span>
        </div>
        <div class="bkm-summary-row">
          <span>🕐</span>
          <span>${bookingData.time}</span>
        </div>
        <div class="bkm-summary-row">
          <span>📦</span>
          <span>${bookingData.package?.name}</span>
        </div>
      </div>
      
      <!-- Form fields -->
      <div class="bkm-form">
        <div class="bkm-field">
          <label class="bkm-label">Your Name *</label>
          <input type="text" class="bkm-input" id="bkmName" 
                 placeholder="Enter your full name" 
                 value="${bookingData.name}">
        </div>
        
        <div class="bkm-field">
          <label class="bkm-label">Phone Number *</label>
          <input type="tel" class="bkm-input" id="bkmPhone" 
                 placeholder="07XX XXX XXX" 
                 value="${bookingData.phone}">
          <span class="bkm-field-hint">For booking confirmation via SMS</span>
        </div>
        
        <div class="bkm-field">
          <label class="bkm-label">Email (Optional)</label>
          <input type="email" class="bkm-input" id="bkmEmail" 
                 placeholder="your@email.com" 
                 value="${bookingData.email}">
        </div>
        
        <div class="bkm-field">
          <label class="bkm-label">Special Requests</label>
          <textarea class="bkm-textarea" id="bkmNotes" 
                    placeholder="Any special requests or notes..."
                    rows="3">${bookingData.notes}</textarea>
        </div>
      </div>
    </div>
  `;
  
  footer.innerHTML = `
    <div class="bkm-footer-row">
      <button class="bkm-btn-back" id="bkmBack2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
        Back
      </button>
      <button class="bkm-btn-primary" id="bkmNext2" disabled>
        Review Booking
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    </div>
  `;
  
  // Event listeners
  const nameInput = document.getElementById('bkmName');
  const phoneInput = document.getElementById('bkmPhone');
  const emailInput = document.getElementById('bkmEmail');
  const notesInput = document.getElementById('bkmNotes');
  
  [nameInput, phoneInput].forEach(input => {
    input?.addEventListener('input', () => {
      bookingData.name = nameInput.value;
      bookingData.phone = phoneInput.value;
      bookingData.email = emailInput?.value || '';
      bookingData.notes = notesInput?.value || '';
      updateStep2Button();
    });
  });
  
  document.getElementById('bkmBack2')?.addEventListener('click', () => {
    currentStep = 1;
    renderStep(currentStep);
  });
  
  document.getElementById('bkmNext2')?.addEventListener('click', () => {
    bookingData.name = nameInput.value;
    bookingData.phone = phoneInput.value;
    bookingData.email = emailInput?.value || '';
    bookingData.notes = notesInput?.value || '';
    currentStep = 3;
    renderStep(currentStep);
  });
}

function updateStep2Button() {
  const btn = document.getElementById('bkmNext2');
  const name = document.getElementById('bkmName')?.value?.trim();
  const phone = document.getElementById('bkmPhone')?.value?.trim();
  if (btn) {
    btn.disabled = !(name && phone && phone.length >= 10);
  }
}

/**
 * STEP 3: Confirmation
 * JTBD: EXECUTE - Final review and confirm
 */
function renderStep3_Confirm() {
  const content = document.getElementById('bkmContent');
  const footer = document.getElementById('bkmFooter');
  
  content.innerHTML = `
    <div class="bkm-step-content">
      <div class="bkm-step-header">
        <span class="bkm-step-icon">✓</span>
        <h2 class="bkm-step-title">Review & Confirm</h2>
        <p class="bkm-step-subtitle">Please verify your booking details</p>
      </div>
      
      <!-- Full booking summary -->
      <div class="bkm-confirm-card">
        <div class="bkm-confirm-section">
          <h4 class="bkm-confirm-heading">Booking Details</h4>
          <div class="bkm-confirm-row">
            <span class="bkm-confirm-label">Service</span>
            <span class="bkm-confirm-value">${bookingData.package?.name}</span>
          </div>
          <div class="bkm-confirm-row">
            <span class="bkm-confirm-label">Date</span>
            <span class="bkm-confirm-value">${formatDate(bookingData.date)}</span>
          </div>
          <div class="bkm-confirm-row">
            <span class="bkm-confirm-label">Time</span>
            <span class="bkm-confirm-value">${bookingData.time}</span>
          </div>
        </div>
        
        <div class="bkm-confirm-divider"></div>
        
        <div class="bkm-confirm-section">
          <h4 class="bkm-confirm-heading">Your Information</h4>
          <div class="bkm-confirm-row">
            <span class="bkm-confirm-label">Name</span>
            <span class="bkm-confirm-value">${bookingData.name}</span>
          </div>
          <div class="bkm-confirm-row">
            <span class="bkm-confirm-label">Phone</span>
            <span class="bkm-confirm-value">${bookingData.phone}</span>
          </div>
          ${bookingData.email ? `
          <div class="bkm-confirm-row">
            <span class="bkm-confirm-label">Email</span>
            <span class="bkm-confirm-value">${bookingData.email}</span>
          </div>
          ` : ''}
          ${bookingData.notes ? `
          <div class="bkm-confirm-row">
            <span class="bkm-confirm-label">Notes</span>
            <span class="bkm-confirm-value">${bookingData.notes}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="bkm-confirm-divider"></div>
        
        <div class="bkm-confirm-total">
          <span>Total</span>
          <span class="bkm-confirm-price">KES ${(bookingData.package?.price || 0).toLocaleString()}</span>
        </div>
      </div>
      
      <!-- Trust reassurance -->
      <div class="bkm-reassurance">
        <div class="bkm-reassurance-item">
          <span>✓</span>
          <span>Free cancellation up to 24 hours before</span>
        </div>
        <div class="bkm-reassurance-item">
          <span>✓</span>
          <span>Instant SMS confirmation</span>
        </div>
        <div class="bkm-reassurance-item">
          <span>✓</span>
          <span>Secure M-Pesa payment</span>
        </div>
      </div>
    </div>
  `;
  
  footer.innerHTML = `
    <div class="bkm-footer-row">
      <button class="bkm-btn-back" id="bkmBack3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
        Back
      </button>
      <button class="bkm-btn-confirm" id="bkmConfirm">
        Confirm Booking
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      </button>
    </div>
  `;
  
  document.getElementById('bkmBack3')?.addEventListener('click', () => {
    currentStep = 2;
    renderStep(currentStep);
  });
  
  document.getElementById('bkmConfirm')?.addEventListener('click', submitBooking);
}

/**
 * Submit the booking
 */
async function submitBooking() {
  const btn = document.getElementById('bkmConfirm');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <span class="bkm-spinner"></span>
      Processing...
    `;
  }
  
  try {
    // TODO: Integrate with API
    console.log('[BKM] Submitting booking:', bookingData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success
    showSuccess();
    
  } catch (error) {
    console.error('[BKM] Booking failed:', error);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        Confirm Booking
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      `;
    }
    alert('Booking failed. Please try again.');
  }
}

/**
 * Show success state
 */
function showSuccess() {
  const content = document.getElementById('bkmContent');
  const footer = document.getElementById('bkmFooter');
  const progress = document.getElementById('bkmProgress');
  
  if (progress) progress.innerHTML = '';
  
  content.innerHTML = `
    <div class="bkm-success">
      <div class="bkm-success-icon">✓</div>
      <h2 class="bkm-success-title">Booking Confirmed!</h2>
      <p class="bkm-success-text">
        Your booking for <strong>${bookingData.package?.name}</strong> on 
        <strong>${formatDate(bookingData.date)}</strong> at <strong>${bookingData.time}</strong> 
        has been confirmed.
      </p>
      <p class="bkm-success-note">
        A confirmation SMS will be sent to <strong>${bookingData.phone}</strong>
      </p>
    </div>
  `;
  
  footer.innerHTML = `
    <button class="bkm-btn-primary" id="bkmDone">
      Done
    </button>
  `;
  
  document.getElementById('bkmDone')?.addEventListener('click', closeModal);
}

// ===========================================
// HELPERS
// ===========================================

function generateDates(days) {
  const dates = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      value: d.toISOString().split('T')[0],
      day: dayNames[d.getDay()],
      num: d.getDate()
    });
  }
  
  return dates;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
}

// Export for global access
window.initBookingModal = initBookingModal;
