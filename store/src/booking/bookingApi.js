// ===========================================
// BOOKING API - Storefront (Public endpoints)
// Prefix: bkm (booking modal)
// API routes: /api/bookings/public/:storeSlug/...
// ===========================================

// Use same API URL as main store API
const API_BASE = (import.meta.env.VITE_API_URL || 'https://jari-ecom-v2-production.up.railway.app').replace(/\/$/, '') + '/api';

export const bookingApi = {
  // Get booking settings for a store (public)
  getSettings: async (storeSlug) => {
    const res = await fetch(`${API_BASE}/bookings/public/${storeSlug}/settings`);
    if (!res.ok) throw new Error('Failed to load booking settings');
    return res.json();
  },
  
  // Get working hours (public)
  getWorkingHours: async (storeSlug) => {
    const res = await fetch(`${API_BASE}/bookings/public/${storeSlug}/working-hours`);
    if (!res.ok) throw new Error('Failed to load working hours');
    return res.json();
  },
  
  // Get blocked dates (public)
  getBlockedDates: async (storeSlug) => {
    const res = await fetch(`${API_BASE}/bookings/public/${storeSlug}/blocked-dates`);
    if (!res.ok) throw new Error('Failed to load blocked dates');
    return res.json();
  },
  
  // Get available time slots for a date (public)
  getAvailability: async (storeSlug, date) => {
    const res = await fetch(`${API_BASE}/bookings/public/${storeSlug}/availability?date=${date}`);
    if (!res.ok) throw new Error('Failed to load availability');
    return res.json();
  },
  
  // Create a booking (public)
  createBooking: async (storeSlug, bookingData) => {
    const res = await fetch(`${API_BASE}/bookings/public/${storeSlug}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create booking');
    }
    return res.json();
  }
};
