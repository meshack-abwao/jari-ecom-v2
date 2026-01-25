import { useState } from 'react';

export default function Step1_BusinessType({ data, updateData, nextStep }) {
  const [step, setStep] = useState('intro'); // 'intro' | 'questionnaire'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    painPoints: [],         // Multi-select
    sellingWhat: null,      // Single select
    desiredOutcomes: [],    // Multi-select
  });

  // JTBD Questions with SVG icons
  const questions = [
    {
      id: 'painPoints',
      type: 'multi',
      question: "What's making your business life harder than it needs to be?",
      subtitle: "Pick all that apply—we've got solutions for each one",
      options: [
        {
          value: 'endless_questions',
          label: "Answering the same customer questions all day",
          subtext: "'Is it available?', 'What sizes?', 'How much?'",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        },
        {
          value: 'payment_chaos',
          label: "Tracking payments is a mess",
          subtext: "Lost M-Pesa codes, screenshot confusion, constant follow-ups",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>`,
        },
        {
          value: 'unprofessional_look',
          label: "My business looks too casual",
          subtext: "Competing with real brands using just WhatsApp and IG stories",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
        },
        {
          value: 'poor_showcase',
          label: "Can't show my products properly",
          subtext: "WhatsApp compresses photos, details get lost",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
        },
        {
          value: 'scheduling_nightmare',
          label: "Booking appointments is chaotic",
          subtext: "Phone tag, double bookings, no-shows",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
        },
        {
          value: 'time_wasted',
          label: "Spending too much time on admin work",
          subtext: "Not enough time to actually grow the business",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
        },
      ],
    },
    {
      id: 'sellingWhat',
      type: 'single',
      question: "What are you selling?",
      subtitle: "This helps us set up the perfect template for your business",
      options: [
        {
          value: 'food',
          label: "Food & Drinks",
          subtext: "Restaurant, cafe, catering, food delivery",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>`,
        },
        {
          value: 'services',
          label: "Services & Appointments",
          subtext: "Photography, salon, consulting, training, events",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
        },
        {
          value: 'products',
          label: "Physical Products",
          subtext: "Fashion, electronics, beauty, home goods",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>`,
        },
        {
          value: 'premium',
          label: "High-End Products",
          subtext: "Jewelry, luxury goods, custom items",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
        },
        {
          value: 'events',
          label: "Events & Tickets",
          subtext: "Workshops, concerts, conferences, classes",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
        },
      ],
    },
    {
      id: 'desiredOutcomes',
      type: 'multi',
      question: "What would success look like for you?",
      subtitle: "Pick your top goals—we'll help you get there",
      options: [
        {
          value: 'save_time',
          label: "Get back 5+ hours every week",
          subtext: "Less customer service, more time to grow",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
        },
        {
          value: 'increase_sales',
          label: "Grow my revenue significantly",
          subtext: "More customers, bigger orders, repeat buyers",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17l-4-4-4 4-5-5"/></svg>`,
        },
        {
          value: 'look_professional',
          label: "Be taken seriously as a business",
          subtext: "Professional presence, compete with bigger brands",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
        },
        {
          value: 'scale_business',
          label: "Scale up and hire help",
          subtext: "Systems that work without me babysitting",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        },
        {
          value: 'reduce_stress',
          label: "Run my business without burning out",
          subtext: "Enjoy it again, not just survive it",
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
        },
      ],
    },
  ];

  const currentQ = step === 'questionnaire' ? questions[currentQuestion] : null;
  const progress = currentQ ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleStartQuestionnaire = () => {
    setStep('questionnaire');
  };

  const handleToggleMulti = (questionId, value) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [questionId]: newValue };
    });
  };

  const handleSelectSingle = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-advance after brief pause
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        processAnswersAndContinue();
      }
    }, 400);
  };

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      processAnswersAndContinue();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const canContinue = () => {
    const currentAnswer = answers[currentQ.id];
    if (currentQ.type === 'multi') {
      return currentAnswer && currentAnswer.length > 0;
    }
    return currentAnswer !== null;
  };

  const processAnswersAndContinue = () => {
    const templateMap = {
      food: 'vm',
      services: 'pbk',
      products: 'qd',
      premium: 'dd',
      events: 'events',
    };

    const addonMap = {
      food: ['mpesa_stk', 'whatsapp_auto'],
      services: ['mpesa_stk'],
      products: ['mpesa_stk', 'whatsapp_auto'],
      premium: ['mpesa_stk', 'priority_support'],
      events: ['mpesa_stk', 'whatsapp_auto'],
    };

    updateData({
      businessType: answers.sellingWhat,
      defaultTemplate: templateMap[answers.sellingWhat],
      smartAddons: addonMap[answers.sellingWhat],
      jtbdAnswers: answers,
    });

    setTimeout(() => nextStep(), 500);
  };

  // Intro screen
  if (step === 'intro') {
    return (
      <div style={styles.introContainer}>
        <div style={styles.introContent}>
          <h1 style={styles.introHeading}>
            Welcome! Let's build your perfect online store.
          </h1>
          <p style={styles.introText}>
            We know running a business in Kenya is challenging. Before we start,
            we'd love to understand what you're looking for—this helps us set up
            your store exactly right.
          </p>
          <p style={styles.introSubtext}>
            Takes about 60 seconds. No wrong answers.
          </p>
          
          <button onClick={handleStartQuestionnaire} style={styles.startButton}>
            Let's get started →
          </button>

          <p style={styles.skipText}>
            Already have an account? <a href="/login" style={styles.skipLink}>Sign in</a>
          </p>
        </div>
      </div>
    );
  }

  // Questionnaire
  return (
    <div style={styles.container}>
      {/* Progress */}
      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <p style={styles.progressText}>
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div style={styles.questionSection}>
        <h2 style={styles.question}>{currentQ.question}</h2>
        <p style={styles.subtitle}>{currentQ.subtitle}</p>
      </div>

      {/* Options */}
      <div style={styles.optionsGrid}>
        {currentQ.options.map((option) => {
          const isSelected = currentQ.type === 'multi'
            ? (answers[currentQ.id] || []).includes(option.value)
            : answers[currentQ.id] === option.value;

          return (
            <button
              key={option.value}
              onClick={() => {
                if (currentQ.type === 'multi') {
                  handleToggleMulti(currentQ.id, option.value);
                } else {
                  handleSelectSingle(currentQ.id, option.value);
                }
              }}
              style={{
                ...styles.optionCard,
                borderColor: isSelected ? '#667eea' : 'rgba(0, 0, 0, 0.08)',
                background: isSelected ? 'rgba(102, 126, 234, 0.04)' : 'white',
              }}
            >
              <div style={{
                ...styles.iconCircle,
                background: isSelected 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : '#f5f5f7',
                color: isSelected ? 'white' : '#667eea',
              }}
                dangerouslySetInnerHTML={{ __html: option.svg }}
              />
              
              <div style={styles.optionContent}>
                <div style={styles.optionLabel}>{option.label}</div>
                <div style={styles.optionSubtext}>{option.subtext}</div>
              </div>

              {isSelected && (
                <div style={styles.selectedCheck}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div style={styles.navigation}>
        {currentQuestion > 0 && (
          <button onClick={handleBack} style={styles.backButton}>
            ← Back
          </button>
        )}
        
        {currentQ.type === 'multi' && (
          <button
            onClick={handleContinue}
            disabled={!canContinue()}
            style={{
              ...styles.continueButton,
              opacity: canContinue() ? 1 : 0.4,
              cursor: canContinue() ? 'pointer' : 'not-allowed',
            }}
          >
            {currentQuestion === questions.length - 1 ? "Let's build your store →" : 'Continue →'}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  // Intro styles
  introContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },

  introContent: {
    maxWidth: '600px',
    textAlign: 'center',
    background: 'white',
    padding: '64px 48px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },

  introHeading: {
    fontSize: 'clamp(28px, 5vw, 40px)',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '24px',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },

  introText: {
    fontSize: '18px',
    color: '#4b5563',
    lineHeight: 1.6,
    marginBottom: '16px',
  },

  introSubtext: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '40px',
  },

  startButton: {
    padding: '16px 48px',
    fontSize: '17px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },

  skipText: {
    marginTop: '32px',
    fontSize: '14px',
    color: '#86868b',
  },

  skipLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 500,
  },

  // Questionnaire styles
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    maxWidth: '900px',
    margin: '0 auto',
  },

  progressSection: {
    marginBottom: '56px',
  },

  progressBar: {
    height: '4px',
    background: 'rgba(0, 0, 0, 0.06)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '12px',
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    borderRadius: '2px',
  },

  progressText: {
    fontSize: '13px',
    color: '#86868b',
    fontWeight: 500,
    margin: 0,
  },

  questionSection: {
    marginBottom: '48px',
    textAlign: 'center',
  },

  question: {
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '12px',
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: '17px',
    color: '#86868b',
    margin: 0,
    lineHeight: 1.5,
  },

  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '40px',
  },

  optionCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '24px',
    border: '2px solid',
    borderRadius: '16px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },

  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  },

  optionContent: {
    flex: 1,
  },

  optionLabel: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '6px',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },

  optionSubtext: {
    fontSize: '14px',
    color: '#86868b',
    lineHeight: 1.5,
  },

  selectedCheck: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '24px',
    height: '24px',
    color: '#667eea',
  },

  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },

  backButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 500,
    border: 'none',
    background: 'transparent',
    color: '#86868b',
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },

  continueButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
    marginLeft: 'auto',
  },
};
