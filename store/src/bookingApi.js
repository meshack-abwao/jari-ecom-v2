// Booking API client for storefront
const API_BASE = import.meta.env.VITE_API_URL || 'https://jari-api-production.up.railway.app';

export const bookingApi = {
  // Get store's booking settings
  async getSettings(storeId) {
    const res = await fetch(`${API_BASE}/api/bookings/settings?store_id=${storeId}`);
    if (!res.ok) throw new Error('Failed to fetch booking settings');
    return res.json();
  },

  // Get working hours
  async getWorkingHours(storeId) {
    const res = await fetch(`${API_BASE}/api/bookings/working-hours?store_id=${storeId}`);
    if (!res.ok) throw new Error('Failed to fetch working hours');
    return res.json();
  },

  // Get blocked dates
  async getBlockedDates(storeId) {
    const res = await fetch(`${API_BASE}/api/bookings/blocked-dates?store_id=${storeId}`);
    if (!res.ok) throw new Error('Failed to fetch blocked dates');
    return res.json();
  },

  // Get available slots for a specific date
  async getAvailability(storeId, date) {
    const res = await fetch(`${API_BASE}/api/bookings/availability?store_id=${storeId}&date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch availability');
    return res.json();
  },

  // Create a new booking
  async createBooking(bookingData) {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create booking');
    }
    return res.json();
  }
};
