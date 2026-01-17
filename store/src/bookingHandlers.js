// Booking event handlers for storefront
import { state, setState } from './state.js';
import { bookingApi } from './bookingApi.js';
import { renderBookingStep, renderCalendarMonth, renderTimeSlots, renderBookingSuccess } from './render.js';

// Initialize booking data when opening modal
export async function initBooking(storeSlug, productId) {
  try {
    // Load booking settings and data
    const [settingsRes, hoursRes, blockedRes] = await Promise.all([
      bookingApi.getSettings(storeSlug),
      bookingApi.getWorkingHours(storeSlug),
      bookingApi.getBlockedDates(storeSlug)
    ]);
    
    // Update state
    state.booking = {
      ...state.booking,
      settings: settingsRes.data || {},
      workingHours: hoursRes.data || [],
      blockedDates: blockedRes.data || [],
      step: 1,
      selectedDate: null,
      selectedTime: null,
      selectedPackage: null,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      notes: ''
    };
    
    return true;
  } catch (error) {
    console.error('Failed to init booking:', error);
    return false;
  }
}

// Open booking modal
window.openBookingModal = async function() {
  const { store, currentProduct } = state;
  if (!store || !currentProduct) return;
  
  // Show modal first with loading
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Initialize booking data (use store slug for public API)
  await initBooking(store.slug, currentProduct.id);
  
  // Re-render step content
  const content = document.getElementById('bookingContent');
  if (content) {
    content.innerHTML = renderBookingStep(state.booking.step, currentProduct);
  }
  
  updateProgressSteps();
};

// Close booking modal
window.closeBookingModal = function() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Reset booking state
  state.booking.step = 1;
};

// Navigate to next step
window.bookingNextStep = function() {
  const { booking, currentProduct } = state;
  
  // Validation per step
  if (booking.step === 1 && !booking.selectedPackage) {
    alert('Please select a package');
    return;
  }
  if (booking.step === 2 && (!booking.selectedDate || !booking.selectedTime)) {
    alert('Please select a date and time');
    return;
  }
  if (booking.step === 3 && (!booking.customerName || !booking.customerPhone)) {
    alert('Please fill in your name and phone number');
    return;
  }
  
  if (booking.step < 4) {
    state.booking.step++;
    renderCurrentStep();
  }
};

// Navigate to previous step
window.bookingPrevStep = function() {
  if (state.booking.step > 1) {
    state.booking.step--;
    renderCurrentStep();
  }
};

// Render current step
function renderCurrentStep() {
  const content = document.getElementById('bookingContent');
  if (content) {
    content.innerHTML = renderBookingStep(state.booking.step, state.currentProduct);
  }
  updateProgressSteps();
}

// Update progress indicator
function updateProgressSteps() {
  const steps = document.querySelectorAll('.progress-step');
  const lines = document.querySelectorAll('.progress-line');
  
  steps.forEach((step, i) => {
    const stepNum = i + 1;
    step.classList.toggle('active', stepNum <= state.booking.step);
    step.classList.toggle('completed', stepNum < state.booking.step);
  });
  
  lines.forEach((line, i) => {
    line.classList.toggle('active', i + 1 < state.booking.step);
  });
}

// Select package (Step 1)
window.selectPackage = function(el) {
  const name = el.dataset.name;
  const price = el.dataset.price;
  const duration = el.dataset.duration;
  
  state.booking.selectedPackage = { name, price, duration };
  
  // Update UI
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.toggle('selected', card === el);
  });
  
  // Enable continue button
  const continueBtn = document.querySelector('.booking-actions .primary');
  if (continueBtn) continueBtn.disabled = false;
};

// Select package from product page AND open booking modal
window.selectPackageAndBook = async function(el) {
  const name = el.dataset.name;
  const price = el.dataset.price;
  const duration = el.dataset.duration;
  
  // Pre-select this package
  state.booking.selectedPackage = { name, price, duration };
  
  // Open booking modal (which will start at Step 1 but with package pre-selected)
  window.openBookingModal();
};

// Select date (Step 2)
window.selectDate = async function(dateStr) {
  state.booking.selectedDate = dateStr;
  state.booking.selectedTime = null; // Reset time
  
  // Update calendar UI
  document.querySelectorAll('.calendar-day').forEach(day => {
    day.classList.toggle('selected', day.dataset.date === dateStr);
  });
  
  // Show time slots container
  const container = document.getElementById('timeSlotsContainer');
  const slotsEl = document.getElementById('timeSlots');
  if (container) container.style.display = 'block';
  if (slotsEl) slotsEl.innerHTML = '<div class="slots-loading">Loading...</div>';
  
  // Fetch available slots
  try {
    const { store, currentProduct } = state;
    const res = await bookingApi.getAvailability(store.slug, dateStr, currentProduct?.id);
    // API returns { available: bool, slots: [], settings: {} }
    const slots = res.slots || [];
    
    if (slotsEl) {
      slotsEl.innerHTML = renderTimeSlots(slots);
    }
  } catch (error) {
    console.error('Failed to fetch slots:', error);
    if (slotsEl) {
      slotsEl.innerHTML = '<div class="slots-error">Failed to load times. Please try again.</div>';
    }
  }
  
  // Disable continue until time selected
  const continueBtn = document.querySelector('.booking-actions .primary');
  if (continueBtn) continueBtn.disabled = true;
};

// Select time (Step 2)
window.selectTime = function(time) {
  state.booking.selectedTime = time;
  
  // Update UI
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.classList.toggle('selected', slot.dataset.time === time);
  });
  
  // Enable continue button
  const continueBtn = document.querySelector('.booking-actions .primary');
  if (continueBtn) continueBtn.disabled = false;
};

// Change calendar month
window.changeMonth = function(delta) {
  const calendar = document.getElementById('bookingCalendar');
  if (!calendar) return;
  
  let month = parseInt(calendar.dataset.month);
  let year = parseInt(calendar.dataset.year);
  
  month += delta;
  if (month < 0) {
    month = 11;
    year--;
  } else if (month > 11) {
    month = 0;
    year++;
  }
  
  // Don't allow past months
  const today = new Date();
  if (year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth())) {
    return;
  }
  
  calendar.dataset.month = month;
  calendar.dataset.year = year;
  calendar.innerHTML = renderCalendarMonth(year, month);
};

// Update booking form fields (Step 3)
window.updateBookingField = function(field, value) {
  state.booking[field] = value;
  
  // Check if we can enable continue
  const { customerName, customerPhone } = state.booking;
  const continueBtn = document.querySelector('.booking-actions .primary');
  if (continueBtn) {
    continueBtn.disabled = !customerName || !customerPhone;
  }
};

// Toggle jump the line option (Step 4)
window.toggleJumpLine = function(checked) {
  state.booking.jumpLine = checked;
};

// Confirm and submit booking (Step 4)
window.confirmBooking = async function() {
  const { store, currentProduct, booking } = state;
  const settings = booking.settings || {};
  const data = currentProduct?.data || {};
  
  const selectedPackage = booking.selectedPackage || { name: data.name, price: data.price };
  
  // Prepare booking data (for public API)
  const bookingData = {
    service_id: currentProduct.id,
    package_name: selectedPackage.name,
    customer_name: booking.customerName,
    customer_phone: booking.customerPhone,
    customer_email: booking.customerEmail || null,
    booking_date: booking.selectedDate,
    booking_time: booking.selectedTime,
    customer_notes: booking.notes || null,
    jumped_line: booking.jumpLine || false,
    payment_type: settings.deposit_enabled ? 'deposit' : 'full'
  };
  
  // Disable confirm button
  const confirmBtn = document.querySelector('.booking-btn.confirm');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = 'Processing...';
  }
  
  try {
    const res = await bookingApi.createBooking(store.slug, bookingData);
    const bookingRef = res.booking?.id || 'PENDING';
    
    // Show success
    const content = document.getElementById('bookingContent');
    if (content) {
      content.innerHTML = renderBookingSuccess(bookingRef);
    }
    
    // Hide progress
    const progress = document.querySelector('.booking-progress');
    if (progress) progress.style.display = 'none';
    
  } catch (error) {
    console.error('Booking failed:', error);
    alert('Failed to create booking. Please try again or contact us directly.');
    
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = 'Confirm Booking <span class="btn-arrow">→</span>';
    }
  }
};

// Export for use in main.js
export function setupBookingListeners() {
  // Listen for "Book Now" button clicks
  document.addEventListener('click', (e) => {
    const buyBtn = e.target.closest('#buyBtn');
    if (buyBtn && state.currentProduct?.template === 'portfolio-booking') {
      e.preventDefault();
      window.openBookingModal();
    }
    
    // Package select in portfolio template (outside modal)
    const pkgBtn = e.target.closest('.package-select-btn');
    if (pkgBtn) {
      e.preventDefault();
      const name = pkgBtn.dataset.name;
      const price = pkgBtn.dataset.price;
      state.booking.selectedPackage = { name, price };
      window.openBookingModal();
    }
  });
}

// Play hero video (Portfolio template)
window.playHeroVideo = function(overlay) {
  const container = overlay.closest('.hero-video-container');
  const video = container?.querySelector('video');
  if (video) {
    overlay.style.display = 'none';
    video.muted = false;
    video.controls = true;
    video.play();
  }
};
