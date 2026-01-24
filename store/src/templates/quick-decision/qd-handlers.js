// ===========================================
// QUICK DECISION TEMPLATE - HANDLERS
// Event handlers for Quick Decision template
// Isolated for independent evolution
// ===========================================

import { state } from '../../state.js';
import { initGalleryHandlers, initStoryHandlers } from '../../shared/media-components.js';
import { initPolicyModalHandlers } from '../../shared/policy-modals.js';
import { navigateToCollection } from '../../shared/utils.js';

/**
 * Initialize Quick Decision template event handlers
 * Called after template is rendered into DOM
 * @param {object} product - Product object
 */
export function initQuickDecisionHandlers(product) {
  const media = product?.media || {};
  
  // Gallery handlers
  initGalleryHandlers(media.images || []);
  
  // Story handlers
  initStoryHandlers(media.stories || []);
  
  // Policy modal handlers
  initPolicyModalHandlers();
  
  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigateToCollection();
    });
  }
  
  // Like button
  const likeBtn = document.getElementById('likeBtn');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      likeBtn.textContent = likeBtn.textContent === '🤍' ? '❤️' : '🤍';
    });
  }
  
  // Share button
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: state.selectedProduct?.data?.name || 'Product',
        text: state.selectedProduct?.data?.description || '',
        url: window.location.href
      };
      
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    });
  }
  
  // Gallery navigation is handled by shared gallery handlers
  // Buy button handler is handled by main.js checkout flow
}
