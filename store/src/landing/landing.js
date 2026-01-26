// STEP 1: Update landing.js - Fix CTAs to point to /signup
const LOGIN_URL = 'https://dashboard.jarisolutionsecom.store/login';
const SIGNUP_URL = 'https://dashboard.jarisolutionsecom.store/signup'; // FIXED: Was /login
const WHATSAPP_URL = 'https://wa.me/254751433625?text=Hi!%20I%27m%20interested%20in%20Jari.Ecom';
const LOGO_URL = 'https://res.cloudinary.com/dmfrtzgkv/image/upload/v1769389089/image_3_sjvgdg.svg';

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
        <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary">Start Your Store →</a>
      </div>
      
      <button class="jari-mobile-toggle" onclick="jariToggleMobile()">☰</button>
    </div>
    
    <!-- Mobile Menu -->
    <div class="jari-mobile-menu" id="jariMobileMenu">
      <a href="#jari-features">Features</a>
      <a href="#jari-pricing">Pricing</a>
      <a href="#jari-how-it-works">How It Works</a>
      <a href="${LOGIN_URL}">Log In</a>
      <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary" style="margin-top: 16px;">Start Your Store →</a>
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
        Start Your Store Now →
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

  <!-- PRICING SECTION -->
  <section class="jari-pricing-section" id="jari-pricing">
    <div class="jari-container">
      <div class="jari-section-header">
        <span class="jari-section-tag">💰 Simple Pricing</span>
        <h2>Start Small, Scale As You Grow</h2>
        <p style="color: #666; max-width: 600px; margin: 0 auto;">No hidden fees. No setup costs. Pay only for what you need.</p>
      </div>
      
      <div class="jari-pricing-grid">
        <!-- Monthly Card (Featured) -->
        <div class="jari-pricing-card jari-pricing-monthly jari-pricing-featured">
          <div class="jari-pricing-badge">Start Here</div>
          <div class="jari-pricing-header">
            <h3>Monthly</h3>
            <div class="jari-pricing-amount">
              <span class="jari-price-currency">KES</span>
              <span class="jari-price-value">1,200</span>
              <span class="jari-price-period">/month</span>
            </div>
          </div>
          <ul class="jari-pricing-features">
            <li>✅ 3 Product card slots</li>
            <li>✅ 1 FREE Theme (your business type)</li>
            <li>✅ Your own store link</li>
            <li>✅ Basic analytics dashboard</li>
            <li>✅ Order management</li>
          </ul>
          <a href="${SIGNUP_URL}" class="jari-btn jari-btn-primary jari-btn-block">
            Start Your Store →
          </a>
        </div>
        
        <!-- Add-ons Card -->
        <div class="jari-pricing-card jari-pricing-addons">
          <div class="jari-pricing-header">
            <h3>Add-Ons</h3>
            <p class="jari-pricing-subtitle">Stack what you need</p>
          </div>
          <ul class="jari-pricing-addons-list">
            <li>
              <span class="jari-addon-name">M-Pesa STK Push</span>
              <span class="jari-addon-price">+KES 300/mo</span>
            </li>
            <li>
              <span class="jari-addon-name">WhatsApp Auto-Reply</span>
              <span class="jari-addon-price">+KES 80/mo</span>
            </li>
            <li>
              <span class="jari-addon-name">Advanced Analytics</span>
              <span class="jari-addon-price">+KES 200/mo</span>
            </li>
            <li>
              <span class="jari-addon-name">Priority Support</span>
              <span class="jari-addon-price">+KES 500/mo</span>
            </li>
          </ul>
        </div>
        
        <!-- Cards & Themes Card -->
        <div class="jari-pricing-card jari-pricing-setup">
          <div class="jari-pricing-header">
            <h3>Cards & Themes</h3>
            <p class="jari-pricing-subtitle">One-time purchases</p>
          </div>
          <ul class="jari-pricing-addons-list">
            <li>
              <span class="jari-addon-name">Starter Pack (+4 cards)</span>
              <span class="jari-addon-price">KES 350</span>
            </li>
            <li>
              <span class="jari-addon-name">Growth Pack (+7 cards)</span>
              <span class="jari-addon-price">KES 550</span>
            </li>
            <li>
              <span class="jari-addon-name">Pro Pack (+12 cards)</span>
              <span class="jari-addon-price">KES 850</span>
            </li>
          </ul>
          <div class="jari-pricing-options" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="font-size: 12px; color: #888; margin-bottom: 8px;">Themes: KES 400-1,000 each</p>
            <p style="font-size: 11px; color: #666;">First theme FREE with signup!</p>
          </div>
        </div>
      </div>
      
      <p class="jari-pricing-note">
        💡 <strong>Example:</strong> Base + M-Pesa = KES 1,500/month | Full Stack = KES 2,280/month
      </p>
    </div>
  </section>

  <!-- CTA: All main CTAs point to signup now -->
  <section class="jari-cta-section">
    <div class="jari-container">
      <div class="jari-cta-card">
        <h2>Ready to Escape the DM Chaos?</h2>
        <p>Join 100+ Kenyan sellers who've already made the switch</p>
        <a href="${SIGNUP_URL}" class="jari-btn jari-btn-white jari-btn-large">
          Start Your Store Now – It's Free →
        </a>
        <p class="jari-cta-note">✓ No credit card required  ✓ 10-minute setup  ✓ Cancel anytime</p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="jari-footer">
    <div class="jari-container">
      <div class="jari-footer-content">
        <div class="jari-footer-brand">
          <div class="jari-logo">
            <img src="${LOGO_URL}" alt="Jari" class="jari-logo-img" style="height: 32px;">
            <span class="jari-logo-text" style="font-size: 18px;">Jari<span>.Ecom</span></span>
          </div>
          <p>Built for Kenyan entrepreneurs.<br>Escape the DM grind.</p>
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
            <a href="${WHATSAPP_URL}" target="_blank">WhatsApp Us</a>
            <a href="mailto:support@jari.co.ke">Email Support</a>
          </div>
          
          <div>
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </div>
      
      <div class="jari-footer-bottom">
        <p>© 2026 Jari Business Solutions. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>

<script>
  function jariToggleMobile() {
    const menu = document.getElementById('jariMobileMenu');
    menu.classList.toggle('active');
  }
</script>
  `;
}

// Handler initialization for landing page
export function initLandingHandlers() {
  // Mobile menu toggle is already handled via onclick in HTML
  // No additional handlers needed for now
  console.log('Landing page handlers initialized');
}
