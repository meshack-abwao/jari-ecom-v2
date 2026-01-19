// ===========================================
// SHARED POLICY MODALS
// Extracted from render.js for template isolation
// Used by: All templates that show product/store policies
// ===========================================

/**
 * Render product-level policy links (delivery, returns, payment)
 * @param {object} policies - Policy object { delivery, returns, payment }
 * @returns {string} HTML string
 */
export function renderProductPolicyLinks(policies) {
  if (!policies) return '';
  const { delivery, returns, payment } = policies;
  if (!delivery && !returns && !payment) return '';
  
  return `
    <div class="policy-links">
      ${delivery ? `<button class="policy-link" data-policy="delivery">📦 Delivery Info</button>` : ''}
      ${returns ? `<button class="policy-link" data-policy="returns">↩️ Returns</button>` : ''}
      ${payment ? `<button class="policy-link" data-policy="payment">💳 Payment</button>` : ''}
    </div>
  `;
}

/**
 * Render product policy modal overlays
 * @param {object} policies - Policy object { delivery, returns, payment }
 * @returns {string} HTML string
 */
export function renderProductPolicyModals(policies) {
  if (!policies) return '';
  const { delivery, returns, payment } = policies;
  
  return `
    ${delivery ? `
      <div class="modal-overlay" id="deliveryModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="deliveryModal">✕</button>
          <h3>📦 Delivery Information</h3>
          <p>${delivery}</p>
          <button class="btn btn-secondary modal-close-btn" data-close="deliveryModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${returns ? `
      <div class="modal-overlay" id="returnsModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="returnsModal">✕</button>
          <h3>↩️ Returns Policy</h3>
          <p>${returns}</p>
          <button class="btn btn-secondary modal-close-btn" data-close="returnsModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${payment ? `
      <div class="modal-overlay" id="paymentModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="paymentModal">✕</button>
          <h3>💳 Payment Information</h3>
          <p>${payment}</p>
          <button class="btn btn-secondary modal-close-btn" data-close="paymentModal">Close</button>
        </div>
      </div>
    ` : ''}
  `;
}

/**
 * Render store-level policy modals (privacy, terms, refund)
 * Called from footer
 * @param {object} policies - Store policies { privacy, terms, refund }
 * @returns {string} HTML string
 */
export function renderStorePolicyModals(policies) {
  if (!policies) return '';
  
  return `
    ${policies.privacy ? `
      <div class="modal-overlay" id="privacyPolicyModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="privacyPolicyModal">✕</button>
          <h3>🔒 Privacy Policy</h3>
          <div class="policy-text">${policies.privacy}</div>
          <button class="btn btn-secondary modal-close-btn" data-close="privacyPolicyModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${policies.terms ? `
      <div class="modal-overlay" id="termsPolicyModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="termsPolicyModal">✕</button>
          <h3>📋 Terms of Service</h3>
          <div class="policy-text">${policies.terms}</div>
          <button class="btn btn-secondary modal-close-btn" data-close="termsPolicyModal">Close</button>
        </div>
      </div>
    ` : ''}
    ${policies.refund ? `
      <div class="modal-overlay" id="refundPolicyModal">
        <div class="modal-content">
          <button class="modal-close-x" data-close="refundPolicyModal">✕</button>
          <h3>↩️ Refund Policy</h3>
          <div class="policy-text">${policies.refund}</div>
          <button class="btn btn-secondary modal-close-btn" data-close="refundPolicyModal">Close</button>
        </div>
      </div>
    ` : ''}
  `;
}

/**
 * Initialize policy modal event handlers
 * Call this after DOM is rendered
 */
export function initPolicyModalHandlers() {
  // Open modals from policy links
  document.querySelectorAll('[data-policy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const policyType = e.currentTarget.dataset.policy;
      const modal = document.getElementById(`${policyType}Modal`);
      if (modal) modal.classList.add('visible');
    });
  });
  
  // Open store policy modals
  document.querySelectorAll('[data-store-policy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const policyType = e.currentTarget.dataset.storePolicy;
      const modal = document.getElementById(`${policyType}PolicyModal`);
      if (modal) modal.classList.add('visible');
    });
  });
  
  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.dataset.close;
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('visible');
    });
  });
  
  // Close on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('visible');
      }
    });
  });
}
