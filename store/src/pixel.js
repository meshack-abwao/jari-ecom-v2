// ===========================================
// JARI PIXEL - Analytics + Platform Pixel Integration
// ===========================================
// Tracks events to:
// 1. Jari's own analytics (pixel_events table)
// 2. Meta Pixel (Facebook/Instagram)
// 3. TikTok Pixel
// 4. Google Analytics 4 / Google Ads
// ===========================================

import { state } from './state.js';

// Session ID (persists for this browser session)
const SESSION_ID = sessionStorage.getItem('jari_sid') || generateSessionId();
sessionStorage.setItem('jari_sid', SESSION_ID);

// Track if platform pixels have been initialized
let pixelsInitialized = false;

function generateSessionId() {
  return 'sid_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// ===========================================
// UTM & DEVICE DETECTION
// ===========================================

function getUTMParams() {
  const url = new URL(window.location.href);
  return {
    source: url.searchParams.get('utm_source') || detectSource(),
    medium: url.searchParams.get('utm_medium') || '',
    campaign: url.searchParams.get('utm_campaign') || ''
  };
}

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

function getDevice() {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://jari-ecom-v2-production.up.railway.app';
  return apiUrl.replace(/\/$/, '');
}

// ===========================================
// PLATFORM PIXEL INITIALIZATION
// ===========================================

/**
 * Initialize all platform pixels based on store config
 */
export function initPlatformPixels() {
  if (pixelsInitialized) return;
  
  const store = state.store;
  console.log('🎯 Pixel init - store data:', { storeId: store?.id, config: store?.config });
  const pixels = store?.config?.pixels || {};
  
  // Initialize Meta Pixel
  if (pixels.meta_pixel_id) {
    initMetaPixel(pixels.meta_pixel_id);
  }
  
  // Initialize TikTok Pixel
  if (pixels.tiktok_pixel_id) {
    initTikTokPixel(pixels.tiktok_pixel_id);
  }
  
  // Initialize Google Tag
  if (pixels.google_tag_id) {
    initGoogleTag(pixels.google_tag_id);
  }
  
  pixelsInitialized = true;
  console.log('🎯 Platform pixels initialized:', {
    meta: !!pixels.meta_pixel_id,
    tiktok: !!pixels.tiktok_pixel_id,
    google: !!pixels.google_tag_id
  });
}

/**
 * Initialize Meta Pixel (Facebook/Instagram)
 */
function initMetaPixel(pixelId) {
  if (window.fbq) return; // Already loaded
  
  // Meta Pixel base code
  !function(f,b,e,v,n,t,s) {
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
  
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  
  console.log('📘 Meta Pixel initialized:', pixelId);
}

/**
 * Initialize TikTok Pixel
 */
function initTikTokPixel(pixelId) {
  if (window.ttq) return; // Already loaded
  
  // TikTok Pixel base code
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
    ttq.load(pixelId);
    ttq.page();
  }(window, document, 'ttq');
  
  console.log('🎵 TikTok Pixel initialized:', pixelId);
}

/**
 * Initialize Google Tag (GA4 / Google Ads)
 */
function initGoogleTag(measurementId) {
  if (window.gtag) return; // Already loaded
  
  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
  
  console.log('🔍 Google Tag initialized:', measurementId);
}

// ===========================================
// PLATFORM EVENT FIRING
// ===========================================

/**
 * Fire event to Meta Pixel
 */
function fireMetaEvent(eventName, params = {}) {
  if (!window.fbq) return;
  window.fbq('track', eventName, params);
}

/**
 * Fire event to TikTok Pixel
 */
function fireTikTokEvent(eventName, params = {}) {
  if (!window.ttq) return;
  window.ttq.track(eventName, params);
}

/**
 * Fire event to Google Tag
 */
function fireGoogleEvent(eventName, params = {}) {
  if (!window.gtag) return;
  window.gtag('event', eventName, params);
}

// ===========================================
// JARI ANALYTICS TRACKING
// ===========================================

/**
 * Core tracking function - sends to Jari backend
 */
export function track(event, data = {}) {
  const store = state.store;
  if (!store?.id) return;
  
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
  
  const endpoint = `${getApiUrl()}/pixel`;
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, JSON.stringify(payload));
  } else {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  }
}

// ===========================================
// UNIFIED EVENT TRACKING (Jari + All Platforms)
// ===========================================

/**
 * Track page view across all platforms
 */
function trackPageView() {
  // Jari analytics
  track('page_view');
  
  // Platform pixels fire PageView on init, but we track again for SPA navigation
  // Meta: Already fires on init
  // TikTok: Already fires on init  
  // Google: Already fires on init
}

/**
 * Track product/content view
 */
function trackProductView(productId, productName, price = 0, currency = 'KES') {
  // Jari analytics
  track('product_view', { product_id: productId, product_name: productName, price });
  
  // Meta Pixel - ViewContent
  fireMetaEvent('ViewContent', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price,
    currency: currency
  });
  
  // TikTok Pixel - ViewContent
  fireTikTokEvent('ViewContent', {
    content_id: productId,
    content_name: productName,
    content_type: 'product',
    value: price,
    currency: currency
  });
  
  // Google Tag - view_item
  fireGoogleEvent('view_item', {
    items: [{
      item_id: productId,
      item_name: productName,
      price: price,
      currency: currency
    }]
  });
}

/**
 * Track add to cart
 */
function trackAddToCart(productId, productName, quantity = 1, price = 0, currency = 'KES') {
  const value = price * quantity;
  
  // Jari analytics
  track('add_to_cart', { product_id: productId, product_name: productName, quantity, price, value });
  
  // Meta Pixel - AddToCart
  fireMetaEvent('AddToCart', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: value,
    currency: currency,
    num_items: quantity
  });
  
  // TikTok Pixel - AddToCart
  fireTikTokEvent('AddToCart', {
    content_id: productId,
    content_name: productName,
    content_type: 'product',
    value: value,
    currency: currency,
    quantity: quantity
  });
  
  // Google Tag - add_to_cart
  fireGoogleEvent('add_to_cart', {
    items: [{
      item_id: productId,
      item_name: productName,
      price: price,
      quantity: quantity,
      currency: currency
    }],
    value: value,
    currency: currency
  });
}

/**
 * Track checkout initiation
 */
function trackCheckoutStart(cartValue = 0, currency = 'KES', items = []) {
  // Jari analytics
  track('checkout_start', { cart_value: cartValue, items_count: items.length });
  
  // Meta Pixel - InitiateCheckout
  fireMetaEvent('InitiateCheckout', {
    value: cartValue,
    currency: currency,
    num_items: items.length,
    content_ids: items.map(i => i.id || i.product_id)
  });
  
  // TikTok Pixel - InitiateCheckout
  fireTikTokEvent('InitiateCheckout', {
    value: cartValue,
    currency: currency,
    quantity: items.length
  });
  
  // Google Tag - begin_checkout
  fireGoogleEvent('begin_checkout', {
    value: cartValue,
    currency: currency,
    items: items.map(i => ({
      item_id: i.id || i.product_id,
      item_name: i.name || i.product_name,
      price: i.price,
      quantity: i.quantity || 1
    }))
  });
}

/**
 * Track successful purchase
 */
function trackPurchase(orderId, total = 0, currency = 'KES', items = [], productId = null) {
  // Jari analytics
  track('purchase', { 
    order_id: orderId, 
    total, 
    product_id: productId,
    items_count: items.length 
  });
  
  // Meta Pixel - Purchase
  fireMetaEvent('Purchase', {
    value: total,
    currency: currency,
    content_ids: items.length > 0 ? items.map(i => i.id || i.product_id) : [productId],
    content_type: 'product',
    num_items: items.length || 1
  });
  
  // TikTok Pixel - CompletePayment
  fireTikTokEvent('CompletePayment', {
    value: total,
    currency: currency,
    quantity: items.length || 1,
    content_id: productId || (items[0]?.id)
  });
  
  // Google Tag - purchase
  fireGoogleEvent('purchase', {
    transaction_id: orderId,
    value: total,
    currency: currency,
    items: items.length > 0 ? items.map(i => ({
      item_id: i.id || i.product_id,
      item_name: i.name || i.product_name,
      price: i.price,
      quantity: i.quantity || 1
    })) : [{
      item_id: productId,
      price: total,
      quantity: 1
    }]
  });
  
  console.log('💰 Purchase tracked:', { orderId, total, currency });
}

/**
 * Track booking confirmation (for service templates)
 */
function trackBookingConfirmed(bookingId, serviceName, total = 0, currency = 'KES') {
  // Jari analytics
  track('purchase', { 
    order_id: bookingId, 
    total,
    type: 'booking',
    service_name: serviceName
  });
  
  // Meta Pixel - Purchase (bookings count as purchases)
  fireMetaEvent('Purchase', {
    value: total,
    currency: currency,
    content_name: serviceName,
    content_type: 'service'
  });
  
  // TikTok Pixel - CompletePayment
  fireTikTokEvent('CompletePayment', {
    value: total,
    currency: currency,
    content_name: serviceName,
    content_type: 'service'
  });
  
  // Google Tag - purchase
  fireGoogleEvent('purchase', {
    transaction_id: bookingId,
    value: total,
    currency: currency,
    items: [{
      item_name: serviceName,
      price: total,
      quantity: 1
    }]
  });
  
  console.log('📅 Booking tracked:', { bookingId, serviceName, total });
}

// ===========================================
// INITIALIZATION
// ===========================================

/**
 * Initialize pixel tracking - call after store data is loaded
 */
export function initPixel() {
  // Wait a bit for store data to be available
  setTimeout(() => {
    // Initialize platform pixels
    initPlatformPixels();
    
    // Track initial page view
    trackPageView();
  }, 100);
  
  // Track when user leaves (for session duration)
  window.addEventListener('beforeunload', () => {
    track('page_leave');
  });
}

// ===========================================
// PUBLIC API
// ===========================================

export const pixel = {
  // Core tracking
  pageView: trackPageView,
  productView: trackProductView,
  addToCart: trackAddToCart,
  checkoutStart: trackCheckoutStart,
  purchase: trackPurchase,
  bookingConfirmed: trackBookingConfirmed,
  
  // Low-level access
  track,
  initPlatformPixels,
  
  // Legacy compatibility
  init: initPixel
};

export default pixel;
