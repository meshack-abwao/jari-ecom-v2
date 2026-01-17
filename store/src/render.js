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
  
  // Build gallery HTML
  const hasMultiple = cardImages.length > 1;
  const galleryHTML = cardImages.length > 0 
    ? `<div class="card-gallery" data-index="0">
        ${cardImages.map((img, i) => `<img src="${img}" alt="${name}" class="card-gallery-img ${i === 0 ? 'active' : ''}" data-img-index="${i}" loading="lazy">`).join('')}
        ${hasMultiple ? `<div class="card-gallery-dots">${cardImages.map((_, i) => `<span class="card-dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></span>`).join('')}</div>` : ''}
       </div>`
    : '<div class="image-placeholder">📸</div>';
  
  return `
    <div class="collection-card" data-product-id="${product.id}">
      <div class="collection-image">
        ${galleryHTML}
        <div class="collection-overlay">
          <h3 class="collection-name">${name}</h3>
          <p class="collection-price"><span class="currency">KES</span> <span class="amount">${parseInt(price).toLocaleString()}</span></p>
        </div>
      </div>
      <div class="collection-content">
        <p class="collection-description">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
        <button class="collection-btn">Get This Now</button>
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
    case 'portfolio-booking': return renderPortfolioBooking(product);
    case 'visual-menu': return renderVisualMenu(product);
    case 'deep-dive': return renderDeepDive(product);
    case 'event-landing': return renderEventLanding(product);
    case 'quick-decision':
    default: 
      return renderQuickDecision(product);
  }
}

// ===========================================
// TEMPLATE: QUICK DECISION (Default)
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
              <button class="action-btn" id="shareBtn" title="Share">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
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
          
          ${renderProductPolicyLinks(policies)}
        </div>
      </div>
    </div>
    
    ${renderStoryViewer(stories)}
    ${renderProductPolicyModals(policies)}
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
                  <button class="package-select-btn" data-price="${pkg.price}" data-name="${pkg.name}">Select Package</button>
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
          ${renderProductPolicyLinks(policies)}
        </div>
      </div>
    </div>
    ${renderStoryViewer(media.stories || [])}
    ${renderProductPolicyModals(policies)}
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
  const stories = media.stories || [];
  const showBackButton = products.length > 1;
  
  // Dietary tag icons (V1 style)
  const dietaryIcons = {
    'vegetarian': '🥬', 'vegan': '🌱', 'spicy': '🌶️', 'hot': '🔥',
    'gluten-free': '🌾', 'halal': '☪️', 'contains-nuts': '🥜',
    'dairy-free': '🥛', 'nut-free': '🥜', 'organic': '🌿'
  };
  
  const storeName = window.storeData?.store?.storeName || 'Menu';
  
  return `
    ${showBackButton ? `
    <button class="back-btn" id="backBtn">← Back to Menu</button>
    ` : ''}
    <div class="product-container template-menu">
      <div class="product-card food-card">
        ${renderMenuGallery(media.images || [])}
        
        <div class="product-info">
          <div class="product-header">
            <h2 class="product-name">${data.name || 'Menu Item'}</h2>
            <div class="social-actions">
              <button class="social-btn share-btn" id="shareBtn" title="Share">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
              <button class="social-btn like-btn" id="likeBtn" title="Save">🤍</button>
            </div>
          </div>
          <div class="price-meta-row">
            <div class="price"><span class="currency">KES</span> <span id="displayPrice">${parseInt(data.price || 0).toLocaleString()}</span></div>
            <div class="menu-meta-inline">
              ${data.prepTime ? `<span class="meta-item">⏱️ ${data.prepTime}</span>` : ''}
              ${data.calories ? `<span class="meta-item">🔥 ${data.calories}</span>` : ''}
            </div>
          </div>
          
          ${dietaryTags.length > 0 ? `
            <div class="dietary-tags">
              ${dietaryTags.map(tag => {
                const icon = dietaryIcons[tag.toLowerCase()] || '•';
                return `<span class="dietary-tag">${icon} ${tag}</span>`;
              }).join('')}
            </div>
          ` : ''}
          
          ${stories.length > 0 ? renderStories(stories, data.storyTitle || 'INDULGE') : ''}
          
          <p class="product-description">${data.description || ''}</p>
          
          ${data.ingredients ? `
            <div class="ingredients-section">
              <h4 class="ingredients-title">Ingredients</h4>
              <p class="ingredients-list">${data.ingredients}</p>
            </div>
          ` : ''}
          
          ${data.allergens ? `<p class="allergens-notice">⚠️ Allergens: ${data.allergens}</p>` : ''}
          
          ${renderQuantitySection(data.price || 0, data.stock || 999)}
          
          <button class="buy-btn" id="buyBtn"><span class="btn-text">Add to Order</span><span class="btn-arrow">→</span></button>
          ${renderProductPolicyLinks(policies)}
        </div>
      </div>
      
      ${testimonials.length > 0 ? renderMenuTestimonials(testimonials) : ''}
    </div>
    ${renderStoryViewer(stories)}
    ${renderProductPolicyModals(policies)}
  `;
}

// Menu-specific gallery (uses menu-gallery class for desktop CSS targeting)
function renderMenuGallery(images) {
  if (!images || images.length === 0) {
    return `<div class="gallery-column"><div class="menu-gallery"><div class="main-image-container"><div class="image-placeholder" style="height:100%;display:flex;align-items:center;justify-content:center;">📸</div></div></div></div>`;
  }
  
  const showNav = images.length > 1;
  
  return `
    <div class="gallery-column">
      <div class="menu-gallery">
        <div class="main-image-container">
          <img src="${images[0]}" alt="Product" class="main-image" id="mainImage">
          ${showNav ? `
            <button class="gallery-nav prev" id="galleryPrev">‹</button>
            <button class="gallery-nav next" id="galleryNext">›</button>
          ` : ''}
        </div>
      </div>
      ${showNav ? `
        <div class="thumbnail-strip">
          ${images.map((img, i) => `<img src="${img}" alt="" class="thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}">`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Menu-specific testimonials (outside the card, centered)
function renderMenuTestimonials(testimonials) {
  if (!testimonials || testimonials.length === 0) return '';
  const filtered = testimonials.filter(t => t.text?.trim());
  if (filtered.length === 0) return '';
  
  return `
    <section class="testimonials-section">
      <h3 class="testimonials-title">Customer Reviews</h3>
      <div class="testimonials-grid">
        ${filtered.map(t => `
          <div class="testimonial-card">
            ${t.image ? 
              `<div class="testimonial-avatar-wrapper"><img src="${t.image}" alt="${t.author}"></div>` : 
              `<div class="testimonial-avatar-placeholder">${(t.author || 'C').charAt(0).toUpperCase()}</div>`}
            <p class="testimonial-quote">"${t.text}"</p>
            <div class="testimonial-author">
              <span class="testimonial-name">${t.author || 'Happy Customer'}</span>
              ${t.role ? `<span class="testimonial-role">${t.role}</span>` : ''}
            </div>
            <div class="testimonial-rating">★★★★★</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// ===========================================
// TEMPLATE: DEEP DIVE (v2 Apple-Inspired)
// ===========================================
function renderDeepDive(product) {
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
      <div class="deep-dive-header">
        <h1 class="product-name">${data.name || 'Product'}</h1>
        <div class="header-meta-row">
          <div class="meta-left">
            <div class="rating-stars">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#E0E0E0"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
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
      
      <!-- HERO GALLERY -->
      <div class="deep-dive-hero">
        ${renderGallery(media.images || [])}
      </div>
      
      <!-- PRICE + DESCRIPTION -->
      <div class="deep-dive-info">
        <div class="price-row">
          <span class="price-currency">KES</span>
          <span class="price-main">${parseInt(data.price || 0).toLocaleString()}</span>
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
      ${(validShowcase.length > 0 || showcaseVideo) ? `
        <div class="deep-dive-showcase">
          <h2 class="showcase-title">${data.showcaseTitle || 'Gallery'}</h2>
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
            ${validShowcase.map((img, i) => `
              <div class="showcase-item ${!showcaseVideo && i === 0 ? 'showcase-large' : ''}" data-index="${i}" data-caption="${img.caption || ''}" data-description="${img.description || ''}">
                <img src="${img.url}" alt="${img.caption || ''}" loading="lazy">
                ${img.caption ? `<div class="showcase-overlay"><span class="showcase-caption">${img.caption}</span></div>` : '<div class="showcase-tap-hint"></div>'}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- SPECIFICATIONS (clean lines) -->
      ${validSpecs.length > 0 ? `
        <div class="deep-dive-specs">
          <h3 class="specs-title">Specifications</h3>
          <div class="specs-list">
            ${validSpecs.map(spec => `
              <div class="spec-row">
                <span class="spec-label">${spec.label}</span>
                <span class="spec-value">${spec.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- WARRANTY (single line) -->
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
          <span class="cta-price-value" id="ctaTotalPrice">${parseInt(data.price || 0).toLocaleString()}</span>
          <span class="cta-price-currency">KES</span>
        </div>
        <button class="cta-add-btn" id="buyBtn" data-price="${data.price || 0}">
          Add →
        </button>
      </div>
    </div>
    
    ${renderStoryViewer(media.stories || [])}
    ${renderShowcaseViewer(validShowcase, showcaseVideo)}
    ${renderProductPolicyModals(policies)}
  `;
}

// Showcase Fullscreen Viewer (Premium Modal - Magazine Style)
function renderShowcaseViewer(showcaseImages, showcaseVideo) {
  const hasContent = (showcaseImages && showcaseImages.length > 0) || showcaseVideo;
  if (!hasContent) return '';
  
  const totalItems = (showcaseVideo ? 1 : 0) + (showcaseImages?.length || 0);
  
  return `
    <div class="showcase-viewer" id="showcaseViewer">
      <div class="showcase-viewer-backdrop" onclick="closeShowcaseViewer()"></div>
      <div class="showcase-viewer-container">
        <button class="showcase-close" onclick="closeShowcaseViewer()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <!-- Image with Magazine Overlay INSIDE -->
        <div class="showcase-viewer-media">
          <div class="showcase-image-wrapper">
            <img class="showcase-viewer-img" id="showcaseViewerImg" src="" alt="" style="display:none;">
            <video class="showcase-viewer-video" id="showcaseViewerVideo" playsinline controls style="display:none;"></video>
            
            <!-- Magazine-style overlay with caption + description -->
            <div class="showcase-magazine-overlay">
              <span class="showcase-magazine-caption" id="showcaseMagazineCaption"></span>
              <p class="showcase-overlay-description" id="showcaseViewerDescription"></p>
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <div class="showcase-viewer-nav">
          <button class="showcase-nav-arrow prev" onclick="navigateShowcase(-1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span class="showcase-nav-count"><span id="showcaseCurrentIndex">1</span> / ${totalItems}</span>
          <button class="showcase-nav-arrow next" onclick="navigateShowcase(1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
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


// ===========================================
// BOOKING SYSTEM - Calendar & Checkout Flow
// ===========================================

// Render the booking modal with multi-step flow
export function renderBookingModal(product) {
  const data = product?.data || {};
  const packages = data.packages || [];
  const { booking } = state;
  
  return `
    <div class="booking-modal-overlay" id="bookingModal">
      <div class="booking-modal">
        <button class="booking-close" onclick="closeBookingModal()">✕</button>
        
        <!-- Progress Steps -->
        <div class="booking-progress">
          <div class="progress-step ${booking.step >= 1 ? 'active' : ''}" data-step="1">
            <span class="step-number">1</span>
            <span class="step-label">Service</span>
          </div>
          <div class="progress-line ${booking.step >= 2 ? 'active' : ''}"></div>
          <div class="progress-step ${booking.step >= 2 ? 'active' : ''}" data-step="2">
            <span class="step-number">2</span>
            <span class="step-label">Date & Time</span>
          </div>
          <div class="progress-line ${booking.step >= 3 ? 'active' : ''}"></div>
          <div class="progress-step ${booking.step >= 3 ? 'active' : ''}" data-step="3">
            <span class="step-number">3</span>
            <span class="step-label">Details</span>
          </div>
          <div class="progress-line ${booking.step >= 4 ? 'active' : ''}"></div>
          <div class="progress-step ${booking.step >= 4 ? 'active' : ''}" data-step="4">
            <span class="step-number">4</span>
            <span class="step-label">Confirm</span>
          </div>
        </div>
        
        <!-- Step Content Container -->
        <div class="booking-content" id="bookingContent">
          ${renderBookingStep(booking.step, product)}
        </div>
      </div>
    </div>
  `;
}

// Render individual booking step
export function renderBookingStep(step, product) {
  switch(step) {
    case 1: return renderBookingStep1(product);
    case 2: return renderBookingStep2();
    case 3: return renderBookingStep3(product);
    case 4: return renderBookingStep4(product);
    default: return renderBookingStep1(product);
  }
}

// Step 1: Select Service/Package
function renderBookingStep1(product) {
  const data = product?.data || {};
  const packages = data.packages || [];
  const { booking } = state;
  
  // If no packages, use base price
  if (packages.length === 0) {
    return `
      <div class="booking-step step-1">
        <h3 class="step-title">Select Service</h3>
        <div class="service-card selected" data-price="${data.price || 0}" data-name="${data.name || 'Service'}">
          <div class="service-info">
            <span class="service-name">${data.name || 'Service'}</span>
            <span class="service-price">KES ${parseInt(data.price || 0).toLocaleString()}</span>
          </div>
          <div class="service-check">✓</div>
        </div>
        <div class="booking-actions">
          <button class="booking-btn primary" onclick="bookingNextStep()">
            Continue <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="booking-step step-1">
      <h3 class="step-title">Select a Package</h3>
      <div class="packages-list">
        ${packages.map((pkg, i) => `
          <div class="service-card ${booking.selectedPackage?.name === pkg.name ? 'selected' : ''}" 
               data-price="${pkg.price}" 
               data-name="${pkg.name}"
               data-duration="${pkg.duration || ''}"
               onclick="selectPackage(this)">
            <div class="service-info">
              <span class="service-name">${pkg.name}</span>
              ${pkg.duration ? `<span class="service-duration">⏱️ ${pkg.duration}</span>` : ''}
              ${pkg.description ? `<p class="service-desc">${pkg.description}</p>` : ''}
            </div>
            <div class="service-price-col">
              <span class="service-price">KES ${parseInt(pkg.price || 0).toLocaleString()}</span>
              <div class="service-check">✓</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="booking-actions">
        <button class="booking-btn primary" onclick="bookingNextStep()" ${!booking.selectedPackage ? 'disabled' : ''}>
          Continue <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;
}

// Step 2: Select Date & Time
function renderBookingStep2() {
  const { booking } = state;
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  return `
    <div class="booking-step step-2">
      <h3 class="step-title">Pick a Date & Time</h3>
      
      <!-- Calendar -->
      <div class="booking-calendar" id="bookingCalendar" data-month="${currentMonth}" data-year="${currentYear}">
        ${renderCalendarMonth(currentYear, currentMonth)}
      </div>
      
      <!-- Time Slots (shown after date selection) -->
      <div class="time-slots-container" id="timeSlotsContainer" style="${booking.selectedDate ? '' : 'display:none'}">
        <h4 class="slots-title">Available Times</h4>
        <div class="time-slots" id="timeSlots">
          <div class="slots-loading">Loading available times...</div>
        </div>
      </div>
      
      <div class="booking-actions">
        <button class="booking-btn secondary" onclick="bookingPrevStep()">
          <span class="btn-arrow">←</span> Back
        </button>
        <button class="booking-btn primary" onclick="bookingNextStep()" ${!booking.selectedDate || !booking.selectedTime ? 'disabled' : ''}>
          Continue <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;
}

// Render calendar month
export function renderCalendarMonth(year, month) {
  const { booking } = state;
  const blockedDates = booking.blockedDates || [];
  const workingHours = booking.workingHours || [];
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get settings for advance booking
  const settings = booking.settings || {};
  const minNoticeHours = settings.min_notice_hours || 24;
  const maxAdvanceDays = settings.max_advance_days || 30;
  
  const minDate = new Date(today);
  minDate.setHours(minDate.getHours() + minNoticeHours);
  
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
  
  // Build days array
  let days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push('<span class="calendar-day empty"></span>');
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Check if day is working day
    const dayHours = workingHours.find(h => h.day_of_week === dayOfWeek);
    const isWorkingDay = dayHours?.is_working !== false;
    
    // Check if date is blocked
    const isBlocked = blockedDates.some(b => b.date === dateStr);
    
    // Check if date is in valid range
    const isPast = date < minDate;
    const isTooFar = date > maxDate;
    
    // Check if selected
    const isSelected = booking.selectedDate === dateStr;
    const isToday = date.toDateString() === today.toDateString();
    
    let classes = ['calendar-day'];
    if (isPast || isTooFar || !isWorkingDay || isBlocked) classes.push('disabled');
    if (isSelected) classes.push('selected');
    if (isToday) classes.push('today');
    
    const clickable = !isPast && !isTooFar && isWorkingDay && !isBlocked;
    
    days.push(`
      <span class="${classes.join(' ')}" 
            data-date="${dateStr}"
            ${clickable ? `onclick="selectDate('${dateStr}')"` : ''}>
        ${day}
      </span>
    `);
  }
  
  return `
    <div class="calendar-header">
      <button class="calendar-nav" onclick="changeMonth(-1)">‹</button>
      <span class="calendar-title">${monthNames[month]} ${year}</span>
      <button class="calendar-nav" onclick="changeMonth(1)">›</button>
    </div>
    <div class="calendar-weekdays">
      ${dayNames.map(d => `<span>${d}</span>`).join('')}
    </div>
    <div class="calendar-days">
      ${days.join('')}
    </div>
  `;
}

// Render time slots
export function renderTimeSlots(slots) {
  const { booking } = state;
  
  if (!slots || slots.length === 0) {
    return `<div class="no-slots">No available times for this date</div>`;
  }
  
  return slots.map(slot => {
    const isSelected = booking.selectedTime === slot.time;
    const isAvailable = slot.available;
    
    return `
      <button class="time-slot ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}"
              data-time="${slot.time}"
              ${isAvailable ? `onclick="selectTime('${slot.time}')"` : ''}>
        ${slot.time}
        ${!isAvailable ? '<span class="slot-full">Full</span>' : ''}
      </button>
    `;
  }).join('');
}

// Step 3: Customer Details
function renderBookingStep3(product) {
  const { booking, store } = state;
  const settings = booking.settings || {};
  
  return `
    <div class="booking-step step-3">
      <h3 class="step-title">Your Details</h3>
      
      <div class="booking-form">
        <div class="form-group">
          <label for="customerName">Full Name *</label>
          <input type="text" id="customerName" placeholder="John Doe" 
                 value="${booking.customerName || ''}"
                 onchange="updateBookingField('customerName', this.value)">
        </div>
        
        <div class="form-group">
          <label for="customerPhone">Phone Number *</label>
          <input type="tel" id="customerPhone" placeholder="0712 345 678"
                 value="${booking.customerPhone || ''}"
                 onchange="updateBookingField('customerPhone', this.value)">
        </div>
        
        <div class="form-group">
          <label for="customerEmail">Email (optional)</label>
          <input type="email" id="customerEmail" placeholder="john@example.com"
                 value="${booking.customerEmail || ''}"
                 onchange="updateBookingField('customerEmail', this.value)">
        </div>
        
        <div class="form-group">
          <label for="bookingNotes">Additional Notes</label>
          <textarea id="bookingNotes" rows="3" placeholder="Any special requests..."
                    onchange="updateBookingField('notes', this.value)">${booking.notes || ''}</textarea>
        </div>
      </div>
      
      <div class="booking-actions">
        <button class="booking-btn secondary" onclick="bookingPrevStep()">
          <span class="btn-arrow">←</span> Back
        </button>
        <button class="booking-btn primary" onclick="bookingNextStep()" 
                ${!booking.customerName || !booking.customerPhone ? 'disabled' : ''}>
          Review Booking <span class="btn-arrow">→</span>
        </button>
      </div>
    </div>
  `;
}

// Step 4: Review & Confirm
function renderBookingStep4(product) {
  const { booking, store } = state;
  const settings = booking.settings || {};
  const data = product?.data || {};
  
  const selectedPackage = booking.selectedPackage || { name: data.name, price: data.price };
  const price = parseInt(selectedPackage.price || 0);
  
  // Calculate deposit if enabled
  const depositEnabled = settings.deposit_enabled;
  const depositPercentage = settings.deposit_percentage || 20;
  const depositAmount = depositEnabled ? Math.round(price * depositPercentage / 100) : 0;
  
  // Jump the line fee
  const jumpLineEnabled = settings.jump_line_enabled;
  const jumpLineFee = settings.jump_line_fee || 0;
  
  // Format date nicely
  const dateObj = new Date(booking.selectedDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  return `
    <div class="booking-step step-4">
      <h3 class="step-title">Review Your Booking</h3>
      
      <div class="booking-summary">
        <div class="summary-section">
          <h4>📦 Service</h4>
          <p class="summary-value">${selectedPackage.name}</p>
          <p class="summary-price">KES ${price.toLocaleString()}</p>
        </div>
        
        <div class="summary-section">
          <h4>📅 Date & Time</h4>
          <p class="summary-value">${formattedDate}</p>
          <p class="summary-value">${booking.selectedTime}</p>
        </div>
        
        <div class="summary-section">
          <h4>👤 Your Details</h4>
          <p class="summary-value">${booking.customerName}</p>
          <p class="summary-value">${booking.customerPhone}</p>
          ${booking.customerEmail ? `<p class="summary-value">${booking.customerEmail}</p>` : ''}
          ${booking.notes ? `<p class="summary-notes">"${booking.notes}"</p>` : ''}
        </div>
        
        ${depositEnabled ? `
          <div class="summary-section payment-section">
            <h4>💰 Payment</h4>
            <div class="payment-row">
              <span>Service Total</span>
              <span>KES ${price.toLocaleString()}</span>
            </div>
            <div class="payment-row deposit">
              <span>Deposit Required (${depositPercentage}%)</span>
              <span class="deposit-amount">KES ${depositAmount.toLocaleString()}</span>
            </div>
            <div class="payment-row balance">
              <span>Balance (pay on day)</span>
              <span>KES ${(price - depositAmount).toLocaleString()}</span>
            </div>
          </div>
        ` : ''}
        
        ${jumpLineEnabled && jumpLineFee > 0 ? `
          <div class="jump-line-option">
            <label class="jump-line-checkbox">
              <input type="checkbox" id="jumpLineCheck" onchange="toggleJumpLine(this.checked)">
              <span class="checkmark"></span>
              <span class="jump-label">
                ⚡ Jump the Line (+KES ${jumpLineFee.toLocaleString()})
                <small>Skip the wait and get priority booking</small>
              </span>
            </label>
          </div>
        ` : ''}
      </div>
      
      <div class="booking-actions">
        <button class="booking-btn secondary" onclick="bookingPrevStep()">
          <span class="btn-arrow">←</span> Back
        </button>
        <button class="booking-btn primary confirm" onclick="confirmBooking()">
          ${depositEnabled ? `Pay Deposit KES ${depositAmount.toLocaleString()}` : 'Confirm Booking'} <span class="btn-arrow">→</span>
        </button>
      </div>
      
      <p class="booking-note">
        ${store?.contact_phone ? `Questions? Call us at ${store.contact_phone}` : ''}
      </p>
    </div>
  `;
}

// Booking Success Screen
export function renderBookingSuccess(bookingRef) {
  const { booking, store } = state;
  
  return `
    <div class="booking-step booking-success">
      <div class="success-icon">✅</div>
      <h3>Booking Confirmed!</h3>
      <p class="booking-ref">Reference: <strong>${bookingRef}</strong></p>
      
      <div class="success-details">
        <p>📅 ${booking.selectedDate} at ${booking.selectedTime}</p>
        <p>📦 ${booking.selectedPackage?.name || 'Service'}</p>
      </div>
      
      <p class="success-note">
        We've sent a confirmation to ${booking.customerPhone}. 
        You'll receive a reminder before your appointment.
      </p>
      
      ${store?.contact_phone ? `
        <a href="https://wa.me/${store.contact_phone.replace(/\D/g, '')}?text=Hi! I just booked (Ref: ${bookingRef})" 
           class="whatsapp-btn" target="_blank">
          💬 Message Us on WhatsApp
        </a>
      ` : ''}
      
      <button class="booking-btn secondary" onclick="closeBookingModal()">
        Done
      </button>
    </div>
  `;
}
