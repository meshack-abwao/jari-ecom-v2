// ===========================================
// SHARED MODULES INDEX
// Central export for all shared components
// ===========================================

// Utility functions
export { 
  formatPrice, 
  formatDate, 
  truncateText, 
  generateWhatsAppLink,
  getInitials,
  sanitizeHTML,
  deepClone,
  debounce,
  isEmpty 
} from './utils.js';

// Policy modals
export { 
  renderProductPolicyLinks, 
  renderProductPolicyModals, 
  renderStorePolicyModals,
  initPolicyModalHandlers 
} from './policy-modals.js';

// Media components (gallery, stories)
export { 
  renderGallery, 
  renderStories, 
  renderStoryViewer,
  initGalleryHandlers,
  initStoryHandlers 
} from './media-components.js';

// Testimonials
export { 
  renderTestimonials, 
  renderTestimonialCard,
  renderStoreTestimonials,
  renderMenuTestimonials 
} from './testimonials.js';

// Quantity controls
export { 
  renderQuantitySection, 
  initQuantityHandlers,
  getQuantityState 
} from './quantity-controls.js';
