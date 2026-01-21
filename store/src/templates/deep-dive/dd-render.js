// ===========================================
// DEEP DIVE TEMPLATE - RENDER
// Apple-inspired premium product template
// Isolated for independent evolution
// ===========================================

import { state } from '../../state.js';
import { formatPrice } from '../../shared/utils.js';
import { renderGallery, renderStories, renderStoryViewer } from '../../shared/media-components.js';
import { renderTestimonials } from '../../shared/testimonials.js';
import { renderProductPolicyLinks, renderProductPolicyModals } from '../../shared/policy-modals.js';
import { renderShowcaseViewer } from './dd-showcase-viewer.js';

/**
 * Render Deep Dive template (premium product page)
 * @param {object} product - Product object
 * @returns {string} HTML string
 */
export function renderDeepDive(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const specifications = data.specifications || [];
  const testimonials = data.testimonials || [];
  const showcaseImages = media.showcaseImages || [];
  const showcaseVideo = media.showcaseVideo || null;
  const policies = data.policies || {};
  const showBackButton = products.length > 1;
  
  // Filter valid specs
  const validSpecs = specifications.filter(s => s.label && s.value);
  // Filter valid showcase images
  const validShowcase = showcaseImages.filter(img => img.url);
  
  return `
    ${showBackButton ? '<button class="back-btn" id="backBtn">← Back to All Products</button>' : ''}
    <div class="product-container template-deep-dive">
      
      <!-- STEP 1: DEFINE - Product Header (Title + Rating) -->
      ${renderDeepDiveHeader(data)}
      
      <!-- STEP 2: LOCATE - Hero Gallery with Dock-style thumbnails -->
      <div class="deep-dive-hero">
        ${renderGallery(media.images || [], { useDots: true })}
      </div>
      
      <!-- STEP 3: PREPARE - Price Row (Inline KES + Share/Like) -->
      <div class="deep-dive-info">
        <div class="price-row">
          <div class="price-group">
            <span class="price-label">From</span>
            <span class="price-currency">KES</span>
            <span class="price-main">${formatPrice(data.price)}</span>
          </div>
          <div class="social-actions">
            <button class="social-btn share-btn" title="Share" onclick="shareProduct()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            <button class="social-btn heart-btn" title="Save" onclick="toggleLike(this)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- STEP 4 & 5: Description + Specs (2-column on desktop) -->
        <div class="dd-content-grid">
          <div class="dd-content-left">
            ${data.description ? `<p class="product-description">${data.description}</p>` : ''}
          </div>
          <div class="dd-content-right">
            ${renderDeepDiveSpecs(validSpecs)}
          </div>
        </div>
      </div>
      
      <!-- STEP 6: Stories (between specs and trust) -->
      ${(media.stories || []).length > 0 ? renderStories(media.stories, data.storyTitle) : ''}
      
      <!-- STEP 7: TRUST - Trust Badges (horizontal) -->
      ${renderTrustBadges(data)}
      
      <!-- STEP 8: What's Included -->
      ${renderWhatsIncluded(data.whatsIncluded)}
      
      <!-- STEP 9: SHOWCASE - Gallery -->
      ${renderDeepDiveShowcase(validShowcase, showcaseVideo, data.showcaseTitle)}
      
      <!-- STEP 10: VALIDATE - Testimonials (LAST) -->
      ${testimonials.length > 0 ? `
        <div class="deep-dive-testimonials">
          ${renderTestimonials(testimonials)}
        </div>
      ` : ''}
      
      ${renderProductPolicyLinks(policies)}
    </div>
    
    <!-- FLOATING CTA -->
    ${renderDeepDiveCTA(data.price)}
    
    ${renderStoryViewer(media.stories || [])}
    ${renderShowcaseViewer(validShowcase, showcaseVideo)}
    ${renderProductPolicyModals(policies)}
  `;
}

/**
 * Render Deep Dive header with title and rating (simplified - social moved to price row)
 */
function renderDeepDiveHeader(data) {
  return `
    <div class="deep-dive-header">
      <h1 class="product-name">${data.name || 'Product'}</h1>
      <div class="header-meta-row">
        <div class="rating-stars">
          ${renderStarSVG(true)}${renderStarSVG(true)}${renderStarSVG(true)}${renderStarSVG(true)}${renderStarSVG(false)}
          <span class="rating-count">4.8</span>
        </div>
        <span class="meta-dot">•</span>
        <span class="stock-badge in-stock">In Stock</span>
      </div>
    </div>
  `;
}

/**
 * Render star SVG
 */
function renderStarSVG(filled = true) {
  const fill = filled ? '#FFD700' : '#E0E0E0';
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="${fill}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
}

/**
 * Render showcase masonry gallery
 */
function renderDeepDiveShowcase(showcaseImages, showcaseVideo, title) {
  if (showcaseImages.length === 0 && !showcaseVideo) return '';
  
  return `
    <div class="deep-dive-showcase">
      <h2 class="showcase-title">${title || 'Gallery'}</h2>
      <div class="showcase-grid">
        ${showcaseVideo ? `
          <div class="showcase-item showcase-large showcase-video" data-type="video" data-src="${showcaseVideo}">
            <video src="${showcaseVideo}" playsinline muted loop></video>
            <div class="showcase-play-overlay">
              <div class="play-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        ` : ''}
        ${showcaseImages.map((img, i) => `
          <div class="showcase-item ${!showcaseVideo && i === 0 ? 'showcase-large' : ''}" data-index="${i}" data-caption="${img.caption || ''}" data-description="${img.description || ''}">
            <img src="${img.url}" alt="${img.caption || ''}" loading="lazy">
            ${img.caption ? `<div class="showcase-overlay"><span class="showcase-caption">${img.caption}</span></div>` : '<div class="showcase-tap-hint"></div>'}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render specifications section - Title INSIDE card for unified look
 */
function renderDeepDiveSpecs(specs) {
  if (!specs || specs.length === 0) return '';
  
  return `
    <div class="deep-dive-specs">
      <div class="specs-card">
        <h3 class="specs-title">Specifications</h3>
        <div class="specs-list">
          ${specs.map(spec => `
            <div class="spec-row">
              <span class="spec-label">${spec.label}</span>
              <span class="spec-value">${spec.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render trust badges - horizontal row with icons
 */
function renderTrustBadges(data) {
  const badges = [];
  
  // Warranty badge
  if (data.warranty) {
    badges.push({ icon: '✓', text: data.warranty });
  }
  
  // Shipping badge (can be set in dashboard)
  if (data.shipping) {
    badges.push({ icon: '🚚', text: data.shipping });
  } else {
    badges.push({ icon: '🚚', text: 'Fast Delivery' });
  }
  
  // Returns badge
  if (data.returns) {
    badges.push({ icon: '↩', text: data.returns });
  } else {
    badges.push({ icon: '↩', text: 'Easy Returns' });
  }
  
  // Secure payment badge
  badges.push({ icon: '🔒', text: 'Secure Payment' });
  
  if (badges.length === 0) return '';
  
  return `
    <div class="deep-dive-trust">
      <div class="trust-badges">
        ${badges.map(b => `
          <div class="trust-badge">
            <span class="badge-icon">${b.icon}</span>
            <span class="badge-text">${b.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render What's Included section
 * Handles both array of items AND single comma-separated string
 */
function renderWhatsIncluded(items) {
  if (!items || items.length === 0) return '';
  
  // Flatten and split: handle both arrays and comma-separated strings
  let allItems = [];
  items.forEach(item => {
    if (item && item.trim()) {
      // If item contains commas, split it into multiple items
      if (item.includes(',')) {
        const splitItems = item.split(',').map(i => i.trim()).filter(i => i);
        allItems.push(...splitItems);
      } else {
        allItems.push(item.trim());
      }
    }
  });
  
  if (allItems.length === 0) return '';
  
  return `
    <div class="deep-dive-included">
      <div class="included-card">
        <h3 class="included-title">What's Included</h3>
        <ul class="included-list">
          ${allItems.map(item => `
            <li class="included-item">
              <span class="included-check">✓</span>
              <span class="included-text">${item}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
}

/**
 * Render floating glass CTA bar
 */
function renderDeepDiveCTA(price) {
  const formattedPrice = formatPrice(price);
  
  return `
    <div class="deep-dive-cta">
      <div class="cta-glass">
        <div class="cta-qty-section">
          <div class="cta-qty-controls">
            <button class="cta-qty-btn minus" onclick="updateQuantity(-1)">−</button>
            <span class="cta-qty-value" id="ctaQtyValue">1</span>
            <button class="cta-qty-btn plus" onclick="updateQuantity(1)">+</button>
          </div>
        </div>
        <div class="cta-price-section">
          <span class="cta-price-currency">KES</span>
          <span class="cta-price-value" id="ctaTotalPrice">${formattedPrice}</span>
        </div>
        <button class="cta-add-btn" id="buyBtn" data-price="${price || 0}">
          Add to Cart
          <svg class="cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13"></path>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}
