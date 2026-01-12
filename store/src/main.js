import { fetchStore } from './api.js';
import { state, setState, getSlug, getProductId, setProductId } from './state.js';
import { renderHeader, renderProductsGrid, renderSingleProduct, renderError } from './render.js';
import { renderCheckoutModal, initCheckout, openCheckout } from './checkout.js';

const app = document.getElementById('app');

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
      document.documentElement.style.setProperty('--jv2-primary', data.theme.colors.primary);
      document.documentElement.style.setProperty('--jv2-gradient', data.theme.colors.gradient);
    }
    
    render();
    
  } catch (err) {
    app.innerHTML = renderError(err.message);
  }
}

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

function renderCatalogView() {
  app.innerHTML = `
    ${renderHeader()}
    <main class="jv2-main">
      ${renderProductsGrid(state.products)}
    </main>
    ${renderCheckoutModal()}
  `;
  
  // Add click handlers for product cards
  document.querySelectorAll('.jv2-product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.productId;
      setProductId(id);
      render();
    });
  });
  
  initCheckout();
}

function renderProductView(product) {
  app.innerHTML = `
    ${renderHeader()}
    <main class="jv2-main">
      ${renderSingleProduct(product)}
    </main>
    ${renderCheckoutModal()}
  `;
  
  initProductHandlers(product);
  initCheckout();
}

function initProductHandlers(product) {
  const price = Number(product.data?.price || 0);
  const stock = Number(product.data?.stock || 999);
  
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
    qtyValue.textContent = newQty;
    totalValue.textContent = `KES ${(price * newQty).toLocaleString()}`;
    minusBtn.disabled = newQty <= 1;
    plusBtn.disabled = newQty >= stock;
  }
  
  minusBtn?.addEventListener('click', () => updateQuantity(-1));
  plusBtn?.addEventListener('click', () => updateQuantity(1));
  
  // Buy button
  document.getElementById('buyBtn')?.addEventListener('click', openCheckout);
}

// Handle browser back/forward
window.addEventListener('popstate', render);

// Start
init();
