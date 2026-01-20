// ===========================================
// SHARED MEDIA COMPONENTS
// Gallery, Stories, and Media rendering
// Used by: Quick Decision, Visual Menu, Deep Dive
// ===========================================

/**
 * Render product image gallery with thumbnails
 * @param {string[]} images - Array of image URLs
 * @param {object} options - Gallery options { useDots: boolean }
 * @returns {string} HTML string
 */
export function renderGallery(images, options = {}) {
  const { useDots = false } = options;
  
  if (!images || images.length === 0) {
    return `
      <div class="product-gallery">
        <div class="main-image-container">
          <div class="image-placeholder" style="height:100%;display:flex;align-items:center;justify-content:center;">📸</div>
        </div>
      </div>
    `;
  }
  
  const showNav = images.length > 1;
  
  // Generate dots HTML
  const dotsHTML = useDots && showNav ? `
    <div class="gallery-dots">
      ${images.map((_, i) => `<span class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
    </div>
  ` : '';
  
  // Counter HTML (hidden if useDots)
  const counterHTML = !useDots && showNav ? `
    <div class="gallery-counter"><span id="galleryIndex">1</span> / ${images.length}</div>
  ` : '';
  
  return `
    <div class="product-gallery" ${useDots ? 'data-use-dots="true"' : ''}>
      <div class="main-image-container">
        <img src="${images[0]}" alt="Product" class="main-image" id="mainImage">
        ${showNav ? `
          <button class="gallery-nav prev" id="galleryPrev">‹</button>
          <button class="gallery-nav next" id="galleryNext">›</button>
          ${counterHTML}
          ${dotsHTML}
        ` : ''}
      </div>
      ${showNav ? `
        <div class="thumbnails">
          ${images.map((img, i) => `
            <img src="${img}" alt="" class="thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}">
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render stories section (Instagram-style circles with optional captions)
 * @param {object[]} stories - Array of story objects { url, type, caption }
 * @param {string} sectionTitle - Section title
 * @returns {string} HTML string
 */
export function renderStories(stories, sectionTitle = 'See it in Action') {
  if (!stories || stories.length === 0) return '';
  
  // Filter only stories with valid URLs
  const validStories = stories.filter(s => s.url?.trim());
  if (validStories.length === 0) return '';
  
  return `
    <div class="stories-section">
      <h3 class="stories-title">${sectionTitle}</h3>
      <div class="stories-row">
        ${validStories.map((story, i) => `
          <div class="story-item" data-story-index="${i}">
            <div class="story-bubble">
              <img src="${story.url}" alt="Story ${i + 1}">
              ${story.type === 'video' ? '<span class="story-play">▶</span>' : ''}
            </div>
            ${story.caption ? `<span class="story-label">${story.caption}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render full-screen story viewer overlay
 * @param {object[]} stories - Array of story objects
 * @returns {string} HTML string
 */
export function renderStoryViewer(stories) {
  if (!stories || stories.length === 0) return '';
  
  return `
    <div class="story-viewer" id="storyViewer">
      <div class="story-content">
        <div class="story-progress-container">
          ${stories.map(() => `
            <div class="story-progress-bar">
              <div class="story-progress-fill"></div>
            </div>
          `).join('')}
        </div>
        <button class="story-close-btn" id="storyClose">✕</button>
        <img src="" alt="Story" class="story-image" id="storyImage">
        <div class="story-nav-left" id="storyPrev"></div>
        <div class="story-nav-right" id="storyNext"></div>
      </div>
    </div>
  `;
}

/**
 * Initialize gallery event handlers
 * Call after DOM is rendered
 * @param {string[]} images - Array of image URLs
 */
export function initGalleryHandlers(images) {
  if (!images || images.length <= 1) return;
  
  let currentIndex = 0;
  const mainImage = document.getElementById('mainImage');
  const galleryIndex = document.getElementById('galleryIndex');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  
  if (!mainImage) return;
  
  function updateGallery(index) {
    currentIndex = index;
    mainImage.src = images[index];
    if (galleryIndex) galleryIndex.textContent = index + 1;
    
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }
  
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const index = parseInt(thumb.dataset.index);
      updateGallery(index);
    });
  });
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      updateGallery(newIndex);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      updateGallery(newIndex);
    });
  }
}

/**
 * Initialize story viewer handlers
 * Call after DOM is rendered
 * @param {object[]} stories - Array of story objects
 */
export function initStoryHandlers(stories) {
  if (!stories || stories.length === 0) return;
  
  let currentStoryIndex = 0;
  const viewer = document.getElementById('storyViewer');
  const storyImage = document.getElementById('storyImage');
  const closeBtn = document.getElementById('storyClose');
  const prevArea = document.getElementById('storyPrev');
  const nextArea = document.getElementById('storyNext');
  const progressBars = document.querySelectorAll('.story-progress-fill');
  
  if (!viewer || !storyImage) return;
  
  function showStory(index) {
    if (!stories[index] || !stories[index].url) return;
    currentStoryIndex = index;
    storyImage.src = stories[index].url;
    viewer.classList.add('active');
    
    progressBars.forEach((bar, i) => {
      bar.style.width = i < index ? '100%' : i === index ? '0%' : '0%';
      if (i === index) {
        bar.style.transition = 'width 5s linear';
        setTimeout(() => bar.style.width = '100%', 50);
      }
    });
  }
  
  function closeViewer() {
    viewer.classList.remove('active');
    progressBars.forEach(bar => {
      bar.style.transition = 'none';
      bar.style.width = '0%';
    });
  }
  
  // Open story on bubble click
  document.querySelectorAll('.story-bubble').forEach(bubble => {
    bubble.addEventListener('click', () => {
      const index = parseInt(bubble.dataset.storyIndex);
      showStory(index);
    });
  });
  
  if (closeBtn) closeBtn.addEventListener('click', closeViewer);
  
  if (prevArea) {
    prevArea.addEventListener('click', () => {
      if (currentStoryIndex > 0) showStory(currentStoryIndex - 1);
    });
  }
  
  if (nextArea) {
    nextArea.addEventListener('click', () => {
      if (currentStoryIndex < stories.length - 1) {
        showStory(currentStoryIndex + 1);
      } else {
        closeViewer();
      }
    });
  }
  
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) closeViewer();
  });
}
