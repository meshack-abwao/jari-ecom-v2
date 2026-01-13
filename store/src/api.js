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

export async function createOrder(slug, orderData) {
  const payload = {
    slug: slug,
    productId: orderData.items[0]?.product_id,
    customer: orderData.customer,
    items: orderData.items,
    payment: orderData.payment
  };
  
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Order failed');
  }
  
  const result = await res.json();
  return { success: true, order_number: result.order_number };
}
