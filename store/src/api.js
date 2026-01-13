// Remove trailing slash if present
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function fetchStore(slug) {
  const res = await fetch(`${API_URL}/s/${slug}`);
  if (!res.ok) throw new Error('Store not found');
  return res.json();
}

export async function fetchProduct(slug, productId) {
  const res = await fetch(`${API_URL}/s/${slug}/products/${productId}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function createOrder(data) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Order failed');
  return res.json();
}
