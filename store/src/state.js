// Simple global state
export const state = {
  store: null,
  theme: null,
  products: [],
  currentProduct: null,
  quantity: 1,
  selectedPrice: null,  // For package/ticket selection
  paymentMethod: null
};

// Store slug from custom domain lookup (cached)
let customDomainSlug = null;

export function setState(updates) {
  Object.assign(state, updates);
}

// Set slug from custom domain lookup
export function setCustomDomainSlug(slug) {
  customDomainSlug = slug;
}

export function getSlug() {
  // Priority: URL param > Custom domain slug > Env variable > null (for landing page)
  const params = new URLSearchParams(window.location.search);
  return params.get('store') || params.get('subdomain') || customDomainSlug || import.meta.env.VITE_STORE_SLUG || null;
}

export function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('product');
}

// Set product in URL - prefers slug over UUID for SEO
export function setProductId(idOrSlug) {
  const url = new URL(window.location);
  if (idOrSlug) {
    url.searchParams.set('product', idOrSlug);
  } else {
    url.searchParams.delete('product');
  }
  window.history.pushState({}, '', url);
}

// Get product slug from product object (fallback to id if no slug)
export function getProductSlug(product) {
  return product?.slug || product?.id;
}
