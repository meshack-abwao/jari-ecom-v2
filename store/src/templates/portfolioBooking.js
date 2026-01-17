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
      <!-- Header - Premium Typography -->
      <div class="pbk-header">
        <h1 class="pbk-title">${data.name || 'Service'}</h1>
        <div class="pbk-meta">
          <div class="pbk-meta-left">
            <div class="pbk-rating">${renderPbkStars(4.8)}<span class="pbk-rating-count">4.8</span></div>
          </div>
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

      <!-- Gallery (Showcase) - uses showcaseImages or fallback to images -->
      ${renderPbkGallerySection(media, data.galleryTitle)}

      <!-- Why Choose Us -->
      ${data.whyChooseUs ? renderPbkWhyChooseUs(data.whyChooseUs) : ''}

      <!-- Packages -->
      ${packages.length > 0 ? renderPbkPackages(packages) : ''}

      <!-- What's Included -->
      ${data.whatsIncluded ? renderPbkWhatsIncluded(data.whatsIncluded) : ''}

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

// Helper: Intelligent text split for captions (like Deep Dive lightbox)
function splitCaptionText(caption) {
  if (!caption) return '';
  const words = caption.split(' ');
  if (words.length > 1) {
    const lastWord = words.pop();
    const firstPart = words.join(' ');
    return `<span class="caption-light">${firstPart}</span> <span class="caption-bold">${lastWord}</span>`;
  }
  return caption;
}

function renderPbkHero(media) {
  // Use showcaseImages if available (has captions), fallback to images
  const showcaseImages = media.showcaseImages || [];
  const regularImages = media.images || [];
  
  // Prefer showcaseImages for caption support
  const hasShowcase = showcaseImages.length > 0;
  const images = hasShowcase ? showcaseImages : regularImages.map(url => ({ url, caption: '' }));
  
  if (images.length === 0) {
    return `<div class="pbk-hero-placeholder">📷</div>`;
  }
  
  const firstImg = hasShowcase ? images[0].url : images[0];
  const firstCaption = hasShowcase ? images[0].caption : '';
  
  return `
    <div class="pbk-hero-image">
      <img src="${firstImg}" alt="Service" id="pbkMainImage">
      <!-- Caption Overlay with intelligent text split -->
      <div class="pbk-hero-overlay" id="pbkHeroOverlay" ${firstCaption ? '' : 'style="display:none"'}>
        <span class="pbk-hero-caption" id="pbkHeroCaption">${splitCaptionText(firstCaption)}</span>
      </div>
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
    <!-- Store image data for JS -->
    <script id="pbkHeroData" type="application/json">${JSON.stringify(images.map(img => hasShowcase ? img : { url: img, caption: '' }))}</script>
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
            <div class="pbk-story-ring">
              <img src="${story.thumbnail || story.url}" alt="${story.label || ''}">
            </div>
            ${story.label ? `<span class="pbk-story-label">${story.label}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Gallery with masonry grid + lightbox (like Deep Dive showcase)
function renderPbkGallery(images, title) {
  const valid = images.filter(img => img.url);
  if (valid.length === 0) return '';
  
  return `
    <div class="pbk-gallery">
      <h3 class="pbk-section-title">${title || 'Gallery'}</h3>
      <div class="pbk-gallery-grid">
        ${valid.map((img, i) => `
          <div class="pbk-gallery-item ${i === 0 ? 'pbk-gallery-large' : ''}" data-index="${i}">
            <img src="${img.url}" alt="${img.caption || ''}" loading="lazy">
            ${img.caption ? `
              <div class="pbk-gallery-overlay">
                <span class="pbk-gallery-caption">${img.caption}</span>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    ${renderPbkLightbox(valid)}
  `;
}

// Lightbox for gallery
function renderPbkLightbox(images) {
  return `
    <div class="pbk-lightbox" id="pbkLightbox">
      <div class="pbk-lightbox-backdrop" onclick="closePbkLightbox()"></div>
      <div class="pbk-lightbox-content">
        <button class="pbk-lightbox-close" onclick="closePbkLightbox()">✕</button>
        <div class="pbk-lightbox-media">
          <img id="pbkLightboxImg" src="" alt="">
          <div class="pbk-lightbox-caption" id="pbkLightboxCaption"></div>
        </div>
        <div class="pbk-lightbox-nav">
          <button class="pbk-lightbox-prev" onclick="pbkLightboxNav(-1)">‹</button>
          <button class="pbk-lightbox-next" onclick="pbkLightboxNav(1)">›</button>
        </div>
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


// Gallery section wrapper - handles fallback from showcaseImages to images
function renderPbkGallerySection(media, title) {
  // Prefer showcaseImages (has captions), fallback to regular images
  const showcaseImages = media.showcaseImages || [];
  const regularImages = media.images || [];
  
  // Convert regular images to object format if needed
  const images = showcaseImages.length > 0 
    ? showcaseImages 
    : regularImages.slice(1).map(url => ({ url, caption: '' })); // Skip first (hero uses it)
  
  if (images.length === 0) return '';
  
  return renderPbkGallery(images, title);
}

// Why Choose Us section
function renderPbkWhyChooseUs(content) {
  if (!content) return '';
  
  // Support both string and array format
  const items = Array.isArray(content) ? content : [content];
  
  return `
    <div class="pbk-why-choose">
      <h3 class="pbk-section-title">Why Choose Us</h3>
      <div class="pbk-why-content">
        ${items.map(item => {
          if (typeof item === 'string') {
            return `<p class="pbk-why-text">${item}</p>`;
          }
          // Object with icon and text
          return `
            <div class="pbk-why-item">
              ${item.icon ? `<span class="pbk-why-icon">${item.icon}</span>` : ''}
              <span class="pbk-why-text">${item.text || item}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// What's Included section
function renderPbkWhatsIncluded(content) {
  if (!content) return '';
  
  // Support both string and array format
  const items = Array.isArray(content) ? content : [content];
  
  return `
    <div class="pbk-whats-included">
      <h3 class="pbk-section-title">What's Included</h3>
      <ul class="pbk-included-list">
        ${items.map(item => `
          <li class="pbk-included-item">
            <span class="pbk-included-check">✓</span>
            <span class="pbk-included-text">${typeof item === 'string' ? item : item.text || item}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}
