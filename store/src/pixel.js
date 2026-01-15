// ===========================================
// JARI PIXEL - Lightweight Analytics Tracking
// ===========================================

import { state } from './state.js';

// Session ID (persists for this browser session)
const SESSION_ID = sessionStorage.getItem('jari_sid') || generateSessionId();
sessionStorage.setItem('jari_sid', SESSION_ID);

function generateSessionId() {
  return 'sid_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Get UTM params from URL
function getUTMParams() {
  const url = new URL(window.location.href);
  return {
    source: url.searchParams.get('utm_source') || detectSource(),
    medium: url.searchParams.get('utm_medium') || '',
    campaign: url.searchParams.get('utm_campaign') || ''
  };
}

// Auto-detect source from referrer if no UTM
function detectSource() {
  const referrer = document.referrer.toLowerCase();
  if (!referrer) return 'direct';
  if (referrer.includes('instagram')) return 'instagram';
  if (referrer.includes('facebook') || referrer.includes('fb.com')) return 'facebook';
  if (referrer.includes('whatsapp') || referrer.includes('wa.me')) return 'whatsapp';
  if (referrer.includes('tiktok')) return 'tiktok';
  if (referrer.includes('twitter') || referrer.includes('x.com')) return 'twitter';
  if (referrer.includes('google')) return 'google';
  if (referrer.includes('bing')) return 'bing';
  return 'referral';
}

// Detect device type
function getDevice() {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

// Get API base URL
function getApiUrl() {
  // Use same base as store API
  const apiUrl = import.meta.env.VITE_API_URL || 'https://jari-ecom-v2-api-production.up.railway.app';
  return apiUrl.replace(/\/$/, ''); // Remove trailing slash
}

// Core tracking function
export function track(event, data = {}) {
  const store = state.store;
  console.log('[Pixel] track() called - event:', event, 'store:', store);
  
  if (!store?.id) {
    console.warn('[Pixel] No store ID found, skipping track. Store object:', store);
    return;
  }
  
  const payload = {
    store_id: store.id,
    event,
    data,
    utm: getUTMParams(),
    device: getDevice(),
    url: window.location.pathname,
    referrer: document.referrer,
    session_id: SESSION_ID
  };
  
  console.log('[Pixel] Sending payload:', payload);
  
  // Fire and forget - use sendBeacon if available for reliability
  const endpoint = `${getApiUrl()}/pixel`;
  console.log('[Pixel] Endpoint:', endpoint);
  
  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(endpoint, JSON.stringify(payload));
    console.log('[Pixel] sendBeacon result:', sent);
  } else {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true // Important for page unload
    }).catch(() => {}); // Fail silently
  }
}

// Auto-track page view on load
export function initPixel() {
  // Small delay to ensure store is loaded
  setTimeout(() => {
    track('page_view');
  }, 100);
  
  // Track when user leaves (for session duration)
  window.addEventListener('beforeunload', () => {
    track('page_leave');
  });
}

// Convenience exports for specific events
export const pixel = {
  pageView: () => track('page_view'),
  productView: (productId, productName) => track('product_view', { product_id: productId, product_name: productName }),
  addToCart: (productId, quantity, price) => track('add_to_cart', { product_id: productId, quantity, price }),
  checkoutStart: (cartValue) => track('checkout_start', { cart_value: cartValue }),
  purchase: (orderId, total, productId) => track('purchase', { order_id: orderId, total, product_id: productId })
};

export default pixel;
