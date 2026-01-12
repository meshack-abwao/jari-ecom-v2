import { state } from './state.js';

export function renderHeader() {
  const { store, theme } = state;
  const gradient = theme?.colors?.gradient || 'linear-gradient(135deg, #ff9f0a 0%, #ff375f 100%)';
  const logoText = store?.logo?.value || store?.name?.charAt(0) || '?';
  
  return `
    <header class="jv2-header" style="background: ${gradient}">
      <div class="jv2-logo">${logoText}</div>
      <h1 class="jv2-store-name">${store?.name || 'Store'}</h1>
      <p class="jv2-tagline">${store?.tagline || ''}</p>
    </header>
  `;
}

export function renderProductCard(product) {
  const { data, media, id } = product;
  const image = media?.[0]?.url;
  const desc = data?.description?.slice(0, 60) || '';
  
  return `
    <div class="jv2-product-card" data-product-id="${id}">
      <div class="jv2-product-image">
        ${image ? `<img src="${image}" alt="${data?.name}">` : '📸'}
      </div>
      <div class="jv2-product-content">
        <h3 class="jv2-product-name">${data?.name || 'Product'}</h3>
        <p class="jv2-product-desc">${desc}${desc.length >= 60 ? '...' : ''}</p>
        <p class="jv2-product-price">KES ${Number(data?.price || 0).toLocaleString()}</p>
      </div>
    </div>
  `;
}

export function renderProductsGrid(products) {
  if (!products.length) {
    return `
      <div class="jv2-empty">
        <div class="jv2-empty-icon">📦</div>
        <h3>No products yet</h3>
        <p>Check back soon!</p>
      </div>
    `;
  }
  
  return `
    <div class="jv2-products-grid">
      ${products.map(renderProductCard).join('')}
    </div>
  `;
}

export function renderSingleProduct(product) {
  const { data, media } = product;
  const image = media?.[0]?.url;
  const price = Number(data?.price || 0);
  
  return `
    <div class="jv2-product-single">
      ${state.products.length > 1 ? `
        <button class="jv2-back-btn" id="backBtn">← Back to Products</button>
      ` : ''}
      
      <div class="jv2-product-hero">
        ${image ? `<img src="${image}" alt="${data?.name}">` : '📸'}
      </div>
      
      <div class="jv2-product-info">
        <h2 class="jv2-product-title">${data?.name || 'Product'}</h2>
        <p class="jv2-product-description">${data?.description || ''}</p>
        
        <div class="jv2-price-display">
          <span class="jv2-price-label">Price</span>
          <span class="jv2-price-value">KES ${price.toLocaleString()}</span>
        </div>
        
        <div class="jv2-quantity">
          <span class="jv2-quantity-label">Quantity</span>
          <div class="jv2-quantity-controls">
            <button class="jv2-qty-btn" id="qtyMinus">−</button>
            <span class="jv2-qty-value" id="qtyValue">1</span>
            <button class="jv2-qty-btn" id="qtyPlus">+</button>
          </div>
        </div>
        
        <div class="jv2-total">
          <span class="jv2-total-label">Total</span>
          <span class="jv2-total-value" id="totalValue">KES ${price.toLocaleString()}</span>
        </div>
        
        <button class="jv2-btn jv2-btn-primary" id="buyBtn">Buy Now →</button>
      </div>
    </div>
  `;
}

export function renderError(message = 'Store not found') {
  return `
    <div class="jv2-error">
      <div class="jv2-error-icon">⚠️</div>
      <h2>${message}</h2>
      <p>Please check the URL and try again.</p>
    </div>
  `;
}
