// ===========================================
// BOOKING MODAL STATE
// Isolated state for booking flow
// ===========================================

export const bookingState = {
  // Modal visibility
  isOpen: false,
  
  // Current step (1-4)
  step: 1,
  
  // Store info
  storeSlug: null,
  storeConfig: null, // Store config including payment details
  
  // Product info
  product: null,
  
  // Selected package
  selectedPackage: null,
  
  // Calendar state
  viewMonth: new Date().getMonth(),
  viewYear: new Date().getFullYear(),
  selectedDate: null,
  selectedTime: null,
  
  // Booking settings (from API, with sensible defaults)
  settings: {
    min_notice_hours: 24,
    max_advance_days: 30,
    slot_duration_minutes: 60,
    deposit_enabled: true,
    deposit_percentage: 30,
    jump_line_enabled: true,
    jump_line_fee: 500,
    inquiry_fee: 0
  },
  workingHours: [],
  blockedDates: [],
  availableSlots: [],
  
  // Customer info
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  notes: '',
  
  // Payment options (JTBD: flexible payment)
  paymentType: 'full', // 'full', 'deposit', 'inquiry'
  jumpLine: false,     // Priority booking
  discountCode: '',
  discountAmount: 0,
  
  // Availability tracking
  dayFullyBooked: false,  // True when all slots for day are taken
  slotFullyBooked: false, // True when selected time slot is full
  
  // UI state
  loading: false,
  submitting: false,
  error: null
};

// Reset state
export function resetBookingState() {
  bookingState.isOpen = false;
  bookingState.step = 1;
  bookingState.selectedPackage = null;
  bookingState.selectedDate = null;
  bookingState.selectedTime = null;
  bookingState.customerName = '';
  bookingState.customerPhone = '';
  bookingState.customerEmail = '';
  bookingState.notes = '';
  bookingState.paymentType = 'full';
  bookingState.jumpLine = false;
  bookingState.discountCode = '';
  bookingState.discountAmount = 0;
  bookingState.dayFullyBooked = false;
  bookingState.slotFullyBooked = false;
  bookingState.error = null;
  bookingState.submitting = false;
  bookingState.viewMonth = new Date().getMonth();
  bookingState.viewYear = new Date().getFullYear();
}

// Update state helper
export function updateBookingState(updates) {
  Object.assign(bookingState, updates);
}
