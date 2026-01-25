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
                  borderColor: isSelected ? addon.color : '#e5e7eb',
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
                    borderColor: isSelected ? addon.color : '#d1d5db',
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
            Continue to Verification →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
  },

  basePlanCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '40px',
    color: 'white',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
  },

  basePlanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    gap: '24px',
    flexWrap: 'wrap',
  },

  basePlanBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
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
    fontSize: '14px',
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
    gap: '4px',
  },

  currency: {
    fontSize: '16px',
    opacity: 0.8,
  },

  amount: {
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },

  period: {
    fontSize: '14px',
    opacity: 0.8,
    display: 'block',
    marginTop: '4px',
  },

  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    opacity: 0.95,
  },

  checkmark: {
    fontSize: '16px',
    fontWeight: 'bold',
  },

  addonsSection: {
    marginBottom: '40px',
  },

  sectionTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },

  sectionSubtitle: {
    fontSize: '14px',
    color: '#86868b',
    marginBottom: '24px',
  },

  addonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },

  addonCard: {
    position: 'relative',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    },
  },

  recommendedBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'white',
    letterSpacing: '0.3px',
  },

  addonTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },

  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
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
    fontSize: '13px',
    color: '#86868b',
    lineHeight: 1.4,
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
    borderTop: '1px solid #e5e7eb',
    paddingTop: '32px',
  },

  totalSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '12px',
  },

  totalLabel: {
    fontSize: '14px',
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
    gap: '12px',
  },

  backButton: {
    flex: 1,
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 500,
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: 'white',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },

  continueButton: {
    flex: 2,
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
  },
};
