// ===========================================
// TEMPLATE: PORTFOLIO-BOOKING
// Isolated - Does NOT share code with other templates
// CSS prefix: pbk-
// ===========================================
import { state } from '../state.js';
import { renderBreadcrumb } from '../render.js';

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
    ${renderBreadcrumb(product)}
    ${showBackButton ? '<button class="pbk-back-btn" id="backBtn">← Back to Services</button>' : ''}
    
    <div class="pbk-container">
      <!-- ==========================================
           SECTION FLOW (Psychology-Based Reading Path)
           Based on "Grids and Page Layouts" - cinematic sequence
           ========================================== -->
      
      <!-- 1. HEADER - "What is this?" (First impression) -->
      <div class="pbk-header">
        <h1 class="pbk-title">${data.name || 'Service'}</h1>
        <div class="pbk-meta">
          <div class="pbk-rating">${renderPbkStars(4.8)}<span class="pbk-rating-count">4.8</span></div>
        </div>
      </div>

      <!-- 2. HERO - Emotional hook (visual impact) -->
      <div class="pbk-hero">
        ${renderPbkHero(media)}
      </div>

      <!-- 3. INTRO - "Why should I care?" (Value proposition) -->
      <div class="pbk-intro">
        <div class="pbk-intro-row">
          <div class="pbk-price-from">From <strong>KES ${startingPrice.toLocaleString()}</strong></div>
          <div class="pbk-actions">
            <button class="pbk-action-btn" onclick="sharePbk()" title="Share">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
            <button class="pbk-action-btn" onclick="likePbk(this)" title="Like">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Description + What's Included (2-column on desktop, like Deep Dive) -->
        <div class="pbk-content-grid">
          <div class="pbk-content-left">
            ${data.description ? `<p class="pbk-description">${data.description}</p>` : ''}
          </div>
          <div class="pbk-content-right">
            ${data.whatsIncluded ? renderPbkWhatsIncluded(data.whatsIncluded) : ''}
          </div>
        </div>

        <!-- 3.5 TRUST BADGES - "Can I trust this provider?" (JTBD: Build confidence) -->
        <div class="pbk-trust-section">
          <div class="pbk-trust-badges">
            <div class="pbk-trust-badge">
              <span class="pbk-badge-icon">✓</span>
              <span class="pbk-badge-text">Verified Pro</span>
            </div>
            <div class="pbk-trust-badge">
              <span class="pbk-badge-icon">🛡️</span>
              <span class="pbk-badge-text">Secure Booking</span>
            </div>
            <div class="pbk-trust-badge">
              <span class="pbk-badge-icon">💬</span>
              <span class="pbk-badge-text">Quick Response</span>
            </div>
            <div class="pbk-trust-badge">
              <span class="pbk-badge-icon">⭐</span>
              <span class="pbk-badge-text">Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. PACKAGES - "What do I get?" (Decision framework - EARLY!) -->
      ${packages.length > 0 ? renderPbkPackages(packages) : ''}

      <!-- 6. GALLERY - "Is the work good?" (Proof of quality) -->
      ${renderPbkGallerySection(media, data.galleryTitle)}

      <!-- 7. WHY CHOOSE US - "Why you over competitors?" (Differentiators) -->
      ${data.whyChooseUs ? renderPbkWhyChooseUs(data.whyChooseUs) : ''}

      <!-- 8. TESTIMONIALS - "Do others trust this provider?" (Social proof) -->
      ${testimonials.length > 0 ? renderPbkTestimonials(testimonials) : ''}

      <!-- 9. STORIES - "See more examples" (Bonus content - last) -->
      ${media.stories?.length > 0 ? renderPbkStories(media.stories, data.storyTitle) : ''}

      <!-- 10. BOOKING NOTE - Final reassurance -->
      ${data.bookingNote ? `<p class="pbk-note">ℹ️ ${data.bookingNote}</p>` : ''}
    </div>

    <!-- Sticky CTA - Always visible -->
    <div class="pbk-sticky-cta">
      <div class="pbk-cta-glass">
        <div class="pbk-cta-price">
          <span class="pbk-cta-label">From</span>
          <span class="pbk-cta-amount">KES ${startingPrice.toLocaleString()}</span>
        </div>
        <div class="pbk-cta-buttons">
          <button class="pbk-cta-book" id="pbkBookBtn">
            Check Availability
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
          ${whatsappLink ? `<a href="${whatsappLink}" class="pbk-cta-inquire" target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>` : ''}
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
// Stacks light word(s) on top, bold word below (screenshot 2 style)
function splitCaptionText(caption) {
  if (!caption) return '';
  const words = caption.split(' ');
  if (words.length > 1) {
    const lastWord = words.pop();
    const firstPart = words.join(' ');
    // Stacked: light on top, bold below (no space between, CSS handles layout)
    return `<span class="caption-light">${firstPart}</span><span class="caption-bold">${lastWord}</span>`;
  }
  return `<span class="caption-bold">${caption}</span>`;
}

function renderPbkHero(media) {
  // Use showcaseImages if available (has captions), fallback to images
  const showcaseImages = media.showcaseImages || [];
  const regularImages = media.images || [];
  
  // Prefer showcaseImages for caption support
  const hasShowcase = showcaseImages.length > 0;
  const images = hasShowcase ? showcaseImages : regularImages.map(url => ({ url, caption: '', description: '' }));
  
  if (images.length === 0) {
    return `<div class="pbk-hero-placeholder">📷</div>`;
  }
  
  const firstImg = hasShowcase ? images[0].url : images[0];
  const firstCaption = hasShowcase ? (images[0].caption || '') : '';
  const firstDesc = hasShowcase ? (images[0].description || '') : '';
  
  return `
    <div class="pbk-hero-image">
      <img src="${firstImg}" alt="Service" id="pbkMainImage">
      <!-- Caption Overlay with intelligent text split + description -->
      <div class="pbk-hero-overlay" id="pbkHeroOverlay" ${(firstCaption || firstDesc) ? '' : 'style="display:none"'}>
        <span class="pbk-hero-caption" id="pbkHeroCaption">${splitCaptionText(firstCaption)}</span>
        <p class="pbk-hero-description" id="pbkHeroDesc">${firstDesc}</p>
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
    <script id="pbkHeroData" type="application/json">${JSON.stringify(images.map(img => hasShowcase ? img : { url: img, caption: '', description: '' }))}</script>
  `;
}

function renderPbkStories(stories, storyTitle) {
  const valid = stories.filter(s => s.thumbnail || s.url);
  if (valid.length === 0) return '';
  
  const title = storyTitle || 'See it in Action';
  
  return `
    <div class="pbk-stories">
      <h3 class="pbk-section-title">${title}</h3>
      <div class="pbk-stories-row">
        ${valid.map((story, i) => `
          <div class="pbk-story" data-index="${i}">
            <div class="pbk-story-ring">
              <img src="${story.thumbnail || story.url}" alt="${story.caption || story.label || ''}">
            </div>
            ${(story.caption || story.label) ? `<span class="pbk-story-label">${story.caption || story.label}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Story Viewer Modal (Instagram-style) -->
    <div class="pbk-story-viewer" id="pbkStoryViewer">
      <div class="pbk-story-viewer-backdrop" onclick="closePbkStoryViewer()"></div>
      <div class="pbk-story-viewer-content">
        <div class="pbk-story-progress">
          ${valid.map((_, i) => `<div class="pbk-story-progress-bar" data-index="${i}"><div class="pbk-story-progress-fill"></div></div>`).join('')}
        </div>
        <button class="pbk-story-close" onclick="closePbkStoryViewer()">✕</button>
        <img class="pbk-story-image" id="pbkStoryImage" src="" alt="">
        <div class="pbk-story-label-overlay" id="pbkStoryLabel"></div>
        <div class="pbk-story-nav">
          <div class="pbk-story-nav-left" onclick="pbkStoryNav(-1)"></div>
          <div class="pbk-story-nav-right" onclick="pbkStoryNav(1)"></div>
        </div>
      </div>
    </div>
    <script id="pbkStoriesData" type="application/json">${JSON.stringify(valid)}</script>
  `;
}

// Gallery with masonry grid + lightbox (like Deep Dive showcase)
function renderPbkGallery(images, title) {
  const valid = images.filter(img => img.url);
  if (valid.length === 0) return '';
  
  return `
    <div class="pbk-gallery">
      <h3 class="pbk-section-title">${title || 'Our Work in Action'}</h3>
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
          <div class="pbk-package ${i === 0 ? 'pbk-package-featured' : ''}" 
               onclick="this.querySelector('.pbk-package-btn').click()" 
               role="button" 
               tabindex="0">
            ${pkg.image ? `
              <div class="pbk-package-image">
                <img src="${pkg.image}" alt="${pkg.name}" loading="lazy">
              </div>
            ` : ''}
            <div class="pbk-package-content">
              <h2 class="pbk-package-name">${pkg.name}</h2>
              <div class="pbk-package-price-row">
                <div class="pbk-package-price">KES ${parseInt(pkg.price || 0).toLocaleString()}</div>
                ${pkg.duration ? `<span class="pbk-package-duration">${pkg.duration}</span>` : ''}
              </div>
              ${pkg.description ? `<p class="pbk-package-desc">${pkg.description}</p>` : ''}
              <button class="pbk-package-btn" data-pkg-index="${i}" data-pkg-name="${pkg.name}" data-pkg-price="${pkg.price}">
                Select Package
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPbkTestimonials(testimonials) {
  const valid = testimonials.filter(t => t.text?.trim());
  if (valid.length === 0) return '';
  
  // Render single testimonial card
  const renderCard = (t) => {
    const initials = (t.author || 'H C').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return `
      <div class="pbk-testimonial">
        <div class="pbk-testimonial-stars">★★★★★</div>
        <p class="pbk-testimonial-text">"${t.text}"</p>
        <div class="pbk-testimonial-author">
          <div class="pbk-testimonial-avatar">${initials}</div>
          <div class="pbk-testimonial-info">
            <div class="pbk-testimonial-name">${t.author || 'Happy Client'}</div>
            <div class="pbk-testimonial-role">${t.role || 'Verified Client'}</div>
          </div>
        </div>
      </div>
    `;
  };
  
  // Duplicate testimonials for seamless infinite scroll
  const testimonialCards = valid.map(renderCard).join('');
  
  return `
    <div class="pbk-testimonials">
      <h3 class="pbk-section-title">What Clients Say</h3>
      <div class="pbk-testimonials-track">
        ${testimonialCards}
        ${testimonialCards}
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
        ${items.map((item) => {
          const text = typeof item === 'string' ? item : (item.text || item);
          // Default to checkmark like What's Included, unless icon provided
          const icon = (typeof item === 'object' && item.icon) ? item.icon : '✓';
          return `
            <div class="pbk-why-item">
              <span class="pbk-why-icon">${icon}</span>
              <span class="pbk-why-text">${text}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// What's Included section - Apple-style card with title inside (like DD Specs)
function renderPbkWhatsIncluded(content) {
  if (!content) return '';
  
  // Support both string and array format
  const items = Array.isArray(content) ? content : [content];
  
  return `
    <div class="pbk-whats-included">
      <div class="pbk-included-card">
        <h3 class="pbk-included-title">What's Included</h3>
        <ul class="pbk-included-list">
          ${items.map(item => `
            <li class="pbk-included-item">
              <span class="pbk-included-check">✓</span>
              <span class="pbk-included-text">${typeof item === 'string' ? item : item.text || item}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
}
