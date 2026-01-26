// ===========================================
// JARI.ECOM LANDING PAGE
// JTBD/ODI Optimized Messaging + Premium Design
// ===========================================

const LOGIN_URL = 'https://dashboard.jarisolutionsecom.store/login';
const SIGNUP_URL = 'https://dashboard.jarisolutionsecom.store/signup';
const WHATSAPP_URL = 'https://wa.me/254751433625?text=Hi!%20I%27m%20interested%20in%20Jari.Ecom';
const LOGO_URL = 'https://res.cloudinary.com/dmfrtzgkv/image/upload/v1769389089/image_3_sjvgdg.svg';

export function renderLandingPage() {
  return `
<div class="jari-landing">
  
  <!-- TOP BANNER -->
  <div class="jari-top-banner">
    🇰🇪 Built for Kenyan entrepreneurs · M-Pesa native · Launch in 10 minutes
  </div>

  <!-- HEADER -->
  <header class="jari-header">
    <div class="jari-header-content">
      <a href="/" class="jari-logo">
        <img src="${LOGO_URL}" alt="Jari" class="jari-logo-img">
        <div class="jari-logo-separator"></div>
        <span class="jari-logo-text">Jari<span>.Ecom</span></span>
      </a>
      
      <nav class="jari-nav">
        <a href="#jari-features">Features</a>
        <a href="#jari-pricing">Pricing</a>
        <a href="#jari-how-it-works">How It Works</a>
        <a href="#jari-who-its-for">Who It's For</a>
      </nav>
      
      <div class="jari-header-cta">
        <a href="${LOGIN_URL}" class="jari-btn jari-btn-outline">Sign in</a>
        <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary">Get started</a>
      </div>
      
      <button class="jari-mobile-toggle" id="jariMobileToggle">☰</button>
    </div>
    
    <div class="jari-mobile-menu" id="jariMobileMenu">
      <a href="#jari-features">Features</a>
      <a href="#jari-pricing">Pricing</a>
      <a href="#jari-how-it-works">How It Works</a>
      <a href="#jari-who-its-for">Who It's For</a>
      <a href="${LOGIN_URL}">Sign in</a>
      <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary">Get started</a>
    </div>
  </header>

  <!-- HERO - JTBD: The job is "Get paid for my products without the DM chaos" -->
  <section class="jari-hero jari-animate">
    <div class="jari-hero-badge">
      <span></span> Trusted by 100+ Kenyan sellers
    </div>
    <h1>Your customers want to buy.<br><span class="highlight">Make it easy.</span></h1>
    <p class="jari-hero-subtitle">
      Stop losing sales in DMs. Give your Instagram and WhatsApp customers 
      a professional checkout with M-Pesa—they pay instantly, you ship.
    </p>
    <div class="jari-hero-cta">
      <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary jari-btn-large">
        Create your store
      </a>
      <a href="${WHATSAPP_URL}" target="_blank" class="jari-btn jari-btn-outline jari-btn-large">
        Talk to us
      </a>
    </div>
    
    <div class="jari-hero-stats">
      <div class="jari-stat">
        <span class="jari-stat-number">10 min</span>
        <span class="jari-stat-label">Setup</span>
      </div>
      <div class="jari-stat">
        <span class="jari-stat-number">KES 1,200</span>
        <span class="jari-stat-label">Monthly</span>
      </div>
      <div class="jari-stat">
        <span class="jari-stat-number">M-Pesa</span>
        <span class="jari-stat-label">Built-in</span>
      </div>
    </div>
  </section>

  <!-- PROBLEM - Emotional triggers based on unmet outcomes -->
  <section class="jari-problem-section jari-animate">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">Sound familiar?</span>
        <h2>The DM trap</h2>
        <p>You're great at what you sell. But selling through DMs is exhausting.</p>
      </div>
      
      <div class="jari-problems-grid">
        <div class="jari-problem-card jari-animate-child">
          <svg class="jari-problem-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <h3>"Send me pics"</h3>
          <p>Hours spent sending photos one by one, explaining the same thing, only for them to ghost.</p>
        </div>
        
        <div class="jari-problem-card jari-animate-child">
          <svg class="jari-problem-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3>"I'll pay tomorrow"</h3>
          <p>You hold items, they disappear. No commitment. No M-Pesa ping. Just wasted time.</p>
        </div>
        
        <div class="jari-problem-card jari-animate-child">
          <svg class="jari-problem-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          <h3>Missed at 3am</h3>
          <p>Serious buyers message late. By morning, they bought from someone who replied faster.</p>
        </div>
        
        <div class="jari-problem-card jari-animate-child">
          <svg class="jari-problem-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
          <h3>"What did they order?"</h3>
          <p>Scrolling through 50 chats to find one order. No records. No system. Just chaos.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- WHO IT'S FOR - Business Types with Image Cards -->
  <section class="jari-who-section jari-animate" id="jari-who-its-for">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">Perfect for you</span>
        <h2>One platform, endless possibilities</h2>
        <p>Whether you bake cakes AND teach classes, or cut hair AND sell products—manage everything in one place.</p>
      </div>
      
      <div class="jari-business-grid">
        <!-- Food & Bakery -->
        <div class="jari-business-card jari-animate-child">
          <div class="jari-business-image" style="background-image: url('https://res.cloudinary.com/dmfrtzgkv/image/upload/v1769448873/cake_itfnhz.png')">
            <div class="jari-business-overlay">
              <h3>Bakers & Food Business</h3>
              <span class="jari-business-template">Visual Menu template</span>
            </div>
          </div>
          <div class="jari-business-content">
            <p class="jari-business-pain">"I spend more time on WhatsApp than baking."</p>
            <ul class="jari-business-solve">
              <li>Visual menu with mouth-watering photos</li>
              <li>Customers order & pay before you start</li>
              <li>No more "I'll pick up but didn't pay"</li>
              <li><strong>Bonus:</strong> Sell baking classes too!</li>
            </ul>
          </div>
        </div>
        
        <!-- Fashion & Boutique -->
        <div class="jari-business-card jari-animate-child">
          <div class="jari-business-image" style="background-image: url('https://res.cloudinary.com/dmfrtzgkv/image/upload/v1769450282/virtual-photoshoot-4_ohqxtl.png')">
            <div class="jari-business-overlay">
              <h3>Fashion & Boutique</h3>
              <span class="jari-business-template">Quick Sell template</span>
            </div>
          </div>
          <div class="jari-business-content">
            <p class="jari-business-pain">"Sending size charts 20 times a day is killing me."</p>
            <ul class="jari-business-solve">
              <li>Professional product pages with all details</li>
              <li>Size guides, colors, variants—all visible</li>
              <li>Customers browse 24/7, you sleep</li>
              <li><strong>Bonus:</strong> Personal styling sessions too!</li>
            </ul>
          </div>
        </div>
        
        <!-- Beauty & Salon -->
        <div class="jari-business-card jari-animate-child">
          <div class="jari-business-image" style="background-image: url('https://res.cloudinary.com/dmfrtzgkv/image/upload/v1769448592/benyamin-bohlouli-LGXN4OSQSa4-unsplash_1_cgzlc1.jpg')">
            <div class="jari-business-overlay">
              <h3>Beauty & Hair Salon</h3>
              <span class="jari-business-template">Booking template</span>
            </div>
          </div>
          <div class="jari-business-content">
            <p class="jari-business-pain">"No-shows are ruining my schedule and income."</p>
            <ul class="jari-business-solve">
              <li>Booking calendar with deposits</li>
              <li>Clients pay to confirm—no more ghosts</li>
              <li>Sell your products alongside services</li>
              <li><strong>Bonus:</strong> Gift cards & packages!</li>
            </ul>
          </div>
        </div>
        
        <!-- Coaches & Consultants -->
        <div class="jari-business-card jari-animate-child">
          <div class="jari-business-image" style="background-image: url('https://res.cloudinary.com/dmfrtzgkv/image/upload/v1769448458/virtual-photoshoot-2_nj1y6v.png')">
            <div class="jari-business-overlay">
              <h3>Coaches & Trainers</h3>
              <span class="jari-business-template">Booking template</span>
            </div>
          </div>
          <div class="jari-business-content">
            <p class="jari-business-pain">"Chasing payment before every session is awkward."</p>
            <ul class="jari-business-solve">
              <li>Sell courses, sessions, packages</li>
              <li>Clients book AND pay upfront</li>
              <li>Offer 1-on-1 AND group sessions</li>
              <li><strong>Bonus:</strong> Sell digital products too!</li>
            </ul>
          </div>
        </div>
        
        <!-- Electronics & Tech -->
        <div class="jari-business-card jari-animate-child">
          <div class="jari-business-image" style="background-image: url('https://res.cloudinary.com/dmfrtzgkv/image/upload/v1769448456/amanz-7mMvHZePkT8-unsplash_vtrdjm.jpg')">
            <div class="jari-business-overlay">
              <h3>Electronics & Gadgets</h3>
              <span class="jari-business-template">Deep Dive template</span>
            </div>
          </div>
          <div class="jari-business-content">
            <p class="jari-business-pain">"Customers want specs, warranty info, comparisons."</p>
            <ul class="jari-business-solve">
              <li>Detailed product pages with specs</li>
              <li>Show warranty, features, what's included</li>
              <li>Build trust before they buy</li>
              <li><strong>Bonus:</strong> Repair booking services!</li>
            </ul>
          </div>
        </div>
        
        <!-- Restaurants & Cafes -->
        <div class="jari-business-card jari-animate-child">
          <div class="jari-business-image" style="background-image: url('https://res.cloudinary.com/dmfrtzgkv/image/upload/v1769448618/luisa-brimble-aFzg83dvnAI-unsplash_pfrvra.jpg')">
            <div class="jari-business-overlay">
              <h3>Restaurants & Cafes</h3>
              <span class="jari-business-template">Visual Menu template</span>
            </div>
          </div>
          <div class="jari-business-content">
            <p class="jari-business-pain">"Order-taking on WhatsApp during rush hour is chaos."</p>
            <ul class="jari-business-solve">
              <li>Digital menu customers browse themselves</li>
              <li>Orders come in organized with details</li>
              <li>Table reservations with deposits</li>
              <li><strong>Bonus:</strong> Catering packages!</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="jari-multi-business jari-animate">
        <div class="jari-multi-business-content">
          <svg class="jari-multi-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <h3>Run multiple businesses? No problem.</h3>
          <p>One dashboard. Multiple offerings. A baker who teaches classes. A hairdresser who sells products. A coach who offers courses AND 1-on-1 sessions. We handle it all.</p>
          <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary">See how it works</a>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES - Outcome-based, not feature-based -->
  <section class="jari-features-section jari-animate" id="jari-features">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">The solution</span>
        <h2>Everything you need to sell professionally</h2>
        <p>Tools that used to cost millions—now accessible to every Kenyan entrepreneur.</p>
      </div>
      
      <div class="jari-features-grid">
        <div class="jari-feature-card jari-animate-child">
          <svg class="jari-feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          <h3>M-Pesa STK Push</h3>
          <p>Customer taps "Pay", gets the M-Pesa prompt, done. No screenshots. No "send to till". Money lands automatically.</p>
        </div>
        
        <div class="jari-feature-card jari-animate-child">
          <svg class="jari-feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
          </svg>
          <h3>Templates that convert</h3>
          <p>Designed for different businesses: Quick checkout for impulse buys, Deep Dive for premium items, Visual Menu for food.</p>
        </div>
        
        <div class="jari-feature-card jari-animate-child">
          <svg class="jari-feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
          <h3>One link, everywhere</h3>
          <p>Drop it in your Instagram bio, WhatsApp status, anywhere. Customers see everything, pay instantly—24/7, while you sleep.</p>
        </div>
        
        <div class="jari-feature-card jari-animate-child">
          <svg class="jari-feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <h3>Know your numbers</h3>
          <p>See every order, track what's selling, understand your customers. Real business intelligence, not guesswork.</p>
        </div>
        
        <div class="jari-feature-card jari-animate-child">
          <svg class="jari-feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <h3>WhatsApp integration</h3>
          <p>Instant order alerts. Auto-replies when you're busy. Never miss a sale because you couldn't respond fast enough.</p>
        </div>
        
        <div class="jari-feature-card jari-animate-child">
          <svg class="jari-feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          <h3>Grows with you</h3>
          <p>Start with 3 products, scale to hundreds. Add features as you need them. Your store evolves with your business.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="jari-how-section jari-animate" id="jari-how-it-works">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">Simple setup</span>
        <h2>Selling in 3 steps</h2>
        <p>From zero to taking orders in under 10 minutes</p>
      </div>
      
      <div class="jari-steps-grid">
        <div class="jari-step-card jari-animate-child">
          <div class="jari-step-number">1</div>
          <h3>Create your store</h3>
          <p>Pick your template, add your logo and colors. Your professional store is ready in minutes—no tech skills needed.</p>
        </div>
        
        <div class="jari-step-card jari-animate-child">
          <div class="jari-step-number">2</div>
          <h3>Add your products</h3>
          <p>Upload photos, set prices, write descriptions. Each product gets a beautiful page designed to convert browsers into buyers.</p>
        </div>
        
        <div class="jari-step-card jari-animate-child">
          <div class="jari-step-number">3</div>
          <h3>Share and sell</h3>
          <p>Post your link on Instagram, WhatsApp, Facebook. Customers click, browse, pay via M-Pesa. You just fulfill orders.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW PRICING WORKS - Story/Journey Section -->
  <section class="jari-pricing-journey jari-animate">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">How it works</span>
        <h2>Pricing that makes sense</h2>
        <p>Start small, grow big. Only pay for what you actually use.</p>
      </div>
      
      <div class="jari-journey-timeline">
        <div class="jari-journey-step jari-animate-child">
          <div class="jari-journey-marker">1</div>
          <div class="jari-journey-content">
            <h4>Start with your base</h4>
            <p><strong>KES 1,200/month</strong> gets you the platform—dashboard, store link, 3 product slots, and your first theme matched to your business.</p>
          </div>
        </div>
        
        <div class="jari-journey-step jari-animate-child">
          <div class="jari-journey-marker">2</div>
          <div class="jari-journey-content">
            <h4>One-time setup</h4>
            <p><strong>KES 5,000</strong> (or split KES 2,500 × 2). We create your account, unlock your theme, and optionally walk you through everything. Try free for a week first!</p>
          </div>
        </div>
        
        <div class="jari-journey-step jari-animate-child">
          <div class="jari-journey-marker">3</div>
          <div class="jari-journey-content">
            <h4>Add power features</h4>
            <p>Want M-Pesa auto-payments? <strong>+KES 300/mo</strong>. WhatsApp notifications? <strong>+KES 80/mo</strong>. Pick only what you need.</p>
          </div>
        </div>
        
        <div class="jari-journey-step jari-animate-child">
          <div class="jari-journey-marker">4</div>
          <div class="jari-journey-content">
            <h4>Expand as you grow</h4>
            <p>Need more products? Buy card packs (one-time). Want a new look? Buy additional templates. Multiple businesses? Add more themes. All permanent purchases.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING - Clean, premium, setup fee inside -->
  <section class="jari-pricing-section jari-animate" id="jari-pricing">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">Transparent pricing</span>
        <h2>Simple. Affordable. No surprises.</h2>
        <p>Pay for what you use. Scale when you're ready.</p>
      </div>
      
      <div class="jari-pricing-main">
        <div class="jari-pricing-card">
          <div class="jari-pricing-badge">Most Popular</div>
          <h2>Monthly Subscription</h2>
          
          <div class="jari-pricing-amount">
            <div class="jari-price-main"><span>KES </span>1,200<span>/mo</span></div>
            <div class="jari-price-period">Base platform</div>
          </div>
          
          <ul class="jari-pricing-features">
            <li><span class="jari-check-icon">✓</span> 3 product cards included</li>
            <li><span class="jari-check-icon">✓</span> 1 theme (matched to your business)</li>
            <li><span class="jari-check-icon">✓</span> Order management dashboard</li>
            <li><span class="jari-check-icon">✓</span> Your own store link</li>
            <li><span class="jari-check-icon">✓</span> Basic analytics</li>
          </ul>
          
          <div class="jari-pricing-setup-included">
            <h4>One-time setup: <span class="jari-setup-price">KES 5,000</span></h4>
            <p>Account creation, theme unlock, optional onboarding call</p>
            <div class="jari-setup-options">
              <div class="jari-setup-option"><strong>Pay upfront:</strong> KES 5,000 once</div>
              <div class="jari-setup-option"><strong>Split it:</strong> KES 2,500 × 2 months</div>
              <div class="jari-setup-option jari-setup-highlight"><strong>Try first:</strong> 1 week free trial</div>
            </div>
          </div>
          
          <div class="jari-pricing-addons">
            <h4>Add what you need</h4>
            <div class="jari-addon-item">
              <span>M-Pesa STK Push</span>
              <span class="jari-addon-price">+KES 300/mo</span>
            </div>
            <div class="jari-addon-item">
              <span>WhatsApp auto-reply</span>
              <span class="jari-addon-price">+KES 80/mo</span>
            </div>
            <div class="jari-addon-item">
              <span>Advanced analytics</span>
              <span class="jari-addon-price">+KES 200/mo</span>
            </div>
            <div class="jari-addon-item">
              <span>Priority support</span>
              <span class="jari-addon-price">+KES 500/mo</span>
            </div>
          </div>
          
          <div class="jari-pricing-popular">
            <strong>Most sellers pay:</strong> KES 1,500/mo (Base + M-Pesa)
          </div>
          
          <div class="jari-pricing-cta">
            <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary jari-btn-large">
              Start your store
            </a>
            <p class="jari-pricing-note">First theme free · Cancel anytime</p>
          </div>
        </div>
      </div>
      
      <div class="jari-pricing-extras">
        <div class="jari-extras-header">
          <h3>One-time purchases</h3>
          <p>Buy once, keep forever. Expand when you're ready.</p>
        </div>
        
        <div class="jari-extras-grid">
          <div class="jari-extras-card jari-animate-child">
            <h4>Product Cards</h4>
            <p>Slots for your products. Buy more as you grow.</p>
            <div class="jari-extras-table">
              <div class="jari-extras-row">
                <span>Included</span>
                <span>3 cards</span>
                <span class="jari-free">FREE</span>
              </div>
              <div class="jari-extras-row">
                <span>Starter Pack</span>
                <span>7 cards total</span>
                <span>KES 350</span>
              </div>
              <div class="jari-extras-row">
                <span>Growth Pack</span>
                <span>10 cards total</span>
                <span>KES 550</span>
              </div>
              <div class="jari-extras-row">
                <span>Pro Pack</span>
                <span>15 cards total</span>
                <span>KES 850</span>
              </div>
            </div>
          </div>
          
          <div class="jari-extras-card jari-animate-child">
            <h4>Templates</h4>
            <p>Checkout styles optimized for your business type.</p>
            <div class="jari-extras-table">
              <div class="jari-extras-row">
                <span>First Theme</span>
                <span>Matched to you</span>
                <span class="jari-free">FREE</span>
              </div>
              <div class="jari-extras-row">
                <span>Quick Sell</span>
                <span>Fast checkout</span>
                <span>KES 500</span>
              </div>
              <div class="jari-extras-row">
                <span>Visual Menu</span>
                <span>Food & bakery</span>
                <span>KES 600</span>
              </div>
              <div class="jari-extras-row">
                <span>Deep Dive</span>
                <span>Premium items</span>
                <span>KES 800</span>
              </div>
              <div class="jari-extras-row">
                <span>Booking</span>
                <span>Services & appointments</span>
                <span>KES 1,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="jari-testimonials-section jari-animate">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">Success stories</span>
        <h2>Sellers who made the switch</h2>
        <p>Real results from real Kenyan entrepreneurs</p>
      </div>
      
      <div class="jari-testimonials-grid">
        <div class="jari-testimonial-card jari-animate-child">
          <div class="jari-testimonial-stars">★★★★★</div>
          <p class="jari-testimonial-text">"I was losing so many sales on Instagram. Now customers click my link, see a professional page, and pay via M-Pesa immediately. My sales doubled in the first month."</p>
          <div class="jari-testimonial-author">
            <div class="jari-author-avatar">W</div>
            <div class="jari-author-info">
              <h4>Wanjiku M.</h4>
              <p>Fashion · Nairobi</p>
            </div>
          </div>
        </div>
        
        <div class="jari-testimonial-card jari-animate-child">
          <div class="jari-testimonial-stars">★★★★★</div>
          <p class="jari-testimonial-text">"Finally, something built for Kenya! The M-Pesa checkout just works. No more chasing customers for payment screenshots. Orders come in complete with all details."</p>
          <div class="jari-testimonial-author">
            <div class="jari-author-avatar">K</div>
            <div class="jari-author-info">
              <h4>Kevin O.</h4>
              <p>Electronics · Mombasa</p>
            </div>
          </div>
        </div>
        
        <div class="jari-testimonial-card jari-animate-child">
          <div class="jari-testimonial-stars">★★★★★</div>
          <p class="jari-testimonial-text">"I'm not tech-savvy at all, but I had my store up in one afternoon. My customers keep saying my shop looks so professional. Game changer."</p>
          <div class="jari-testimonial-author">
            <div class="jari-author-avatar">N</div>
            <div class="jari-author-info">
              <h4>Nancy K.</h4>
              <p>Beauty Products · Kisumu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="jari-cta-section jari-animate">
    <div class="jari-container">
      <h2>Ready to sell like a pro?</h2>
      <p>Join hundreds of Kenyan entrepreneurs who've upgraded from DM chaos to a real online store. Your customers are waiting.</p>
      
      <div class="jari-cta-buttons">
        <a href="${SIGNUP_URL}" class="jari-btn jari-btn-white jari-btn-large">
          Start your store now
        </a>
        <a href="${WHATSAPP_URL}" target="_blank" class="jari-btn jari-btn-dark jari-btn-large">
          Talk to us first
        </a>
      </div>
      <p class="jari-cta-note">✓ 1-week free trial · ✓ 10-minute setup · ✓ Cancel anytime</p>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="jari-footer">
    <div class="jari-container">
      <div class="jari-footer-content">
        <div class="jari-footer-brand">
          <div class="jari-logo">
            <img src="${LOGO_URL}" alt="Jari" class="jari-logo-img">
            <span class="jari-logo-text">Jari<span>.Ecom</span></span>
          </div>
          <p>Built for Kenyan entrepreneurs.<br>Escape the DM trap. Sell professionally.</p>
        </div>
        
        <div class="jari-footer-links">
          <div>
            <h4>Product</h4>
            <a href="#jari-features">Features</a>
            <a href="#jari-pricing">Pricing</a>
            <a href="#jari-how-it-works">How It Works</a>
          </div>
          
          <div>
            <h4>Support</h4>
            <a href="${WHATSAPP_URL}" target="_blank">WhatsApp</a>
            <a href="mailto:support@jari.co.ke">Email</a>
          </div>
          
          <div>
            <h4>Legal</h4>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
      
      <div class="jari-footer-bottom">
        <p>© 2026 Jari Business Solutions. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>
  `;
}

// Initialize all landing page handlers
export function initLandingHandlers() {
  console.log('Landing page initialized');
  
  // Mobile menu toggle
  const mobileToggle = document.getElementById('jariMobileToggle');
  const mobileMenu = document.getElementById('jariMobileMenu');
  
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      mobileToggle.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
    });
    
    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileToggle.textContent = '☰';
      });
    });
  }
  
  // Scroll animations using Intersection Observer
  const animateElements = document.querySelectorAll('.jari-animate');
  const animateChildren = document.querySelectorAll('.jari-animate-child');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('jari-visible');
        
        // Stagger children animations
        const children = entry.target.querySelectorAll('.jari-animate-child');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('jari-visible');
          }, index * 100);
        });
      }
    });
  }, observerOptions);
  
  animateElements.forEach(el => observer.observe(el));
  
  // Also observe direct children that might not be in a parent jari-animate
  animateChildren.forEach(el => {
    if (!el.closest('.jari-animate')) {
      observer.observe(el);
    }
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#jari-"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
