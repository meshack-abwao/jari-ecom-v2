import { fetchStore } from './api.js';
import { state, setState, getSlug, getProductId, setProductId } from './state.js';
import { renderHeader, renderProductsGrid, renderSingleProduct, renderError } from './render.js';
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
  
  initCheckout();
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
    ${renderCheckoutModal()}
  `;
  
  initProductHandlers(product);
  initGalleryHandlers(product);
  initStoryHandlers(product);
  initPolicyHandlers();
  initCheckout();
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
      title: product.name,
      text: `Check out ${product.name}!`,
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
    progressBars.forEach(bar => bar.classList.remove('active'));
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
      bar.classList.remove('active');
      if (i < index) {
        bar.querySelector('.story-progress-fill').style.width = '100%';
      } else if (i === index) {
        bar.querySelector('.story-progress-fill').style.width = '0%';
        bar.classList.add('active');
      } else {
        bar.querySelector('.story-progress-fill').style.width = '0%';
      }
    });
    
    // Auto-advance
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
}

// ===========================================
// POLICY HANDLERS
// ===========================================
function initPolicyHandlers() {
  // Policy link clicks
  document.querySelectorAll('.policy-link').forEach(link => {
    link.addEventListener('click', () => {
      const policy = link.dataset.policy;
      const modal = document.getElementById(`${policy}Modal`);
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
  
  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
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
