import { useState } from 'react';
import { authAPI } from '../../api/client';

export default function Step1_BusinessType({ data, updateData, nextStep }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const businessTypes = [
    {
      id: 'food',
      name: 'Food & Restaurants',
      icon: '🍽️',
      description: 'Restaurants, cafes, food delivery',
      examples: 'Menu ordering, food galleries, quick checkout',
      color: '#f59e0b',
    },
    {
      id: 'services',
      name: 'Services & Booking',
      icon: '📸',
      description: 'Photography, consulting, salons',
      examples: 'Portfolio showcase, booking calendar, packages',
      color: '#8b5cf6',
    },
    {
      id: 'products',
      name: 'Products & Retail',
      icon: '🛍️',
      description: 'Online shops, retail stores',
      examples: 'Product catalog, quick buy, inventory',
      color: '#3b82f6',
    },
    {
      id: 'premium',
      name: 'Premium & Luxury',
      icon: '💎',
      description: 'High-end products, luxury goods',
      examples: 'Detailed specs, premium imagery, trust signals',
      color: '#ec4899',
    },
    {
      id: 'events',
      name: 'Events & Tickets',
      icon: '🎫',
      description: 'Concerts, conferences, workshops',
      examples: 'Event landing pages, ticket booking, countdown',
      color: '#10b981',
    },
  ];

  const handleSelect = async (businessType) => {
    setLoading(true);
    setError('');

    try {
      // Call API to get template recommendations
      const response = await authAPI.post('/auth/signup/business-type', {
        businessType: businessType.id,
      });

      const { defaultTemplate, templateName, smartAddons } = response.data;

      // Update signup data
      updateData({
        businessType: businessType.id,
        defaultTemplate,
        templateName,
        smartAddons,
      });

      // Move to next step
      nextStep();
    } catch (err) {
      setError('Failed to load template. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.heading}>What are you selling?</h2>
        <p style={styles.subheading}>
          Choose your business type to get the perfect template
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          {businessTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelect(type)}
              disabled={loading}
              style={{
                ...styles.card,
                borderColor: type.color,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              className="glass-card"
            >
              <div style={styles.iconContainer}>
                <span style={{ ...styles.icon, color: type.color }}>{type.icon}</span>
              </div>
              
              <h3 style={styles.cardTitle}>{type.name}</h3>
              <p style={styles.cardDescription}>{type.description}</p>
              
              <div style={styles.examples}>
                <span style={styles.examplesLabel}>Includes:</span>
                <span style={styles.examplesText}>{type.examples}</span>
              </div>

              <div style={{ ...styles.selectButton, backgroundColor: type.color }}>
                {loading ? 'Loading...' : 'Choose This'}
              </div>
            </button>
          ))}
        </div>

        {/* Trust messaging */}
        <div style={styles.trustBar}>
          <span style={styles.trustItem}>✓ Free template included</span>
          <span style={styles.trustItem}>✓ Change anytime</span>
          <span style={styles.trustItem}>✓ 50+ merchants already selling</span>
        </div>
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
  
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
    border: '3px solid',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    position: 'relative',
    backdropFilter: 'blur(10px)',
  },
  
  iconContainer: {
    marginBottom: '1rem',
  },
  
  icon: {
    fontSize: '3rem',
  },
  
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  
  cardDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  
  examples: {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '0.75rem',
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  
  examplesLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#4b5563',
    display: 'block',
    marginBottom: '0.25rem',
  },
  
  examplesText: {
    fontSize: '0.75rem',
    color: '#6b7280',
    lineHeight: '1.4',
  },
  
  selectButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.875rem',
    border: 'none',
    width: '100%',
  },
  
  trustBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
    padding: '1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  
  trustItem: {
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
};
