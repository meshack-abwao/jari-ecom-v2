export default function Step2_TemplatePreview({ data, updateData, nextStep, prevStep }) {
  const templatePreviews = {
    vm: {
      name: 'Visual Menu',
      description: 'Perfect for restaurants and food businesses',
      features: ['Photo-based menu', 'Category filters', 'Quick ordering', 'WhatsApp integration'],
      preview: '🍽️ Menu cards with appetizing photos',
    },
    pbk: {
      name: 'Portfolio & Booking',
      description: 'Showcase your work and take bookings',
      features: ['Gallery showcase', 'Booking calendar', 'Service packages', 'Client testimonials'],
      preview: '📸 Professional portfolio with booking system',
    },
    qd: {
      name: 'Quick Decision',
      description: 'Fast, simple product pages',
      features: ['Single product focus', 'Quick checkout', 'Stock indicators', 'Social sharing'],
      preview: '🛍️ Clean product card with instant buy',
    },
    dd: {
      name: 'Deep Dive',
      description: 'Detailed product information',
      features: ['Spec tables', 'Image galleries', 'Reviews', 'Detailed descriptions'],
      preview: '💎 Premium product showcase with specs',
    },
    events: {
      name: 'Events & Booking',
      description: 'Promote events and sell tickets',
      features: ['Event details', 'Ticket booking', 'Countdown timer', 'Location maps'],
      preview: '🎫 Event landing page with ticket sales',
    },
  };

  const currentTemplate = templatePreviews[data.defaultTemplate] || templatePreviews.qd;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={prevStep} style={styles.backButton}>
          ← Back
        </button>

        <h2 style={styles.heading}>Your Free Template: {currentTemplate.name}</h2>
        <p style={styles.subheading}>{currentTemplate.description}</p>

        {/* Template preview */}
        <div style={styles.previewCard} className="glass-card">
          <div style={styles.previewPlaceholder}>
            <span style={styles.previewIcon}>{currentTemplate.preview}</span>
            <p style={styles.previewText}>Template Preview</p>
            <p style={styles.previewSubtext}>
              Your store will look professional and mobile-optimized
            </p>
          </div>

          {/* Features list */}
          <div style={styles.features}>
            <h3 style={styles.featuresTitle}>What's included:</h3>
            <ul style={styles.featuresList}>
              {currentTemplate.features.map((feature, index) => (
                <li key={index} style={styles.featureItem}>
                  <span style={styles.checkmark}>✓</span> {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reassurance + CTA */}
        <div style={styles.reassurance}>
          <p style={styles.reassuranceText}>
            ✨ Don't worry, you can unlock more templates later
          </p>
          <p style={styles.reassuranceText}>
            🎨 Customize colors, fonts, and content to match your brand
          </p>
        </div>

        <button onClick={nextStep} style={styles.continueButton}>
          Looks Great! Continue →
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
  
  previewCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
  },
  
  previewPlaceholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '3rem 2rem',
    textAlign: 'center',
    marginBottom: '2rem',
    border: '2px dashed #d1d5db',
  },
  
  previewIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem',
  },
  
  previewText: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  
  previewSubtext: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  
  features: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  
  featuresTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
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
    transition: 'all 0.3s ease',
  },
};
