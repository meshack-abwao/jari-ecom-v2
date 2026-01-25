import { useState } from 'react';

export default function Step5_VerificationTier({ data, updateData, nextStep, prevStep }) {
  const [selectedTier, setSelectedTier] = useState(data.verificationTier || 'BASIC');

  const tiers = [
    {
      id: 'BASIC',
      name: 'Basic',
      tagline: 'Start Selling Today',
      limits: ['KES 50,000/month', 'KES 10,000/transaction'],
      settlement: '3-day hold',
      required: ['Phone verification', 'Email verification'],
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      badge: null,
    },
    {
      id: 'VERIFIED',
      name: 'Verified',
      tagline: 'Build Customer Trust',
      limits: ['KES 500,000/month', 'KES 50,000/transaction'],
      settlement: '2-day hold',
      required: ['Phone + Email', 'National ID upload'],
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      badge: 'Recommended',
    },
    {
      id: 'BUSINESS',
      name: 'Business',
      tagline: 'Unlimited Power',
      limits: ['Unlimited transactions', 'No limits'],
      settlement: 'Instant settlement',
      required: ['All above', 'Business Registration', 'KRA PIN'],
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      badge: 'Premium',
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
      <div style={styles.header}>
        <p style={styles.helpText}>
          💡 You can upgrade your verification level anytime after signup
        </p>
      </div>

      <div style={styles.tiersGrid}>
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.id;

          return (
            <div
              key={tier.id}
              onClick={() => handleSelect(tier.id)}
              style={{
                ...styles.tierCard,
                border: isSelected ? '3px solid' : '2px solid #e5e7eb',
                borderImage: isSelected ? `${tier.gradient} 1` : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {tier.badge && (
                <div style={{...styles.badge, background: tier.gradient}}>
                  {tier.badge}
                </div>
              )}

              <div style={styles.tierTop}>
                <div style={styles.tierNameSection}>
                  <h3 style={styles.tierName}>{tier.name}</h3>
                  <p style={styles.tierTagline}>{tier.tagline}</p>
                </div>

                <div style={{
                  ...styles.radioButton,
                  borderColor: isSelected ? 'transparent' : '#d1d5db',
                  background: isSelected ? tier.gradient : 'white',
                }}>
                  {isSelected && <span style={styles.radioCheck}>✓</span>}
                </div>
              </div>

              <div style={styles.tierContent}>
                {/* Limits */}
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Transaction Limits</div>
                  {tier.limits.map((limit, idx) => (
                    <div key={idx} style={styles.listItem}>
                      <span style={styles.dot}>•</span>
                      <span>{limit}</span>
                    </div>
                  ))}
                </div>

                {/* Settlement */}
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Settlement</div>
                  <div style={styles.listItem}>
                    <span style={styles.dot}>•</span>
                    <span>{tier.settlement}</span>
                  </div>
                </div>

                {/* Required Docs */}
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Required Documents</div>
                  {tier.required.map((doc, idx) => (
                    <div key={idx} style={styles.listItem}>
                      <span style={styles.checkSmall}>✓</span>
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <button onClick={prevStep} style={styles.backButton}>
          ← Back
        </button>
        <button onClick={handleContinue} style={styles.continueButton}>
          Continue with {tiers.find(t => t.id === selectedTier)?.name} →
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
  },

  header: {
    marginBottom: '32px',
  },

  helpText: {
    fontSize: '14px',
    color: '#667eea',
    background: '#f3f4ff',
    padding: '12px 20px',
    borderRadius: '10px',
    textAlign: 'center',
    margin: 0,
  },

  tiersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },

  tierCard: {
    position: 'relative',
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },

  badge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'white',
    letterSpacing: '0.5px',
  },

  tierTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #f3f4f6',
  },

  tierNameSection: {
    flex: 1,
  },

  tierName: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  },

  tierTagline: {
    fontSize: '13px',
    color: '#86868b',
    margin: 0,
  },

  radioButton: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },

  radioCheck: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
  },

  tierContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  sectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },

  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    lineHeight: 1.5,
  },

  dot: {
    color: '#d1d5db',
    fontWeight: 'bold',
    fontSize: '16px',
    flexShrink: 0,
  },

  checkSmall: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: '14px',
    flexShrink: 0,
  },

  footer: {
    display: 'flex',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
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
