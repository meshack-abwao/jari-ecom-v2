import { state } from './state.js';
import { renderPortfolioBookingTemplate } from './templates/portfolioBooking.js';
import { renderDeepDive as renderDeepDiveTemplate } from './templates/deep-dive/index.js';
import { renderVisualMenu as renderVisualMenuTemplate } from './templates/visual-menu/index.js';
import { renderQuickDecision as renderQuickDecisionTemplate } from './templates/quick-decision/index.js';
import { renderEventLanding as renderEventLandingTemplate } from './templates/event-landing/index.js';

// ===========================================
// BREADCRUMB NAVIGATION
// Kalbach: Location breadcrumbs show position in hierarchy
// Apple: Unified sticky pill with back button
// ===========================================
export function renderBreadcrumb(product = null) {
  const { store, products } = state;
  const storeName = store?.name || 'Store';
  
  // Don't show breadcrumb if only one product (no navigation needed)
  if (!product || products.length <= 1) return '';
  
  const productName = product?.data?.name || 'Product';
  const category = product?.data?.category || null;
  
  // Find category info if exists
  const categoryInfo = category && store?.categories?.find(c => c.name === category);
  const categoryEmoji = categoryInfo?.emoji || '';
  
  return `
    <div class="store-breadcrumb-wrapper">
      <div class="store-breadcrumb-pill">
        <!-- Back Button - Left -->
        <button class="breadcrumb-back" onclick="window.showCollection()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span>Back</span>
        </button>
        
        <!-- Breadcrumb Trail - Right -->
        <nav class="breadcrumb-trail" aria-label="Breadcrumb">
          <a href="#" onclick="window.showCollection(); return false;">${storeName}</a>
          <span class="breadcrumb-separator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </span>
          ${category ? `
            <a href="#" onclick="window.filterByCategory('${category}'); return false;">${categoryEmoji} ${category}</a>
            <span class="breadcrumb-separator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </span>
          ` : ''}
          <span class="breadcrumb-current">${productName}</span>
        </nav>
      </div>
    </div>
  `;
}

// ===========================================
// PRODUCT NAVIGATION (Prev/Next)
// Kalbach: Sequential navigation for browsing
// ===========================================
export function renderProductNav(product = null) {
  const { products } = state;
  
  // Need at least 2 products for navigation
  if (!product || products.length <= 1) return '';
  
  const currentIndex = products.findIndex(p => p.id === product.id);
  if (currentIndex === -1) return '';
  
  const prevProduct = currentIndex > 0 ? products[currentIndex - 1] : null;
  const nextProduct = currentIndex < products.length - 1 ? products[currentIndex + 1] : null;
  const total = products.length;
  const current = currentIndex + 1;
  
  return `
    <div class="product-nav">
      <button class="product-nav-btn ${!prevProduct ? 'disabled' : ''}" 
              onclick="${prevProduct ? `window.viewRelatedProduct('${prevProduct.id}')` : ''}"
              ${!prevProduct ? 'disabled' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span>Prev</span>
      </button>
      
      <span class="product-nav-counter">${current} of ${total}</span>
      
      <button class="product-nav-btn ${!nextProduct ? 'disabled' : ''}" 
              onclick="${nextProduct ? `window.viewRelatedProduct('${nextProduct.id}')` : ''}"
              ${!nextProduct ? 'disabled' : ''}>
        <span>Next</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  `;
}

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
    <div class="hero-ctas" style="display:flex;justify-content:center;gap:10px;margin-top:16px;">
      <a href="${whatsappLink}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;font-size:13px;font-weight:500;background:#25D366;border:none;border-radius:20px;color:#fff;text-decoration:none;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>
      <a href="${callLink}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;font-size:13px;font-weight:500;background:rgba(255,255,255,0.9);border:none;border-radius:20px;color:#222;text-decoration:none;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        Call
      </a>
    </div>
  `;
}

// ===========================================
// FOOTER - Enhanced with Kalbach Navigation
// Contact, Social, Quick Links, Back to Top
// ===========================================
export function renderFooter() {
  const { store } = state;
  const policies = store.policies || {};
  const hasAnyPolicy = policies.privacy || policies.terms || policies.refund;
  const phone = store.contact_phone;
  const instagram = store.instagram_handle;
  const storeName = store.name || 'Store';
  
  // Clean phone for links
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '';
  const callLink = cleanPhone ? `tel:${cleanPhone}` : '';
  const instagramLink = instagram ? `https://instagram.com/${instagram.replace('@', '')}` : '';
  
  return `
    <footer class="store-footer-enhanced">
      <div class="footer-container">
        <!-- Back to Top -->
        <button class="footer-back-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
          <span>Back to top</span>
        </button>
        
        <!-- Store Info -->
        <div class="footer-brand">
          <span class="footer-store-name">${storeName}</span>
        </div>
        
        <!-- Contact & Social Row -->
        ${(phone || instagram) ? `
        <div class="footer-contact-row">
          ${whatsappLink ? `
            <a href="${whatsappLink}" target="_blank" class="footer-contact-pill" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          ` : ''}
          ${callLink ? `
            <a href="${callLink}" class="footer-contact-pill" aria-label="Call">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <span>Call</span>
            </a>
          ` : ''}
          ${instagramLink ? `
            <a href="${instagramLink}" target="_blank" class="footer-contact-pill" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span>Instagram</span>
            </a>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- Policy Links -->
        ${hasAnyPolicy ? `
        <div class="footer-policy-links">
          ${policies.privacy ? `<button class="store-policy-link" data-store-policy="privacy">Privacy</button>` : ''}
          ${policies.terms ? `<button class="store-policy-link" data-store-policy="terms">Terms</button>` : ''}
          ${policies.refund ? `<button class="store-policy-link" data-store-policy="refund">Refunds</button>` : ''}
        </div>
        ` : ''}
        
        <!-- Powered By -->
        <p class="footer-powered">Powered by <a href="https://jarisolutionsecom.store" target="_blank" rel="noopener">jari.ecom</a></p>
      </div>
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
