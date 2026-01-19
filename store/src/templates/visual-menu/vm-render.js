// ===========================================
// VISUAL MENU TEMPLATE - RENDER
// Food/restaurant menu template
// Isolated for independent evolution
// ===========================================

import { state } from '../../state.js';
import { formatPrice } from '../../shared/utils.js';
import { renderStories, renderStoryViewer } from '../../shared/media-components.js';
import { renderProductPolicyLinks, renderProductPolicyModals } from '../../shared/policy-modals.js';
import { renderQuantitySection } from '../../shared/quantity-controls.js';

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
  const showBackButton = products.length > 1;
  
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
            <div class="price"><span class="currency">KES</span> <span id="displayPrice">${formatPrice(data.price)}</span></div>
            <div class="menu-meta-inline">
              ${data.prepTime ? `<span class="meta-item">⏱️ ${data.prepTime}</span>` : ''}
              ${data.calories ? `<span class="meta-item">🔥 ${data.calories}</span>` : ''}
            </div>
          </div>
          
          ${renderDietaryTags(dietaryTags)}
          
          ${stories.length > 0 ? renderStories(stories, data.storyTitle || 'INDULGE') : ''}
          
          <p class="product-description">${data.description || ''}</p>
          
          ${renderIngredientsSection(data.ingredients)}
          
          ${data.allergens ? `<p class="allergens-notice">⚠️ Allergens: ${data.allergens}</p>` : ''}
          
          ${renderQuantitySection(data.price || 0, data.stock || 999)}
          
          <button class="buy-btn" id="buyBtn"><span class="btn-text">Add to Order</span><span class="btn-arrow">→</span></button>
          ${renderProductPolicyLinks(policies)}
        </div>
      </div>
      
      ${renderMenuTestimonials(testimonials)}
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
 * Render ingredients section
 */
function renderIngredientsSection(ingredients) {
  if (!ingredients) return '';
  
  return `
    <div class="ingredients-section">
      <h4 class="ingredients-title">Ingredients</h4>
      <p class="ingredients-list">${ingredients}</p>
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
