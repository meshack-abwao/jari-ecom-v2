import { useState } from 'react';

export default function Step1_BusinessType({ data, updateData, nextStep }) {
  const [selectedType, setSelectedType] = useState('');
  const [hoveredType, setHoveredType] = useState(null);

  const businessScenarios = [
    {
      id: 'food',
      question: "Want customers to order food without endless back-and-forth?",
      painPoint: "Tired of 'Is it available?' messages at 2am",
      solution: "Menu that shows what's in stock, accepts orders instantly",
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    },
    {
      id: 'services',
      question: "Losing bookings because clients can't find available times?",
      painPoint: "Playing phone tag to schedule appointments",
      solution: "Calendar that shows open slots, books automatically",
      image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
    {
      id: 'products',
      question: "Spending all day answering 'What colors do you have?'",
      painPoint: "Same questions, different customers, every single day",
      solution: "Product catalog with photos, prices, and instant checkout",
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    {
      id: 'premium',
      question: "Your products deserve better than blurry WhatsApp photos?",
      painPoint: "Competing with cheap sellers when you offer premium quality",
      solution: "Showcase every detail with stunning galleries and trust signals",
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    },
    {
      id: 'events',
      question: "Manually tracking RSVPs and payments in spreadsheets?",
      painPoint: "Losing track of who paid, who's coming, who cancelled",
      solution: "Event page with automatic RSVP tracking and M-Pesa payments",
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  ];

  const handleSelect = (scenario) => {
    setSelectedType(scenario.id);
    
    const templateMap = {
      food: 'vm',
      services: 'pbk',
      products: 'qd',
      premium: 'dd',
      events: 'events'
    };
    
    const addonMap = {
      food: ['mpesa_stk', 'whatsapp_auto'],
      services: ['mpesa_stk'],
      products: ['mpesa_stk', 'whatsapp_auto'],
      premium: ['mpesa_stk', 'priority_support'],
      events: ['mpesa_stk', 'whatsapp_auto']
    };

    updateData({
      businessType: scenario.id,
      defaultTemplate: templateMap[scenario.id],
      smartAddons: addonMap[scenario.id],
    });

    setTimeout(() => {
      nextStep();
    }, 400);
  };

  return (
    <div style={styles.fullContainer}>
      {/* Header - No container, full width */}
      <div style={styles.header}>
        <h2 style={styles.heading}>We get it. Running a business in Kenya is tough.</h2>
        <p style={styles.subheading}>
          Pick the scenario that sounds most like your daily hustle:
        </p>
      </div>

      {/* Grid - Edge to edge on mobile, max-width on desktop */}
      <div style={styles.grid}>
        {businessScenarios.map((scenario) => (
          <div
            key={scenario.id}
            onClick={() => handleSelect(scenario)}
            onMouseEnter={() => setHoveredType(scenario.id)}
            onMouseLeave={() => setHoveredType(null)}
            style={{
              ...styles.card,
              transform: selectedType === scenario.id ? 'scale(0.98)' : 
                         hoveredType === scenario.id ? 'translateY(-4px)' : 'scale(1)',
              opacity: selectedType && selectedType !== scenario.id ? 0.6 : 1,
              boxShadow: hoveredType === scenario.id 
                ? '0 20px 40px rgba(0, 0, 0, 0.15)' 
                : selectedType === scenario.id
                ? '0 8px 24px rgba(0, 0, 0, 0.12)'
                : '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Image - Taller, more prominent */}
            <div style={styles.imageContainer}>
              <img 
                src={scenario.image} 
                alt={scenario.question}
                style={{
                  ...styles.image,
                  transform: hoveredType === scenario.id ? 'scale(1.08)' : 'scale(1)',
                }}
              />
              <div style={{
                ...styles.gradientOverlay,
                background: scenario.gradient,
                opacity: hoveredType === scenario.id ? 0.5 : 0.35,
              }} />
              
              {/* Selected checkmark overlaid on image */}
              {selectedType === scenario.id && (
                <div style={styles.selectedBadge}>
                  <div style={styles.checkmark}>✓</div>
                </div>
              )}
            </div>

            {/* Content - More breathing room */}
            <div style={styles.cardContent}>
              {/* Question - Prominent */}
              <h3 style={styles.question}>{scenario.question}</h3>
              
              {/* Pain Point - Always visible, subtle */}
              <div style={styles.painPoint}>
                <span style={styles.painIcon}>😤</span>
                <span style={styles.painText}>{scenario.painPoint}</span>
              </div>

              {/* Solution - Prominent */}
              <div style={styles.solution}>
                <span style={styles.solutionIcon}>✨</span>
                <span style={styles.solutionText}>{scenario.solution}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - No container needed */}
      <p style={styles.footerText}>
        💡 Don't worry—you can switch templates anytime
      </p>
    </div>
  );
}

const styles = {
  fullContainer: {
    width: '100%',
    minHeight: '100vh',
    padding: '40px 20px',
  },

  header: {
    textAlign: 'center',
    marginBottom: '48px',
    maxWidth: '800px',
    margin: '0 auto 48px',
  },

  heading: {
    fontSize: 'clamp(28px, 5vw, 40px)',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '16px',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },

  subheading: {
    fontSize: 'clamp(16px, 3vw, 20px)',
    color: '#86868b',
    margin: 0,
    fontWeight: 400,
    lineHeight: 1.4,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    maxWidth: '1400px',
    margin: '0 auto 48px',
  },

  card: {
    position: 'relative',
    background: 'white',
    borderRadius: '24px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: 'none',
  },

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '240px',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  },

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: 'opacity 0.4s ease',
  },

  selectedBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '44px',
    height: '44px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    zIndex: 10,
  },

  checkmark: {
    color: '#10b981',
    fontSize: '24px',
    fontWeight: 'bold',
  },

  cardContent: {
    padding: '32px 28px',
  },

  question: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '16px',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },

  painPoint: {
    display: 'flex',
    gap: '10px',
    padding: '14px 16px',
    background: 'rgba(239, 68, 68, 0.06)',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid rgba(239, 68, 68, 0.1)',
  },

  painIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },

  painText: {
    fontSize: '14px',
    color: '#dc2626',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },

  solution: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },

  solutionIcon: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '2px',
  },

  solutionText: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: 1.6,
    fontWeight: 500,
  },

  footerText: {
    fontSize: '15px',
    color: '#86868b',
    textAlign: 'center',
    margin: '0 auto',
    maxWidth: '600px',
  },
};
