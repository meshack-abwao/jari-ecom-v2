// STEP 1: Update landing.js - Fix CTAs to point to /signup
const LOGIN_URL = 'https://dashboard.jarisolutionsecom.store/login';
const SIGNUP_URL = 'https://dashboard.jarisolutionsecom.store/signup'; // FIXED: Was /login
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
