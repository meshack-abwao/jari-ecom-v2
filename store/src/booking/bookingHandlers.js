// ===========================================
// BOOKING MODAL HANDLERS
// Event handlers for the booking modal
// ===========================================
import { bookingState, updateBookingState, resetBookingState } from './bookingState.js';
import { bookingApi } from './bookingApi.js';
import { renderBookingModal, renderStep, renderCalendarDays, renderTimeSlots, renderBookingSuccess } from './bookingModal.js';

// Open the booking modal
export async function openBookingModal(storeSlug, product, preSelectedPackage = null) {
  resetBookingState();
  
  updateBookingState({
    isOpen: true,
    storeSlug,
    product,
    selectedPackage: preSelectedPackage,
    loading: true
  });
  
  // Render initial modal
  renderModal();
  
  // Load booking data
  try {
    const [settingsRes, workingHoursRes, blockedDatesRes] = await Promise.all([
      bookingApi.getSettings(storeSlug),
      bookingApi.getWorkingHours(storeSlug),
      bookingApi.getBlockedDates(storeSlug)
    ]);
    
    // Extract data from responses
    updateBookingState({
      settings: settingsRes.data || {},
      workingHours: workingHoursRes.data || [],
      blockedDates: blockedDatesRes.data || [],
      loading: false
    });
    
    renderModal();
    setupEventListeners();
  } catch (error) {
    console.error('[Booking] Failed to load data:', error);
    // Set defaults on error so modal still works
    updateBookingState({ 
      loading: false, 
      error: 'Failed to load booking data',
      settings: {
        min_notice_hours: 24,
        max_advance_days: 30,
        slot_duration_minutes: 60
      },
      workingHours: [
        { day_of_week: 1, is_open: true, start_time: '09:00', end_time: '17:00' },
        { day_of_week: 2, is_open: true, start_time: '09:00', end_time: '17:00' },
        { day_of_week: 3, is_open: true, start_time: '09:00', end_time: '17:00' },
        { day_of_week: 4, is_open: true, start_time: '09:00', end_time: '17:00' },
        { day_of_week: 5, is_open: true, start_time: '09:00', end_time: '17:00' }
      ],
      blockedDates: []
    });
    renderModal();
  }
}

// Close the modal
export function closeBookingModal() {
  resetBookingState();
  const overlay = document.getElementById('bkmOverlay');
  if (overlay) overlay.remove();
}

// Render/update the modal
function renderModal() {
  let container = document.getElementById('bkmOverlay');
  
  if (!bookingState.isOpen) {
    if (container) container.remove();
    return;
  }
  
  const html = renderBookingModal();
  
  if (container) {
    container.outerHTML = html;
  } else {
    document.body.insertAdjacentHTML('beforeend', html);
  }
  
  setupEventListeners();
}

// Update just the content area
function updateContent() {
  const content = document.getElementById('bkmContent');
  if (content) {
    content.innerHTML = renderStep(bookingState.step);
    setupStepListeners();
  }
}


// Setup all event listeners
function setupEventListeners() {
  // Close button
  document.getElementById('bkmClose')?.addEventListener('click', closeBookingModal);
  
  // Overlay click to close
  document.getElementById('bkmOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'bkmOverlay') closeBookingModal();
  });
  
  setupStepListeners();
}

// Setup listeners for current step
function setupStepListeners() {
  const { step } = bookingState;
  
  // Navigation buttons
  document.getElementById('bkmNext')?.addEventListener('click', handleNext);
  document.getElementById('bkmBack')?.addEventListener('click', handleBack);
  document.getElementById('bkmConfirm')?.addEventListener('click', handleConfirm);
  document.getElementById('bkmDone')?.addEventListener('click', closeBookingModal);
  
  // Step-specific listeners
  if (step === 1) {
    document.querySelectorAll('.bkm-service').forEach(el => {
      el.addEventListener('click', () => selectPackage(el));
    });
  }
  
  if (step === 2) {
    document.getElementById('bkmPrevMonth')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('bkmNextMonth')?.addEventListener('click', () => changeMonth(1));
    
    document.querySelectorAll('.bkm-day:not(.disabled):not(.empty)').forEach(el => {
      el.addEventListener('click', () => selectDate(el.dataset.date));
    });
    
    document.querySelectorAll('.bkm-slot:not(.disabled)').forEach(el => {
      el.addEventListener('click', () => selectTime(el.dataset.time));
    });
  }
  
  if (step === 3) {
    document.getElementById('bkmName')?.addEventListener('input', (e) => {
      updateBookingState({ customerName: e.target.value });
    });
    document.getElementById('bkmPhone')?.addEventListener('input', (e) => {
      updateBookingState({ customerPhone: e.target.value });
    });
    document.getElementById('bkmEmail')?.addEventListener('input', (e) => {
      updateBookingState({ customerEmail: e.target.value });
    });
    document.getElementById('bkmNotes')?.addEventListener('input', (e) => {
      updateBookingState({ notes: e.target.value });
    });
  }
}

// Handle next step
function handleNext() {
  const { step, selectedPackage, selectedDate, selectedTime, customerName, customerPhone, product } = bookingState;
  
  // Validation
  if (step === 1 && !selectedPackage && !product?.data?.price) {
    alert('Please select a package');
    return;
  }
  
  if (step === 2 && (!selectedDate || !selectedTime)) {
    alert('Please select a date and time');
    return;
  }
  
  if (step === 3 && (!customerName || !customerPhone)) {
    alert('Please enter your name and phone number');
    return;
  }
  
  updateBookingState({ step: step + 1 });
  updateContent();
}

// Handle back step
function handleBack() {
  const { step } = bookingState;
  if (step > 1) {
    updateBookingState({ step: step - 1 });
    updateContent();
  }
}


// Select a package
function selectPackage(el) {
  const pkg = {
    index: parseInt(el.dataset.index),
    name: el.dataset.name,
    price: parseInt(el.dataset.price),
    duration: el.dataset.duration
  };
  
  updateBookingState({ selectedPackage: pkg });
  
  // Update UI
  document.querySelectorAll('.bkm-service').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  
  // Enable next button
  const nextBtn = document.getElementById('bkmNext');
  if (nextBtn) nextBtn.disabled = false;
}

// Change calendar month
function changeMonth(delta) {
  let { viewMonth, viewYear } = bookingState;
  viewMonth += delta;
  
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  } else if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
  
  updateBookingState({ viewMonth, viewYear });
  
  // Update calendar
  const calDays = document.getElementById('bkmCalDays');
  const calTitle = document.getElementById('bkmCalTitle');
  if (calDays) calDays.innerHTML = renderCalendarDays();
  if (calTitle) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    calTitle.textContent = `${months[viewMonth]} ${viewYear}`;
  }
  
  // Re-attach listeners
  document.querySelectorAll('.bkm-day:not(.disabled):not(.empty)').forEach(el => {
    el.addEventListener('click', () => selectDate(el.dataset.date));
  });
}

// Select a date
async function selectDate(dateStr) {
  updateBookingState({ selectedDate: dateStr, selectedTime: null, availableSlots: [] });
  
  // Update UI
  document.querySelectorAll('.bkm-day').forEach(d => d.classList.remove('selected'));
  document.querySelector(`.bkm-day[data-date="${dateStr}"]`)?.classList.add('selected');
  
  // Load available slots
  try {
    const { storeSlug } = bookingState;
    const result = await bookingApi.getAvailability(storeSlug, dateStr);
    
    if (result.available && result.slots?.length > 0) {
      updateBookingState({ availableSlots: result.slots });
    } else {
      // API returned no slots - generate defaults
      updateBookingState({ availableSlots: generateDefaultSlots() });
    }
  } catch (error) {
    console.error('[Booking] Failed to load slots, using defaults:', error);
    // Generate client-side slots when API fails
    updateBookingState({ availableSlots: generateDefaultSlots() });
  }
  
  // Always re-render to show slots
  updateContent();
}

// Generate default time slots (9am-5pm, hourly)
function generateDefaultSlots() {
  const { settings, workingHours, selectedDate } = bookingState;
  const slots = [];
  
  // Get working hours for selected day
  const dateObj = new Date(selectedDate);
  const dayOfWeek = dateObj.getDay();
  const dayHours = workingHours.find(w => w.day_of_week === dayOfWeek);
  
  // Default to 9-5 if no working hours configured
  const startHour = dayHours?.start_time ? parseInt(dayHours.start_time.split(':')[0]) : 9;
  const endHour = dayHours?.end_time ? parseInt(dayHours.end_time.split(':')[0]) : 17;
  const duration = settings?.slot_duration_minutes || 60;
  
  // Generate slots
  for (let hour = startHour; hour < endHour; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    slots.push({ time, available: true });
    
    // Add half-hour slots if duration is 30 min
    if (duration === 30 && hour < endHour - 1) {
      slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, available: true });
    }
  }
  
  return slots;
}

// Select a time slot
function selectTime(time) {
  updateBookingState({ selectedTime: time });
  
  // Update UI
  document.querySelectorAll('.bkm-slot').forEach(s => s.classList.remove('selected'));
  document.querySelector(`.bkm-slot[data-time="${time}"]`)?.classList.add('selected');
  
  // Enable next button
  const nextBtn = document.getElementById('bkmNext');
  if (nextBtn) nextBtn.disabled = false;
}

// Confirm booking
async function handleConfirm() {
  const { storeSlug, product, selectedPackage, selectedDate, selectedTime, customerName, customerPhone, customerEmail, notes } = bookingState;
  
  const confirmBtn = document.getElementById('bkmConfirm');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Booking...';
  }
  
  try {
    const booking = await bookingApi.createBooking(storeSlug, {
      product_id: product?.id,
      package_name: selectedPackage?.name || product?.data?.name,
      package_price: selectedPackage?.price || product?.data?.price,
      booking_date: selectedDate,
      booking_time: selectedTime,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      notes
    });
    
    // Show success
    const content = document.getElementById('bkmContent');
    if (content) {
      content.innerHTML = renderBookingSuccess(booking);
      document.getElementById('bkmDone')?.addEventListener('click', closeBookingModal);
    }
  } catch (error) {
    alert(error.message || 'Failed to create booking');
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Booking';
    }
  }
}

// Listen for portfolio-booking template events
window.addEventListener('pbk:openBooking', (e) => {
  const { product, selectedPackage } = e.detail;
  const slug = window.JARI_STORE_SLUG;
  if (slug && product) {
    openBookingModal(slug, product, selectedPackage);
  }
});
