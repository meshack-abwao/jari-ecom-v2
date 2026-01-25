import { useState } from 'react';

export default function Step4_PlanSelector({ data, updateData, nextStep, prevStep }) {
  const [selectedAddons, setSelectedAddons] = useState(data.selectedAddons || data.smartAddons || []);

  const addons = [
    {
      id: 'mpesa_stk',
      name: 'M-Pesa STK Push',
      price: 300,
      description: 'Accept payments directly via M-Pesa',
      icon: '💳',
      recommended: true,
    },
    {
      id: 'whatsapp_auto',
      name: 'WhatsApp Auto-Reply',
      price: 80,
      description: 'Automated customer messages',
      icon: '💬',
      recommended: data.businessType === 'food' || data.businessType === 'products',
    },
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      price: 200,
      description: 'Track conversions and customer behavior',
      icon: '📊',
      recommended: false,
    },
    {
      id: 'priority_support',
      name: 'Priority Support',
      price: 500,
      description: 'Get help within 2 hours',
      icon: '🎯',
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
      <div style={styles.content}>
        <button onClick={prevStep} style={styles.backButton}>
          ← Back
        </button>

        <h2 style={styles.heading}>Choose Your Plan</h2>
        <p style={styles.subheading}>
          {data.smartAddons?.length > 0 
            ? `We've pre-selected what ${data.businessType} businesses typically need`
            : 'Select the features you need'}
        </p>

        {/* Base Plan */}
        <div style={styles.basePlanCard}>
          <div style={styles.basePlanHeader}>
            <div>
              <h3 style={styles.basePlanTitle}>{basePlan.name}</h3>
              <p style={styles.basePlanSubtitle}>Everything you need to get started</p>
            </div>
            <div style={styles.basePlanPrice}>
              <span style={styles.currency}>KES</span>
              <span style={styles.amount}>{basePlan.price}</span>
              <span style={styles.period}>/month</span>
            </div>
          </div>

          <ul style={styles.featuresList}>
            {basePlan.features.map((feature, index) => (
              <li key={index} style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span> {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Add-ons */}
        <div style={styles.addonsSection}>
          <h3 style={styles.addonsTitle}>Add-ons (Optional)</h3>
          
          <div style={styles.addonsGrid}>
            {addons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id);
              
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  style={{
                    ...styles.addonCard,
                    borderColor: isSelected ? '#10b981' : '#d1d5db',
                    backgroundColor: isSelected ? '#f0fdf4' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  {addon.recommended && (
                    <span style={styles.recommendedBadge}>Recommended</span>
                  )}
                  
                  <div style={styles.addonHeader}>
                    <span style={styles.addonIcon}>{addon.icon}</span>
                    <div style={styles.addonCheckbox}>
                      {isSelected && <span style={styles.checkbox}>✓</span>}
                    </div>
                  </div>

                  <h4 style={styles.addonName}>{addon.name}</h4>
                  <p style={styles.addonDescription}>{addon.description}</p>

                  <div style={styles.addonPrice}>
                    +KES {addon.price}/month
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <div style={styles.totalCard}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Monthly Total:</span>
            <span style={styles.totalAmount}>KES {calculateTotal()}</span>
          </div>
          {selectedAddons.length > 0 && (
            <p style={styles.totalHint}>
              You can cancel or modify add-ons anytime from your dashboard
            </p>
          )}
        </div>

        <button onClick={handleContinue} style={styles.continueButton}>
          Continue →
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  
  content: {
    width: '100%',
    maxWidth: '700px',
  },
  
  backButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  
  subheading: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  
  basePlanCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    border: '3px solid #10b981',
  },
  
  basePlanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  
  basePlanTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  
  basePlanSubtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  
  basePlanPrice: {
    textAlign: 'right',
  },
  
  currency: {
    fontSize: '1rem',
    color: '#6b7280',
    marginRight: '0.25rem',
  },
  
  amount: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#10b981',
  },
  
  period: {
    fontSize: '0.875rem',
    color: '#6b7280',
    display: 'block',
  },
  
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  
  featureItem: {
    fontSize: '0.875rem',
    color: '#4b5563',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
  },
  
  checkmark: {
    color: '#10b981',
    fontWeight: 'bold',
    marginRight: '0.5rem',
    fontSize: '1.25rem',
  },
  
  addonsSection: {
    marginBottom: '2rem',
  },
  
  addonsTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'white',
    marginBottom: '1rem',
  },
  
  addonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
  },
  
  addonCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '2px solid',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  
  recommendedBadge: {
    position: 'absolute',
    top: '-10px',
    right: '10px',
    backgroundColor: '#f59e0b',
    color: 'white',
    fontSize: '0.625rem',
    fontWeight: '600',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  
  addonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  
  addonIcon: {
    fontSize: '1.5rem',
  },
  
  addonCheckbox: {
    width: '24px',
    height: '24px',
    border: '2px solid #d1d5db',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkbox: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  
  addonName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  
  addonDescription: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
  
  addonPrice: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#10b981',
  },
  
  totalCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  totalLabel: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#10b981',
  },
  
  totalHint: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.5rem',
  },
  
  continueButton: {
    width: '100%',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
