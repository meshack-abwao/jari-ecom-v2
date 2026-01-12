import { state } from './state.js';

// ===========================================
// HEADER
// ===========================================
export function renderHeader() {
  const { store } = state;
  const logoText = store.logo_text || store.name?.charAt(0) || '🛍️';
  
  return `
    <header class="header">
      <div class="logo">${logoText}</div>
      <h1 class="business-name">${store.name || 'Store'}</h1>
      <p class="tagline">${store.tagline || ''}</p>
    </header>
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
  `;
}

function renderProductCard(product) {
  const data = product.data || {};
  const media = product.media || {};
  const images = media.images || [];
  const mainImage = images[0] || null;
  const price = data.price || 0;
  const description = data.description || product.description || '';
  
  return `
    <div class="collection-card" data-product-id="${product.id}">
      <div class="collection-image">
        ${mainImage 
          ? `<img src="${mainImage}" alt="${product.name}" loading="lazy">`
          : '<div class="image-placeholder">📸</div>'
        }
      </div>
      <div class="collection-content">
        <h3 class="collection-name">${product.name}</h3>
        <p class="collection-description">${description.substring(0, 80)}${description.length > 80 ? '...' : ''}</p>
        <div class="collection-footer">
          <p class="collection-price">KES ${parseInt(price).toLocaleString()}</p>
          <button class="collection-btn">View Details →</button>
        </div>
      </div>
    </div>
  `;
}

// ===========================================
// SINGLE PRODUCT VIEW
// ===========================================
export function renderSingleProduct(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const images = media.images || [];
  const stories = media.stories || [];
  const testimonials = data.testimonials || [];
  const policies = data.policies || {};
  
  const price = data.price || 0;
  const stock = data.stock || 999;
  const description = data.description || product.description || '';
  
  const showBackButton = products.length > 1;
  
  return `
    ${showBackButton ? '<button class="back-btn" id="backBtn">← Back to All Products</button>' : ''}
    <div class="product-container">
      <div class="product-card">
        ${renderGallery(images)}
        ${stories.length > 0 ? renderStories(stories) : ''}
        
        <div class="product-info">
          <div class="product-header">
            <h2 class="product-name">${product.name}</h2>
            <div class="product-actions">
              <button class="action-btn" id="likeBtn" title="Save">🤍</button>
              <button class="action-btn" id="shareBtn" title="Share">📤</button>
            </div>
          </div>
          
          <p class="product-description">${description}</p>
          
          ${testimonials.length > 0 ? renderTestimonials(testimonials) : ''}
          
          <div class="price-display">
            <span class="price-label">Price</span>
            <div class="price">KES <span id="displayPrice">${parseInt(price).toLocaleString()}</span></div>
          </div>
          
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
          
          <button class="buy-btn" id="buyBtn">
            <span class="btn-text">Buy Now</span>
            <span class="btn-arrow">→</span>
          </button>
          
          ${Object.keys(policies).length > 0 ? renderPolicyLinks(policies) : ''}
        </div>
      </div>
    </div>
    
    ${renderStoryViewer(stories)}
    ${renderPolicyModals(policies)}
  `;
}

// ===========================================
// IMAGE GALLERY
// ===========================================
function renderGallery(images) {
  if (!images || images.length === 0) {
    return `
      <div class="product-gallery">
        <div class="main-image-container">
          <div class="image-placeholder" style="height:100%;display:flex;align-items:center;justify-content:center;">📸</div>
        </div>
      </div>
    `;
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
      ${images.length > 1 ? `
        <div class="thumbnail-strip">
          ${images.map((img, i) => `
            <div class="thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}">
              <img src="${img}" alt="Thumbnail ${i + 1}">
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// ===========================================
// STORIES
// ===========================================
function renderStories(stories) {
  if (!stories || stories.length === 0) return '';
  
  return `
    <div class="stories-strip">
      ${stories.map((story, i) => `
        <div class="story-bubble" data-story-index="${i}">
          <div class="story-bubble-inner">
            <img src="${story.thumbnail || story.url}" alt="Story ${i + 1}">
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStoryViewer(stories) {
  if (!stories || stories.length === 0) return '';
  
  return `
    <div class="story-viewer" id="storyViewer">
      <div class="story-progress">
        ${stories.map((_, i) => `
          <div class="story-progress-bar" data-index="${i}">
            <div class="story-progress-fill"></div>
          </div>
        `).join('')}
      </div>
      <div class="story-content">
        <button class="story-close" id="storyClose">×</button>
        <img src="" alt="Story" id="storyImage">
        <button class="story-nav prev" id="storyPrev"></button>
        <button class="story-nav next" id="storyNext"></button>
      </div>
    </div>
  `;
}

// ===========================================
// TESTIMONIALS
// ===========================================
function renderTestimonials(testimonials) {
  if (!testimonials || testimonials.length === 0) return '';
  
  return `
    <div class="testimonials-section">
      <div class="testimonials-header">
        <span>⭐</span>
        <h4>Customer Reviews</h4>
      </div>
      <div class="testimonials-scroll">
        ${testimonials.map(t => `
          <div class="testimonial-card">
            <div class="testimonial-stars">${'★'.repeat(t.rating || 5)}${'☆'.repeat(5 - (t.rating || 5))}</div>
            <p class="testimonial-text">"${t.text}"</p>
            <p class="testimonial-author">— ${t.author}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ===========================================
// POLICY LINKS & MODALS
// ===========================================
function renderPolicyLinks(policies) {
  const links = [];
  if (policies.delivery) links.push('<span class="policy-link" data-policy="delivery">🚚 Delivery</span>');
  if (policies.returns) links.push('<span class="policy-link" data-policy="returns">↩️ Returns</span>');
  if (policies.payment) links.push('<span class="policy-link" data-policy="payment">💳 Payment</span>');
  
  if (links.length === 0) return '';
  
  return `<div class="policy-links">${links.join('')}</div>`;
}

function renderPolicyModals(policies) {
  if (!policies || Object.keys(policies).length === 0) return '';
  
  let modals = '';
  
  if (policies.delivery) {
    modals += `
      <div class="modal-overlay" id="deliveryModal">
        <div class="modal-content">
          <button class="modal-close" data-close="deliveryModal">×</button>
          <h2 class="step-title">🚚 Delivery Info</h2>
          <p style="line-height:1.8;color:var(--text-secondary)">${policies.delivery}</p>
          <button class="btn btn-primary" data-close="deliveryModal" style="margin-top:24px">Got it</button>
        </div>
      </div>
    `;
  }
  
  if (policies.returns) {
    modals += `
      <div class="modal-overlay" id="returnsModal">
        <div class="modal-content">
          <button class="modal-close" data-close="returnsModal">×</button>
          <h2 class="step-title">↩️ Returns Policy</h2>
          <p style="line-height:1.8;color:var(--text-secondary)">${policies.returns}</p>
          <button class="btn btn-primary" data-close="returnsModal" style="margin-top:24px">Got it</button>
        </div>
      </div>
    `;
  }
  
  if (policies.payment) {
    modals += `
      <div class="modal-overlay" id="paymentModal">
        <div class="modal-content">
          <button class="modal-close" data-close="paymentModal">×</button>
          <h2 class="step-title">💳 Payment Options</h2>
          <p style="line-height:1.8;color:var(--text-secondary)">${policies.payment}</p>
          <button class="btn btn-primary" data-close="paymentModal" style="margin-top:24px">Got it</button>
        </div>
      </div>
    `;
  }
  
  return modals;
}

// ===========================================
// ERROR VIEW
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
