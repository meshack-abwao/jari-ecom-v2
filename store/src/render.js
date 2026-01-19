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
// OLD TEMPLATES REMOVED - Now isolated in /templates/
// - Quick Decision: /templates/quick-decision/
// - Visual Menu: /templates/visual-menu/
// - Deep Dive: /templates/deep-dive/
// ===========================================

// ===========================================
// TEMPLATE: EVENT LANDING
// ===========================================
function renderEventLanding(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const tickets = data.tickets || [];
  const testimonials = data.testimonials || [];
  const policies = data.policies || {};
  const showBackButton = products.length > 1;
  
  let formattedDate = '';
  if (data.eventDate) {
    try { formattedDate = new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } 
    catch (e) { formattedDate = data.eventDate; }
  }
  
  return `
    ${showBackButton ? '<button class="back-btn" id="backBtn">← Back to All Events</button>' : ''}
    <div class="product-container">
      <div class="product-card">
        ${renderGallery(media.images || [])}
        ${(media.stories || []).length > 0 ? renderStories(media.stories, data.storyTitle || 'Event Highlights') : ''}
        
        <div class="product-info">
          <h2 class="product-name">${data.name || 'Event'}</h2>
          
          <div class="event-details">
            ${formattedDate ? `<div class="event-detail"><span class="detail-icon">📅</span><span>${formattedDate}</span></div>` : ''}
            ${data.eventTime ? `<div class="event-detail"><span class="detail-icon">⏰</span><span>${data.eventTime}</span></div>` : ''}
            ${data.venue ? `<div class="event-detail"><span class="detail-icon">📍</span><span>${data.venue}</span></div>` : ''}
            ${data.venueAddress ? `<div class="event-detail venue-address"><span>${data.venueAddress}</span></div>` : ''}
          </div>
          
          <p class="product-description">${data.description || ''}</p>
          
          ${tickets.length > 0 ? `
            <div class="tickets-section">
              <h3 class="section-title">🎟️ Tickets</h3>
              ${tickets.map((ticket, i) => `
                <div class="ticket-card ${i === 0 ? 'featured' : ''}">
                  <div class="ticket-header">
                    <span class="ticket-name">${ticket.name}</span>
                    <span class="ticket-price">KES ${parseInt(ticket.price || 0).toLocaleString()}</span>
                  </div>
                  ${ticket.description ? `<p class="ticket-description">${ticket.description}</p>` : ''}
                  ${ticket.available ? `<p class="ticket-available">${ticket.available} spots left</p>` : ''}
                  <button class="ticket-select-btn" data-price="${ticket.price}" data-name="${ticket.name}">Get Tickets</button>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="price-display">
              <span class="price-label">Starting From</span>
              <div class="price">KES <span id="displayPrice">${parseInt(data.price || 0).toLocaleString()}</span></div>
            </div>
            <button class="buy-btn" id="buyBtn"><span class="btn-text">🎟️ Get Tickets</span><span class="btn-arrow">→</span></button>
          `}
          
          ${testimonials.length > 0 ? renderTestimonials(testimonials) : ''}
          ${renderProductPolicyLinks(policies)}
        </div>
      </div>
    </div>
    ${renderStoryViewer(media.stories || [])}
    ${renderProductPolicyModals(policies)}
  `;
}

// ===========================================
// SHARED COMPONENTS
// ===========================================

function renderQuantitySection(price, stock) {
  return `
    <div class="quantity-section">
      <label class="quantity-label">Quantity</label>
      <div class="quantity-controls">
        <button class="quantity-btn" id="qtyMinus" disabled>−</button>
        <span class="quantity-value" id="qtyValue">1</span>
        <button class="quantity-btn" id="qtyPlus" ${stock <= 1 ? 'disabled' : ''}>+</button>
      </div>
    </div>
    <div class="total-section">
      <span class="total-label">Total</span>
      <div class="total-price">KES <span id="totalValue">${parseInt(price).toLocaleString()}</span></div>
    </div>
  `;
}

function renderGallery(images) {
  if (!images || images.length === 0) {
    return `<div class="product-gallery"><div class="main-image-container"><div class="image-placeholder" style="height:100%;display:flex;align-items:center;justify-content:center;">📸</div></div></div>`;
  }
  
  const showNav = images.length > 1;
  
  return `
    <div class="product-gallery">
      <div class="main-image-container">
        <img src="${images[0]}" alt="Product" class="main-image" id="mainImage">
        ${showNav ? `
          <button class="gallery-nav prev" id="galleryPrev">‹</button>
          <button class="gallery-nav next" id="galleryNext">›</button>
          <div class="gallery-counter"><span id="galleryIndex">1</span> / ${images.length}</div>
        ` : ''}
      </div>
      ${showNav ? `
        <div class="thumbnails">
          ${images.map((img, i) => `<img src="${img}" alt="" class="thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}">`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderStories(stories, title = 'See it in Action') {
  if (!stories || stories.length === 0) return '';
  
  return `
    <div class="stories-section">
      <h3 class="stories-title">${title}</h3>
      <div class="stories-row">
        ${stories.map((story, i) => `
          <div class="story-bubble" data-story-index="${i}">
            <img src="${story.url}" alt="Story ${i + 1}">
            ${story.type === 'video' ? '<span class="story-play">▶</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderStoryViewer(stories) {
  if (!stories || stories.length === 0) return '';
  
  return `
    <div class="story-viewer" id="storyViewer">
      <div class="story-content">
        <div class="story-progress-container">
          ${stories.map(() => `<div class="story-progress-bar"><div class="story-progress-fill"></div></div>`).join('')}
        </div>
        <button class="story-close-btn" id="storyClose">✕</button>
        <img src="" alt="Story" class="story-image" id="storyImage">
        <div class="story-nav-left" id="storyPrev"></div>
        <div class="story-nav-right" id="storyNext"></div>
      </div>
    </div>
  `;
}

function renderTestimonials(testimonials) {
  if (!testimonials || testimonials.length === 0) return '';
  const filtered = testimonials.filter(t => t.text?.trim());
  if (filtered.length === 0) return '';
  
  return `
    <div class="testimonials-section">
      <div class="testimonials-header">
        <h4>Testimonials</h4>
        <p class="section-title">What Our Customers Say</p>
      </div>
      <div class="testimonials-scroll">
        ${filtered.map(t => {
          const name = t.author || 'Customer';
          const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
          const avatarUrl = t.avatar || t.image;
          const avatarContent = avatarUrl 
            ? `<img src="${avatarUrl}" alt="${name}">`
            : initials;
          return `
          <div class="testimonial-card">
            <div class="testimonial-stars">${'★'.repeat(t.rating || 5)}</div>
            <p class="testimonial-text">"${t.text}"</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">${avatarContent}</div>
              <div class="testimonial-author-info">
                <span class="testimonial-author-name">${name}</span>
                <span class="testimonial-author-label">Verified Buyer</span>
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    </div>
  `;
}

// Product-level policies (delivery, returns, payment)
function renderProductPolicyLinks(policies) {
  if (!policies) return '';
  const { delivery, returns, payment } = policies;
  if (!delivery && !returns && !payment) return '';
  
  return `
    <div class="policy-links">
      ${delivery ? `<button class="policy-link" data-policy="delivery">📦 Delivery Info</button>` : ''}
      ${returns ? `<button class="policy-link" data-policy="returns">↩️ Returns</button>` : ''}
      ${payment ? `<button class="policy-link" data-policy="payment">💳 Payment</button>` : ''}
    </div>
  `;
}

function renderProductPolicyModals(policies) {
  if (!policies) return '';
  const { delivery, returns, payment } = policies;
  
  return `
    ${delivery ? `
      <div class="modal-overlay" id="deliveryModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="deliveryModal">✕</button>
          <h3>📦 Delivery Information</h3>
          <p>${delivery}</p>
          <button class="btn btn-secondary modal-close-btn" data-close="deliveryModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${returns ? `
      <div class="modal-overlay" id="returnsModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="returnsModal">✕</button>
          <h3>↩️ Returns Policy</h3>
          <p>${returns}</p>
          <button class="btn btn-secondary modal-close-btn" data-close="returnsModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${payment ? `
      <div class="modal-overlay" id="paymentModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="paymentModal">✕</button>
          <h3>💳 Payment Information</h3>
          <p>${payment}</p>
          <button class="btn btn-secondary modal-close-btn" data-close="paymentModal">Close</button>
        </div>
      </div>
    ` : ''}
  `;
}

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
