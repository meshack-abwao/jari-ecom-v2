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
  
  // Gallery navigation (buttons)
  document.getElementById('pbkPrevImg')?.addEventListener('click', () => navigateGallery(-1));
  document.getElementById('pbkNextImg')?.addEventListener('click', () => navigateGallery(1));
  
  // Touch swipe support for hero images
  const heroImage = document.querySelector('.pbk-hero-image');
  if (heroImage && heroImages.length > 1) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    heroImage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    heroImage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left -> next image
          navigateGallery(1);
        } else {
          // Swipe right -> prev image
          navigateGallery(-1);
        }
      }
    }, { passive: true });
  }
  
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
  
  // Sticky CTA - stop at footer
  initStickyCTABehavior();
}

// Sticky CTA behavior - stops before footer
function initStickyCTABehavior() {
  const stickyCTA = document.querySelector('.pbk-sticky-cta');
  const footer = document.querySelector('.site-footer') || document.querySelector('footer');
  
  if (!stickyCTA || !footer) return;
  
  const handleScroll = () => {
    const footerRect = footer.getBoundingClientRect();
    const ctaHeight = stickyCTA.offsetHeight;
    const windowHeight = window.innerHeight;
    const bottomOffset = 20; // Same as CSS bottom value
    
    // When footer is about to enter viewport
    if (footerRect.top < windowHeight) {
      // Calculate how much footer is visible
      const footerVisibleHeight = windowHeight - footerRect.top;
      // Move CTA up by that amount + some padding
      const newBottom = footerVisibleHeight + bottomOffset;
      stickyCTA.style.bottom = `${newBottom}px`;
      stickyCTA.style.transition = 'bottom 0.15s ease';
    } else {
      // Reset to normal position
      stickyCTA.style.bottom = '';
      stickyCTA.style.transition = '';
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  // Initial check
  handleScroll();
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

// Story viewer state
let storyData = [];
let currentStoryIndex = 0;
let storyTimer = null;

// Story viewer - Instagram-style with auto-progress
function openStoryViewer(index) {
  const storiesDataEl = document.getElementById('pbkStoriesData');
  if (storiesDataEl) {
    try {
      storyData = JSON.parse(storiesDataEl.textContent);
    } catch (e) {
      storyData = state.currentProduct?.media?.stories || [];
    }
  } else {
    storyData = state.currentProduct?.media?.stories || [];
  }
  
  if (storyData.length === 0) return;
  
  currentStoryIndex = index;
  const viewer = document.getElementById('pbkStoryViewer');
  if (viewer) {
    viewer.classList.add('active');
    showStory(currentStoryIndex);
  }
}

function showStory(index) {
  if (index < 0 || index >= storyData.length) {
    closePbkStoryViewer();
    return;
  }
  
  currentStoryIndex = index;
  const story = storyData[index];
  
  // Update image
  const img = document.getElementById('pbkStoryImage');
  if (img) img.src = story.url || story.thumbnail;
  
  // Update label
  const label = document.getElementById('pbkStoryLabel');
  if (label) label.textContent = story.label || '';
  
  // Update progress bars
  document.querySelectorAll('.pbk-story-progress-bar').forEach((bar, i) => {
    bar.classList.remove('active', 'completed');
    if (i < index) bar.classList.add('completed');
    if (i === index) bar.classList.add('active');
  });
  
  // Auto-advance timer
  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => {
    if (currentStoryIndex < storyData.length - 1) {
      showStory(currentStoryIndex + 1);
    } else {
      closePbkStoryViewer();
    }
  }, 5000);
}

window.closePbkStoryViewer = function() {
  clearTimeout(storyTimer);
  const viewer = document.getElementById('pbkStoryViewer');
  if (viewer) viewer.classList.remove('active');
};

window.pbkStoryNav = function(direction) {
  clearTimeout(storyTimer);
  const newIndex = currentStoryIndex + direction;
  if (newIndex >= 0 && newIndex < storyData.length) {
    showStory(newIndex);
  } else if (newIndex >= storyData.length) {
    closePbkStoryViewer();
  }
};

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
  btn.classList.toggle('liked');
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
