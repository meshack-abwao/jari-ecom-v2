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
      
      <!-- PRODUCT HEADER - Above Image -->
      ${renderDeepDiveHeader(data)}
      
      <!-- HERO GALLERY -->
      <div class="deep-dive-hero">
        ${renderGallery(media.images || [])}
      </div>
      
      <!-- PRICE + DESCRIPTION -->
      <div class="deep-dive-info">
        <div class="price-row">
          <span class="price-currency">KES</span>
          <span class="price-main">${formatPrice(data.price)}</span>
        </div>
        ${data.description ? `<p class="product-description">${data.description}</p>` : ''}
      </div>
      
      <!-- STORIES (if present) -->
      ${(media.stories || []).length > 0 ? `
        <div class="deep-dive-stories">
          ${renderStories(media.stories, data.storyTitle)}
        </div>
      ` : ''}
      
      <!-- SHOWCASE MASONRY GALLERY -->
      ${renderDeepDiveShowcase(validShowcase, showcaseVideo, data.showcaseTitle)}
      
      <!-- SPECIFICATIONS -->
      ${renderDeepDiveSpecs(validSpecs)}
      
      <!-- WARRANTY -->
      ${data.warranty ? `
        <div class="deep-dive-warranty">
          <span class="warranty-icon">✓</span>
          <span class="warranty-text">${data.warranty}</span>
        </div>
      ` : ''}
      
      <!-- TESTIMONIALS -->
      ${testimonials.length > 0 ? `
        <div class="deep-dive-testimonials">
          ${renderTestimonials(testimonials)}
        </div>
      ` : ''}
      
      ${renderProductPolicyLinks(policies)}
    </div>
    
    <!-- FLOATING GLASS CTA -->
    ${renderDeepDiveCTA(data.price)}
    
    ${renderStoryViewer(media.stories || [])}
    ${renderShowcaseViewer(validShowcase, showcaseVideo)}
    ${renderProductPolicyModals(policies)}
  `;
}

/**
 * Render Deep Dive header with title, stars, and social actions
 */
function renderDeepDiveHeader(data) {
  return `
    <div class="deep-dive-header">
      <h1 class="product-name">${data.name || 'Product'}</h1>
      <div class="header-meta-row">
        <div class="meta-left">
          <div class="rating-stars">
            ${renderStarSVG(true)}${renderStarSVG(true)}${renderStarSVG(true)}${renderStarSVG(true)}${renderStarSVG(false)}
            <span class="rating-count">4.8</span>
          </div>
          <span class="meta-dot">•</span>
          <span class="stock-badge in-stock">In Stock</span>
        </div>
        <div class="social-actions">
          <button class="social-btn share-btn" title="Share" onclick="shareProduct()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
          <button class="social-btn heart-btn" title="Save" onclick="toggleLike(this)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
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
 * Render specifications section
 */
function renderDeepDiveSpecs(specs) {
  if (!specs || specs.length === 0) return '';
  
  return `
    <div class="deep-dive-specs">
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
          <span class="cta-price-value" id="ctaTotalPrice">${formattedPrice}</span>
          <span class="cta-price-currency">KES</span>
        </div>
        <button class="cta-add-btn" id="buyBtn" data-price="${price || 0}">
          Add →
        </button>
      </div>
    </div>
  `;
}
