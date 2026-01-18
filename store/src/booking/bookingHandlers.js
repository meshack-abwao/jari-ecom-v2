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
        slot_duration_minutes: 60,
        // Payment settings defaults
        deposit_enabled: true,
        deposit_percentage: 30,
        jump_line_enabled: true,
        jump_line_fee: 500,
        inquiry_fee: 0
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

// Update just the content area and progress bar
function updateContent() {
  const content = document.getElementById('bkmContent');
  if (content) {
    content.innerHTML = renderStep(bookingState.step);
    setupStepListeners();
  }
  
  // Also update progress bar
  updateProgressBar();
}

// Update progress bar to reflect current step
function updateProgressBar() {
  const { step } = bookingState;
  document.querySelectorAll('.bkm-step').forEach((el, index) => {
    const stepNum = index + 1;
    if (stepNum <= step) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  document.querySelectorAll('.bkm-line').forEach((el, index) => {
    const stepNum = index + 1;
    if (stepNum < step) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
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
  
  // Step 4: Payment options, Jump the Line, Discount
  if (step === 4) {
    // Payment type selection
    document.querySelectorAll('input[name="paymentType"]').forEach(el => {
      el.addEventListener('change', (e) => {
        updateBookingState({ paymentType: e.target.value });
        updateContent();
      });
    });
    
    // Jump the Line toggle
    document.getElementById('bkmJumpLine')?.addEventListener('click', () => {
      updateBookingState({ jumpLine: !bookingState.jumpLine });
      updateContent();
    });
    
    // Discount code
    document.getElementById('bkmApplyDiscount')?.addEventListener('click', applyDiscountCode);
    document.getElementById('bkmDiscountCode')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') applyDiscountCode();
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
  updateBookingState({ 
    selectedDate: dateStr, 
    selectedTime: null, 
    availableSlots: [],
    dayFullyBooked: false,
    slotFullyBooked: false
  });
  
  // Update UI
  document.querySelectorAll('.bkm-day').forEach(d => d.classList.remove('selected'));
  document.querySelector(`.bkm-day[data-date="${dateStr}"]`)?.classList.add('selected');
  
  // Load available slots
  try {
    const { storeSlug } = bookingState;
    const result = await bookingApi.getAvailability(storeSlug, dateStr);
    
    if (result.available && result.slots?.length > 0) {
      // Check if day is fully booked (all slots have 0 availability)
      const availableCount = result.slots.filter(s => s.available > 0).length;
      const dayFullyBooked = availableCount === 0;
      
      updateBookingState({ 
        availableSlots: result.slots,
        dayFullyBooked
      });
    } else if (!result.available) {
      // Day is fully booked or blocked
      updateBookingState({ 
        availableSlots: [],
        dayFullyBooked: true
      });
    } else {
      // API returned no slots - generate defaults
      updateBookingState({ 
        availableSlots: generateDefaultSlots(),
        dayFullyBooked: false
      });
    }
  } catch (error) {
    console.error('[Booking] Failed to load slots, using defaults:', error);
    // Generate client-side slots when API fails
    updateBookingState({ 
      availableSlots: generateDefaultSlots(),
      dayFullyBooked: false
    });
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

// Apply discount code (placeholder - would need API validation)
function applyDiscountCode() {
  const code = document.getElementById('bkmDiscountCode')?.value?.trim().toUpperCase();
  if (!code) return;
  
  // Simple client-side validation for demo
  // In production, this would call an API to validate
  const discounts = {
    'SAVE10': 10,
    'WELCOME': 15,
    'VIP20': 20
  };
  
  const percent = discounts[code];
  if (percent) {
    const { selectedPackage, product } = bookingState;
    const basePrice = selectedPackage?.price || product?.data?.price || 0;
    const discountAmount = Math.round(basePrice * percent / 100);
    updateBookingState({ discountCode: code, discountAmount });
    updateContent();
  } else {
    alert('Invalid discount code');
  }
}

// Confirm booking
async function handleConfirm() {
  const { 
    storeSlug, product, selectedPackage, selectedDate, selectedTime, 
    customerName, customerPhone, customerEmail, notes,
    paymentType, jumpLine, discountCode, discountAmount, settings
  } = bookingState;
  
  // Prevent double submission
  if (bookingState.submitting) return;
  updateBookingState({ submitting: true });
  updateContent();
  
  // Calculate final amounts
  const basePrice = selectedPackage?.price || product?.data?.price || 0;
  const jumpLineFee = jumpLine ? (settings.jump_line_fee || 0) : 0;
  const totalAmount = basePrice + jumpLineFee - discountAmount;
  
  let payNow = totalAmount;
  if (paymentType === 'deposit') {
    payNow = Math.round(totalAmount * (settings.deposit_percentage || 20) / 100);
  } else if (paymentType === 'inquiry') {
    payNow = settings.inquiry_fee || 0;
  }
  
  try {
    const booking = await bookingApi.createBooking(storeSlug, {
      product_id: product?.id,
      package_name: selectedPackage?.name || product?.data?.name,
      package_price: basePrice,
      total_amount: totalAmount,
      amount_paid: payNow,
      booking_date: selectedDate,
      booking_time: selectedTime,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      notes,
      payment_type: paymentType,
      jumped_line: jumpLine,
      discount_code: discountCode,
      discount_amount: discountAmount
    });
    
    // Show success
    updateBookingState({ submitting: false });
    const content = document.getElementById('bkmContent');
    if (content) {
      content.innerHTML = renderBookingSuccess(booking);
      document.getElementById('bkmDone')?.addEventListener('click', closeBookingModal);
      document.getElementById('bkmAddToCalendar')?.addEventListener('click', () => addToCalendar(booking));
    }
  } catch (error) {
    console.error('[Booking] Failed to create booking:', error);
    updateBookingState({ submitting: false });
    
    // Fallback to WhatsApp booking when API fails
    const fallbackToWhatsApp = confirm(
      'Unable to complete online booking. Would you like to book via WhatsApp instead?'
    );
    
    if (fallbackToWhatsApp) {
      sendBookingViaWhatsApp();
    } else {
      updateContent();
    }
  }
}

// Send booking via WhatsApp (fallback when API unavailable)
function sendBookingViaWhatsApp() {
  const { 
    product, selectedPackage, selectedDate, selectedTime, 
    customerName, customerPhone, notes, paymentType, jumpLine
  } = bookingState;
  
  const serviceName = selectedPackage?.name || product?.data?.name || 'Service';
  const price = selectedPackage?.price || product?.data?.price || 0;
  
  // Format the booking message
  const message = `🗓️ *BOOKING REQUEST*

*Service:* ${serviceName}
*Date:* ${selectedDate}
*Time:* ${selectedTime}
*Price:* KES ${parseInt(price).toLocaleString()}

*Customer Details:*
• Name: ${customerName}
• Phone: ${customerPhone}
${notes ? `• Notes: ${notes}` : ''}

*Payment:* ${paymentType === 'deposit' ? 'Deposit' : paymentType === 'inquiry' ? 'Inquiry' : 'Full Payment'}
${jumpLine ? '⚡ Priority Booking Requested' : ''}

Please confirm availability.`;

  // Get store phone from product or use default
  const storePhone = product?.data?.whatsapp || product?.data?.phone || '254700000000';
  const cleanPhone = storePhone.replace(/[^0-9]/g, '');
  
  // Open WhatsApp
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  
  // Show success anyway
  const content = document.getElementById('bkmContent');
  if (content) {
    content.innerHTML = `
      <div class="bkm-success">
        <div class="bkm-success-icon" style="background: #25D366;">💬</div>
        <h3>WhatsApp Opened!</h3>
        <p>Complete your booking in WhatsApp.<br>The provider will confirm your appointment.</p>
        <button class="bkm-btn bkm-btn-primary" id="bkmDone">Done</button>
      </div>
    `;
    document.getElementById('bkmDone')?.addEventListener('click', closeBookingModal);
  }
}

// Add booking to calendar (generates .ics file download)
function addToCalendar(booking = {}) {
  const { product, selectedPackage, selectedDate, selectedTime, customerName } = bookingState;
  
  const serviceName = selectedPackage?.name || product?.data?.name || booking?.package_name || 'Appointment';
  const bookingDate = selectedDate || booking?.booking_date;
  const bookingTime = selectedTime || booking?.booking_time || '09:00';
  const storeName = product?.data?.store_name || 'Service Provider';
  
  if (!bookingDate) {
    alert('No date available for calendar');
    return;
  }
  
  // Parse date and time
  const [hours, minutes] = bookingTime.split(':').map(Number);
  const startDate = new Date(bookingDate);
  startDate.setHours(hours || 9, minutes || 0, 0, 0);
  
  // End time (1 hour later by default)
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);
  
  // Format for ICS (YYYYMMDDTHHMMSS)
  const formatICS = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  // Create ICS content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Jari.Eco//Booking//EN
BEGIN:VEVENT
UID:${Date.now()}@jari.eco
DTSTAMP:${formatICS(new Date())}
DTSTART:${formatICS(startDate)}
DTEND:${formatICS(endDate)}
SUMMARY:${serviceName} - ${storeName}
DESCRIPTION:Your appointment for ${serviceName}. Remember to arrive 5-10 minutes early.
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  // Download the file
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `appointment-${bookingDate}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Listen for portfolio-booking template events
window.addEventListener('pbk:openBooking', (e) => {
  const { product, selectedPackage } = e.detail;
  const slug = window.JARI_STORE_SLUG;
  if (slug && product) {
    openBookingModal(slug, product, selectedPackage);
  }
});
