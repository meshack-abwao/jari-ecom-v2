// ===========================================
// SHARED QUANTITY COMPONENT
// Used by: Quick Decision, Visual Menu, Event Landing
// Deep Dive uses its own CTA-integrated version
// ===========================================

import { formatPrice } from './utils.js';

/**
 * Render quantity selector with total price
 * @param {number} price - Unit price
 * @param {number} stock - Available stock (default 999)
 * @returns {string} HTML string
 */
export function renderQuantitySection(price, stock = 999) {
  return `
    <div class="quantity-section">
      <label class="quantity-label">Quantity</label>
      <div class="quantity-controls">
        <button class="quantity-btn" id="qtyMinus" disabled>−</button>
        <span class="quantity-value" id="qtyValue">1</span>
        <button class="quantity-btn" id="qtyPlus" ${stock <= 1 ? 'disabled' : ''}>+</button>
      </div>
    </div>
    <div class="total-section">
      <span class="total-label">Total</span>
      <div class="total-price">KES <span id="totalValue">${formatPrice(price)}</span></div>
    </div>
  `;
}

/**
 * Initialize quantity controls
 * @param {number} price - Unit price
 * @param {number} maxStock - Maximum stock available
 * @param {Function} onQuantityChange - Callback when quantity changes
 */
export function initQuantityHandlers(price, maxStock = 999, onQuantityChange = null) {
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('qtyValue');
  const totalValue = document.getElementById('totalValue');
  
  if (!qtyValue) return;
  
  let quantity = 1;
  
  function updateQuantity(delta) {
    const newQty = quantity + delta;
    
    if (newQty < 1 || newQty > maxStock) return;
    
    quantity = newQty;
    qtyValue.textContent = quantity;
    
    if (totalValue) {
      totalValue.textContent = formatPrice(price * quantity);
    }
    
    // Update button states
    if (qtyMinus) qtyMinus.disabled = quantity <= 1;
    if (qtyPlus) qtyPlus.disabled = quantity >= maxStock;
    
    // Callback
    if (onQuantityChange) onQuantityChange(quantity, price * quantity);
  }
  
  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => updateQuantity(-1));
  }
  
  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => updateQuantity(1));
  }
  
  return {
    getQuantity: () => quantity,
    getTotal: () => price * quantity,
    setQuantity: (qty) => {
      quantity = Math.max(1, Math.min(qty, maxStock));
      qtyValue.textContent = quantity;
      if (totalValue) totalValue.textContent = formatPrice(price * quantity);
      if (qtyMinus) qtyMinus.disabled = quantity <= 1;
      if (qtyPlus) qtyPlus.disabled = quantity >= maxStock;
    }
  };
}

/**
 * Get current quantity and total from DOM
 * Useful when buy button is clicked
 * @returns {object} { quantity, total }
 */
export function getQuantityState() {
  const qtyValue = document.getElementById('qtyValue');
  const totalValue = document.getElementById('totalValue');
  
  return {
    quantity: qtyValue ? parseInt(qtyValue.textContent) : 1,
    total: totalValue ? parseInt(totalValue.textContent.replace(/,/g, '')) : 0
  };
}
