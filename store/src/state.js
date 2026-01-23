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

export function setState(updates) {
  Object.assign(state, updates);
}

export function getSlug() {
  // Priority: URL param > Env variable > null (for landing page)
  const params = new URLSearchParams(window.location.search);
  return params.get('store') || params.get('subdomain') || import.meta.env.VITE_STORE_SLUG || null;
}

export function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('product');
}

export function setProductId(id) {
  const url = new URL(window.location);
  if (id) {
    url.searchParams.set('product', id);
  } else {
    url.searchParams.delete('product');
  }
  window.history.pushState({}, '', url);
}
