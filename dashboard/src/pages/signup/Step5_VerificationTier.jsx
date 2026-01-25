import { useState } from 'react';

export default function Step5_VerificationTier({ data, updateData, nextStep, prevStep }) {
  const [selectedTier, setSelectedTier] = useState(data.verificationTier || 'BASIC');

  const tiers = [
    {
      id: 'BASIC',
      name: 'Basic',
      icon: '🌱',
      description: 'Start selling immediately',
      limits: 'KES 50,000/month, KES 10,000/transaction',
      settlement: '3-day hold',
      required: ['Phone verification', 'Email verification'],
      color: '#3b82f6',
    },
    {
      id: 'VERIFIED',
      name: 'Verified',
      icon: '✓',
      description: 'Build customer trust',
      limits: 'KES 500,000/month, KES 50,000/transaction',
      settlement: '2-day hold',
      required: ['Phone + Email', 'National ID upload'],
      color: '#10b981',
      badge: 'Recommended',
    },
    {
      id: 'BUSINESS',
      name: 'Business',
      icon: '🏢',
      description: 'Unlimited selling power',
      limits: 'Unlimited transactions',
      settlement: 'Instant settlement',
      required: ['All above', 'Business Registration', 'KRA PIN'],
      color: '#8b5cf6',
    },
  ];

  const handleSelect = (tierId) => {
    setSelectedTier(tierId);
  };

  const handleContinue = () => {
    updateData({ verificationTier: selectedTier });
    nextStep();
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={prevStep} style={styles.backButton}>
          ← Back
        </button>

        <h2 style={styles.heading}>Choose Your Verification Level</h2>
        <p style={styles.subheading}>
          Higher verification = More trust from customers + Better limits
        </p>

        <div style={styles.tiersContainer}>
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.id;

            return (
              <div
                key={tier.id}
                onClick={() => handleSelect(tier.id)}
                style={{
                  ...styles.tierCard,
                  borderColor: isSelected ? tier.color : '#d1d5db',
                  backgroundColor: isSelected ? '#f0fdf4' : 'rgba(255, 255, 255, 0.95)',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  cursor: 'pointer',
                }}
              >
                {tier.badge && (
                  <span style={{ ...styles.badge, backgroundColor: tier.color }}>
                    {tier.badge}
                  </span>
                )}

                <div style={styles.tierHeader}>
                  <span style={{ ...styles.tierIcon, color: tier.color }}>{tier.icon}</span>
                  <div style={styles.tierCheckbox}>
                    {isSelected && (
                      <span style={{ ...styles.checkbox, backgroundColor: tier.color }}>✓</span>
                    )}
                  </div>
                </div>

                <h3 style={styles.tierName}>{tier.name}</h3>
                <p style={styles.tierDescription}>{tier.description}</p>

                <div style={styles.tierDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>💰 Limits:</span>
                    <span style={styles.detailValue}>{tier.limits}</span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>⏱️ Settlement:</span>
                    <span style={styles.detailValue}>{tier.settlement}</span>
                  </div>
                </div>

                <div style={styles.requirements}>
                  <span style={styles.requirementsLabel}>Required:</span>
                  <ul style={styles.requirementsList}>
                    {tier.required.map((req, index) => (
                      <li key={index} style={styles.requirementItem}>
                        • {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance */}
        <div style={styles.reassurance}>
          <p style={styles.reassuranceText}>
            ✓ You can upgrade your verification anytime from your dashboard
          </p>
          <p style={styles.reassuranceText}>
            🔒 All verification documents are encrypted and stored securely
          </p>
        </div>

        <button onClick={handleContinue} style={styles.continueButton}>
          Continue with {tiers.find(t => t.id === selectedTier)?.name} →
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
    maxWidth: '900px',
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
  
  tiersContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  
  tierCard: {
    borderRadius: '16px',
    padding: '2rem',
    border: '3px solid',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  
  badge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
  },
  
  tierHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  
  tierIcon: {
    fontSize: '2.5rem',
  },
  
  tierCheckbox: {
    width: '28px',
    height: '28px',
    border: '2px solid #d1d5db',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkbox: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  
  tierName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  
  tierDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  
  tierDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  },
  
  detailLabel: {
    color: '#6b7280',
    fontWeight: '500',
  },
  
  detailValue: {
    color: '#1f2937',
    fontWeight: '600',
    textAlign: 'right',
  },
  
  requirements: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1rem',
  },
  
  requirementsLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  requirementsList: {
    listStyle: 'none',
    padding: 0,
    margin: '0.5rem 0 0 0',
  },
  
  requirementItem: {
    fontSize: '0.875rem',
    color: '#4b5563',
    marginBottom: '0.25rem',
  },
  
  reassurance: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  
  reassuranceText: {
    color: 'white',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
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
