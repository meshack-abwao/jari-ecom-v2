import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templatesAPI } from '../api/client';
import { 
  Check, ChevronRight, ShoppingBag, Calendar, Utensils, Search, Ticket, 
  Lock, Unlock, X, CreditCard, HelpCircle, Layers, Package, Zap, BookOpen
} from 'lucide-react';

// ===========================================
// TEMPLATE DEFINITIONS WITH JTBD/ODI DETAILS
// ===========================================
const TEMPLATES = [
  {
    slug: 'quick-decision',
    name: 'Quick Sell',
    subtitle: 'Fast Checkout for Simple Products',
    price: 500,
    icon: <Zap size={24} />,
    color: '#f97316',
    
    // JTBD: What job does this help the customer accomplish?
    customerJob: 'Help me quickly buy this product without overthinking',
    
    // ODI: Desired outcomes the customer wants
    desiredOutcomes: [
      'Minimize time spent making purchase decision',
      'Reduce steps needed to complete checkout',
      'Feel confident this is a good impulse buy',
      'Get instant confirmation of my purchase'
    ],
    
    // Key features that fulfill the job
    features: [
      'Single-product focus landing page',
      'Hero image gallery with swipe',
      'Instagram-style stories for social proof',
      'One-click checkout flow',
      'Customer testimonials section'
    ],
    
    // Who this template is best for
    bestFor: ['Fashion items', 'Accessories', 'Limited drops', 'Single products', 'Impulse buys'],
    
    // Checkout style
    checkoutStyle: 'Minimal steps, fast checkout - optimized for mobile',
    
    // Example businesses
    examples: 'Instagram clothing sellers, accessory brands, drop-ship products'
  },
  {
    slug: 'visual-menu',
    name: 'Visual Menu',
    subtitle: 'For Food & Restaurant Businesses',
    price: 600,
    icon: <Utensils size={24} />,
    color: '#22c55e',
    
    customerJob: 'Help me browse food options and order what I want easily',
    
    desiredOutcomes: [
      'See all menu items with appetizing photos',
      'Quickly filter by dietary preferences',
      'Know preparation time and calories',
      'Build my order without confusion',
      'Complete order with delivery/pickup options'
    ],
    
    features: [
      'Visual menu grid with categories',
      'Dietary tags (Vegan, Halal, Gluten-free)',
      'Prep time and calorie info',
      'Add-ons and customizations',
      'Cart-based ordering system',
      'Delivery/Pickup selection'
    ],
    
    bestFor: ['Restaurants', 'Cafes', 'Bakeries', 'Cloud kitchens', 'Caterers', 'Food trucks'],
    
    checkoutStyle: 'Grid display, cart checkout - build your order',
    
    examples: 'Mama Njeri\'s Kitchen, Urban Bites Cafe, Sweet Treats Bakery'
  },
  {
    slug: 'deep-dive',
    name: 'Deep Dive',
    subtitle: 'For Premium & Complex Products',
    price: 800,
    icon: <Search size={24} />,
    color: '#0ea5e9',
    
    customerJob: 'Help me thoroughly evaluate this expensive item before committing',
    
    desiredOutcomes: [
      'Understand all specifications and features',
      'See the product from multiple angles',
      'Compare with alternatives mentally',
      'Feel confident about quality and value',
      'Know warranty and return policies',
      'Trust the seller before big purchase'
    ],
    
    features: [
      'Magazine-style product gallery',
      'Detailed specifications section',
      'What\'s included breakdown',
      'Warranty information',
      'Trust badges and certifications',
      'Customer reviews with ratings',
      'Comparison-friendly layout'
    ],
    
    bestFor: ['Electronics', 'Furniture', 'Luxury items', 'Vehicles', 'High-ticket goods', 'Premium services'],
    
    checkoutStyle: 'Gallery, specs, storytelling - builds trust before purchase',
    
    examples: 'Phone accessories, home appliances, premium fashion, jewelry'
  },
  {
    slug: 'portfolio-booking',
    name: 'Services',
    subtitle: 'For Coaches, Consultants & Freelancers',
    price: 800,
    icon: <Calendar size={24} />,
    color: '#8b5cf6',
    
    customerJob: 'Help me find the right service package and book an appointment',
    
    desiredOutcomes: [
      'Understand what services are offered',
      'See proof of quality work (portfolio)',
      'Compare different packages/pricing',
      'Book a convenient time slot',
      'Know what to expect from the service',
      'Feel confident in the provider\'s expertise'
    ],
    
    features: [
      'Service packages with pricing tiers',
      'Portfolio/work showcase gallery',
      'Booking calendar integration',
      'Inquiry form for custom requests',
      'Client testimonials',
      'About/bio section',
      'Availability display'
    ],
    
    bestFor: ['Photographers', 'Consultants', 'Coaches', 'Trainers', 'Freelancers', 'Therapists'],
    
    checkoutStyle: 'Packages, inquiry flow - book or inquire',
    
    examples: 'Wedding photographers, business coaches, personal trainers, makeup artists'
  },
  {
    slug: 'event-landing',
    name: 'Events/Booking',
    subtitle: 'For Events, Classes & Workshops',
    price: 1000,
    icon: <Ticket size={24} />,
    color: '#ec4899',
    
    customerJob: 'Help me learn about this event and secure my spot',
    
    desiredOutcomes: [
      'Understand what the event offers',
      'Know the date, time, and location',
      'See who is speaking/hosting',
      'Choose the right ticket tier',
      'Secure my spot before it sells out',
      'Get confirmation and event details'
    ],
    
    features: [
      'Event countdown timer',
      'Date/time/location display',
      'Speaker/host profiles',
      'Multiple ticket tiers',
      'Capacity/availability indicator',
      'Agenda/schedule breakdown',
      'Location map integration'
    ],
    
    bestFor: ['Workshops', 'Webinars', 'Classes', 'Concerts', 'Conferences', 'Meetups'],
    
    checkoutStyle: 'Date/time picker, capacity limits - secure your spot',
    
    examples: 'Cooking classes, fitness workshops, tech meetups, music events'
  },
  {
    slug: 'catalog',
    name: 'Catalog',
    subtitle: 'Browse-Only with WhatsApp Inquiry',
    price: 400,
    icon: <BookOpen size={24} />,
    color: '#64748b',
    
    customerJob: 'Help me browse products and contact the seller directly',
    
    desiredOutcomes: [
      'See all available products easily',
      'Get product details and pricing',
      'Contact seller for questions',
      'Negotiate or customize order via chat',
      'Build relationship before buying'
    ],
    
    features: [
      'Product catalog grid',
      'Product detail pages',
      'WhatsApp inquiry button',
      'Category filtering',
      'Search functionality',
      'No direct checkout (inquiry-based)'
    ],
    
    bestFor: ['Wholesale sellers', 'Custom orders', 'B2B businesses', 'Price-on-request items'],
    
    checkoutStyle: 'No direct checkout - inquiry via WhatsApp',
    
    examples: 'Wholesale suppliers, custom furniture makers, B2B distributors'
  }
];

// ===========================================
// MAIN COMPONENT
// ===========================================
export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [templateToUnlock, setTemplateToUnlock] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showExplainer, setShowExplainer] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templatesAPI.getAvailable();
      setAvailableTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (slug) => {
    const template = availableTemplates.find(t => t.id === slug);
    return template?.unlocked || false;
  };

  // Click on card opens modal with full details
  const handleSelectTemplate = (template) => {
    setViewingTemplate(template);
    setShowTemplateModal(true);
  };

  const handleUnlockClick = (e, template) => {
    e.stopPropagation();
    setTemplateToUnlock(template);
    setShowUnlockModal(true);
  };

  // Payment coming soon - no fake success
  const handleUnlockTemplate = async () => {
    if (!templateToUnlock) return;
    
    alert('🚧 Payment Coming Soon!\n\nM-Pesa and IntaSend integration is being configured. Template purchases will be available shortly.\n\nContact support for early access.');
    
    setShowUnlockModal(false);
    setTemplateToUnlock(null);
    setPhoneNumber('');
  };

  const handleUseTemplate = (template) => {
    if (!isUnlocked(template.slug)) {
      handleUnlockClick({ stopPropagation: () => {} }, template);
      return;
    }
    navigate(`/products?template=${template.slug}`);
    setShowTemplateModal(false);
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Templates</h1>
          <p style={styles.subtitle}>Choose the perfect checkout experience for your business</p>
        </div>
        <button onClick={() => setShowExplainer(true)} style={styles.helpBtn}>
          <HelpCircle size={18} />
          How it works
        </button>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsRow}>
        <div className="glass-card" style={styles.statCard}>
          <Layers size={20} style={{ color: 'var(--accent-color)' }} />
          <div>
            <div style={styles.statValue}>{availableTemplates.filter(t => t.unlocked).length}</div>
            <div style={styles.statLabel}>Unlocked</div>
          </div>
        </div>
        <div className="glass-card" style={styles.statCard}>
          <Package size={20} style={{ color: '#22c55e' }} />
          <div>
            <div style={styles.statValue}>{TEMPLATES.length}</div>
            <div style={styles.statLabel}>Available</div>
          </div>
        </div>
        <div className="glass-card" style={styles.statCard}>
          <CreditCard size={20} style={{ color: '#f59e0b' }} />
          <div>
            <div style={styles.statValue}>KES 400-1,000</div>
            <div style={styles.statLabel}>One-time unlock</div>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div style={styles.grid}>
        {TEMPLATES.map((template) => {
          const unlocked = isUnlocked(template.slug);
          
          return (
            <div
              key={template.slug}
              onClick={() => handleSelectTemplate(template)}
              className="glass-card"
              style={styles.card}
            >
              {/* Lock/Unlock Badge */}
              <div style={{
                ...styles.lockBadge,
                background: unlocked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: unlocked ? '#22c55e' : '#ef4444'
              }}>
                {unlocked ? <Unlock size={14} /> : <Lock size={14} />}
                {unlocked ? 'Unlocked' : 'Locked'}
              </div>

              <div style={styles.cardHeader}>
                <div style={{ ...styles.iconBox, background: `${template.color}20`, color: template.color }}>
                  {template.icon}
                </div>
                <div style={styles.priceTag}>
                  {unlocked ? '✓ Owned' : `KES ${template.price.toLocaleString()}`}
                </div>
              </div>
              
              <h3 style={styles.cardTitle}>{template.name}</h3>
              <p style={styles.cardSubtitle}>{template.subtitle}</p>
              
              {/* Customer Job (JTBD) - Brief */}
              <div style={styles.jobSection}>
                <p style={styles.jobText}>"{template.customerJob}"</p>
              </div>
              
              {/* Best For Tags - Preview */}
              <div style={styles.bestForPreview}>
                {template.bestFor.slice(0, 3).map((item, idx) => (
                  <span key={idx} style={styles.miniTag}>{item}</span>
                ))}
                {template.bestFor.length > 3 && <span style={styles.moreTag}>+{template.bestFor.length - 3}</span>}
              </div>
              
              <div style={styles.tapHint}>
                Tap for details →
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Details Modal */}
      {showTemplateModal && viewingTemplate && (
        <div style={styles.modalOverlay} onClick={() => setShowTemplateModal(false)}>
          <div style={{ ...styles.modal, maxWidth: '550px' }} className="glass-card" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...styles.iconBox, background: `${viewingTemplate.color}20`, color: viewingTemplate.color }}>
                  {viewingTemplate.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>{viewingTemplate.name}</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{viewingTemplate.subtitle}</p>
                </div>
              </div>
              <button onClick={() => setShowTemplateModal(false)} style={styles.closeBtn}><X size={24} /></button>
            </div>
            
            {/* Price & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>One-time unlock</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent-color)' }}>KES {viewingTemplate.price.toLocaleString()}</div>
              </div>
              <div style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                background: isUnlocked(viewingTemplate.slug) ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isUnlocked(viewingTemplate.slug) ? '#22c55e' : '#ef4444'
              }}>
                {isUnlocked(viewingTemplate.slug) ? '✓ Unlocked' : '🔒 Locked'}
              </div>
            </div>
            
            {/* Customer Job */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={styles.detailSectionTitle}>🎯 Customer's Job</h4>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5' }}>"{viewingTemplate.customerJob}"</p>
            </div>
            
            {/* Desired Outcomes */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={styles.detailSectionTitle}>📊 What Customers Want</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {viewingTemplate.desiredOutcomes.map((outcome, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)', padding: '6px 0' }}>
                    <Check size={16} style={{ color: viewingTemplate.color, flexShrink: 0, marginTop: '2px' }} />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Features */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={styles.detailSectionTitle}>✨ Features Included</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {viewingTemplate.features.map((feature, idx) => (
                  <span key={idx} style={{ padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{feature}</span>
                ))}
              </div>
            </div>
            
            {/* Best For */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={styles.detailSectionTitle}>👥 Best For</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {viewingTemplate.bestFor.map((item, idx) => (
                  <span key={idx} style={{ padding: '6px 12px', border: `1px solid ${viewingTemplate.color}`, borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{item}</span>
                ))}
              </div>
            </div>
            
            {/* Checkout Style */}
            <div style={{ marginBottom: '24px', padding: '12px 16px', background: `${viewingTemplate.color}15`, borderRadius: '10px', borderLeft: `3px solid ${viewingTemplate.color}` }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Checkout Flow:</strong>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{viewingTemplate.checkoutStyle}</span>
            </div>
            
            {/* Examples */}
            <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong>Example businesses:</strong> {viewingTemplate.examples}
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isUnlocked(viewingTemplate.slug) ? (
                <button 
                  onClick={(e) => { setShowTemplateModal(false); handleUnlockClick(e, viewingTemplate); }} 
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '14px' }}
                >
                  <Lock size={16} /> Unlock for KES {viewingTemplate.price.toLocaleString()}
                </button>
              ) : (
                <button 
                  onClick={() => handleUseTemplate(viewingTemplate)}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '14px' }}
                >
                  <ChevronRight size={16} /> Use This Template
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unlock Modal - Payment Coming Soon */}
      {showUnlockModal && templateToUnlock && (
        <div style={styles.modalOverlay} onClick={() => setShowUnlockModal(false)}>
          <div style={styles.modal} className="glass-card" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Unlock Template</h2>
              <button onClick={() => setShowUnlockModal(false)} style={styles.closeBtn}><X size={24} /></button>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                ...styles.iconBox, 
                background: `${templateToUnlock.color}20`, 
                color: templateToUnlock.color,
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                fontSize: '28px'
              }}>
                {templateToUnlock.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {templateToUnlock.name}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {templateToUnlock.subtitle}
              </p>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-color)', marginBottom: '16px' }}>
                KES {templateToUnlock.price.toLocaleString()}
              </div>
              
              {/* Coming Soon Notice */}
              <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚧</div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>Payment Coming Soon</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  M-Pesa and IntaSend integration is being configured. Template purchases will be available shortly.
                </p>
              </div>
              
              <button 
                onClick={() => setShowUnlockModal(false)} 
                style={{ width: '100%', padding: '14px', fontSize: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Got it
              </button>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                Contact support for early access
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Explainer Modal */}
      {showExplainer && (
        <div style={styles.modalOverlay} onClick={() => setShowExplainer(false)}>
          <div style={{ ...styles.modal, maxWidth: '600px' }} className="glass-card" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>How Cards & Templates Work</h2>
              <button onClick={() => setShowExplainer(false)} style={styles.closeBtn}><X size={24} /></button>
            </div>
            
            <div style={styles.explainerContent}>
              {/* Product Cards Section */}
              <div style={styles.explainerSection}>
                <div style={styles.explainerIcon}>🎴</div>
                <h3 style={styles.explainerTitle}>Product Cards</h3>
                <p style={styles.explainerText}>
                  Each product in your store uses <strong>1 card</strong>. Cards are slots for your products.
                </p>
                <ul style={styles.explainerList}>
                  <li><strong>You start with 3 free cards</strong></li>
                  <li>Buy more cards in bundles (one-time purchase)</li>
                  <li>Cards never expire - buy once, keep forever</li>
                  <li>Use cards on any template you've unlocked</li>
                </ul>
                <div style={styles.bundlePreview}>
                  <div style={styles.bundleItem}>
                    <span>Starter (+4)</span>
                    <span style={styles.bundlePrice}>KES 350</span>
                  </div>
                  <div style={styles.bundleItem}>
                    <span>Growth (+7)</span>
                    <span style={styles.bundlePrice}>KES 550</span>
                  </div>
                  <div style={styles.bundleItem}>
                    <span>Pro (+12)</span>
                    <span style={styles.bundlePrice}>KES 850</span>
                  </div>
                </div>
              </div>
              
              {/* Templates Section */}
              <div style={styles.explainerSection}>
                <div style={styles.explainerIcon}>🎨</div>
                <h3 style={styles.explainerTitle}>Templates (Themes)</h3>
                <p style={styles.explainerText}>
                  Templates determine how your products look and how customers checkout. Different templates for different business types.
                </p>
                <ul style={styles.explainerList}>
                  <li><strong>You get 1 free template</strong> based on your business type</li>
                  <li>Unlock additional templates to diversify offerings</li>
                  <li>One-time unlock - use on unlimited products</li>
                  <li>Each product can use any template you own</li>
                </ul>
                <div style={styles.templatePreview}>
                  <span>Quick Sell (KES 500)</span>
                  <span>•</span>
                  <span>Visual Menu (KES 600)</span>
                  <span>•</span>
                  <span>Deep Dive (KES 800)</span>
                </div>
              </div>
              
              {/* Example Section */}
              <div style={styles.exampleBox}>
                <h4 style={styles.exampleTitle}>💡 Example: Wanjiku's Bakery</h4>
                <p style={styles.exampleText}>
                  Wanjiku starts with <strong>3 cards</strong> and <strong>Visual Menu</strong> (free for food businesses).
                  She lists 3 cake types. Later, she adds baking classes using the <strong>Events</strong> template (KES 1,000).
                  She buys the <strong>Growth Pack (+7 cards)</strong> for KES 550.
                </p>
                <p style={styles.exampleText}>
                  <strong>Total one-time cost:</strong> KES 1,550 | <strong>Result:</strong> 10 products across 2 templates
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================
// STYLES
// ===========================================
const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)' },
  helpBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' },
  statValue: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' },
  statLabel: { fontSize: '12px', color: 'var(--text-muted)' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', paddingBottom: '100px' },
  
  card: { padding: '24px', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.3s', position: 'relative' },
  lockBadge: { position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  iconBox: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  priceTag: { padding: '6px 12px', background: 'var(--accent-light)', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-color)' },
  
  cardTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
  cardSubtitle: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' },
  
  jobSection: { padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px', marginBottom: '12px' },
  jobText: { fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4', margin: 0 },
  
  bestForPreview: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' },
  miniTag: { padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-muted)' },
  moreTag: { padding: '4px 8px', background: 'var(--accent-light)', borderRadius: '4px', fontSize: '11px', color: 'var(--accent-color)', fontWeight: '600' },
  
  tapHint: { textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' },
  
  detailSectionTitle: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { width: '100%', maxWidth: '450px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  
  explainerContent: { display: 'flex', flexDirection: 'column', gap: '24px' },
  explainerSection: { padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '12px' },
  explainerIcon: { fontSize: '32px', marginBottom: '12px' },
  explainerTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' },
  explainerText: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' },
  explainerList: { paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' },
  bundlePreview: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' },
  bundleItem: { display: 'flex', justifyContent: 'space-between', fontSize: '13px' },
  bundlePrice: { fontWeight: '600', color: 'var(--accent-color)' },
  templatePreview: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' },
  exampleBox: { padding: '20px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(34, 197, 94, 0.1))', borderRadius: '12px', border: '1px solid var(--border-color)' },
  exampleTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' },
  exampleText: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' },
};
