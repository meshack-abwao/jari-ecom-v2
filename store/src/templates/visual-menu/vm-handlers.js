// ===========================================
// VISUAL MENU TEMPLATE - EVENT HANDLERS
// ===========================================

import { initStoryHandlers } from '../../shared/media-components.js';
import { initPolicyModalHandlers } from '../../shared/policy-modals.js';

/**
 * Initialize all Visual Menu template handlers
 * @param {object} product - Product object
 */
export function initVisualMenuHandlers(product) {
  const media = product.media || {};
  const data = product.data || {};
  
  // Gallery handlers
  initMenuGalleryHandlers(media.images || []);
  
  // Story handlers
  initStoryHandlers(media.stories || []);
  
  // Policy modal handlers
  initPolicyModalHandlers();
  
  // Sticky CTA quantity + add-ons handlers
  initStickyCTAHandlers(data.price || 0, data.stock || 999, data.addOns || []);
  
  // Social actions
  initMenuSocialActions(product);
  
  // Back button
  initBackButton();
}

/**
 * Menu-specific gallery handlers
 */
function initMenuGalleryHandlers(images) {
  if (!images || images.length <= 1) return;
  
  let currentIndex = 0;
  const mainImage = document.getElementById('mainImage');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  
  if (!mainImage) return;
  
  function updateGallery(index) {
    currentIndex = index;
    mainImage.src = images[index];
    
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }
  
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const index = parseInt(thumb.dataset.index);
      updateGallery(index);
    });
  });
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      updateGallery(newIndex);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      updateGallery(newIndex);
    });
  }
}

/**
 * Initialize menu social actions
 */
function initMenuSocialActions(product) {
  const shareBtn = document.getElementById('shareBtn');
  const likeBtn = document.getElementById('likeBtn');
  const data = product.data || {};
  
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: data.name || 'Check out this menu item',
        text: data.description || '',
        url: window.location.href
      };
      
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Link copied!');
        }
      } catch (err) {
        console.log('Share cancelled');
      }
    });
  }
  
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('liked');
      likeBtn.textContent = likeBtn.classList.contains('liked') ? '❤️' : '🤍';
    });
  }
}

/**
 * Initialize back button
 */
function initBackButton() {
  const backBtn = document.getElementById('backBtn');
  if (!backBtn) return;
  
  backBtn.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      const urlParts = window.location.pathname.split('/');
      urlParts.pop();
      window.location.href = urlParts.join('/') || '/';
    }
  });
}

/**
 * Initialize sticky CTA handlers (quantity + add-ons with qty selectors)
 */
function initStickyCTAHandlers(basePrice, maxStock, addOns) {
  const decreaseBtn = document.getElementById('decreaseQty');
  const increaseBtn = document.getElementById('increaseQty');
  const qtyDisplay = document.getElementById('quantity');
  const priceDisplay = document.getElementById('displayPrice');
  
  // New: Get addon cards and their controls
  const addonCards = document.querySelectorAll('.vm-addon-card');
  
  let quantity = 1;
  let addonQuantities = {}; // { index: qty }
  
  function updateDisplay() {
    // Calculate add-ons total based on quantities
    let addOnsTotal = 0;
    const selectedAddOns = [];
    
    Object.entries(addonQuantities).forEach(([index, qty]) => {
      if (qty > 0 && addOns[index]) {
        const addon = addOns[index];
        addOnsTotal += (addon.price || 0) * qty;
        selectedAddOns.push({
          name: addon.name,
          price: addon.price || 0,
          quantity: qty,
          subtotal: (addon.price || 0) * qty
        });
      }
    });
    
    const unitPrice = basePrice + addOnsTotal;
    const total = unitPrice * quantity;
    
    if (qtyDisplay) qtyDisplay.textContent = quantity;
    if (priceDisplay) priceDisplay.textContent = total.toLocaleString();
    
    // Store for checkout - include addon quantities
    window.JARI_SELECTED_ADDONS = selectedAddOns;
    window.JARI_VM_QUANTITY = quantity;
    window.JARI_ADDON_QUANTITIES = addonQuantities;
  }
  
  // Main quantity buttons
  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        updateDisplay();
      }
    });
  }
  
  if (increaseBtn) {
    increaseBtn.addEventListener('click', () => {
      if (quantity < maxStock) {
        quantity++;
        updateDisplay();
      }
    });
  }
  
  // Add-on quantity controls
  addonCards.forEach((card) => {
    const index = parseInt(card.dataset.addonIndex);
    const decreaseAddon = card.querySelector('.vm-addon-decrease');
    const increaseAddon = card.querySelector('.vm-addon-increase');
    const qtyValue = card.querySelector('.vm-addon-qty-value');
    
    addonQuantities[index] = 0;
    
    if (decreaseAddon) {
      decreaseAddon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (addonQuantities[index] > 0) {
          addonQuantities[index]--;
          if (qtyValue) qtyValue.textContent = addonQuantities[index];
          card.classList.toggle('has-quantity', addonQuantities[index] > 0);
          updateDisplay();
        }
      });
    }
    
    if (increaseAddon) {
      increaseAddon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (addonQuantities[index] < 10) { // Max 10 per addon
          addonQuantities[index]++;
          if (qtyValue) qtyValue.textContent = addonQuantities[index];
          card.classList.add('has-quantity');
          updateDisplay();
        }
      });
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
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}
