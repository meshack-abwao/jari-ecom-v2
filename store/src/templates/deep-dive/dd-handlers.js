// ===========================================
// DEEP DIVE EVENT HANDLERS
// Initialize all Deep Dive template interactions
// ===========================================

import { initGalleryHandlers, initStoryHandlers } from '../../shared/media-components.js';
import { initPolicyModalHandlers } from '../../shared/policy-modals.js';
import { initShowcaseViewerHandlers } from './dd-showcase-viewer.js';
import { formatPrice } from '../../shared/utils.js';

/**
 * Initialize all Deep Dive template handlers
 * Call this after the template is rendered
 * @param {object} product - Product object
 */
export function initDeepDiveHandlers(product) {
  const media = product.media || {};
  const data = product.data || {};
  
  // Gallery handlers
  initGalleryHandlers(media.images || []);
  
  // Story handlers
  initStoryHandlers(media.stories || []);
  
  // Showcase viewer handlers
  const showcaseImages = (media.showcaseImages || []).filter(img => img.url);
  const showcaseVideo = media.showcaseVideo || null;
  initShowcaseViewerHandlers(showcaseImages, showcaseVideo);
  
  // Policy modal handlers
  initPolicyModalHandlers();
  
  // Deep Dive specific: CTA quantity controls
  initDeepDiveCTAHandlers(data.price || 0);
  
  // Social actions
  initSocialActions(product);
  
  // Back button
  initBackButton();
}

/**
 * Initialize floating CTA quantity controls
 */
function initDeepDiveCTAHandlers(price) {
  const qtyValue = document.getElementById('ctaQtyValue');
  const totalPrice = document.getElementById('ctaTotalPrice');
  
  if (!qtyValue) return;
  
  let quantity = 1;
  
  window.updateQuantity = function(delta) {
    const newQty = quantity + delta;
    if (newQty < 1 || newQty > 99) return;
    
    quantity = newQty;
    qtyValue.textContent = quantity;
    
    if (totalPrice) {
      totalPrice.textContent = formatPrice(price * quantity);
    }
    
    // Update button states
    const minusBtn = document.querySelector('.cta-qty-btn.minus');
    const plusBtn = document.querySelector('.cta-qty-btn.plus');
    
    if (minusBtn) minusBtn.disabled = quantity <= 1;
    if (plusBtn) plusBtn.disabled = quantity >= 99;
  };
  
  // Return getter for buy button
  return {
    getQuantity: () => quantity,
    getTotal: () => price * quantity
  };
}

/**
 * Initialize social share/like actions
 */
function initSocialActions(product) {
  const data = product.data || {};
  
  // Share product
  window.shareProduct = async function() {
    const shareData = {
      title: data.name || 'Check out this product',
      text: data.description || '',
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Share cancelled or failed');
    }
  };
  
  // Toggle like/save
  window.toggleLike = function(btn) {
    btn.classList.toggle('liked');
    const svg = btn.querySelector('svg');
    
    if (btn.classList.contains('liked')) {
      svg.setAttribute('fill', '#FF6B6B');
      svg.setAttribute('stroke', '#FF6B6B');
    } else {
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
    }
  };
}

/**
 * Initialize back button
 */
function initBackButton() {
  const backBtn = document.getElementById('backBtn');
  if (!backBtn) return;
  
  backBtn.addEventListener('click', () => {
    // Check if there's a history state to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Navigate to collection page
      const urlParts = window.location.pathname.split('/');
      urlParts.pop(); // Remove product slug
      window.location.href = urlParts.join('/') || '/';
    }
  });
}

/**
 * Show toast notification
 */
function showToast(message, duration = 2000) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    animation: fadeInUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOutDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
