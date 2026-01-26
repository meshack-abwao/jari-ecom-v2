// ===========================================
// RELATED PRODUCTS COMPONENT
// Kalbach: Associative navigation for upsell
// Template-aware: Different messaging per JTBD
// Apple-style horizontal scroll
// ===========================================

import { state } from '../state.js';
import { formatPrice } from './utils.js';

/**
 * Get template-specific configuration
 * Based on Jobs-to-Be-Done for each template type
 */
function getTemplateConfig(template) {
  const configs = {
    'deep-dive': {
      sectionTitle: 'You might also like',
      cardClass: 'related-card-premium',
      ctaText: 'View Details',
      showPrice: true,
      pricePrefix: '',
      showDescription: true,
      descriptionLength: 60
    },
    'visual-menu': {
      sectionTitle: 'More from the menu',
      cardClass: 'related-card-food',
      ctaText: 'View Item',
      showPrice: true,
      pricePrefix: '',
      showDescription: false,
      showPrepTime: true,
      showDietaryTags: true
    },
    'portfolio-booking': {
      sectionTitle: 'Other services',
      cardClass: 'related-card-service',
      ctaText: 'Learn More',
      showPrice: true,
      pricePrefix: 'From ',
      showDescription: true,
      descriptionLength: 50
    },
    'quick-decision': {
      sectionTitle: 'More products',
      cardClass: 'related-card-quick',
      ctaText: 'Get This',
      showPrice: true,
      pricePrefix: '',
      showDescription: false
    }
  };
  
  return configs[template] || configs['quick-decision'];
}

/**
 * Render related products section
 * @param {object} currentProduct - Current product being viewed
 * @param {string} template - Current template type
 * @param {number} limit - Max products to show (default: 6)
 * @returns {string} HTML string
 */
export function renderRelatedProducts(currentProduct, template = 'quick-decision', limit = 6) {
  const { products } = state;
  
  // Need at least 2 products for related section
  if (!products || products.length < 2) return '';
  
  const currentId = currentProduct?.id;
  const currentCategory = currentProduct?.data?.category;
  const config = getTemplateConfig(template);
  
  // Filter related products:
  // 1. Same category (priority)
  // 2. Other products (fallback)
  // 3. Exclude current product
  let relatedProducts = products
    .filter(p => p.id !== currentId)
    .sort((a, b) => {
      // Prioritize same category
      const aMatch = a.data?.category === currentCategory ? 1 : 0;
      const bMatch = b.data?.category === currentCategory ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
  
  if (relatedProducts.length === 0) return '';
  
  return `
    <section class="related-products">
      <h3 class="related-products-title">${config.sectionTitle}</h3>
      <div class="related-products-scroll">
        ${relatedProducts.map(product => renderRelatedCard(product, config)).join('')}
      </div>
    </section>
  `;
}

/**
 * Render single related product card
 * Template-aware styling and content
 */
function renderRelatedCard(product, config) {
  const data = product.data || {};
  const media = product.media || {};
  const images = media.images || [];
  const imageUrl = images[0] || '';
  const name = data.name || 'Product';
  const price = parseInt(data.price || 0);
  const description = data.description || '';
  const template = product.template || 'quick-decision';
  
  // For portfolio-booking, get starting price from packages
  let displayPrice = price;
  if (template === 'portfolio-booking' && data.packages?.length > 0) {
    displayPrice = Math.min(...data.packages.map(p => parseInt(p.price || 0)));
  }
  
  // Build description snippet
  const descSnippet = config.showDescription && description
    ? `<p class="related-card-desc">${description.substring(0, config.descriptionLength)}${description.length > config.descriptionLength ? '...' : ''}</p>`
    : '';
  
  // Build meta info (prep time, dietary tags for VM)
  let metaHTML = '';
  if (config.showPrepTime && data.prepTime) {
    metaHTML += `<span class="related-card-meta">⏱️ ${data.prepTime}</span>`;
  }
  if (config.showDietaryTags && data.dietaryTags?.length > 0) {
    const tags = data.dietaryTags.slice(0, 2).map(tag => {
      const icons = { 'vegetarian': '🥬', 'vegan': '🌱', 'spicy': '🌶️', 'halal': '☪️' };
      return icons[tag] || '';
    }).filter(Boolean).join(' ');
    if (tags) metaHTML += `<span class="related-card-tags">${tags}</span>`;
  }
  
  return `
    <article class="related-card ${config.cardClass}" data-product-id="${product.id}" onclick="window.viewRelatedProduct('${product.id}')">
      <div class="related-card-image">
        ${imageUrl 
          ? `<img src="${imageUrl}" alt="${name}" loading="lazy">`
          : `<div class="related-card-placeholder">📦</div>`
        }
      </div>
      <div class="related-card-content">
        <h4 class="related-card-name">${name}</h4>
        ${descSnippet}
        ${metaHTML ? `<div class="related-card-meta-row">${metaHTML}</div>` : ''}
        <div class="related-card-footer">
          ${config.showPrice ? `
            <span class="related-card-price">${config.pricePrefix}KES ${formatPrice(displayPrice)}</span>
          ` : ''}
          <span class="related-card-cta">${config.ctaText} →</span>
        </div>
      </div>
    </article>
  `;
}
