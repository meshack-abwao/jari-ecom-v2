// ===========================================
// EVENT LANDING TEMPLATE - HANDLERS
// Event handlers for Event Landing template
// Isolated for independent evolution
// ===========================================

import { state } from '../../state.js';
import { navigateToCollection } from '../../shared/utils.js';

/**
 * Initialize Event Landing template event handlers
 * Called after template is rendered into DOM
 */
export function initEventLandingHandlers() {
  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigateToCollection();
    });
  }
  
  // Ticket selection buttons
  const ticketBtns = document.querySelectorAll('.ticket-select-btn');
  ticketBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const price = btn.dataset.price;
      const name = btn.dataset.name;
      
      // Store selected ticket info
      if (state.selectedProduct) {
        state.selectedProduct.selectedTicket = { name, price };
      }
      
      // Trigger checkout (handled by main.js)
      const buyBtn = document.getElementById('buyBtn');
      if (buyBtn) {
        buyBtn.click();
      } else {
        // If no buyBtn, dispatch custom event
        document.dispatchEvent(new CustomEvent('ticketSelected', { 
          detail: { name, price } 
        }));
      }
    });
  });
  
  // Gallery navigation (shared handlers from main.js will handle this)
  // Story viewer (shared handlers from main.js will handle this)
}
