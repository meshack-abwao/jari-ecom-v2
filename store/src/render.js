import { state } from './state.js';
import { renderPortfolioBookingTemplate } from './templates/portfolioBooking.js';
import { renderDeepDive as renderDeepDiveTemplate } from './templates/deep-dive/index.js';
import { renderVisualMenu as renderVisualMenuTemplate } from './templates/visual-menu/index.js';
import { renderQuickDecision as renderQuickDecisionTemplate } from './templates/quick-decision/index.js';
import { renderEventLanding as renderEventLandingTemplate } from './templates/event-landing/index.js';

// ===========================================
// HEADER
// ===========================================
export function renderHeader() {
  const { store } = state;
  const logoText = store.logo_text || store.name?.charAt(0) || '🛍️';
  const heroPhotoUrl = store.hero?.photo_url;
  const headerBgUrl = store.hero?.background_url;
  
  const headerStyle = headerBgUrl 
    ? `background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${headerBgUrl}'); background-size: cover; background-position: center;`
    : '';
  
  return `
    <header class="header" style="${headerStyle}">
      <div class="header-content">
        ${heroPhotoUrl 
          ? `<img src="${heroPhotoUrl}" alt="${store.name}" class="logo-image" style="width:72px;height:72px;border-radius:50%;object-fit:cover;margin-bottom:12px;">`
          : `<div class="logo">${logoText}</div>`
        }
        <h1 class="business-name">${store.hero?.title || store.name || 'Store'}</h1>
        <p class="tagline">${store.hero?.subtitle || store.tagline || ''}</p>
        ${renderHeroCTAs(store.hero)}
      </div>
    </header>
  `;
}

function renderHeroCTAs(hero) {
  if (!hero) return '';
  
  const primary = hero.cta_primary;
  const secondary = hero.cta_secondary;
  
  if (!primary?.text && !secondary?.text) return '';
  
  return `
    <div class="hero-ctas" style="display:flex;gap:12px;margin-top:16px;">
      ${primary?.text ? `<a href="${primary.link || '#'}" class="btn btn-primary" style="padding:10px 20px;font-size:14px;">${primary.text}</a>` : ''}
      ${secondary?.text ? `<a href="${secondary.link || '#'}" class="btn btn-secondary" style="padding:10px 20px;font-size:14px;">${secondary.text}</a>` : ''}
    </div>
  `;
}

// ===========================================
// FOOTER - Simple V1-style
// ===========================================
export function renderFooter() {
  const { store } = state;
  const policies = store.policies || {};
  const hasAnyPolicy = policies.privacy || policies.terms || policies.refund;
  
  return `
    <footer class="store-footer">
      <p class="powered-by">Powered by <a href="https://jarisolutionsecom.store" target="_blank" rel="noopener">jarisolutionsecom.store</a></p>
      ${hasAnyPolicy ? `
        <div class="policy-links">
          ${policies.privacy ? `<button class="store-policy-link" data-store-policy="privacy">Privacy Policy</button>` : ''}
          ${policies.terms ? `<button class="store-policy-link" data-store-policy="terms">Terms of Service</button>` : ''}
          ${policies.refund ? `<button class="store-policy-link" data-store-policy="refund">Refund Policy</button>` : ''}
        </div>
      ` : ''}
    </footer>
    ${renderStorePolicyModals(policies)}
  `;
}

function renderStorePolicyModals(policies) {
  if (!policies) return '';
  
  return `
    ${policies.privacy ? `
      <div class="modal-overlay" id="privacyPolicyModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="privacyPolicyModal">✕</button>
          <h3>🔒 Privacy Policy</h3>
          <div class="policy-text">${policies.privacy}</div>
          <button class="btn btn-secondary modal-close-btn" data-close="privacyPolicyModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${policies.terms ? `
      <div class="modal-overlay" id="termsPolicyModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="termsPolicyModal">✕</button>
          <h3>📋 Terms of Service</h3>
          <div class="policy-text">${policies.terms}</div>
          <button class="btn btn-secondary modal-close-btn" data-close="termsPolicyModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${policies.refund ? `
      <div class="modal-overlay" id="refundPolicyModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="refundPolicyModal">✕</button>
          <h3>↩️ Refund Policy</h3>
          <div class="policy-text">${policies.refund}</div>
          <button class="btn btn-secondary modal-close-btn" data-close="refundPolicyModal">Close</button>
        </div>
      </div>
    ` : ''}
  `;
}

// ===========================================
// PRODUCTS GRID (Collections View)
// ===========================================
export function renderProductsGrid(products) {
  const { store } = state;
  
  if (!products || products.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h2>No Products Available</h2>
        <p>Check back soon!</p>
      </div>
    `;
  }
  
  // Get categories from store config
  const categories = store.categories || [];
  const collectionTitle = store.collection_title || 'Shop All Products';
  const collectionSubtitle = store.collection_subtitle || '';
  
  // Build category filter HTML
  const categoryFilterHTML = categories.length > 0 ? `
    <div class="category-filters">
      <button class="category-pill active" data-category="all">All</button>
      ${categories.map(cat => `
        <button class="category-pill" data-category="${cat.name}">${cat.emoji} ${cat.name}</button>
      `).join('')}
    </div>
  ` : '';
  
  return `
    <div class="collections-container">
      <div class="collections-header">
        <h2>${collectionTitle}</h2>
        <p>${collectionSubtitle || `${products.length} ${products.length === 1 ? 'Product' : 'Products'} Available`}</p>
      </div>
      ${categoryFilterHTML}
      <div class="collections-grid">
        ${products.map(product => renderProductCard(product)).join('')}
      </div>
    </div>
    ${renderStoreTestimonials()}
  `;
}

function renderProductCard(product) {
  const data = product.data || {};
  const media = product.media || {};
  const images = media.images || [];
  const cardImages = images.slice(0, 2); // Max 2 images
  const price = data.price || 0;
  const description = data.description || '';
  const name = data.name || 'Product';
  const template = product.template || 'quick-decision';
  
  // Portfolio-booking: show "From" price and "View" button
  const isPortfolio = template === 'portfolio-booking';
  const packages = data.packages || [];
  const startingPrice = isPortfolio && packages.length > 0
    ? Math.min(...packages.map(p => parseInt(p.price || 0)))
    : parseInt(price);
  
  // Build gallery HTML
  const hasMultiple = cardImages.length > 1;
  const galleryHTML = cardImages.length > 0 
    ? `<div class="card-gallery" data-index="0">
        ${cardImages.map((img, i) => `<img src="${img}" alt="${name}" class="card-gallery-img ${i === 0 ? 'active' : ''}" data-img-index="${i}" loading="lazy">`).join('')}
        ${hasMultiple ? `<div class="card-gallery-dots">${cardImages.map((_, i) => `<span class="card-dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></span>`).join('')}</div>` : ''}
       </div>`
    : '<div class="image-placeholder">📸</div>';
  
  // Button text and price display based on template
  const btnText = isPortfolio ? 'View →' : 'Get This Now';
  const priceDisplay = isPortfolio 
    ? `<span class="price-from">From</span> <span class="currency">KES</span> <span class="amount">${startingPrice.toLocaleString()}</span>`
    : `<span class="currency">KES</span> <span class="amount">${parseInt(price).toLocaleString()}</span>`;
  
  return `
    <div class="collection-card" data-product-id="${product.id}">
      <div class="collection-image">
        ${galleryHTML}
        <div class="collection-overlay">
          <h3 class="collection-name">${name}</h3>
          <p class="collection-price">${priceDisplay}</p>
        </div>
      </div>
      <div class="collection-content">
        <p class="collection-description">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
        <button class="collection-btn">${btnText}</button>
      </div>
    </div>
  `;
}

// Store Testimonials
function renderStoreTestimonials() {
  const { store } = state;
  if (!store.show_testimonials || !store.testimonials?.length) return '';
  
  const testimonials = store.testimonials.filter(t => t.quote?.trim() || t.text?.trim());
  if (testimonials.length === 0) return '';
  
  return `
    <div class="testimonials-section">
      <div class="testimonials-header">
        <h4>Testimonials</h4>
        <p class="section-title">What Our Customers Say</p>
      </div>
      <div class="testimonials-scroll">
        ${testimonials.map(t => {
          const name = t.name || t.author || 'Customer';
          const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
          const avatarUrl = t.avatar || t.image;
          const avatarContent = avatarUrl 
            ? `<img src="${avatarUrl}" alt="${name}">`
            : initials;
          return `
          <div class="testimonial-card">
            <div class="testimonial-stars">${'★'.repeat(t.rating || 5)}</div>
            <p class="testimonial-text">"${t.quote || t.text}"</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">${avatarContent}</div>
              <div class="testimonial-author-info">
                <span class="testimonial-author-name">${name}</span>
                <span class="testimonial-author-label">${t.role || 'Verified Buyer'}</span>
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    </div>
  `;
}

// ===========================================
// SINGLE PRODUCT VIEW - DISPATCHER
// ===========================================
export function renderSingleProduct(product) {
  const template = product.template || 'quick-decision';
  
  console.log(`[Render] Loading template: ${template} for product:`, product.data?.name);
  
  switch (template) {
    case 'portfolio-booking': return renderPortfolioBookingTemplate(product);
    case 'visual-menu': return renderVisualMenuTemplate(product);
    case 'deep-dive': return renderDeepDiveTemplate(product);
    case 'event-landing': return renderEventLandingTemplate(product);
    case 'quick-decision':
    default: 
      return renderQuickDecisionTemplate(product);
  }
}

// ===========================================
// ALL TEMPLATES NOW ISOLATED IN /templates/
// - Quick Decision: /templates/quick-decision/
// - Visual Menu: /templates/visual-menu/
// - Deep Dive: /templates/deep-dive/
// - Event Landing: /templates/event-landing/
// - Portfolio-Booking: /templates/portfolioBooking.js
// 
// Shared components are in /shared/
// ===========================================

// ===========================================
// ERROR
// ===========================================
export function renderError(message) {
  return `
    <div class="error-screen">
      <div class="error-icon">⚠️</div>
      <h2>Store Not Found</h2>
      <p>${message || 'This store doesn\'t exist or has been deactivated.'}</p>
    </div>
  `;
}
