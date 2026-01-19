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
        ${renderHeroCTAs(store.hero, store)}
      </div>
    </header>
  `;
}

function renderHeroCTAs(hero, store) {
  // Use store contact info for WhatsApp and Call
  const phone = store?.contact_phone;
  const storeName = store?.name || 'this store';
  
  if (!phone) return '';
  
  // Clean phone number for links
  const cleanPhone = phone.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi! I'm interested in ${storeName}`)}`;
  const callLink = `tel:${cleanPhone}`;
  
  return `
    <div class="hero-ctas" style="display:flex;gap:12px;margin-top:16px;">
      <a href="${whatsappLink}" target="_blank" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:12px 20px;font-size:14px;background:#25D366;border:none;border-radius:24px;color:#fff;text-decoration:none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>
      <a href="${callLink}" class="btn btn-secondary" style="display:inline-flex;align-items:center;gap:8px;padding:12px 20px;font-size:14px;background:rgba(0,0,0,0.08);border:none;border-radius:24px;color:var(--text-primary);text-decoration:none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        Call
      </a>
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
