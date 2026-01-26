// ===========================================
// EVENT LANDING TEMPLATE - RENDER
// Event/ticket sales template
// Isolated for independent evolution
// ===========================================

import { state } from '../../state.js';
import { renderGallery, renderStories, renderStoryViewer } from '../../shared/media-components.js';
import { renderTestimonials } from '../../shared/testimonials.js';
import { renderProductPolicyLinks, renderProductPolicyModals } from '../../shared/policy-modals.js';
import { renderBreadcrumb, renderProductNav } from '../../render.js';
import { renderRelatedProducts } from '../../shared/related-products.js';

/**
 * Render Event Landing template
 * @param {object} product - Product object
 * @returns {string} HTML string
 */
export function renderEventLanding(product) {
  const { products } = state;
  const data = product.data || {};
  const media = product.media || {};
  const tickets = data.tickets || [];
  const testimonials = data.testimonials || [];
  const policies = data.policies || {};
  const showBackButton = products.length > 1;
  
  let formattedDate = '';
  if (data.eventDate) {
    try { 
      formattedDate = new Date(data.eventDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }); 
    } catch (e) { 
      formattedDate = data.eventDate; 
    }
  }
  
  return `
    ${renderBreadcrumb(product)}
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
          
          ${tickets.length > 0 ? renderTicketsSection(tickets) : renderSimplePrice(data.price)}
          
          ${testimonials.length > 0 ? renderTestimonials(testimonials) : ''}
          
          <!-- Related Events -->
          ${renderRelatedProducts(product, 'event-landing')}
          
          <!-- Product Navigation (Bottom) -->
          ${renderProductNav(product)}
          
          ${renderProductPolicyLinks(policies)}
        </div>
      </div>
    </div>
    ${renderStoryViewer(media.stories || [])}
    ${renderProductPolicyModals(policies)}
  `;
}

/**
 * Render tickets section for events with multiple ticket types
 */
function renderTicketsSection(tickets) {
  return `
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
  `;
}

/**
 * Render simple price display for events without ticket tiers
 */
function renderSimplePrice(price) {
  return `
    <div class="price-display">
      <span class="price-label">Starting From</span>
      <div class="price">KES <span id="displayPrice">${parseInt(price || 0).toLocaleString()}</span></div>
    </div>
    <button class="buy-btn" id="buyBtn">
      <span class="btn-text">🎟️ Get Tickets</span>
      <span class="btn-arrow">→</span>
    </button>
  `;
}
