// ===========================================
// PORTFOLIO-BOOKING EVENT HANDLERS
// Isolated - prefix: pbk
// ===========================================
import { state } from '../state.js';

let currentImageIndex = 0;
let heroImages = []; // Store image objects with captions

// Initialize handlers when template loads
export function initPortfolioBookingHandlers() {
  const product = state.currentProduct;
  if (!product) return;
  
  // Load hero images with captions
  const heroDataEl = document.getElementById('pbkHeroData');
  if (heroDataEl) {
    try {
      heroImages = JSON.parse(heroDataEl.textContent);
    } catch (e) {
      heroImages = (product.media?.images || []).map(url => ({ url, caption: '' }));
    }
  } else {
    heroImages = (product.media?.images || []).map(url => ({ url, caption: '' }));
  }
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
  
  // Gallery items -> Lightbox
  document.querySelectorAll('.pbk-gallery-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      window.openPbkLightbox(index);
    });
  });
}

// Gallery navigation
function navigateGallery(direction) {
  if (heroImages.length <= 1) return;
  currentImageIndex = (currentImageIndex + direction + heroImages.length) % heroImages.length;
  goToImage(currentImageIndex);
}

function goToImage(index) {
  currentImageIndex = index;
  const img = heroImages[index];
  
  // Update image
  const mainImg = document.getElementById('pbkMainImage');
  if (mainImg) mainImg.src = img.url || img;
  
  // Update caption with intelligent text splitting (like Deep Dive lightbox)
  const captionEl = document.getElementById('pbkHeroCaption');
  const descEl = document.getElementById('pbkHeroDesc');
  const overlayEl = document.getElementById('pbkHeroOverlay');
  if (captionEl && overlayEl) {
    const caption = img.caption || '';
    const description = img.description || '';
    
    if (caption || description) {
      // Caption with text split
      if (caption) {
        const words = caption.split(' ');
        if (words.length > 1) {
          const lastWord = words.pop();
          const firstPart = words.join(' ');
          captionEl.innerHTML = `<span class="caption-light">${firstPart}</span> <span class="caption-bold">${lastWord}</span>`;
        } else {
          captionEl.textContent = caption;
        }
      } else {
        captionEl.textContent = '';
      }
      
      // Description
      if (descEl) descEl.textContent = description;
      
      overlayEl.style.display = '';
    } else {
      captionEl.textContent = '';
      if (descEl) descEl.textContent = '';
      overlayEl.style.display = 'none';
    }
  }
  
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

// Lightbox functions
let lightboxImages = [];
let lightboxIndex = 0;

window.openPbkLightbox = function(index) {
  const product = state.currentProduct;
  lightboxImages = product?.media?.showcaseImages || [];
  lightboxIndex = index;
  
  const lightbox = document.getElementById('pbkLightbox');
  const img = document.getElementById('pbkLightboxImg');
  const caption = document.getElementById('pbkLightboxCaption');
  
  if (lightbox && img && lightboxImages[index]) {
    img.src = lightboxImages[index].url;
    caption.textContent = lightboxImages[index].caption || '';
    caption.style.display = lightboxImages[index].caption ? '' : 'none';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closePbkLightbox = function() {
  const lightbox = document.getElementById('pbkLightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.pbkLightboxNav = function(direction) {
  if (lightboxImages.length <= 1) return;
  lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
  
  const img = document.getElementById('pbkLightboxImg');
  const caption = document.getElementById('pbkLightboxCaption');
  
  if (img && lightboxImages[lightboxIndex]) {
    img.src = lightboxImages[lightboxIndex].url;
    caption.textContent = lightboxImages[lightboxIndex].caption || '';
    caption.style.display = lightboxImages[lightboxIndex].caption ? '' : 'none';
  }
};
