# JARI.ECO Navigation Design Principles
## Based on James Kalbach's "Designing Web Navigation"
## Applied to E-commerce Templates

---

## 1. CORE NAVIGATION TYPES

### 1.1 Structural Navigation
**Purpose:** Shows users where they are in the information hierarchy

**Implementation in JARI:**
- Breadcrumbs (sticky pill design)
- Back button (integrated in breadcrumb)
- Category links (clickable in breadcrumb)

**Key Principles:**
- Always show current location
- Provide escape routes (back to collection)
- Enable hierarchical exploration
- Persistent across scroll (sticky)

```
User Question: "Where am I?"
Answer: Store > Category > Product Name
```

### 1.2 Associative Navigation
**Purpose:** Connects related content for discovery

**Implementation in JARI:**
- Related Products section
- Cross-category suggestions
- "You might also like" cards

**Key Principles:**
- Show relevance (same category first)
- Template-aware presentation
- Enable serendipitous discovery
- Horizontal scroll for space efficiency

```
User Question: "What else might I want?"
Answer: Related products with context-appropriate messaging
```

### 1.3 Utility Navigation
**Purpose:** Provides tools and secondary functions

**Implementation in JARI:**
- Footer contact links (WhatsApp, Call, Instagram)
- Back to top button
- Policy links
- Skip to content (accessibility)

**Key Principles:**
- Secondary to main content
- Always accessible
- Consistent placement
- Don't distract from primary tasks

```
User Question: "How do I contact/navigate/access tools?"
Answer: Footer utilities + accessibility shortcuts
```

### 1.4 Sequential Navigation
**Purpose:** Enables linear browsing through content

**Implementation in JARI:**
- Previous/Next product navigation
- Product counter ("X of Y")
- Positioned at page bottom

**Key Principles:**
- Show progress in sequence
- Enable forward/backward movement
- Disable at boundaries
- Support browse-and-compare behavior

```
User Question: "What's next/previous?"
Answer: Prev/Next buttons with context
```

---

## 2. WAYFINDING PRINCIPLES

### 2.1 You Are Here
**Principle:** Users must always know their current location

**JARI Implementation:**
- Breadcrumb shows: Store > Category > Product
- Current item highlighted/truncated
- Sticky visibility on scroll

### 2.2 Where Can I Go
**Principle:** Clear paths to related/next content

**JARI Implementation:**
- Related products (associative)
- Category links (structural)
- Prev/Next navigation (sequential)
- Footer links (utility)

### 2.3 How Do I Get Back
**Principle:** Easy return to previous states

**JARI Implementation:**
- Dedicated back button
- Breadcrumb trail
- Browser back support
- Collection link always visible

---

## 3. TEMPLATE-SPECIFIC NAVIGATION STRATEGY

### 3.1 Deep Dive Template
**User Job:** Research high-value purchase thoroughly

**Navigation Priority:**
1. Easy return to compare (back button prominent)
2. Related premium products (cross-sell opportunity)
3. Sequential browsing (compare similar items)
4. Contact for questions (utility footer)

**Related Products Config:**
```javascript
{
  sectionTitle: 'You might also like',
  ctaText: 'View Details',
  showDescription: true,
  descriptionLength: 60
}
```

### 3.2 Visual Menu Template
**User Job:** Browse menu, order food quickly

**Navigation Priority:**
1. Category filtering (structural)
2. Related menu items (associative)
3. Quick add to order (utility CTA)
4. Contact restaurant (utility footer)

**Related Products Config:**
```javascript
{
  sectionTitle: 'More from the menu',
  ctaText: 'View Item',
  showPrepTime: true,
  showDietaryTags: true
}
```

### 3.3 Portfolio Booking Template
**User Job:** Evaluate service provider, book consultation

**Navigation Priority:**
1. Browse other services (associative)
2. Compare packages (sequential)
3. Easy contact (utility - prominent)
4. Trust signals (testimonials nav)

**Related Products Config:**
```javascript
{
  sectionTitle: 'Other services',
  ctaText: 'Learn More',
  pricePrefix: 'From '
}
```

### 3.4 Quick Decision Template
**User Job:** Fast impulse purchase

**Navigation Priority:**
1. Minimal distraction (streamlined)
2. Quick add to cart (prominent CTA)
3. More products (associative)
4. Trust signals (utility)

**Related Products Config:**
```javascript
{
  sectionTitle: 'More products',
  ctaText: 'Get This',
  showDescription: false
}
```

### 3.5 Event Landing Template
**User Job:** Get event info, purchase tickets

**Navigation Priority:**
1. Event details clear (structural)
2. Ticket options (utility)
3. Related events (associative)
4. Contact organizer (utility footer)

---

## 4. MOBILE NAVIGATION CONSIDERATIONS

### 4.1 Touch-Friendly Targets
- Minimum 44x44px touch targets
- Adequate spacing between elements
- Pill-shaped buttons for finger-friendly interaction

### 4.2 Progressive Disclosure
- Collapsible sections in dashboard
- Horizontal scroll vs. grid on mobile
- Icon-only mode for compact spaces

### 4.3 Thumb Zone Optimization
- Primary actions in bottom half of screen
- Sticky CTA accessible while scrolling
- Back button reachable with left thumb

### 4.4 Reduced Motion
- Respect `prefers-reduced-motion`
- Subtle transitions (0.15s-0.2s)
- No jarring animations

---

## 5. ACCESSIBILITY IN NAVIGATION

### 5.1 Keyboard Navigation
- Skip to main content link
- Tab order follows visual order
- Focus states clearly visible
- Enter/Space activates buttons

### 5.2 Screen Reader Support
- ARIA labels on navigation regions
- Live regions for dynamic content
- Semantic HTML (nav, button, etc.)
- Alt text on images

### 5.3 Focus Management
```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 6. NAVIGATION ANTI-PATTERNS TO AVOID

### 6.1 Mystery Navigation
❌ Icons without labels
✅ Icons with text labels (at least on hover)

### 6.2 Orphan Pages
❌ No way back to collection
✅ Always show breadcrumb/back button

### 6.3 Infinite Scroll Without Markers
❌ No sense of position in list
✅ "X of Y" counter in sequential nav

### 6.4 Hidden Navigation
❌ Hamburger menu for everything
✅ Most important nav always visible

### 6.5 Blocking CTAs
❌ Sticky CTA covers footer content
✅ Smart sticky that moves with footer

---

## 7. CSS IMPLEMENTATION PATTERNS

### 7.1 Sticky Navigation
```css
.store-breadcrumb-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(to bottom, 
    rgba(255,255,255,0.95) 0%, 
    rgba(255,255,255,0.9) 100%);
  backdrop-filter: blur(20px);
}
```

### 7.2 Smart Sticky CTA
```javascript
// Moves up when footer enters viewport
const handleScroll = () => {
  const footerRect = footer.getBoundingClientRect();
  if (footerRect.top < window.innerHeight) {
    const visibleFooter = window.innerHeight - footerRect.top;
    stickyCTA.style.bottom = `${visibleFooter + 24}px`;
  }
};
```

### 7.3 Collapsible Sections
```css
.nav-section-content {
  max-height: 500px;
  transition: max-height 0.25s ease, opacity 0.2s ease;
}

.nav-section-content.collapsed {
  max-height: 0;
  opacity: 0;
  pointer-events: none;
}
```

### 7.4 Horizontal Scroll Cards
```css
.related-products-scroll {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.related-card {
  scroll-snap-align: start;
}
```

---

## 8. GLOBAL FUNCTIONS PATTERN

### 8.1 Navigation Functions
```javascript
// Always attach to window for onclick handlers
window.showCollection = function() { /* ... */ };
window.filterByCategory = function(name) { /* ... */ };
window.viewRelatedProduct = function(id) { /* ... */ };
```

### 8.2 Why Window Assignment?
- Onclick handlers in HTML need global scope
- Template strings can't access module scope
- Consistent pattern across all templates

---

## 9. METRICS FOR NAVIGATION SUCCESS

### 9.1 Engagement Metrics
- Breadcrumb click rate (structural use)
- Related product clicks (associative discovery)
- Prev/Next usage (sequential browsing)
- Back to top clicks (utility usage)

### 9.2 Usability Metrics
- Time to find product
- Bounce rate from product pages
- Cross-sell conversion rate
- Return visitor navigation patterns

### 9.3 Accessibility Metrics
- Skip link usage
- Keyboard-only navigation success
- Screen reader completion rates

---

## 10. QUICK REFERENCE

### Navigation Type Decision Matrix

| User Need | Nav Type | JARI Component |
|-----------|----------|----------------|
| "Where am I?" | Structural | Breadcrumb |
| "Go back" | Structural | Back button |
| "Similar items" | Associative | Related Products |
| "Next/Previous" | Sequential | Product Nav |
| "Contact/Help" | Utility | Footer |
| "Go to top" | Utility | Back to Top |
| "Skip to content" | Utility | Skip Link |

### Component File Locations

| Component | File |
|-----------|------|
| Breadcrumb | `store/src/render.js` |
| Product Nav | `store/src/render.js` |
| Related Products | `store/src/shared/related-products.js` |
| Footer | `store/src/render.js` |
| Smart Sticky | `store/src/main.js` |
| Skip Link | `store/src/main.js` |
| Dashboard Nav | `dashboard/src/components/Layout.jsx` |

---

*Document Created: January 27, 2026*
*Based on: James Kalbach's "Designing Web Navigation"*
*Applied to: JARI.ECO E-commerce Platform*
