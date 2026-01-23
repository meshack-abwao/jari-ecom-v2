// ===========================================
// ORDER TRACKING PAGE
// Public page for customers to track their food order status
// URL: /order/{orderNumber}
// ===========================================

// Production fallback ensures it works even if env var not set
const API_URL = (import.meta.env.VITE_API_URL || 'https://jari-ecom-v2-production.up.railway.app').replace(/\/$/, '');

// Status display configuration
const STATUS_CONFIG = {
  pending: { 
    label: 'Order Received', 
    icon: '📋', 
    color: '#f59e0b',
    message: 'Your order has been received and is waiting to be confirmed.'
  },
  confirmed: { 
    label: 'Confirmed', 
    icon: '✅', 
    color: '#3b82f6',
    message: 'Your order has been confirmed and sent to the kitchen.'
  },
  preparing: { 
    label: 'Being Prepared', 
    icon: '👨‍🍳', 
    color: '#8b5cf6',
    message: 'Our chef is preparing your delicious meal!'
  },
  ready: { 
    label: 'Ready!', 
    icon: '🍽️', 
    color: '#10b981',
    message: 'Your order is ready for pickup/delivery!'
  },
  out_for_delivery: { 
    label: 'On the Way', 
    icon: '🚗', 
    color: '#06b6d4',
    message: 'Your order is on its way to you!'
  },
  delivered: { 
    label: 'Delivered', 
    icon: '🎉', 
    color: '#22c55e',
    message: 'Enjoy your meal! Thank you for ordering with us.'
  },
  picked_up: { 
    label: 'Picked Up', 
    icon: '🎉', 
    color: '#22c55e',
    message: 'Thank you for picking up your order. Enjoy!'
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: '❌', 
    color: '#ef4444',
    message: 'This order has been cancelled.'
  }
};

// Status flow order
const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const STATUS_ORDER_PICKUP = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'];

// Fetch order from API
async function fetchOrder(orderNumber) {
  const url = `${API_URL}/s/order/${orderNumber}`;
  console.log('[Order Tracking] Fetching order:', orderNumber);
  console.log('[Order Tracking] API URL:', url);
  
  try {
    const res = await fetch(url);
    console.log('[Order Tracking] Response status:', res.status);
    
    if (!res.ok) {
      if (res.status === 404) {
        console.log('[Order Tracking] Order not found in database');
        return { error: 'Order not found. Please check your order number.' };
      }
      const errorText = await res.text();
      console.error('[Order Tracking] API error:', errorText);
      throw new Error(`Failed to fetch order: ${res.status}`);
    }
    const data = await res.json();
    console.log('[Order Tracking] Order data:', data);
    return data;
  } catch (err) {
    console.error('[Order Tracking] Fetch error:', err);
    return { error: 'Failed to load order. Please check your connection and try again.' };
  }
}

// Format price
function formatPrice(amount) {
  return `KES ${(amount || 0).toLocaleString()}`;
}

// Format time
function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Calculate time remaining
function getTimeRemaining(estimatedReadyAt) {
  if (!estimatedReadyAt) return null;
  
  const now = new Date();
  const ready = new Date(estimatedReadyAt);
  const diff = ready - now;
  
  if (diff <= 0) return 'Any moment now!';
  
  const mins = Math.ceil(diff / 60000);
  if (mins < 60) return `~${mins} min${mins > 1 ? 's' : ''}`;
  
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `~${hrs}h ${remainingMins}m`;
}

// Render the tracking page
function renderTrackingPage(order) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const statusFlow = order.order_type === 'pickup' ? STATUS_ORDER_PICKUP : STATUS_ORDER;
  const currentIndex = statusFlow.indexOf(order.status);
  const isCompleted = ['delivered', 'picked_up'].includes(order.status);
  const isCancelled = order.status === 'cancelled';
  
  // Estimated time display
  let timeDisplay = '';
  if (!isCompleted && !isCancelled && order.estimated_ready_at) {
    const remaining = getTimeRemaining(order.estimated_ready_at);
    timeDisplay = `
      <div class="ot-time-box">
        <div class="ot-time-icon">⏱️</div>
        <div class="ot-time-info">
          <div class="ot-time-label">Estimated Ready</div>
          <div class="ot-time-value">${remaining}</div>
        </div>
      </div>
    `;
  } else if (order.status === 'ready') {
    timeDisplay = `
      <div class="ot-time-box ot-ready">
        <div class="ot-time-icon">🔔</div>
        <div class="ot-time-info">
          <div class="ot-time-value">Your order is ready!</div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="ot-container">
      <div class="ot-card">
        <!-- Header -->
        <div class="ot-header">
          <div class="ot-store-name">${order.store?.name || 'Restaurant'}</div>
          <div class="ot-order-number">Order #${order.order_number}</div>
        </div>
        
        <!-- Status Banner -->
        <div class="ot-status-banner" style="background: ${config.color}15; border-color: ${config.color}">
          <div class="ot-status-icon">${config.icon}</div>
          <div class="ot-status-info">
            <div class="ot-status-label" style="color: ${config.color}">${config.label}</div>
            <div class="ot-status-message">${config.message}</div>
          </div>
        </div>
        
        <!-- Time Estimate -->
        ${timeDisplay}
        
        <!-- Progress Steps -->
        ${!isCancelled ? `
        <div class="ot-progress">
          ${statusFlow.map((status, idx) => {
            const stepConfig = STATUS_CONFIG[status];
            const isActive = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return `
              <div class="ot-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}">
                <div class="ot-step-dot" style="${isActive ? `background: ${stepConfig.color}; border-color: ${stepConfig.color}` : ''}">
                  ${isActive ? '✓' : ''}
                </div>
                <div class="ot-step-label">${stepConfig.label}</div>
                ${idx < statusFlow.length - 1 ? '<div class="ot-step-line"></div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}
        
        <!-- Order Details -->
        <div class="ot-section">
          <div class="ot-section-title">Your Order</div>
          <div class="ot-items">
            ${(order.items || []).map(item => `
              <div class="ot-item">
                <div class="ot-item-qty">${item.quantity}×</div>
                <div class="ot-item-info">
                  <div class="ot-item-name">${item.productName || item.product_name}</div>
                  ${item.extras && item.extras.length > 0 ? `
                    <div class="ot-item-extras">
                      ${item.extras.map(e => `+ ${e.name}`).join(', ')}
                    </div>
                  ` : ''}
                </div>
                <div class="ot-item-price">${formatPrice(item.itemTotal || item.total)}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="ot-totals">
            <div class="ot-total-row">
              <span>Subtotal</span>
              <span>${formatPrice(order.subtotal)}</span>
            </div>
            ${order.delivery_fee > 0 ? `
              <div class="ot-total-row">
                <span>Delivery Fee</span>
                <span>${formatPrice(order.delivery_fee)}</span>
              </div>
            ` : ''}
            <div class="ot-total-row ot-total-final">
              <span>Total</span>
              <span>${formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
        
        <!-- Location/Table -->
        <div class="ot-section">
          <div class="ot-location">
            ${order.order_type === 'pickup' || order.table_number ? `
              <div class="ot-location-icon">🍽️</div>
              <div class="ot-location-text">
                ${order.table_number ? `Table ${order.table_number}` : 'Pickup at counter'}
              </div>
            ` : `
              <div class="ot-location-icon">📍</div>
              <div class="ot-location-text">Delivery</div>
            `}
          </div>
        </div>
        
        <!-- Contact -->
        ${order.store?.phone || order.store?.whatsapp ? `
        <div class="ot-actions">
          ${order.store.whatsapp ? `
            <a href="https://wa.me/${order.store.whatsapp.replace(/[^0-9]/g, '')}?text=Hi! I have a question about order ${order.order_number}" 
               class="ot-btn ot-btn-whatsapp" target="_blank">
              <span>💬</span> WhatsApp Us
            </a>
          ` : ''}
          ${order.store.phone ? `
            <a href="tel:${order.store.phone}" class="ot-btn ot-btn-call">
              <span>📞</span> Call Restaurant
            </a>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- Auto-refresh notice -->
        <div class="ot-refresh-notice">
          This page auto-refreshes every 30 seconds
        </div>
      </div>
    </div>
  `;
}

// Render error state
function renderError(message, orderNumber = '') {
  return `
    <div class="ot-container">
      <div class="ot-card ot-error">
        <div class="ot-error-icon">😕</div>
        <div class="ot-error-title">Order Not Found</div>
        <div class="ot-error-message">${message}</div>
        ${orderNumber ? `<div class="ot-error-order">Looking for: <strong>${orderNumber}</strong></div>` : ''}
        <p style="font-size: 0.8rem; color: #666; margin-top: 1rem;">
          If you just placed this order, please wait a moment and refresh the page.
        </p>
        <a href="/" class="ot-btn">Back to Store</a>
      </div>
    </div>
  `;
}

// Render loading state
function renderLoading() {
  return `
    <div class="ot-container">
      <div class="ot-card">
        <div class="ot-loading">
          <div class="ot-spinner"></div>
          <div>Loading your order...</div>
        </div>
      </div>
    </div>
  `;
}

// Initialize tracking page
export async function initOrderTracking(orderNumber) {
  const app = document.getElementById('app');
  
  console.log('[Order Tracking] Initializing for order:', orderNumber);
  
  // Show loading
  app.innerHTML = renderLoading();
  
  // Fetch order
  const result = await fetchOrder(orderNumber);
  
  if (result.error) {
    app.innerHTML = renderError(result.error, orderNumber);
    return;
  }
  
  // Render order
  app.innerHTML = renderTrackingPage(result.order);
  
  // Auto-refresh every 30 seconds (only if not completed)
  const order = result.order;
  if (!['delivered', 'picked_up', 'cancelled'].includes(order.status)) {
    setInterval(async () => {
      const updated = await fetchOrder(orderNumber);
      if (!updated.error) {
        app.innerHTML = renderTrackingPage(updated.order);
      }
    }, 30000);
  }
}

// Export for use
export default { initOrderTracking };
