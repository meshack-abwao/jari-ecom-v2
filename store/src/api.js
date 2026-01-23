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
  
  console.log('Creating order with payload:', JSON.stringify(payload, null, 2));
  console.log('API URL:', API_URL);
  
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  console.log('Response status:', res.status);
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error('Order API error:', error);
    throw new Error(error.error || 'Order failed');
  }
  
  const result = await res.json();
  console.log('Order created:', result);
  return { success: true, order_number: result.order_number };
}

// Food orders (Visual Menu template)
export async function createFoodOrder(slug, orderData) {
  const payload = {
    slug: slug,
    customer_name: orderData.customer?.name,
    customer_phone: orderData.customer?.phone,
    delivery_address: orderData.customer?.location,
    order_type: orderData.order_type || 'delivery',
    items: orderData.items.map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      extras: item.extras || [],
      specialInstructions: item.special_instructions || '',
      itemTotal: item.total
    })),
    subtotal: orderData.items.reduce((sum, i) => sum + (i.total || 0), 0),
    delivery_fee: orderData.delivery_fee || 0,
    total: orderData.total_amount,
    payment_method: orderData.payment?.method,
    payment_status: orderData.payment?.payment_confirmed ? 'paid' : 'pending',
    mpesa_receipt: orderData.payment?.mpesa_code
  };
  
  console.log('Creating FOOD order with payload:', JSON.stringify(payload, null, 2));
  
  const res = await fetch(`${API_URL}/api/food-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  console.log('Food order response status:', res.status);
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error('Food Order API error:', error);
    throw new Error(error.error || 'Food order failed');
  }
  
  const result = await res.json();
  console.log('Food order created:', result);
  return { success: true, order_number: result.order?.order_number || result.order_number };
}
