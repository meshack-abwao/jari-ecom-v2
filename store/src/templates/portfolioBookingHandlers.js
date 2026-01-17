// ===========================================
// PORTFOLIO-BOOKING EVENT HANDLERS
// Isolated - prefix: pbk
// ===========================================
import { state } from '../state.js';

let currentImageIndex = 0;
let images = [];

// Initialize handlers when template loads
export function initPortfolioBookingHandlers() {
  const product = state.currentProduct;
  if (!product) return;
  
  images = product.media?.images || [];
  currentImageIndex = 0;
  
  // Gallery navigation
  document.getElementById('pbkPrevImg')?.addEventListener('click', () => navigateGallery(-1));
  document.getElementById('pbkNextImg')?.addEventListener('click', () => navigateGallery(1));
  
  // Dots
  document.querySelectorAll('.pbk-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      goToImage(index);
    });
  });
  
  // Package buttons
  document.querySelectorAll('.pbk-package-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pkgIndex = parseInt(e.target.dataset.pkgIndex);
      const pkgName = e.target.dataset.pkgName;
      const pkgPrice = e.target.dataset.pkgPrice;
      selectPackage(pkgIndex, pkgName, pkgPrice);
    });
  });
  
  // Main CTA button
  document.getElementById('pbkBookBtn')?.addEventListener('click', openBookingModal);
  
  // Back button
  document.getElementById('backBtn')?.addEventListener('click', () => {
    window.history.pushState({}, '', window.location.pathname);
    window.dispatchEvent(new Event('popstate'));
  });
  
  // Stories
  document.querySelectorAll('.pbk-story').forEach(story => {
    story.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      openStoryViewer(index);
    });
  });
}

// Gallery navigation
function navigateGallery(direction) {
  if (images.length <= 1) return;
  currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
  goToImage(currentImageIndex);
}

function goToImage(index) {
  currentImageIndex = index;
  const mainImg = document.getElementById('pbkMainImage');
  if (mainImg) mainImg.src = images[index];
  
  // Update dots
  document.querySelectorAll('.pbk-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// Package selection
function selectPackage(index, name, price) {
  state.booking = state.booking || {};
  state.booking.selectedPackage = { index, name, price: parseInt(price) };
  openBookingModal();
}

// Open booking modal
function openBookingModal() {
  // Will be implemented in Phase 4
  console.log('[PBK] Opening booking modal', state.booking?.selectedPackage);
  
  // For now, trigger a custom event that booking system will listen to
  window.dispatchEvent(new CustomEvent('pbk:openBooking', { 
    detail: { 
      product: state.currentProduct,
      selectedPackage: state.booking?.selectedPackage 
    }
  }));
}

// Story viewer (reuse existing if available, or simple implementation)
function openStoryViewer(index) {
  const stories = state.currentProduct?.media?.stories || [];
  if (stories.length === 0) return;
  
  // Check if global story viewer exists
  if (typeof window.openStoryViewer === 'function') {
    window.openStoryViewer(index);
  } else {
    console.log('[PBK] Story viewer not available, index:', index);
  }
}

// Global helper functions (attached to window for onclick handlers)
window.sharePbk = function() {
  if (navigator.share) {
    navigator.share({
      title: state.currentProduct?.data?.name || 'Service',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  }
};

window.likePbk = function(btn) {
  btn.textContent = btn.textContent === '♡' ? '♥' : '♡';
  btn.style.color = btn.textContent === '♥' ? '#e74c3c' : '';
};
