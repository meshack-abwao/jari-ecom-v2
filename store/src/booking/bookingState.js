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
  
  // Product info
  product: null,
  
  // Selected package
  selectedPackage: null,
  
  // Calendar state
  viewMonth: new Date().getMonth(),
  viewYear: new Date().getFullYear(),
  selectedDate: null,
  selectedTime: null,
  
  // Booking settings (from API)
  settings: {},
  workingHours: [],
  blockedDates: [],
  availableSlots: [],
  
  // Customer info
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  notes: '',
  
  // UI state
  loading: false,
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
  bookingState.error = null;
  bookingState.viewMonth = new Date().getMonth();
  bookingState.viewYear = new Date().getFullYear();
}

// Update state helper
export function updateBookingState(updates) {
  Object.assign(bookingState, updates);
}
