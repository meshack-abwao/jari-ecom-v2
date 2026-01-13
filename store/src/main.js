import { fetchStore } from './api.js';
import { state, setState, getSlug, getProductId, setProductId } from './state.js';
import { renderHeader, renderProductsGrid, renderSingleProduct, renderFooter, renderError } from './render.js';
import { renderCheckoutModal, initCheckout, openCheckout } from './checkout.js';

const app = document.getElementById('app');

// ===========================================
// GALLERY STATE
// ===========================================
let currentImageIndex = 0;
let currentStoryIndex = 0;
let storyTimer = null;

// ===========================================
// INIT
// ===========================================
async function init() {
  const slug = getSlug();
  
  try {
    const data = await fetchStore(slug);
    setState({
      store: { ...data.store, slug },
      theme: data.theme,
      products: data.products
    });
    
    // Update page title
    document.title = data.store.name || 'Store';
    
    // Apply theme colors to CSS variables
    if (data.theme?.colors) {
      document.documentElement.style.setProperty('--gradient-primary', data.theme.colors.gradient);
      document.documentElement.style.setProperty('--color-primary', data.theme.colors.primary);
    }
    
    render();
    
  } catch (err) {
    app.innerHTML = renderError(err.message);
  }
}

// ===========================================
// RENDER
// ===========================================
function render() {
  const productId = getProductId();
  const { products } = state;
  
  if (productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      setState({ currentProduct: product, quantity: 1 });
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
    ${renderHeader()}
    <main class="main">
      ${renderProductsGrid(state.products)}
    </main>
    ${renderFooter()}
    ${renderCheckoutModal()}
  `;
  
  // Add click handlers for product cards
  document.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.productId;
      setProductId(id);
      render();
    });
  });
  
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
// PRODUCT VIEW
// ===========================================
function renderProductView(product) {
  currentImageIndex = 0;
  
  app.innerHTML = `
    ${renderHeader()}
    <main class="main">
      ${renderSingleProduct(product)}
    </main>
    ${renderFooter()}
    ${renderCheckoutModal()}
  `;
  
  initProductHandlers(product);
  initGalleryHandlers(product);
  initStoryHandlers(product);
  initProductPolicyHandlers();
  initStorePolicyHandlers();
  initPackageTicketHandlers(product);
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
  
  function setImage(index) {
    currentImageIndex = index;
    if (mainImage) mainImage.src = images[index];
    if (galleryIndex) galleryIndex.textContent = index + 1;
    
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
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
// BROWSER NAVIGATION
// ===========================================
window.addEventListener('popstate', render);

// ===========================================
// START
// ===========================================
init();
