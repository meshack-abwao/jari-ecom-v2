// ===========================================
// DEEP DIVE SHOWCASE VIEWER
// Premium lightbox/modal for showcase gallery
// Magazine-style with captions inside image
// ===========================================

/**
 * Render showcase fullscreen viewer (Magazine Style)
 * @param {object[]} showcaseImages - Array of showcase image objects
 * @param {string|null} showcaseVideo - Video URL if present
 * @returns {string} HTML string
 */
export function renderShowcaseViewer(showcaseImages, showcaseVideo) {
  const hasContent = (showcaseImages && showcaseImages.length > 0) || showcaseVideo;
  if (!hasContent) return '';
  
  const totalItems = (showcaseVideo ? 1 : 0) + (showcaseImages?.length || 0);
  
  return `
    <div class="showcase-viewer" id="showcaseViewer">
      <div class="showcase-viewer-backdrop" onclick="closeShowcaseViewer()"></div>
      <div class="showcase-viewer-container">
        <button class="showcase-close" onclick="closeShowcaseViewer()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <!-- Image with Magazine Overlay INSIDE -->
        <div class="showcase-viewer-media">
          <div class="showcase-image-wrapper">
            <img class="showcase-viewer-img" id="showcaseViewerImg" src="" alt="" style="display:none;">
            <video class="showcase-viewer-video" id="showcaseViewerVideo" playsinline controls style="display:none;"></video>
            
            <!-- Magazine-style overlay with caption + description -->
            <div class="showcase-magazine-overlay">
              <span class="showcase-magazine-caption" id="showcaseMagazineCaption"></span>
              <p class="showcase-overlay-description" id="showcaseViewerDescription"></p>
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <div class="showcase-viewer-nav">
          <button class="showcase-nav-arrow prev" onclick="navigateShowcase(-1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span class="showcase-nav-count"><span id="showcaseCurrentIndex">1</span> / ${totalItems}</span>
          <button class="showcase-nav-arrow next" onclick="navigateShowcase(1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize showcase viewer event handlers
 * @param {object[]} showcaseImages - Array of showcase image objects
 * @param {string|null} showcaseVideo - Video URL if present
 */
export function initShowcaseViewerHandlers(showcaseImages, showcaseVideo) {
  const hasContent = (showcaseImages && showcaseImages.length > 0) || showcaseVideo;
  if (!hasContent) return;
  
  let currentIndex = 0;
  const totalItems = (showcaseVideo ? 1 : 0) + (showcaseImages?.length || 0);
  
  const viewer = document.getElementById('showcaseViewer');
  const img = document.getElementById('showcaseViewerImg');
  const video = document.getElementById('showcaseViewerVideo');
  const caption = document.getElementById('showcaseMagazineCaption');
  const description = document.getElementById('showcaseViewerDescription');
  const indexDisplay = document.getElementById('showcaseCurrentIndex');
  
  if (!viewer) return;
  
  function showItem(index) {
    currentIndex = index;
    indexDisplay.textContent = index + 1;
    
    // Determine if this is video or image
    const isVideo = showcaseVideo && index === 0;
    
    if (isVideo) {
      img.style.display = 'none';
      video.style.display = 'block';
      video.src = showcaseVideo;
      caption.textContent = '';
      description.textContent = '';
    } else {
      const imageIndex = showcaseVideo ? index - 1 : index;
      const item = showcaseImages[imageIndex];
      
      video.style.display = 'none';
      video.pause();
      img.style.display = 'block';
      img.src = item.url;
      caption.textContent = item.caption || '';
      description.textContent = item.description || '';
    }
    
    viewer.classList.add('active');
  }
  
  // Expose navigation function globally
  window.navigateShowcase = function(delta) {
    let newIndex = currentIndex + delta;
    if (newIndex < 0) newIndex = totalItems - 1;
    if (newIndex >= totalItems) newIndex = 0;
    showItem(newIndex);
  };
  
  // Expose close function globally
  window.closeShowcaseViewer = function() {
    viewer.classList.remove('active');
    if (video) {
      video.pause();
      video.src = '';
    }
  };
  
  // Click on showcase items to open
  document.querySelectorAll('.showcase-item').forEach(item => {
    item.addEventListener('click', () => {
      const isVideo = item.dataset.type === 'video';
      const index = isVideo ? 0 : parseInt(item.dataset.index) + (showcaseVideo ? 1 : 0);
      showItem(index);
    });
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!viewer.classList.contains('active')) return;
    
    if (e.key === 'Escape') window.closeShowcaseViewer();
    if (e.key === 'ArrowLeft') window.navigateShowcase(-1);
    if (e.key === 'ArrowRight') window.navigateShowcase(1);
  });
}
