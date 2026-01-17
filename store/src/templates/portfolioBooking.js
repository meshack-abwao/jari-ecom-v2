// ===========================================
// TEMPLATE: PORTFOLIO-BOOKING
// Isolated - Does NOT share code with other templates
// CSS prefix: pbk-
// ===========================================
import { state } from '../state.js';

export function renderPortfolioBookingTemplate(product) {
  const { products, store } = state;
  const data = product.data || {};
  const media = product.media || {};
  const packages = data.packages || [];
  const testimonials = data.testimonials || [];
  const showBackButton = products.length > 1;
  
  const startingPrice = packages.length > 0 
    ? Math.min(...packages.map(p => parseInt(p.price || 0)))
    : parseInt(data.price || 0);

  const whatsappLink = store?.contact_phone 
    ? `https://wa.me/${store.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in ${data.name || 'your service'}`)}`
    : null;

  return `
    ${showBackButton ? '<button class="pbk-back-btn" id="backBtn">← Back to Services</button>' : ''}
    
    <div class="pbk-container">
      <!-- Header -->
      <div class="pbk-header">
        <h1 class="pbk-title">${data.name || 'Service'}</h1>
        <div class="pbk-meta">
          <div class="pbk-rating">${renderPbkStars(4.8)} <span>4.8</span></div>
          <div class="pbk-actions">
            <button class="pbk-action-btn" onclick="sharePbk()">↗</button>
            <button class="pbk-action-btn" onclick="likePbk(this)">♡</button>
          </div>
        </div>
      </div>

      <!-- Hero Media -->
      <div class="pbk-hero">
        ${renderPbkHero(media)}
      </div>

      <!-- Intro -->
      <div class="pbk-intro">
        <div class="pbk-price-from">Starting from <strong>KES ${startingPrice.toLocaleString()}</strong></div>
        ${data.description ? `<p class="pbk-description">${data.description}</p>` : ''}
      </div>

      <!-- Stories (if any) -->
      ${media.stories?.length > 0 ? renderPbkStories(media.stories) : ''}

      <!-- Packages -->
      ${packages.length > 0 ? renderPbkPackages(packages) : ''}

      <!-- Testimonials -->
      ${testimonials.length > 0 ? renderPbkTestimonials(testimonials) : ''}

      <!-- Booking Note -->
      ${data.bookingNote ? `<p class="pbk-note">ℹ️ ${data.bookingNote}</p>` : ''}
    </div>

    <!-- Sticky CTA - Glass Style -->
    <div class="pbk-sticky-cta">
      <div class="pbk-cta-glass">
        <div class="pbk-cta-price">
          <span class="pbk-cta-label">From</span>
          <span class="pbk-cta-amount">KES ${startingPrice.toLocaleString()}</span>
        </div>
        <div class="pbk-cta-buttons">
          <button class="pbk-cta-book" id="pbkBookBtn">📅 Check Availability</button>
          ${whatsappLink ? `<a href="${whatsappLink}" class="pbk-cta-inquire" target="_blank">💬</a>` : ''}
        </div>
      </div>
    </div>

    <!-- Booking Modal (empty, filled by booking system) -->
    <div id="pbkBookingModal"></div>
  `;
}


// ===========================================
// HELPER FUNCTIONS (pbk- prefixed, isolated)
// ===========================================

function renderPbkStars(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

function renderPbkHero(media) {
  const images = media.images || [];
  if (images.length === 0) {
    return `<div class="pbk-hero-placeholder">📷</div>`;
  }
  
  const mainImage = images[0];
  return `
    <div class="pbk-hero-image">
      <img src="${mainImage}" alt="Service" id="pbkMainImage">
      ${images.length > 1 ? `
        <div class="pbk-hero-nav">
          <button class="pbk-nav-btn" id="pbkPrevImg">‹</button>
          <button class="pbk-nav-btn" id="pbkNextImg">›</button>
        </div>
        <div class="pbk-hero-dots">
          ${images.map((_, i) => `<span class="pbk-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderPbkStories(stories) {
  const valid = stories.filter(s => s.thumbnail || s.url);
  if (valid.length === 0) return '';
  
  return `
    <div class="pbk-stories">
      <h3 class="pbk-section-title">Our Work</h3>
      <div class="pbk-stories-row">
        ${valid.map((story, i) => `
          <div class="pbk-story" data-index="${i}">
            <img src="${story.thumbnail || story.url}" alt="${story.label || ''}">
            ${story.label ? `<span class="pbk-story-label">${story.label}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPbkPackages(packages) {
  return `
    <div class="pbk-packages">
      <h3 class="pbk-section-title">Packages</h3>
      <div class="pbk-packages-grid">
        ${packages.map((pkg, i) => `
          <div class="pbk-package ${i === 0 ? 'pbk-package-featured' : ''}">
            ${i === 0 ? '<span class="pbk-package-badge">Popular</span>' : ''}
            <div class="pbk-package-name">${pkg.name}</div>
            <div class="pbk-package-price">KES ${parseInt(pkg.price || 0).toLocaleString()}</div>
            ${pkg.duration ? `<div class="pbk-package-duration">⏱ ${pkg.duration}</div>` : ''}
            ${pkg.description ? `<p class="pbk-package-desc">${pkg.description}</p>` : ''}
            <button class="pbk-package-btn" data-pkg-index="${i}" data-pkg-name="${pkg.name}" data-pkg-price="${pkg.price}">
              Select Package
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPbkTestimonials(testimonials) {
  const valid = testimonials.filter(t => t.text?.trim());
  if (valid.length === 0) return '';
  
  return `
    <div class="pbk-testimonials">
      <h3 class="pbk-section-title">What Clients Say</h3>
      <div class="pbk-testimonials-grid">
        ${valid.map(t => `
          <div class="pbk-testimonial">
            <p class="pbk-testimonial-text">"${t.text}"</p>
            <div class="pbk-testimonial-author">
              ${t.author || 'Happy Client'}
              ${t.role ? `<span class="pbk-testimonial-role">${t.role}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
