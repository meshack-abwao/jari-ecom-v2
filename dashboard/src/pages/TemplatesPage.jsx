import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ShoppingBag, Calendar, Utensils, Search, Ticket } from 'lucide-react';

const TEMPLATES = [
  {
    slug: 'quick-decision',
    name: 'Quick Decision',
    subtitle: 'Single Product Landing',
    price: 250,
    description: 'Perfect for impulse buys, single products, or limited drops',
    icon: <ShoppingBag size={24} />,
    color: '#f97316',
    features: ['Hero image gallery', 'Instagram stories', 'Quick checkout', 'Testimonials'],
    bestFor: 'Fashion items, accessories, limited edition products'
  },
  {
    slug: 'portfolio-booking',
    name: 'Portfolio + Booking',
    subtitle: 'Service Provider',
    price: 500,
    description: 'For freelancers and service providers with booking',
    icon: <Calendar size={24} />,
    color: '#8b5cf6',
    features: ['Service packages', 'Portfolio gallery', 'Booking integration', 'Testimonials'],
    bestFor: 'Photographers, consultants, trainers, coaches'
  },
  {
    slug: 'visual-menu',
    name: 'Visual Menu',
    subtitle: 'Food & Restaurant',
    price: 600,
    description: 'For restaurants and food businesses',
    icon: <Utensils size={24} />,
    color: '#22c55e',
    features: ['Menu categories', 'Dietary tags', 'Prep time & calories', 'Order system'],
    bestFor: 'Restaurants, cafes, cloud kitchens, caterers'
  },
  {
    slug: 'deep-dive',
    name: 'Deep Dive Evaluator',
    subtitle: 'High-Ticket Items',
    price: 800,
    description: 'For expensive items needing detailed specs',
    icon: <Search size={24} />,
    color: '#0ea5e9',
    features: ['Detailed specs', 'Trust badges', 'Warranty info', 'Comparison tables'],
    bestFor: 'Electronics, furniture, luxury items, vehicles'
  },
  {
    slug: 'event-landing',
    name: 'Event Landing',
    subtitle: 'Events & Workshops',
    price: 700,
    description: 'For events, courses, and workshops',
    icon: <Ticket size={24} />,
    color: '#ec4899',
    features: ['Event countdown', 'Speaker profiles', 'Ticket tiers', 'Location map'],
    bestFor: 'Workshops, webinars, concerts, conferences'
  },
];

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const navigate = useNavigate();

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.slug);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      navigate(`/products?template=${selectedTemplate}`);
    }
  };

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Templates</h1>
          <p style={styles.subtitle}>Choose the perfect layout for your products</p>
        </div>
      </div>

      <div style={styles.grid}>
        {TEMPLATES.map((template) => (
          <div
            key={template.slug}
            onClick={() => handleSelectTemplate(template)}
            className="glass-card template-card"
            style={{
              ...styles.card,
              borderColor: selectedTemplate === template.slug ? template.color : 'transparent',
              background: selectedTemplate === template.slug ? `${template.color}10` : 'var(--card-bg)',
            }}
          >
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: `${template.color}20`, color: template.color }}>
                {template.icon}
              </div>
              <div style={styles.priceTag}>KES {template.price}</div>
            </div>
            
            <h3 style={styles.cardTitle}>{template.name}</h3>
            <p style={styles.cardSubtitle}>{template.subtitle}</p>
            <p style={styles.cardDesc}>{template.description}</p>
            
            <div style={styles.features}>
              {template.features.map((feature, idx) => (
                <div key={idx} style={styles.featureItem}>
                  <Check size={14} style={{ color: template.color }} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
            <div style={styles.bestFor}>
              <strong>Best for:</strong> {template.bestFor}
            </div>
            
            {selectedTemplate === template.slug && (
              <div style={{ ...styles.selectedBadge, background: template.color }}>
                <Check size={16} /> Selected
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div style={styles.floatingAction}>
          <div style={styles.floatingContent}>
            <p style={styles.floatingText}>
              {TEMPLATES.find(t => t.slug === selectedTemplate)?.name} selected
            </p>
            <button onClick={handleUseTemplate} className="btn btn-primary" style={styles.useBtn}>
              Use This Template <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { marginBottom: '32px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', paddingBottom: '100px' },
  
  card: { padding: '24px', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.3s', position: 'relative' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  iconBox: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  priceTag: { padding: '6px 12px', background: 'var(--accent-light)', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-color)' },
  
  cardTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
  cardSubtitle: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' },
  cardDesc: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' },
  
  features: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' },
  
  bestFor: { fontSize: '12px', color: 'var(--text-muted)', padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px' },
  
  selectedBadge: { position: 'absolute', top: '12px', right: '12px', padding: '6px 12px', borderRadius: '6px', color: 'white', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  
  floatingAction: { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 },
  floatingContent: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  floatingText: { fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' },
  useBtn: { display: 'flex', alignItems: 'center', gap: '6px' },
};
