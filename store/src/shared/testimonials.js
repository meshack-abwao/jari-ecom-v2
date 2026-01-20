// ===========================================
// SHARED TESTIMONIALS COMPONENT
// Extracted from render.js for template isolation
// Used by: All templates
// ===========================================

import { getInitials } from './utils.js';

/**
 * Render testimonials section (product-level)
 * Unified card style - title INSIDE card
 * @param {object[]} testimonials - Array of testimonial objects
 * @returns {string} HTML string
 */
export function renderTestimonials(testimonials) {
  if (!testimonials || testimonials.length === 0) return '';
  
  const filtered = testimonials.filter(t => t.text?.trim());
  if (filtered.length === 0) return '';
  
  return `
    <div class="testimonials-section">
      <div class="testimonials-card">
        <h3 class="testimonials-title">What Customers Say</h3>
        <div class="testimonials-scroll">
          ${filtered.map(t => renderTestimonialCard(t)).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a single testimonial card
 * @param {object} testimonial - Testimonial object
 * @returns {string} HTML string
 */
export function renderTestimonialCard(testimonial) {
  const name = testimonial.author || testimonial.name || 'Customer';
  const initials = getInitials(name);
  const avatarUrl = testimonial.avatar || testimonial.image;
  const text = testimonial.text || testimonial.quote || '';
  const rating = testimonial.rating || 5;
  const role = testimonial.role || 'Verified Buyer';
  
  const avatarContent = avatarUrl 
    ? `<img src="${avatarUrl}" alt="${name}">`
    : initials;
  
  return `
    <div class="testimonial-card">
      <div class="testimonial-stars">${'★'.repeat(rating)}</div>
      <p class="testimonial-text">"${text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${avatarContent}</div>
        <div class="testimonial-author-info">
          <span class="testimonial-author-name">${name}</span>
          <span class="testimonial-author-label">${role}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render store-level testimonials (used on collection page)
 * @param {object} store - Store object with testimonials array
 * @returns {string} HTML string
 */
export function renderStoreTestimonials(store) {
  if (!store?.show_testimonials || !store?.testimonials?.length) return '';
  
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
          const initials = getInitials(name);
          const avatarUrl = t.avatar || t.image;
          const avatarContent = avatarUrl 
            ? `<img src="${avatarUrl}" alt="${name}">`
            : initials;
          const text = t.quote || t.text;
          const rating = t.rating || 5;
          const role = t.role || 'Verified Buyer';
          
          return `
            <div class="testimonial-card">
              <div class="testimonial-stars">${'★'.repeat(rating)}</div>
              <p class="testimonial-text">"${text}"</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">${avatarContent}</div>
                <div class="testimonial-author-info">
                  <span class="testimonial-author-name">${name}</span>
                  <span class="testimonial-author-label">${role}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Render menu-style testimonials (grid layout, outside card)
 * Used by Visual Menu template
 * @param {object[]} testimonials - Array of testimonial objects
 * @returns {string} HTML string
 */
export function renderMenuTestimonials(testimonials) {
  if (!testimonials || testimonials.length === 0) return '';
  const filtered = testimonials.filter(t => t.text?.trim());
  if (filtered.length === 0) return '';
  
  return `
    <section class="testimonials-section">
      <h3 class="testimonials-title">Customer Reviews</h3>
      <div class="testimonials-grid">
        ${filtered.map(t => {
          const name = t.author || 'Happy Customer';
          const avatarUrl = t.image || t.avatar;
          const initial = name.charAt(0).toUpperCase();
          
          return `
            <div class="testimonial-card">
              ${avatarUrl 
                ? `<div class="testimonial-avatar-wrapper"><img src="${avatarUrl}" alt="${name}"></div>` 
                : `<div class="testimonial-avatar-placeholder">${initial}</div>`
              }
              <p class="testimonial-quote">"${t.text}"</p>
              <div class="testimonial-author">
                <span class="testimonial-name">${name}</span>
                ${t.role ? `<span class="testimonial-role">${t.role}</span>` : ''}
              </div>
              <div class="testimonial-rating">★★★★★</div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}
