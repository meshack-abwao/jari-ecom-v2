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
 * Initialize sticky CTA handlers (quantity + add-ons)
 */
function initStickyCTAHandlers(basePrice, maxStock, addOns) {
  const decreaseBtn = document.getElementById('decreaseQty');
  const increaseBtn = document.getElementById('increaseQty');
  const qtyDisplay = document.getElementById('quantity');
  const priceDisplay = document.getElementById('displayPrice');
  const addonItems = document.querySelectorAll('.vm-addon-item');
  
  let quantity = 1;
  let selectedAddOns = [];
  
  function updateDisplay() {
    // Calculate total with add-ons
    const addOnsTotal = selectedAddOns.reduce((sum, addon) => sum + (addon.price || 0), 0);
    const unitPrice = basePrice + addOnsTotal;
    const total = unitPrice * quantity;
    
    if (qtyDisplay) qtyDisplay.textContent = quantity;
    if (priceDisplay) priceDisplay.textContent = total.toLocaleString();
    
    // Store for checkout
    window.JARI_SELECTED_ADDONS = selectedAddOns;
    window.JARI_VM_QUANTITY = quantity;
  }
  
  // Quantity buttons
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
  
  // Add-on selection
  addonItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
      
      const addonData = {
        name: item.querySelector('.vm-addon-name')?.textContent || '',
        price: parseFloat(item.dataset.price || 0),
        index: index
      };
      
      if (item.classList.contains('selected')) {
        selectedAddOns.push(addonData);
      } else {
        selectedAddOns = selectedAddOns.filter(a => a.index !== index);
      }
      
      updateDisplay();
    });
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
