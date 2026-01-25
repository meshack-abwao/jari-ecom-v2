import { useState } from 'react';

export default function Step1_BusinessType({ data, updateData, nextStep }) {
  const [selectedType, setSelectedType] = useState('');

  const businessTypes = [
    {
      id: 'food',
      name: 'Food & Restaurants',
      description: 'Menus, food delivery, cafes',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    },
    {
      id: 'services',
      name: 'Services & Booking',
      description: 'Photography, consulting, appointments',
      image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
    {
      id: 'products',
      name: 'Products & Retail',
      description: 'Online shops, fashion, merchandise',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    {
      id: 'premium',
      name: 'Premium & Luxury',
      description: 'High-end products, jewelry, watches',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    },
    {
      id: 'events',
      name: 'Events & Tickets',
      description: 'Concerts, workshops, conferences',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  ];

  const handleSelect = (type) => {
    setSelectedType(type.id);
    
    // Map business type to template
    const templateMap = {
      food: 'vm',
      services: 'pbk',
      products: 'qd',
      premium: 'dd',
      events: 'events'
    };
    
    // Map to smart add-ons
    const addonMap = {
      food: ['mpesa_stk', 'whatsapp_auto'],
      services: ['mpesa_stk'],
      products: ['mpesa_stk', 'whatsapp_auto'],
      premium: ['mpesa_stk', 'priority_support'],
      events: ['mpesa_stk', 'whatsapp_auto']
    };

    // Update signup data
    updateData({
      businessType: type.id,
      defaultTemplate: templateMap[type.id],
      smartAddons: addonMap[type.id],
    });

    // Auto-advance after short delay (visual feedback)
    setTimeout(() => {
      nextStep();
    }, 400);
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {businessTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => handleSelect(type)}
            style={{
              ...styles.card,
              transform: selectedType === type.id ? 'scale(0.98)' : 'scale(1)',
              opacity: selectedType && selectedType !== type.id ? 0.5 : 1,
            }}
          >
            {/* Image with gradient overlay */}
            <div style={styles.imageContainer}>
              <img 
                src={type.image} 
                alt={type.name}
                style={styles.image}
              />
              <div style={{
                ...styles.gradientOverlay,
                background: type.gradient,
              }} />
            </div>

            {/* Content */}
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{type.name}</h3>
              <p style={styles.cardDescription}>{type.description}</p>
            </div>

            {/* Selected indicator */}
            {selectedType === type.id && (
              <div style={styles.selectedBadge}>
                <div style={styles.checkmark}>✓</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },

  card: {
    position: 'relative',
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '2px solid transparent',
  },

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '180px',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    transition: 'opacity 0.3s ease',
  },

  cardContent: {
    padding: '20px',
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '6px',
    letterSpacing: '-0.01em',
  },

  cardDescription: {
    fontSize: '14px',
    color: '#86868b',
    lineHeight: 1.4,
    margin: 0,
  },

  selectedBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },

  checkmark: {
    color: '#10b981',
    fontSize: '18px',
    fontWeight: 'bold',
  },
};
