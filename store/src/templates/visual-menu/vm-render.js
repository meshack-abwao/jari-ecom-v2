// ===========================================
// VISUAL MENU TEMPLATE - RENDER
// Food/restaurant menu template
// Isolated for independent evolution
// ===========================================

import { state } from '../../state.js';
import { formatPrice } from '../../shared/utils.js';
import { renderStories, renderStoryViewer } from '../../shared/media-components.js';
import { renderProductPolicyLinks, renderProductPolicyModals } from '../../shared/policy-modals.js';
import { renderProductNav } from '../../render.js';
import { renderRelatedProducts } from '../../shared/related-products.js';

// Dietary tag icons mapping
const DIETARY_ICONS = {
  'vegetarian': '🥬',
  'vegan': '🌱',
  'spicy': '🌶️',
  'hot': '🔥',
  'gluten-free': '🌾',
  'halal': '☪️',
  'contains-nuts': '🥜',
  'dairy-free': '🥛',
  'nut-free': '🥜',
  'organic': '🌿'
};

/**
 * Render Visual Menu template (food/restaurant)
 * @param {object} product - Product object
 * @returns {string} HTML string
 */
export function renderVisualMenu(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const testimonials = data.testimonials || [];
  const policies = data.policies || {};
  const dietaryTags = data.dietaryTags || [];
  const stories = media.stories || [];
  const addOns = data.addOns || [];
  const showBackButton = products.length > 1;
  
  return `
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
            <div class="menu-meta-inline">
              ${data.prepTime ? `<span class="meta-item">⏱️ ${data.prepTime}</span>` : ''}
              ${data.calories ? `<span class="meta-item">🔥 ${data.calories}</span>` : ''}
            </div>
          </div>
          
          ${renderDietaryTags(dietaryTags)}
          
          ${stories.length > 0 ? renderStories(stories, data.storyTitle || 'INDULGE') : ''}
          
          <p class="product-description">${data.description || ''}</p>
          
          ${renderAddOnsSection(addOns)}
          
          ${renderIngredientsSection(data.ingredients)}
          
          ${data.allergens ? `<p class="allergens-notice">⚠️ Allergens: ${data.allergens}</p>` : ''}
          
          ${renderProductPolicyLinks(policies)}
        </div>
      </div>
      
      ${renderMenuTestimonials(testimonials)}
      
      <!-- Related Menu Items (Kalbach: Associative Nav) -->
      ${renderRelatedProducts(product, 'visual-menu')}
      
      <!-- Product Navigation (Bottom) -->
      ${renderProductNav(product)}
      
      <!-- Sticky CTA - PBK Style (Stacked mobile, inline desktop) -->
      <div class="vm-sticky-cta">
        <div class="vm-cta-glass">
          <div class="vm-cta-price-row">
            <span class="vm-cta-label">Total</span>
            <span class="vm-cta-amount">KES <span id="displayPrice">${formatPrice(data.price)}</span></span>
          </div>
          <div class="vm-cta-qty">
            <button class="vm-qty-btn" id="decreaseQty">−</button>
            <span class="vm-qty-value" id="quantity">1</span>
            <button class="vm-qty-btn" id="increaseQty">+</button>
          </div>
          <button class="vm-cta-order" id="buyBtn">Add to Order</button>
        </div>
      </div>
    </div>
    ${renderStoryViewer(stories)}
    ${renderProductPolicyModals(policies)}
  `;
}

/**
 * Render menu-specific gallery
 */
function renderMenuGallery(images) {
  if (!images || images.length === 0) {
    return `
      <div class="gallery-column">
        <div class="menu-gallery">
          <div class="main-image-container">
            <div class="image-placeholder" style="height:100%;display:flex;align-items:center;justify-content:center;">📸</div>
          </div>
        </div>
      </div>
    `;
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
          ${images.map((img, i) => `
            <img src="${img}" alt="" class="thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}">
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render dietary tags
 */
function renderDietaryTags(tags) {
  if (!tags || tags.length === 0) return '';
  
  return `
    <div class="dietary-tags">
      ${tags.map(tag => {
        const icon = DIETARY_ICONS[tag.toLowerCase()] || '•';
        return `<span class="dietary-tag">${icon} ${tag}</span>`;
      }).join('')}
    </div>
  `;
}

/**
 * Render add-ons/extras section with quantity selectors
 */
function renderAddOnsSection(addOns) {
  if (!addOns || addOns.length === 0) return '';
  const validAddOns = addOns.filter(a => a.name?.trim());
  if (validAddOns.length === 0) return '';
  
  return `
    <div class="vm-addons-section">
      <h4 class="vm-addons-title">🍟 Add Extras</h4>
      <div class="vm-addons-grid">
        ${validAddOns.map((addon, i) => `
          <div class="vm-addon-card" data-addon-index="${i}" data-addon-price="${addon.price || 0}" data-addon-name="${addon.name}">
            ${addon.image ? `
              <div class="vm-addon-image">
                <img src="${addon.image}" alt="${addon.name}" />
              </div>
            ` : `
              <div class="vm-addon-image vm-addon-placeholder">
                <span>🍴</span>
              </div>
            `}
            <div class="vm-addon-details">
              <span class="vm-addon-name">${addon.name}</span>
              <span class="vm-addon-price">+KES ${formatPrice(addon.price || 0)}</span>
            </div>
            <div class="vm-addon-qty-controls">
              <button type="button" class="vm-addon-qty-btn vm-addon-decrease" data-index="${i}">−</button>
              <span class="vm-addon-qty-value" data-index="${i}">0</span>
              <button type="button" class="vm-addon-qty-btn vm-addon-increase" data-index="${i}">+</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render ingredients section - Apple specs card style
 */
function renderIngredientsSection(ingredients) {
  if (!ingredients) return '';
  
  // Split by comma and clean up
  const ingredientList = ingredients
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0);
  
  if (ingredientList.length === 0) return '';
  
  return `
    <div class="vm-ingredients-card">
      <h4 class="vm-ingredients-title">
        <span class="vm-ingredients-icon">🥗</span>
        Ingredients
      </h4>
      <div class="vm-ingredients-grid">
        ${ingredientList.map(ingredient => `
          <div class="vm-ingredient-item">
            <span class="vm-ingredient-dot"></span>
            <span class="vm-ingredient-name">${ingredient}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render menu-specific testimonials (grid layout outside card)
 */
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
            ${t.image 
              ? `<div class="testimonial-avatar-wrapper"><img src="${t.image}" alt="${t.author}"></div>` 
              : `<div class="testimonial-avatar-placeholder">${(t.author || 'C').charAt(0).toUpperCase()}</div>`
            }
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
