import { useState } from 'react';

export default function Step4_PlanSelector({ data, updateData, nextStep, prevStep }) {
  const [selectedAddons, setSelectedAddons] = useState(data.selectedAddons || data.smartAddons || []);

  const addons = [
    {
      id: 'mpesa_stk',
      name: 'M-Pesa STK Push',
      price: 300,
      description: 'Accept payments directly via M-Pesa',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>',
      color: '#10b981',
      recommended: true,
    },
    {
      id: 'whatsapp_auto',
      name: 'WhatsApp Auto-Reply',
      price: 80,
      description: 'Automated customer messages',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>',
      color: '#3b82f6',
      recommended: data.businessType === 'food' || data.businessType === 'products',
    },
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      price: 200,
      description: 'Track conversions and customer behavior',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>',
      color: '#8b5cf6',
      recommended: false,
    },
    {
      id: 'priority_support',
      name: 'Priority Support',
      price: 500,
      description: 'Get help within 2 hours',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
      color: '#f59e0b',
      recommended: data.businessType === 'premium',
    },
  ];

  const basePlan = {
    name: 'Base Platform',
    price: 1200,
    features: [
      '3 product cards included',
      '1 free template',
      'Order management',
      'Mobile-optimized store',
      'Custom domain support',
    ],
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId);
      } else {
        return [...prev, addonId];
      }
    });
  };

  const calculateTotal = () => {
    const addonTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    
    return basePlan.price + addonTotal;
  };

  const handleContinue = () => {
    updateData({ selectedAddons });
    nextStep();
  };

  const PHI = 1.618;

  return (
    <div style={styles.container}>
      {/* Base Plan Card */}
      <div style={styles.basePlanCard}>
        <div style={styles.basePlanHeader}>
          <div>
            <span style={styles.basePlanBadge}>Essential</span>
            <h3 style={styles.basePlanTitle}>{basePlan.name}</h3>
            <p style={styles.basePlanSubtitle}>Everything you need to get started</p>
          </div>
          <div style={styles.basePlanPrice}>
            <div style={styles.currencyRow}>
              <span style={styles.currency}>KES</span>
              <span style={styles.amount}>{basePlan.price.toLocaleString()}</span>
            </div>
            <span style={styles.period}>per month</span>
          </div>
        </div>

        <ul style={styles.featuresList}>
          {basePlan.features.map((feature, index) => (
            <li key={index} style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Add-ons Section */}
      <div style={styles.addonsSection}>
        <h3 style={styles.sectionTitle}>Power Up Your Store</h3>
        <p style={styles.sectionSubtitle}>
          {data.smartAddons?.length > 0 
            ? 'Pre-selected based on your business type — adjust as needed'
            : 'Add features that match your needs'}
        </p>
        
        <div style={styles.addonsGrid}>
          {addons.map((addon) => {
            const isSelected = selectedAddons.includes(addon.id);
            
            return (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                style={{
                  ...styles.addonCard,
                  borderColor: isSelected ? addon.color : 'rgba(0, 0, 0, 0.08)',
                  backgroundColor: isSelected ? `${addon.color}08` : 'white',
                }}
              >
                {addon.recommended && (
                  <span style={{...styles.recommendedBadge, backgroundColor: addon.color}}>
                    Recommended
                  </span>
                )}
                
                <div style={styles.addonTop}>
                  <div 
                    style={{...styles.iconCircle, backgroundColor: `${addon.color}15`, color: addon.color}}
                    dangerouslySetInnerHTML={{ __html: addon.svg }}
                  />
                  
                  <div style={{
                    ...styles.checkbox,
                    borderColor: isSelected ? addon.color : 'rgba(0, 0, 0, 0.15)',
                    backgroundColor: isSelected ? addon.color : 'white',
                  }}>
                    {isSelected && <span style={styles.checkIcon}>✓</span>}
                  </div>
                </div>

                <h4 style={styles.addonName}>{addon.name}</h4>
                <p style={styles.addonDescription}>{addon.description}</p>

                <div style={styles.addonPrice}>
                  +KES {addon.price.toLocaleString()}<span style={styles.pricePeriod}>/mo</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total & Actions */}
      <div style={styles.footer}>
        <div style={styles.totalSection}>
          <div style={styles.totalLabel}>Total Monthly Cost</div>
          <div style={styles.totalAmount}>
            KES {calculateTotal().toLocaleString()}
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={prevStep} style={styles.backButton}>
            ← Back
          </button>
          <button onClick={handleContinue} style={styles.continueButton}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

const PHI = 1.618;

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    padding: `0 clamp(20px, 5vw, 32px) clamp(40px, 8vh, 64px)`,
  },

  basePlanCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '24px',
    padding: `${Math.round(32 * PHI)}px 32px 32px`,
    marginBottom: `${Math.round(40 * PHI)}px`,
    color: 'white',
    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.25)',
  },

  basePlanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    gap: '24px',
    flexWrap: 'wrap',
  },

  basePlanBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '980px', // Pill
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '12px',
    letterSpacing: '0.5px',
  },

  basePlanTitle: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },

  basePlanSubtitle: {
    fontSize: '15px',
    opacity: 0.9,
    margin: 0,
  },

  basePlanPrice: {
    textAlign: 'right',
  },

  currencyRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: '6px',
  },

  currency: {
    fontSize: '18px',
    opacity: 0.85,
    fontWeight: 500,
  },

  amount: {
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },

  period: {
    fontSize: '14px',
    opacity: 0.85,
    display: 'block',
    marginTop: '4px',
  },

  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    opacity: 0.95,
  },

  checkmark: {
    fontSize: '18px',
    fontWeight: 'bold',
  },

  addonsSection: {
    marginBottom: `${Math.round(48 * PHI)}px`,
  },

  sectionTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '10px',
    letterSpacing: '-0.02em',
  },

  sectionSubtitle: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: `${Math.round(24 * PHI)}px`,
    lineHeight: PHI,
  },

  addonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: `${Math.round(16 * PHI)}px`,
  },

  addonCard: {
    position: 'relative',
    background: 'white',
    border: '2px solid',
    borderRadius: '20px', // Rounded
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },

  recommendedBadge: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    padding: '4px 12px',
    borderRadius: '980px', // Pill
    fontSize: '11px',
    fontWeight: 600,
    color: 'white',
    letterSpacing: '0.3px',
  },

  addonTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '18px',
  },

  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '14px', // Rounded square
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '8px', // Rounded
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  checkIcon: {
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
  },

  addonName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px',
    letterSpacing: '-0.01em',
  },

  addonDescription: {
    fontSize: '14px',
    color: '#86868b',
    lineHeight: PHI,
    marginBottom: '16px',
  },

  addonPrice: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1d1d1f',
  },

  pricePeriod: {
    fontSize: '13px',
    color: '#86868b',
    fontWeight: 400,
  },

  footer: {
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    paddingTop: `${Math.round(32 * PHI)}px`,
  },

  totalSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${Math.round(24 * PHI)}px`,
    padding: '24px',
    background: '#f9fafb',
    borderRadius: '16px',
  },

  totalLabel: {
    fontSize: '15px',
    color: '#86868b',
    fontWeight: 500,
  },

  totalAmount: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },

  buttonGroup: {
    display: 'flex',
    gap: '16px',
  },

  backButton: {
    flex: 1,
    padding: '16px 28px',
    fontSize: '16px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '980px', // Pill
    background: '#f5f5f7',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },

  continueButton: {
    flex: 2,
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '980px', // Pill
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
  },
};
