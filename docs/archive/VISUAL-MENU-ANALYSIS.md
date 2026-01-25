# Visual Menu Template - JTBD/ODI Analysis & Improvements
## Deep Dive: Typography Psychology + Customer Jobs

---

## 1. UNDERSTANDING THE FOOD ORDERING JOB

### Main Job Statement
**"Help me decide what to eat and order it easily"**

### Job Performer Context (Kenya/East Africa)
- Instagram/WhatsApp food sellers
- Small restaurants, cafes, food vendors
- Home-based food businesses (mama fua, bakers)
- Meal prep services

### Circumstances
- Browsing on mobile (90%+ users)
- Often hungry (emotional state: craving)
- Time-sensitive (lunch hour, dinner planning)
- Budget-conscious (need to see prices quickly)
- Trust concerns (food quality, hygiene)

---

## 2. JOB MAP: 8 STEPS IN FOOD ORDERING

| Step | Job | Emotional Need | Current Template | Gap |
|------|-----|----------------|------------------|-----|
| **1. DISCOVER** | "What food is available?" | Excitement, curiosity | ❌ No category nav | Need menu categories |
| **2. BROWSE** | "What looks appetizing?" | Appetite stimulation | ⚠️ Basic gallery | Need food photography focus |
| **3. EVALUATE** | "Is this what I want?" | Confidence in choice | ⚠️ Generic description | Need taste/texture cues |
| **4. COMPARE** | "What else is there?" | FOMO management | ❌ Single item view | Need related items |
| **5. CUSTOMIZE** | "Can I modify this?" | Control, personalization | ❌ No add-ons | Need extras/modifications |
| **6. VERIFY TRUST** | "Is this safe/quality?" | Safety, hygiene confidence | ⚠️ Only testimonials | Need food safety badges |
| **7. ORDER** | "How do I get this?" | Ease, speed | ⚠️ Basic CTA | Need delivery/pickup options |
| **8. CONFIRM** | "When will it arrive?" | Anticipation, certainty | ❌ No ETA | Need time estimates |

---

## 3. TYPOGRAPHY PSYCHOLOGY FOR FOOD

### Key Research Findings (Sarah Hyndman / Crossmodal Lab)

#### Shape-Taste Associations
| Shape | Taste Association | Font Type |
|-------|-------------------|-----------|
| **Rounded** | Sweet, creamy, soft | VAG Rounded, Cooper Black |
| **Angular** | Sour, bitter, crunchy | Gothic, Impact |
| **Curvy/Script** | Indulgent, decadent | Scripts, decorative |
| **Light weight** | Diet, healthy, fresh | Thin sans-serifs |
| **Heavy weight** | Rich, full-fat, hearty | Bold slab serifs |

#### Critical Insight: Menus Change Taste Perception
> "Dr. David Lewis found that those who read the Lucida Calligraphy menu rated the soup as tasting **64% tastier, fresher and more enjoyable**. Twice as many said they were likely to purchase it."

**Implication:** The font we use on our menu LITERALLY changes how the food tastes to customers.

#### Food Packaging Typography Key
| Style | Association |
|-------|-------------|
| **Curvilinear** | Sweet, soft, melting, creamy |
| **Angular** | Salty, crunchy, sour |
| **Script** | Casual, sweet, naughty, decadent |
| **Light serif** | Expensive, healthy, slow food |
| **Bold sans** | Budget, fast food, unhealthy |
| **Condensed** | Cheap, instant, fast |

---

## 4. CURRENT TEMPLATE ANALYSIS

### What's Working ✅
1. **Dietary tags with emojis** - Clear visual communication
2. **Prep time display** - Sets expectations
3. **Calories display** - Health-conscious users
4. **Allergens notice** - Trust/safety
5. **Ingredients section** - Transparency

### What's Missing ❌
1. **No category navigation** - Can't browse menu
2. **No "popular" or "recommended" badges** - No social proof on items
3. **No customization/add-ons** - Lost upsell opportunity
4. **No delivery time estimate** - Uncertainty
5. **No portion size indicator** - Value perception
6. **Typography is generic** - Not appetite-stimulating

### Typography Issues 🔤
1. **Product name**: Using system font, not food-appropriate
2. **Price**: Standard display, not integrated with value perception
3. **Description**: Generic paragraph style
4. **No "sensory" language styling** - "Crispy", "Creamy" should LOOK different

---

## 5. IMPROVEMENT RECOMMENDATIONS

### A. Typography Overhaul

#### 1. Food Name Typography
**Current:** Generic bold heading
**Proposed:** Rounded, slightly playful font that stimulates appetite

```css
.vm-food-name {
  font-family: 'DM Sans', 'Nunito', sans-serif; /* Rounded friendly */
  font-weight: 700;
  letter-spacing: -0.02em; /* Slightly tight = premium */
  font-size: clamp(24px, 5vw, 32px);
}
```

#### 2. Price Typography
**Current:** Standard price display
**Proposed:** Integrated with value badges

```
Instead of: KES 850
Show: KES 850 · Serves 2 · ⭐ Popular
```

#### 3. Description with Sensory Styling
**Concept:** Key taste words get visual treatment

```html
<p class="vm-description">
  A <span class="vm-sensory vm-crispy">crispy</span>, 
  <span class="vm-sensory vm-creamy">creamy</span> delight...
</p>
```

```css
.vm-sensory.vm-crispy { 
  font-weight: 600; 
  letter-spacing: 0.02em; /* Angular = crunchy */
}
.vm-sensory.vm-creamy { 
  font-style: italic; 
  font-weight: 400; /* Soft = smooth */
}
```

### B. Structure Improvements

#### 1. Add Category Pills (Top Navigation)
```
[🍔 Mains] [🥗 Sides] [🍹 Drinks] [🍰 Desserts]
```

#### 2. Add Value/Popularity Badges
```
⭐ Best Seller | 🔥 Popular | 💚 Healthy Choice | 👨‍👩‍👧 Family Size
```

#### 3. Add Portion Indicator
```
Serves: 1 person | 2-3 people | Family (4+)
```

#### 4. Add Customization Section
```
ADD EXTRAS
[ ] Extra cheese +KES 50
[ ] Double portion +KES 150
[ ] Make it spicy 🌶️ +KES 0
```

#### 5. Add Delivery/Time Info
```
📍 Delivery: 30-45 mins | 🏃 Pickup: 15 mins
```

### C. Trust Architecture for Food

#### Food Safety Badges (New Section)
```
┌─────────────────────────────────────┐
│ 🧑‍🍳 Freshly Made | 🧊 Hygiene Cert  │
│ 📦 Secure Packaging | ⏱️ Fast Prep  │
└─────────────────────────────────────┘
```

#### Ingredient Transparency
- Source indicators: "Locally sourced chicken"
- Freshness: "Made today"
- Allergen prominence

### D. Visual Hierarchy Restructure

**Current Order:**
1. Image → 2. Name/Price → 3. Tags → 4. Stories → 5. Description → 6. Ingredients → 7. Allergens → 8. Quantity → 9. CTA

**Proposed Order (JTBD-Optimized):**
1. **Image** (appetite trigger)
2. **Name + Popular Badge** (what is it)
3. **Price + Portion + Prep Time** (value assessment)
4. **Dietary Tags** (quick filters)
5. **Short Description with Sensory Words** (desire building)
6. **Customization/Add-ons** (upsell)
7. **Trust Badges** (safety confidence)
8. **Quantity + Delivery Options**
9. **CTA: "Add to Order"**
10. **Testimonials** (social proof - can scroll to)

---

## 6. MOBILE-FIRST CONSIDERATIONS

### Thumb-Zone Optimization
- CTA button in easy thumb reach
- Category pills horizontal scroll
- Quantity controls large enough for tap

### Speed Optimization
- Lazy load images
- Show skeleton while loading
- Cache menu data

### WhatsApp Integration
- "Order via WhatsApp" as secondary CTA
- Pre-filled message with item details

---

## 7. COLOR PSYCHOLOGY FOR FOOD

### Appetite-Stimulating Colors
| Color | Effect | Use For |
|-------|--------|---------|
| **Red/Orange** | Increases appetite | CTA buttons, sale tags |
| **Yellow** | Happiness, warmth | Background accents |
| **Green** | Fresh, healthy | Vegetarian tags, health badges |
| **Brown** | Earthy, comfort | Coffee, baked goods |
| **White** | Clean, fresh | Background, hygiene signals |

### Colors to Avoid
- Blue (appetite suppressant)
- Purple (rarely used in food, feels artificial)
- Gray (unappetizing)

---

## 8. IMPLEMENTATION PRIORITY

### Phase 1: Quick Wins (This Session)
1. ✅ Typography improvements (rounded fonts)
2. ✅ Price + portion integration
3. ✅ Popular/Best Seller badges
4. ✅ Trust badges for food safety

### Phase 2: Structure (Next Session)
1. Category navigation pills
2. Customization/add-ons section
3. Delivery time estimates
4. Related items section

### Phase 3: Advanced (Future)
1. Sensory word styling
2. WhatsApp ordering flow
3. Menu browsing mode (multi-item view)
4. Order tracking

---

## 9. SUCCESS METRICS

| Metric | Current | Target |
|--------|---------|--------|
| Time to first order | Unknown | < 60 seconds |
| Add-on attachment rate | 0% | 25% |
| Menu item views to order | Unknown | > 15% |
| Return customer rate | Unknown | > 40% |

---

## 10. SUMMARY: THE FOOD MENU FORMULA

```
APPETITE = 
  (Rounded Typography × Food Photography) 
  + (Clear Pricing × Portion Clarity)
  + (Trust Badges × Hygiene Signals)
  + (Easy Ordering × Fast Delivery Promise)
```

**The key insight:** A menu isn't just information - it's appetite stimulation. Every typography choice, every layout decision should make the customer HUNGRIER and more CONFIDENT to order.

---

*Document created: January 22, 2026*
*For: Jari.Ecom V2 Visual Menu Template Enhancement*
