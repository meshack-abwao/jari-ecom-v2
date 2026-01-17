// Booking API client for storefront
const API_BASE = import.meta.env.VITE_API_URL || 'https://jari-api-production.up.railway.app';

export const bookingApi = {
  // Get store's booking settings (public)
  async getSettings(storeSlug) {
    const res = await fetch(`${API_BASE}/api/bookings/public/${storeSlug}/settings`);
    if (!res.ok) {
      // If 404, return empty settings (store might not have booking configured)
      if (res.status === 404) return { data: {} };
      throw new Error('Failed to fetch booking settings');
    }
    return res.json();
  },

  // Get working hours (public)
  async getWorkingHours(storeSlug) {
    const res = await fetch(`${API_BASE}/api/bookings/public/${storeSlug}/working-hours`);
    if (!res.ok) {
      if (res.status === 404) return { data: [] };
      throw new Error('Failed to fetch working hours');
    }
    return res.json();
  },

  // Get blocked dates (public)
  async getBlockedDates(storeSlug) {
    const res = await fetch(`${API_BASE}/api/bookings/public/${storeSlug}/blocked-dates`);
    if (!res.ok) {
      if (res.status === 404) return { data: [] };
      throw new Error('Failed to fetch blocked dates');
    }
    return res.json();
  },

  // Get available slots for a specific date (public)
  async getAvailability(storeSlug, date, serviceId = null) {
    let url = `${API_BASE}/api/bookings/public/${storeSlug}/available?date=${date}`;
    if (serviceId) url += `&service_id=${serviceId}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch availability');
    return res.json();
  },

  // Create a new booking (public)
  async createBooking(storeSlug, bookingData) {
    const res = await fetch(`${API_BASE}/api/bookings/public/${storeSlug}`, {
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
