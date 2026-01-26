// ===========================================
// QUICK DECISION TEMPLATE - RENDER
// Default template for simple, impulse purchases
// Isolated for independent evolution
// ===========================================

import { state } from '../../state.js';
import { formatPrice } from '../../shared/utils.js';
import { renderGallery, renderStories, renderStoryViewer } from '../../shared/media-components.js';
import { renderTestimonials } from '../../shared/testimonials.js';
import { renderProductPolicyLinks, renderProductPolicyModals } from '../../shared/policy-modals.js';
import { renderQuantitySection } from '../../shared/quantity-controls.js';
import { renderBreadcrumb, renderProductNav } from '../../render.js';
import { renderRelatedProducts } from '../../shared/related-products.js';

/**
 * Main render function for Quick Decision template
 * @param {object} product - Product data object
 * @returns {string} HTML string
 */
export function renderQuickDecision(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const images = media.images || [];
  const stories = media.stories || [];
  const testimonials = data.testimonials || [];
  const policies = data.policies || {};
  
  const showBackButton = products.length > 1;
  
  return `
    ${renderBreadcrumb(product)}
    ${renderProductNav(product)}
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
      
      <!-- Related Products (Kalbach: Associative Nav) -->
      ${renderRelatedProducts(product, 'quick-decision')}
    </div>
    
    ${renderStoryViewer(stories)}
    ${renderProductPolicyModals(policies)}
  `;
}
