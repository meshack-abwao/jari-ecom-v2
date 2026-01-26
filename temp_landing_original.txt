// ===========================================
// JARI.ECOM LANDING PAGE
// Renders when no ?store= parameter is present
// ===========================================

const LOGIN_URL = 'https://dashboard.jarisolutionsecom.store/login';
const SIGNUP_URL = 'https://dashboard.jarisolutionsecom.store/login';
const WHATSAPP_URL = 'https://wa.me/254751433625?text=Hi!%20I%27m%20interested%20in%20Jari.Ecom';
const LOGO_URL = 'https://res.cloudinary.com/dmfrtzgkv/image/upload/v1737283841/jari/Jari-Business-Solutions-1_r2z9ow.png';

export function renderLandingPage() {
  return `
<div class="jari-landing">
  
  <!-- TOP BANNER -->
  <div class="jari-top-banner">
    🚀 Built for Kenyan Sellers • M-Pesa Integration • Start in 10 Minutes
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
      </nav>
      
      <div class="jari-header-cta">
        <a href="${LOGIN_URL}" class="jari-btn jari-btn-outline">Log In</a>
        <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary">Start Free →</a>
      </div>
      
      <button class="jari-mobile-toggle" onclick="jariToggleMobile()">☰</button>
    </div>
    
    <!-- Mobile Menu -->
    <div class="jari-mobile-menu" id="jariMobileMenu">
      <a href="#jari-features">Features</a>
      <a href="#jari-pricing">Pricing</a>
      <a href="#jari-how-it-works">How It Works</a>
      <a href="${LOGIN_URL}">Log In</a>
      <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary" style="margin-top: 16px;">Start Free →</a>
    </div>
  </header>

  <!-- HERO -->
  <section class="jari-hero">
    <div class="jari-hero-badge">
      <span>●</span> Trusted by 100+ Kenyan Sellers
    </div>
    <h1>Stop Losing Sales in <span class="highlight">DMs</span></h1>
    <p class="jari-hero-subtitle">
      Your Instagram & WhatsApp customers click one link, see your products beautifully, 
      pay via M-Pesa instantly. You just fulfill orders.
    </p>
    <div class="jari-hero-cta">
      <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary jari-btn-large">
        Create Your Store Free →
      </a>
      <a href="${WHATSAPP_URL}" target="_blank" class="jari-btn jari-btn-outline jari-btn-large">
        💬 Chat With Us
      </a>
    </div>
    
    <div class="jari-hero-stats">
      <div class="jari-stat">
        <span class="jari-stat-number">10 min</span>
        <span class="jari-stat-label">Setup Time</span>
      </div>
      <div class="jari-stat">
        <span class="jari-stat-number">KES 1,200</span>
        <span class="jari-stat-label">Per Month</span>
      </div>
      <div class="jari-stat">
        <span class="jari-stat-number">M-Pesa</span>
        <span class="jari-stat-label">Built-in</span>
      </div>
    </div>
  </section>

  <!-- PROBLEM SECTION -->
  <section class="jari-problem-section">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">😤 Sound Familiar?</span>
        <h2>The DM Nightmare</h2>
      </div>
      
      <div class="jari-problems-grid">
        <div class="jari-problem-card">
          <div class="jari-problem-icon">📱</div>
          <h3>"Send me pics"</h3>
          <p>You spend hours sending product photos one by one, only for them to ghost you.</p>
        </div>
        
        <div class="jari-problem-card">
          <div class="jari-problem-icon">💸</div>
          <h3>"I'll pay later"</h3>
          <p>Customers promise to pay, you hold items, they disappear. Time wasted.</p>
        </div>
        
        <div class="jari-problem-card">
          <div class="jari-problem-icon">😴</div>
          <h3>Missed messages</h3>
          <p>You wake up to 20 DMs asking the same questions. Half are already gone.</p>
        </div>
        
        <div class="jari-problem-card">
          <div class="jari-problem-icon">📝</div>
          <h3>"Wait, what did they order?"</h3>
          <p>Scrolling through 100 chats trying to find that one order detail.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES SECTION -->
  <section class="jari-features-section" id="jari-features">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">✨ The Solution</span>
        <h2>Everything You Need to Sell Online</h2>
        <p>Professional store, instant payments, zero tech skills required</p>
      </div>
      
      <div class="jari-features-grid">
        <div class="jari-feature-card">
          <div class="jari-feature-icon">💳</div>
          <h3>M-Pesa STK Push</h3>
          <p>Customers tap "Pay", get M-Pesa prompt instantly. No manual confirmations. Money hits your account automatically.</p>
        </div>
        
        <div class="jari-feature-card">
          <div class="jari-feature-icon">🎨</div>
          <h3>Beautiful Templates</h3>
          <p>Quick Sell for fast buys. Visual Menu for food. Deep Dive for premium items. Pick what fits your business.</p>
        </div>
        
        <div class="jari-feature-card">
          <div class="jari-feature-icon">🔗</div>
          <h3>One Link Does It All</h3>
          <p>Share your store link on Instagram bio, WhatsApp status, anywhere. Customers see everything, buy instantly.</p>
        </div>
        
        <div class="jari-feature-card">
          <div class="jari-feature-icon">📊</div>
          <h3>Simple Dashboard</h3>
          <p>See all orders in one place. Track what's selling. Know exactly how your business is doing.</p>
        </div>
        
        <div class="jari-feature-card">
          <div class="jari-feature-icon">📱</div>
          <h3>WhatsApp Notifications</h3>
          <p>Get instant alerts when orders come in. Auto-reply to customer inquiries 24/7.</p>
        </div>
        
        <div class="jari-feature-card">
          <div class="jari-feature-icon">📈</div>
          <h3>Built to Scale</h3>
          <p>Start with 3 products. Grow to hundreds. Your store grows with your business.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="jari-how-section" id="jari-how-it-works">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">🚀 Simple Setup</span>
        <h2>Start Selling in 3 Steps</h2>
        <p>From zero to taking orders in under 10 minutes</p>
      </div>
      
      <div class="jari-steps-grid">
        <div class="jari-step-card">
          <div class="jari-step-number">1</div>
          <h3>Create Your Store</h3>
          <p>Sign up and pick your template. Add your logo, colors, and business details. Your store is ready in minutes.</p>
        </div>
        
        <div class="jari-step-card">
          <div class="jari-step-number">2</div>
          <h3>Add Your Products</h3>
          <p>Upload photos, set prices, write descriptions. Each product gets a beautiful page that sells.</p>
        </div>
        
        <div class="jari-step-card">
          <div class="jari-step-number">3</div>
          <h3>Share & Sell</h3>
          <p>Post your link on Instagram, WhatsApp, Facebook. Customers click, buy, pay via M-Pesa. Done.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING SECTION - UPDATED WITH NEW STRUCTURE -->
  <section class="jari-pricing-section" id="jari-pricing">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">💰 Simple Pricing</span>
        <h2>Pay Only For What You Need</h2>
        <p>Start small, scale as you grow. No hidden fees.</p>
      </div>
      
      <!-- SUBSCRIPTION PRICING -->
      <div class="jari-pricing-main">
        <div class="jari-pricing-card jari-pricing-featured">
          <div class="jari-pricing-badge">Most Popular</div>
          <h2>Monthly Subscription</h2>
          
          <div class="jari-pricing-amount">
            <div class="jari-price-main"><span>KES </span>1,200<span>/mo</span></div>
            <div class="jari-price-period">Base Platform</div>
          </div>
          
          <ul class="jari-pricing-features">
            <li><span class="jari-check-icon">✓</span> 3 Product Cards included</li>
            <li><span class="jari-check-icon">✓</span> 1 Theme (matched to your business)</li>
            <li><span class="jari-check-icon">✓</span> Order Management Dashboard</li>
            <li><span class="jari-check-icon">✓</span> Shareable Store Link</li>
            <li><span class="jari-check-icon">✓</span> Basic Analytics</li>
          </ul>
          
          <div class="jari-pricing-addons">
            <h4>Add What You Need:</h4>
            <div class="jari-addon-item">
              <span>M-Pesa STK Push</span>
              <span class="jari-addon-price">+KES 300/mo</span>
            </div>
            <div class="jari-addon-item">
              <span>WhatsApp Auto-Reply</span>
              <span class="jari-addon-price">+KES 80/mo</span>
            </div>
            <div class="jari-addon-item">
              <span>Advanced Analytics</span>
              <span class="jari-addon-price">+KES 200/mo</span>
            </div>
            <div class="jari-addon-item">
              <span>Priority Support</span>
              <span class="jari-addon-price">+KES 500/mo</span>
            </div>
          </div>
          
          <div class="jari-pricing-popular">
            <strong>Most sellers pay:</strong> KES 1,500/mo (Base + M-Pesa)
          </div>
          
          <div class="jari-pricing-cta">
            <a href="${SIGNUP_URL}" class="jari-btn jari-btn-white jari-btn-large">
              Start Your Store →
            </a>
            <p class="jari-pricing-note">First theme FREE • No setup fees • Cancel anytime</p>
          </div>
        </div>
      </div>
      
      <!-- ONE-TIME PURCHASES -->
      <div class="jari-pricing-extras">
        <div class="jari-extras-header">
          <h3>🛒 One-Time Purchases</h3>
          <p>Buy once, keep forever. Expand when you're ready.</p>
        </div>
        
        <div class="jari-extras-grid">
          <!-- Product Cards -->
          <div class="jari-extras-card">
            <h4>📦 Product Cards</h4>
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
          
          <!-- Themes -->
          <div class="jari-extras-card">
            <h4>🎨 Themes</h4>
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
                <span>Events/Booking</span>
                <span>Classes & appointments</span>
                <span>KES 1,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="jari-testimonials-section">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">⭐ Success Stories</span>
        <h2>Sellers Love Jari.Ecom</h2>
        <p>Real results from real Kenyan entrepreneurs</p>
      </div>
      
      <div class="jari-testimonials-grid">
        <div class="jari-testimonial-card">
          <div class="jari-testimonial-stars">★★★★★</div>
          <p class="jari-testimonial-text">"I was losing so many sales on Instagram. Now customers click my link, see a professional page, and pay via M-Pesa immediately. My sales doubled in the first month!"</p>
          <div class="jari-testimonial-author">
            <div class="jari-author-avatar">W</div>
            <div class="jari-author-info">
              <h4>Wanjiku M.</h4>
              <p>Fashion Seller, Nairobi</p>
            </div>
          </div>
        </div>
        
        <div class="jari-testimonial-card">
          <div class="jari-testimonial-stars">★★★★★</div>
          <p class="jari-testimonial-text">"Finally, something built for Kenya! The M-Pesa checkout just works. No more chasing customers for payment confirmations. Orders come with all details ready."</p>
          <div class="jari-testimonial-author">
            <div class="jari-author-avatar">K</div>
            <div class="jari-author-info">
              <h4>Kevin O.</h4>
              <p>Electronics, Mombasa</p>
            </div>
          </div>
        </div>
        
        <div class="jari-testimonial-card">
          <div class="jari-testimonial-stars">★★★★★</div>
          <p class="jari-testimonial-text">"I'm not tech-savvy at all, but I had my store up in one afternoon. The templates look amazing on phones. My customers keep saying my shop looks legit!"</p>
          <div class="jari-testimonial-author">
            <div class="jari-author-avatar">N</div>
            <div class="jari-author-info">
              <h4>Nancy K.</h4>
              <p>Beauty Products, Kisumu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="jari-cta-section">
    <div class="jari-container">
      <h2>Ready to Sell More?</h2>
      <p>Join hundreds of Kenyan sellers who've transformed their business with Jari.Ecom. Your customers are waiting — give them an easy way to buy from you.</p>
      
      <div class="jari-cta-buttons">
        <a href="${SIGNUP_URL}" class="jari-btn jari-btn-white jari-btn-large">
          Start Your Store Now →
        </a>
        <a href="${WHATSAPP_URL}" target="_blank" class="jari-btn jari-btn-dark jari-btn-large">
          💬 Chat With Us
        </a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="jari-footer">
    <div class="jari-footer-content">
      <div class="jari-footer-brand">
        <a href="/" class="jari-logo" style="margin-bottom: 16px; display: flex;">
          <img src="${LOGO_URL}" alt="Jari" class="jari-logo-img">
          <div class="jari-logo-separator"></div>
          <span class="jari-logo-text">Jari<span>.Ecom</span></span>
        </a>
        <p>E-commerce made simple for Kenyan sellers. Powered by Jari Business Solutions.</p>
        <div class="jari-social-links">
          <a href="${WHATSAPP_URL}" class="jari-social-link" target="_blank">💬</a>
          <a href="tel:+254751433625" class="jari-social-link">📞</a>
          <a href="mailto:support@jarisolutions.com" class="jari-social-link">📧</a>
        </div>
      </div>
      
      <div class="jari-footer-col">
        <h4>Platform</h4>
        <ul>
          <li><a href="#jari-features">Features</a></li>
          <li><a href="#jari-pricing">Pricing</a></li>
          <li><a href="#jari-how-it-works">How It Works</a></li>
        </ul>
      </div>
      
      <div class="jari-footer-col">
        <h4>Support</h4>
        <ul>
          <li><a href="${WHATSAPP_URL}" target="_blank">WhatsApp Support</a></li>
          <li><a href="tel:+254751433625">Call Us</a></li>
          <li><a href="mailto:support@jarisolutions.com">Email</a></li>
        </ul>
      </div>
      
      <div class="jari-footer-col">
        <h4>Contact</h4>
        <ul>
          <li>📞 +254 751 433 625</li>
          <li>📧 support@jarisolutions.com</li>
          <li>📍 Nairobi, Kenya</li>
        </ul>
      </div>
    </div>
    
    <div class="jari-footer-bottom">
      <p>© ${new Date().getFullYear()} Jari.Ecom by Jari Business Solutions. All rights reserved.</p>
    </div>
  </footer>

</div>
`;
}

// Mobile menu toggle
export function initLandingHandlers() {
  window.jariToggleMobile = function() {
    const menu = document.getElementById('jariMobileMenu');
    if (menu) menu.classList.toggle('active');
  };
  
  // Smooth scroll for anchor links
  document.querySelectorAll('.jari-landing a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Close mobile menu on link click
  document.querySelectorAll('.jari-mobile-menu a').forEach(link => {
    link.addEventListener('click', function() {
      const menu = document.getElementById('jariMobileMenu');
      if (menu) menu.classList.remove('active');
    });
  });
}
