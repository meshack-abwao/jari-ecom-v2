import { fetchStore } from './api.js';
import { state, setState, getSlug, getProductId, setProductId, setCustomDomainSlug, getProductSlug } from './state.js';
import { renderHeader, renderMinimalHeader, renderProductsGrid, renderSingleProduct, renderFooter, renderError } from './render.js';
import { renderCheckoutModal, initCheckout, openCheckout } from './checkout.js';
import { initPixel, pixel } from './pixel.js';
import { initPortfolioBookingHandlers } from './templates/portfolioBookingHandlers.js';
import { initVisualMenuHandlers } from './templates/visual-menu/vm-handlers.js';
import { initDeepDiveHandlers } from './templates/deep-dive/dd-handlers.js';
import { initQuickDecisionHandlers } from './templates/quick-decision/qd-handlers.js';
import { initOrderTracking } from './order-tracking.js';
import { renderLandingPage, initLandingHandlers } from './landing/landing.js';
import { API_URL, MAIN_DOMAINS } from './config.js';
import './landing/landing.css'; // Import landing CSS so Vite bundles it
import './booking/bookingHandlers.js'; // Auto-registers event listener

const app = document.getElementById('app');

// ===========================================
// FAVICON - Dynamic store avatar in browser tab
// ===========================================
const JARI_DEFAULT_FAVICON = 'https://res.cloudinary.com/dmfrtzgkv/image/upload/v1769389089/image_3_sjvgdg.svg';

function setFavicon(url) {
  // Remove existing favicons
  const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
  existingFavicons.forEach(el => el.remove());
  
  // Create new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = url.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  link.href = url;
  document.head.appendChild(link);
  
  // Also add apple-touch-icon for iOS
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = url;
  document.head.appendChild(appleLink);
}

// ===========================================
// GALLERY STATE
// ===========================================
let currentImageIndex = 0;
let currentStoryIndex = 0;
let storyTimer = null;

// ===========================================
// ROUTING - Check for order tracking page
// ===========================================
function checkOrderTrackingRoute() {
  const path = window.location.pathname;
  // Match /order/ABC-123 pattern
  const match = path.match(/^\/order\/([A-Z0-9-]+)$/i);
  if (match) {
    return match[1].toUpperCase(); // Return order number
  }
  return null;
}

// ===========================================
// CUSTOM DOMAIN DETECTION
// ===========================================
// MAIN_DOMAINS is now imported from config.js

async function checkCustomDomain() {
  const hostname = window.location.hostname.toLowerCase();
  
  // Skip if already have a slug in URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('store') || params.get('subdomain')) {
    return;
  }
  
  // Skip if on main domains
  if (MAIN_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
    return;
  }
  
  // This looks like a custom domain - try to look it up
  try {
    // API_URL is imported from config.js - NEVER hardcode URLs!
    const response = await fetch(`${API_URL}/domain/lookup/${encodeURIComponent(hostname)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.slug) {
        // Found! Set the slug in state
        setCustomDomainSlug(data.slug);
        console.log(`🔗 Custom domain detected: ${hostname} → ${data.slug}`);
      }
    } else {
      console.log(`⚠️ Custom domain not found: ${hostname}`);
    }
  } catch (err) {
    console.log(`⚠️ Failed to lookup custom domain: ${err.message}`);
  }
}

// ===========================================
// INIT
// ===========================================
async function init() {
  // Check if this is an order tracking page
  const orderNumber = checkOrderTrackingRoute();
  if (orderNumber) {
    // Load order tracking styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/styles/order-tracking.css';
    document.head.appendChild(link);
    
    // Initialize order tracking
    initOrderTracking(orderNumber);
    return;
  }
  
  // ===========================================
  // CUSTOM DOMAIN DETECTION
  // ===========================================
  await checkCustomDomain();
  
  const slug = getSlug();
  
  // If no store slug, show landing page
  if (!slug) {
    // Render landing page (CSS already imported at top)
    document.title = 'Jari.Ecom - E-commerce Made Simple for Kenyan Sellers';
    setFavicon(JARI_DEFAULT_FAVICON);
    app.innerHTML = renderLandingPage();
    initLandingHandlers();
    return;
  }
  
  // Set global slug for booking system
  window.JARI_STORE_SLUG = slug;
  
  try {
    const data = await fetchStore(slug);
    setState({
      store: { ...data.store, slug },
      theme: data.theme,
      products: data.products
    });
    
    // Set global store config for booking system (includes payment info)
    window.JARI_STORE_CONFIG = data.store || null;
    
    // Update page title
    document.title = data.store.name || 'Store';
    
    // Set favicon to store logo (or default Jari favicon)
    const storeLogo = data.store.logo_url;
    setFavicon(storeLogo || JARI_DEFAULT_FAVICON);
    
    // Apply theme colors to CSS variables
    if (data.theme?.colors) {
      document.documentElement.style.setProperty('--gradient-primary', data.theme.colors.gradient);
      document.documentElement.style.setProperty('--color-primary', data.theme.colors.primary);
    }
    
    // Initialize pixel tracking
    initPixel();
    
    render();
    
  } catch (err) {
    app.innerHTML = renderError(err.message);
  }
}

// ===========================================
// RENDER
// ===========================================
function render() {
  const productIdOrSlug = getProductId();
  const { products } = state;
  
  if (productIdOrSlug) {
    // Find product by slug OR id (supports both old UUID links and new slug links)
    const product = products.find(p => p.slug === productIdOrSlug || p.id === productIdOrSlug);
    if (product) {
      setState({ currentProduct: product, quantity: 1 });
      
      // If URL has UUID but product has slug, update URL to use slug (SEO improvement)
      if (product.slug && productIdOrSlug === product.id) {
        setProductId(product.slug);
      }
      
      renderProductView(product);
    } else {
      renderCatalogView();
    }
  } else if (products.length === 1) {
    // Single product store - go directly to product
    setState({ currentProduct: products[0], quantity: 1 });
    renderProductView(products[0]);
  } else {
    renderCatalogView();
  }
}

// ===========================================
// CATALOG VIEW
// ===========================================
function renderCatalogView() {
  app.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    ${renderHeader()}
    <main class="main" id="main-content">
      ${renderProductsGrid(state.products)}
    </main>
    ${renderFooter()}
    ${renderCheckoutModal()}
  `;
  
  // Add click handlers for product cards
  document.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if swiping on gallery
      if (e.target.closest('.card-gallery-dots')) return;
      // Use slug for SEO-friendly URLs, fallback to id
      const slug = card.dataset.productSlug || card.dataset.productId;
      setProductId(slug);
      render();
    });
  });
  
  // Init card gallery swipe (mobile)
  initCardGallerySwipe();
  
  // Add category filter handlers
  initCategoryFilters();
  
  initStorePolicyHandlers();
  initCheckout();
}

// ===========================================
// CATEGORY FILTERS
// ===========================================
function initCategoryFilters() {
  const pills = document.querySelectorAll('.category-pill');
  const cards = document.querySelectorAll('.collection-card');
  
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const category = pill.dataset.category;
      
      // Update active state
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      // Filter cards
      cards.forEach(card => {
        const productId = card.dataset.productId;
        const product = state.products.find(p => p.id === productId);
        const productCategory = product?.data?.category || '';
        
        if (category === 'all' || productCategory === category) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ===========================================
// CARD GALLERY SWIPE (Mobile)
// ===========================================
function initCardGallerySwipe() {
  document.querySelectorAll('.card-gallery').forEach(gallery => {
    const images = gallery.querySelectorAll('.card-gallery-img');
    const dots = gallery.querySelectorAll('.card-dot');
    if (images.length < 2) return;
    
    let startX = 0;
    let currentIndex = 0;
    
    const showImage = (index) => {
      images.forEach((img, i) => img.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      currentIndex = index;
    };
    
    gallery.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    
    gallery.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < images.length - 1) {
          showImage(currentIndex + 1);
        } else if (diff < 0 && currentIndex > 0) {
          showImage(currentIndex - 1);
        }
        e.preventDefault();
        e.stopPropagation();
      }
    });
    
    // Dot click
    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(i);
      });
    });
  });
}

// ===========================================
// PRODUCT VIEW
// ===========================================
function renderProductView(product) {
  currentImageIndex = 0;
  
  // Track product view
  pixel.productView(product.id, product.data?.name || 'Unknown');
  
  app.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    ${renderMinimalHeader()}
    <main class="main" id="main-content">
      ${renderSingleProduct(product)}
    </main>
    ${renderFooter()}
    ${renderCheckoutModal()}
  `;
  
  initProductHandlers(product);
  initGalleryHandlers(product);
  initStoryHandlers(product.media?.stories || []);
  initShowcaseHandlers();
  initProductPolicyHandlers();
  initStorePolicyHandlers();
  initPackageTicketHandlers(product);
  
  // Portfolio-Booking template specific handlers
  if (product.template === 'portfolio-booking') {
    state.currentProduct = product;
    initPortfolioBookingHandlers();
  }
  
  // Visual-Menu template specific handlers
  if (product.template === 'visual-menu') {
    initVisualMenuHandlers(product);
  }
  
  // Deep-Dive template specific handlers
  if (product.template === 'deep-dive') {
    initDeepDiveHandlers(product);
  }
  
  // Quick-Decision template specific handlers
  if (product.template === 'quick-decision') {
    initQuickDecisionHandlers(product);
  }
  
  // Init smart sticky CTA for all templates
  initSmartStickyCTA();
  
  initCheckout();
}

// ===========================================
// PACKAGE & TICKET HANDLERS (Template-specific)
// ===========================================
function initPackageTicketHandlers(product) {
  // Package selection (portfolio-booking template)
  document.querySelectorAll('.package-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const price = Number(btn.dataset.price || 0);
      const packageName = btn.dataset.name || '';
      setState({ quantity: 1, selectedPackage: packageName });
      
      // Update price displays
      const displayPrice = document.getElementById('displayPrice');
      const totalValue = document.getElementById('totalValue');
      if (displayPrice) displayPrice.textContent = price.toLocaleString();
      if (totalValue) totalValue.textContent = price.toLocaleString();
      
      // Highlight selected package
      document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('featured');
      });
      btn.closest('.package-card')?.classList.add('featured');
      
      // Store selected package price in state for checkout
      setState({ selectedPrice: price });
      
      // Open checkout
      openCheckout();
    });
  });
  
  // Ticket selection (event-landing template)
  document.querySelectorAll('.ticket-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const price = Number(btn.dataset.price || 0);
      const ticketName = btn.dataset.name || '';
      setState({ quantity: 1, selectedTicket: ticketName });
      
      // Update price displays
      const displayPrice = document.getElementById('displayPrice');
      const totalValue = document.getElementById('totalValue');
      if (displayPrice) displayPrice.textContent = price.toLocaleString();
      if (totalValue) totalValue.textContent = price.toLocaleString();
      
      // Highlight selected ticket
      document.querySelectorAll('.ticket-card').forEach(card => {
        card.classList.remove('featured');
      });
      btn.closest('.ticket-card')?.classList.add('featured');
      
      // Store selected ticket price in state for checkout
      setState({ selectedPrice: price });
      
      // Open checkout
      openCheckout();
    });
  });
}

// ===========================================
// PRODUCT HANDLERS
// ===========================================
function initProductHandlers(product) {
  const data = product.data || {};
  const price = Number(data.price || 0);
  const stock = Number(data.stock || 999);
  
  // Back button
  document.getElementById('backBtn')?.addEventListener('click', () => {
    setProductId(null);
    render();
  });
  
  // Breadcrumb home link - same as back button
  document.getElementById('breadcrumbHome')?.addEventListener('click', (e) => {
    e.preventDefault();
    setProductId(null);
    render();
  });
  
  // Quantity controls
  const qtyValue = document.getElementById('qtyValue');
  const totalValue = document.getElementById('totalValue');
  const minusBtn = document.getElementById('qtyMinus');
  const plusBtn = document.getElementById('qtyPlus');
  
  function updateQuantity(delta) {
    const newQty = Math.max(1, Math.min(stock, state.quantity + delta));
    setState({ quantity: newQty });
    if (qtyValue) qtyValue.textContent = newQty;
    if (totalValue) totalValue.textContent = (price * newQty).toLocaleString();
    if (minusBtn) minusBtn.disabled = newQty <= 1;
    if (plusBtn) plusBtn.disabled = newQty >= stock;
  }
  
  minusBtn?.addEventListener('click', () => updateQuantity(-1));
  plusBtn?.addEventListener('click', () => updateQuantity(1));
  
  // Buy button
  document.getElementById('buyBtn')?.addEventListener('click', openCheckout);
  
  // Like button
  const likeBtn = document.getElementById('likeBtn');
  likeBtn?.addEventListener('click', () => {
    likeBtn.classList.toggle('liked');
    likeBtn.textContent = likeBtn.classList.contains('liked') ? '❤️' : '🤍';
  });
  
  // Share button
  document.getElementById('shareBtn')?.addEventListener('click', async () => {
    const shareData = {
      title: product.data?.name || 'Product',
      text: `Check out ${product.data?.name || 'this'}!`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy link
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  });
}

// ===========================================
// GALLERY HANDLERS
// ===========================================
function initGalleryHandlers(product) {
  const media = product.media || {};
  const images = media.images || [];
  
  if (images.length <= 1) return;
  
  const mainImage = document.getElementById('mainImage');
  const galleryIndex = document.getElementById('galleryIndex');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const dots = document.querySelectorAll('.gallery-dot');
  
  function setImage(index) {
    currentImageIndex = index;
    if (mainImage) mainImage.src = images[index];
    if (galleryIndex) galleryIndex.textContent = index + 1;
    
    // Update thumbnails
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
    
    // Update dots if present
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }
  
  // Navigation buttons
  document.getElementById('galleryPrev')?.addEventListener('click', () => {
    const newIndex = (currentImageIndex - 1 + images.length) % images.length;
    setImage(newIndex);
  });
  
  document.getElementById('galleryNext')?.addEventListener('click', () => {
    const newIndex = (currentImageIndex + 1) % images.length;
    setImage(newIndex);
  });
  
  // Thumbnail clicks
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const index = parseInt(thumb.dataset.index);
      setImage(index);
    });
  });
  
  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      setImage(index);
    });
  });
  
  // Swipe support
  let touchStartX = 0;
  const container = document.querySelector('.main-image-container');
  
  container?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });
  
  container?.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next
        setImage((currentImageIndex + 1) % images.length);
      } else {
        // Swipe right - prev
        setImage((currentImageIndex - 1 + images.length) % images.length);
      }
    }
  });
}

// ===========================================
// STORY HANDLERS
// ===========================================
function initStoryHandlers(product) {
  const media = product.media || {};
  const stories = media.stories || [];
  
  if (stories.length === 0) return;
  
  const viewer = document.getElementById('storyViewer');
  const storyImage = document.getElementById('storyImage');
  const progressBars = document.querySelectorAll('.story-progress-bar');
  
  function openStory(index) {
    currentStoryIndex = index;
    viewer?.classList.add('active');
    document.body.style.overflow = 'hidden';
    showStory(index);
  }
  
  function closeStory() {
    viewer?.classList.remove('active');
    document.body.style.overflow = '';
    clearTimeout(storyTimer);
    // Reset all progress bars
    progressBars.forEach(bar => {
      bar.classList.remove('active', 'viewed');
      const fill = bar.querySelector('.story-progress-fill');
      if (fill) fill.style.width = '0%';
    });
  }
  
  function showStory(index) {
    if (index >= stories.length) {
      closeStory();
      return;
    }
    
    currentStoryIndex = index;
    if (storyImage) storyImage.src = stories[index].url;
    
    // Update progress bars
    progressBars.forEach((bar, i) => {
      const fill = bar.querySelector('.story-progress-fill');
      bar.classList.remove('active', 'viewed');
      
      if (i < index) {
        // Already viewed - full
        bar.classList.add('viewed');
        if (fill) fill.style.width = '100%';
      } else if (i === index) {
        // Current - animate
        if (fill) {
          fill.style.width = '0%';
          // Force reflow to restart animation
          void fill.offsetWidth;
        }
        // Small delay to ensure CSS transition kicks in
        setTimeout(() => {
          bar.classList.add('active');
        }, 50);
      } else {
        // Not yet viewed - empty
        if (fill) fill.style.width = '0%';
      }
    });
    
    // Auto-advance after 5 seconds
    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => showStory(index + 1), 5000);
  }
  
  // Story bubble clicks
  document.querySelectorAll('.story-bubble').forEach(bubble => {
    bubble.addEventListener('click', () => {
      const index = parseInt(bubble.dataset.storyIndex);
      openStory(index);
    });
  });
  
  // Close button
  document.getElementById('storyClose')?.addEventListener('click', closeStory);
  
  // Navigation
  document.getElementById('storyPrev')?.addEventListener('click', () => {
    if (currentStoryIndex > 0) showStory(currentStoryIndex - 1);
  });
  
  document.getElementById('storyNext')?.addEventListener('click', () => {
    showStory(currentStoryIndex + 1);
  });
  
  // Close on overlay click
  viewer?.addEventListener('click', (e) => {
    if (e.target === viewer) closeStory();
  });
  
  // Tap left/right to navigate
  storyImage?.addEventListener('click', (e) => {
    const rect = storyImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width / 3) {
      // Left third - go back
      if (currentStoryIndex > 0) showStory(currentStoryIndex - 1);
    } else {
      // Right two thirds - go forward
      showStory(currentStoryIndex + 1);
    }
  });
}

// ===========================================
// PRODUCT POLICY HANDLERS (delivery, returns, payment)
// ===========================================
function initProductPolicyHandlers() {
  // Policy link clicks
  document.querySelectorAll('.policy-link').forEach(link => {
    link.addEventListener('click', () => {
      const policy = link.dataset.policy;
      const modal = document.getElementById(`${policy}Modal`);
      modal?.classList.add('active');
    });
  });
  
  // Close buttons (both X and bottom button)
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      const modal = document.getElementById(modalId);
      modal?.classList.remove('active');
    });
  });
  
  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
}

// ===========================================
// STORE POLICY HANDLERS (privacy, terms, refund)
// ===========================================
function initStorePolicyHandlers() {
  // Store policy link clicks (in footer)
  document.querySelectorAll('.store-policy-link').forEach(link => {
    link.addEventListener('click', () => {
      const policy = link.dataset.storePolicy;
      const modal = document.getElementById(`${policy}PolicyModal`);
      modal?.classList.add('active');
    });
  });
  
  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      const modal = document.getElementById(modalId);
      modal?.classList.remove('active');
    });
  });
}

// ===========================================
// SHOWCASE VIEWER (Deep Dive Template)
// ===========================================
let showcaseData = [];
let showcaseHasVideo = false;
let currentShowcaseIndex = 0;

function initShowcaseHandlers() {
  const showcase = document.querySelector('.deep-dive-showcase');
  if (!showcase) return;
  
  // Collect showcase data
  showcaseData = [];
  const videoItem = showcase.querySelector('.showcase-video');
  if (videoItem) {
    showcaseHasVideo = true;
    showcaseData.push({
      type: 'video',
      src: videoItem.dataset.src || videoItem.querySelector('video')?.src,
      caption: ''
    });
  }
  
  showcase.querySelectorAll('.showcase-item:not(.showcase-video)').forEach(item => {
    const img = item.querySelector('img');
    showcaseData.push({
      type: 'image',
      src: img?.src || '',
      caption: item.dataset.caption || '',
      description: item.dataset.description || ''
    });
  });
  
  // Click handlers for showcase items
  showcase.querySelectorAll('.showcase-item').forEach((item, idx) => {
    item.addEventListener('click', () => {
      if (item.classList.contains('showcase-video')) {
        openShowcaseViewer(0);
      } else {
        // If video exists, idx includes the video item, so we just use idx
        // If no video, use the data-index attribute
        const viewerIndex = showcaseHasVideo ? idx : parseInt(item.dataset.index || idx);
        openShowcaseViewer(viewerIndex);
      }
    });
  });
}

function openShowcaseViewer(index) {
  const viewer = document.getElementById('showcaseViewer');
  if (!viewer || showcaseData.length === 0) return;
  
  currentShowcaseIndex = index;
  viewer.classList.add('active');
  document.body.style.overflow = 'hidden';
  showShowcaseItem(index);
}

function showShowcaseItem(index) {
  const item = showcaseData[index];
  if (!item) return;
  
  const img = document.getElementById('showcaseViewerImg');
  const video = document.getElementById('showcaseViewerVideo');
  const magazineCaption = document.getElementById('showcaseMagazineCaption');
  const description = document.getElementById('showcaseViewerDescription');
  const counter = document.getElementById('showcaseCurrentIndex');
  
  // Reset
  if (img) img.style.display = 'none';
  if (video) {
    video.style.display = 'none';
    video.pause();
  }
  
  if (item.type === 'video') {
    if (video) {
      video.src = item.src;
      video.style.display = 'block';
    }
  } else {
    if (img) {
      img.src = item.src;
      img.style.display = 'block';
    }
  }
  
  // Magazine-style caption with intelligent text splitting
  if (magazineCaption) {
    const caption = item.caption || '';
    const words = caption.split(' ');
    
    if (words.length > 1) {
      // Split text: first word(s) lighter, last word bold
      const lastWord = words.pop();
      const firstPart = words.join(' ');
      magazineCaption.innerHTML = `<span class="caption-light">${firstPart}</span> <span class="caption-bold">${lastWord}</span>`;
    } else {
      magazineCaption.textContent = caption;
    }
  }
  
  // Scrollable description
  if (description) description.textContent = item.description || '';
  if (counter) counter.textContent = index + 1;
}

window.closeShowcaseViewer = function() {
  const viewer = document.getElementById('showcaseViewer');
  const video = document.getElementById('showcaseViewerVideo');
  
  viewer?.classList.remove('active');
  document.body.style.overflow = '';
  if (video) video.pause();
};

window.navigateShowcase = function(direction) {
  const newIndex = currentShowcaseIndex + direction;
  if (newIndex >= 0 && newIndex < showcaseData.length) {
    currentShowcaseIndex = newIndex;
    showShowcaseItem(newIndex);
  }
};

// ===========================================
// GLOBAL FUNCTIONS FOR BREADCRUMB NAVIGATION
// ===========================================
window.showCollection = function() {
  setProductId(null);
  render();
};

window.filterByCategory = function(categoryName) {
  // First go back to collection view
  setProductId(null);
  render();
  
  // Then trigger the category filter (after DOM updates)
  setTimeout(() => {
    const categoryPill = document.querySelector(`.category-pill[data-category="${categoryName}"]`);
    if (categoryPill) {
      categoryPill.click();
    }
  }, 100);
};

// ===========================================
// GLOBAL FUNCTIONS FOR RELATED PRODUCTS
// ===========================================
window.viewRelatedProduct = function(productId) {
  setProductId(productId);
  render();
  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ===========================================
// SMART STICKY CTA - Graceful footer avoidance
// Applies to all templates with sticky CTAs
// ===========================================
function initSmartStickyCTA() {
  const stickyCTA = document.querySelector('.sticky-cta, .pbk-sticky-cta, .vm-sticky-cta, .dd-sticky-cta');
  const footer = document.querySelector('.store-footer-enhanced, .store-footer, footer');
  
  if (!stickyCTA || !footer) return;
  
  const handleScroll = () => {
    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const bottomOffset = 24; // CSS variable --space-lg equivalent
    
    if (footerRect.top < windowHeight) {
      const footerVisibleHeight = windowHeight - footerRect.top;
      const newBottom = footerVisibleHeight + bottomOffset;
      stickyCTA.style.bottom = `${newBottom}px`;
      stickyCTA.style.transition = 'bottom 0.15s ease';
    } else {
      stickyCTA.style.bottom = '';
      stickyCTA.style.transition = '';
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// ===========================================
// GLOBAL FUNCTIONS FOR DEEP DIVE TEMPLATE
// ===========================================
window.shareProduct = async function() {
  const shareData = {
    title: state.currentProduct?.data?.name || 'Product',
    text: `Check out ${state.currentProduct?.data?.name || 'this product'}!`,
    url: window.location.href
  };
  
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // User cancelled
    }
  } else {
    // Fallback: copy link
    await navigator.clipboard.writeText(window.location.href);
    showToast('Link copied!');
  }
};

window.toggleLike = function(btn) {
  btn.classList.toggle('liked');
  const svg = btn.querySelector('svg');
  if (svg) {
    svg.style.fill = btn.classList.contains('liked') ? '#ff375f' : 'none';
    svg.style.stroke = btn.classList.contains('liked') ? '#ff375f' : 'currentColor';
  }
};

window.updateQuantity = function(delta) {
  const product = state.currentProduct;
  if (!product) return;
  
  const price = Number(product.data?.price || 0);
  const stock = Number(product.data?.stock || 999);
  const newQty = Math.max(1, Math.min(stock, state.quantity + delta));
  
  setState({ quantity: newQty });
  
  const qtyValue = document.getElementById('ctaQtyValue');
  const totalPrice = document.getElementById('ctaTotalPrice');
  
  if (qtyValue) qtyValue.textContent = newQty;
  if (totalPrice) totalPrice.textContent = (price * newQty).toLocaleString();
};

function showToast(message) {
  // Create simple toast
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 14px;
    z-index: 9999;
    animation: toastFade 2s ease forwards;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ===========================================
// BROWSER NAVIGATION
// ===========================================
window.addEventListener('popstate', render);

// ===========================================
// START
// ===========================================
init();
