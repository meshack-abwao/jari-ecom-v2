import { state } from './state.js';

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
      ${heroPhotoUrl 
        ? `<img src="${heroPhotoUrl}" alt="${store.name}" class="logo-image" style="width:72px;height:72px;border-radius:50%;object-fit:cover;margin-bottom:12px;">`
        : `<div class="logo">${logoText}</div>`
      }
      <h1 class="business-name">${store.hero?.title || store.name || 'Store'}</h1>
      <p class="tagline">${store.hero?.subtitle || store.tagline || ''}</p>
      ${renderHeroCTAs(store.hero)}
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
// PRODUCTS GRID (Collections View)
// ===========================================
export function renderProductsGrid(products) {
  if (!products || products.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h2>No Products Available</h2>
        <p>Check back soon!</p>
      </div>
    `;
  }
  
  return `
    <div class="collections-container">
      <div class="collections-header">
        <h2>Shop All Products</h2>
        <p>${products.length} ${products.length === 1 ? 'Product' : 'Products'} Available</p>
      </div>
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
  const mainImage = images[0] || null;
  const price = data.price || 0;
  const description = data.description || '';
  const name = data.name || 'Product';
  
  return `
    <div class="collection-card" data-product-id="${product.id}">
      <div class="collection-image">
        ${mainImage 
          ? `<img src="${mainImage}" alt="${name}" loading="lazy">`
          : '<div class="image-placeholder">📸</div>'
        }
      </div>
      <div class="collection-content">
        <h3 class="collection-name">${name}</h3>
        <p class="collection-description">${description.substring(0, 80)}${description.length > 80 ? '...' : ''}</p>
        <div class="collection-footer">
          <p class="collection-price">KES ${parseInt(price).toLocaleString()}</p>
          <button class="collection-btn">View Details →</button>
        </div>
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
    <div class="store-testimonials">
      <h3 class="testimonials-title">What Our Customers Say</h3>
      <div class="testimonials-scroll">
        ${testimonials.map(t => `
          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"${t.quote || t.text}"</p>
            <p class="testimonial-author">— ${t.name || t.author || 'Customer'}${t.role ? `, ${t.role}` : ''}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ===========================================
// SINGLE PRODUCT VIEW - DISPATCHER
// ===========================================
export function renderSingleProduct(product) {
  const template = product.template || 'quick-decision';
  
  switch (template) {
    case 'portfolio-booking': return renderPortfolioBooking(product);
    case 'visual-menu': return renderVisualMenu(product);
    case 'deep-dive': return renderDeepDive(product);
    case 'event-landing': return renderEventLanding(product);
    default: return renderQuickDecision(product);
  }
}

// ===========================================
// TEMPLATE: QUICK DECISION
// ===========================================
function renderQuickDecision(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const images = media.images || [];
  const stories = media.stories || [];
  const testimonials = data.testimonials || [];
  const policies = data.policies || {};
  
  const showBackButton = products.length > 1;
  
  return `
    ${showBackButton ? '<button class="back-btn" id="backBtn">← Back to All Products</button>' : ''}
    <div class="product-container">
      <div class="product-card">
        ${renderGallery(images)}
        ${stories.length > 0 ? renderStories(stories, data.storyTitle) : ''}
        
        <div class="product-info">
          <div class="product-header">
            <h2 class="product-name">${data.name || 'Product'}</h2>
            <div class="product-actions">
              <button class="action-btn" id="likeBtn" title="Save">🤍</button>
              <button class="action-btn" id="shareBtn" title="Share">📤</button>
            </div>
          </div>
          
          <p class="product-description">${data.description || ''}</p>
          
          ${testimonials.length > 0 ? renderTestimonials(testimonials) : ''}
          
          <div class="price-display">
            <span class="price-label">Price</span>
            <div class="price">KES <span id="displayPrice">${parseInt(data.price || 0).toLocaleString()}</span></div>
          </div>
          
          ${renderQuantitySection(data.price || 0, data.stock || 999)}
          
          <button class="buy-btn" id="buyBtn">
            <span class="btn-text">Buy Now</span>
            <span class="btn-arrow">→</span>
          </button>
          
          ${renderPolicyLinks(policies)}
        </div>
      </div>
    </div>
    
    ${renderStoryViewer(stories)}
    ${renderPolicyModals(policies)}
  `;
}

// ===========================================
// TEMPLATE: PORTFOLIO + BOOKING
// ===========================================
function renderPortfolioBooking(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const packages = data.packages || [];
  const testimonials = data.testimonials || [];
  const policies = data.policies || {};
  const showBackButton = products.length > 1;
  
  return `
    ${showBackButton ? '<button class="back-btn" id="backBtn">← Back to All Services</button>' : ''}
    <div class="product-container">
      <div class="product-card">
        ${renderGallery(media.images || [])}
        ${(media.stories || []).length > 0 ? renderStories(media.stories, data.storyTitle || 'Our Work') : ''}
        
        <div class="product-info">
          <h2 class="product-name">${data.name || 'Service'}</h2>
          <p class="product-description">${data.description || ''}</p>
          
          ${packages.length > 0 ? `
            <div class="packages-section">
              <h3 class="section-title">📦 Service Packages</h3>
              ${packages.map((pkg, i) => `
                <div class="package-card ${i === 0 ? 'featured' : ''}">
                  <div class="package-header">
                    <span class="package-name">${pkg.name}</span>
                    <span class="package-price">KES ${parseInt(pkg.price || 0).toLocaleString()}</span>
                  </div>
                  ${pkg.duration ? `<p class="package-duration">⏱️ ${pkg.duration}</p>` : ''}
                  ${pkg.description ? `<p class="package-description">${pkg.description}</p>` : ''}
                  <button class="package-select-btn" data-price="${pkg.price}">Select Package</button>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="price-display">
              <span class="price-label">Starting From</span>
              <div class="price">KES <span id="displayPrice">${parseInt(data.price || 0).toLocaleString()}</span></div>
            </div>
          `}
          
          ${data.bookingNote ? `<p class="booking-note">ℹ️ ${data.bookingNote}</p>` : ''}
          ${testimonials.length > 0 ? renderTestimonials(testimonials) : ''}
          
          <button class="buy-btn" id="buyBtn"><span class="btn-text">📅 Book Now</span><span class="btn-arrow">→</span></button>
          ${renderPolicyLinks(policies)}
        </div>
      </div>
    </div>
    ${renderStoryViewer(media.stories || [])}
    ${renderPolicyModals(policies)}
  `;
}

// ===========================================
// TEMPLATE: VISUAL MENU
// ===========================================
function renderVisualMenu(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const testimonials = data.testimonials || [];
  const policies = data.policies || {};
  const dietaryTags = data.dietaryTags || [];
  const showBackButton = products.length > 1;
  
  return `
    ${showBackButton ? '<button class="back-btn" id="backBtn">← Back to Menu</button>' : ''}
    <div class="product-container">
      <div class="product-card">
        ${renderGallery(media.images || [])}
        
        <div class="product-info">
          <h2 class="product-name">${data.name || 'Menu Item'}</h2>
          
          ${dietaryTags.length > 0 ? `
            <div class="dietary-tags">
              ${dietaryTags.map(tag => `<span class="dietary-tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          
          <p class="product-description">${data.description || ''}</p>
          
          <div class="menu-meta">
            ${data.prepTime ? `<span class="meta-item">⏱️ ${data.prepTime}</span>` : ''}
            ${data.calories ? `<span class="meta-item">🔥 ${data.calories}</span>` : ''}
          </div>
          
          ${data.allergens ? `<p class="allergens-notice">⚠️ Allergens: ${data.allergens}</p>` : ''}
          ${testimonials.length > 0 ? renderTestimonials(testimonials) : ''}
          
          <div class="price-display">
            <span class="price-label">Price</span>
            <div class="price">KES <span id="displayPrice">${parseInt(data.price || 0).toLocaleString()}</span></div>
          </div>
          
          ${renderQuantitySection(data.price || 0, data.stock || 999)}
          
          <button class="buy-btn" id="buyBtn"><span class="btn-text">🍽️ Order Now</span><span class="btn-arrow">→</span></button>
          ${renderPolicyLinks(policies)}
        </div>
      </div>
    </div>
    ${renderPolicyModals(policies)}
  `;
}

// ===========================================
// TEMPLATE: DEEP DIVE
// ===========================================
function renderDeepDive(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const specifications = data.specifications || [];
  const testimonials = data.testimonials || [];
  const trustBadges = data.trustBadges || [];
  const policies = data.policies || {};
  const showBackButton = products.length > 1;
  
  return `
    ${showBackButton ? '<button class="back-btn" id="backBtn">← Back to All Products</button>' : ''}
    <div class="product-container">
      <div class="product-card">
        ${renderGallery(media.images || [])}
        ${(media.stories || []).length > 0 ? renderStories(media.stories, data.storyTitle) : ''}
        
        <div class="product-info">
          <h2 class="product-name">${data.name || 'Product'}</h2>
          
          ${trustBadges.length > 0 ? `
            <div class="trust-badges">
              ${trustBadges.map(badge => `<span class="trust-badge">✓ ${badge}</span>`).join('')}
            </div>
          ` : ''}
          
          <p class="product-description">${data.description || ''}</p>
          
          ${specifications.length > 0 ? `
            <div class="specifications-section">
              <h3 class="section-title">📋 Specifications</h3>
              <table class="specs-table">
                ${specifications.map(spec => `<tr><td class="spec-label">${spec.label}</td><td class="spec-value">${spec.value}</td></tr>`).join('')}
              </table>
            </div>
          ` : ''}
          
          ${data.warranty ? `<div class="warranty-section"><h3 class="section-title">🛡️ Warranty</h3><p>${data.warranty}</p></div>` : ''}
          ${testimonials.length > 0 ? renderTestimonials(testimonials) : ''}
          
          <div class="price-display">
            <span class="price-label">Price</span>
            <div class="price">KES <span id="displayPrice">${parseInt(data.price || 0).toLocaleString()}</span></div>
          </div>
          
          ${renderQuantitySection(data.price || 0, data.stock || 999)}
          
          <button class="buy-btn" id="buyBtn"><span class="btn-text">Buy Now</span><span class="btn-arrow">→</span></button>
          ${renderPolicyLinks(policies)}
        </div>
      </div>
    </div>
    ${renderStoryViewer(media.stories || [])}
    ${renderPolicyModals(policies)}
  `;
}

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
                  <button class="ticket-select-btn" data-price="${ticket.price}">Get Tickets</button>
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
          ${renderPolicyLinks(policies)}
        </div>
      </div>
    </div>
    ${renderStoryViewer(media.stories || [])}
    ${renderPolicyModals(policies)}
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
      <div class="story-progress">
        ${stories.map(() => `<div class="story-progress-bar"><div class="story-progress-fill"></div></div>`).join('')}
      </div>
      <button class="story-close" id="storyClose">✕</button>
      <img src="" alt="Story" class="story-image" id="storyImage">
      <button class="story-nav prev" id="storyPrev">‹</button>
      <button class="story-nav next" id="storyNext">›</button>
    </div>
  `;
}

function renderTestimonials(testimonials) {
  if (!testimonials || testimonials.length === 0) return '';
  const filtered = testimonials.filter(t => t.text?.trim());
  if (filtered.length === 0) return '';
  
  return `
    <div class="testimonials-section">
      <h3 class="section-title">⭐ Customer Reviews</h3>
      <div class="testimonials-scroll">
        ${filtered.map(t => `
          <div class="testimonial-card">
            <div class="testimonial-stars">${'★'.repeat(t.rating || 5)}${'☆'.repeat(5 - (t.rating || 5))}</div>
            <p class="testimonial-text">"${t.text}"</p>
            <p class="testimonial-author">— ${t.author || 'Customer'}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPolicyLinks(policies) {
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

function renderPolicyModals(policies) {
  if (!policies) return '';
  const { delivery, returns, payment } = policies;
  
  return `
    ${delivery ? `
      <div class="modal-overlay" id="deliveryModal">
        <div class="modal-content">
          <h3>📦 Delivery Information</h3>
          <p>${delivery}</p>
          <button class="modal-close" data-close="deliveryModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${returns ? `
      <div class="modal-overlay" id="returnsModal">
        <div class="modal-content">
          <h3>↩️ Returns Policy</h3>
          <p>${returns}</p>
          <button class="modal-close" data-close="returnsModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${payment ? `
      <div class="modal-overlay" id="paymentModal">
        <div class="modal-content">
          <h3>💳 Payment Information</h3>
          <p>${payment}</p>
          <button class="modal-close" data-close="paymentModal">Close</button>
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
