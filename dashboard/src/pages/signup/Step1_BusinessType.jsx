import { useState, useEffect } from 'react';

export default function Step1_BusinessType({ data, updateData, nextStep }) {
  const [step, setStep] = useState('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [answers, setAnswers] = useState({
    painPoints: [],
    customerJobs: [],      // CHANGED to array for multi-select
    desiredOutcomes: [],
  });

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const questions = [
    {
      id: 'painPoints',
      type: 'multi',
      question: "What's holding your business back right now?",
      subtitle: "Pick what resonates—we'll help you fix these",
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
    // 🎯 NEW JTBD-BASED QUESTION 2 (Multi-select, max 2)
    {
      id: 'customerJobs',
      type: 'multi',
      maxSelections: 2,
      question: "How do your customers think when they're buying?",
      subtitle: "Pick 1-2 that match your customers' mindset",
      options: [
        {
          value: 'functional_quick',
          label: "Quick, practical solutions",
          customerThinking: "'I need to see what's available right now'",
          examples: "Fast food menus, daily essentials, quick-service items",
          template: 'Visual Menu',
          businessType: 'food',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4M12 16V8"/></svg>`,
        },
        {
          value: 'emotional_perfect',
          label: "Something perfect for a special moment",
          customerThinking: "'This needs to be amazing—show me every detail'",
          examples: "Wedding cakes, custom jewelry, milestone gifts, artisan products",
          template: 'Deep Dive',
          businessType: 'premium',
          gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
        },
        {
          value: 'trust_booking',
          label: "A reliable service they can book confidently",
          customerThinking: "'I need to see availability and know what's included'",
          examples: "Photography, salon services, consulting, event planning",
          template: 'Portfolio & Booking',
          businessType: 'services',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
        },
        {
          value: 'convenience_fast',
          label: "The easiest possible purchase",
          customerThinking: "'I know what I want—just let me buy it quickly'",
          examples: "Repeat purchases, simple products, known items",
          template: 'Quick Decision',
          businessType: 'products',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5L20 7"/></svg>`,
        },
        {
          value: 'social_status',
          label: "To impress others or stand out",
          customerThinking: "'I want something exclusive that reflects my taste'",
          examples: "Designer fashion, luxury goods, limited editions, status symbols",
          template: 'Premium Showcase',
          businessType: 'premium',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
        },
        {
          value: 'discovery_explore',
          label: "Inspiration and new possibilities",
          customerThinking: "'Show me your range—I need ideas'",
          examples: "Custom services, creative work, made-to-order items",
          template: 'Portfolio Gallery',
          businessType: 'services',
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
        },
      ],
    },
    {
      id: 'desiredOutcomes',
      type: 'multi',
      question: "What does winning look like for you?",
      subtitle: "Pick your top goals—your store will help you achieve them",
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
    setIsVisible(false);
    setTimeout(() => {
      setStep('questionnaire');
      setIsVisible(true);
    }, 300);
  };

  const handleToggleMulti = (questionId, value) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      
      // Check if this question has max selections limit
      const question = questions.find(q => q.id === questionId);
      const maxSelections = question?.maxSelections;
      
      if (current.includes(value)) {
        // Remove if already selected
        return { ...prev, [questionId]: current.filter(v => v !== value) };
      } else {
        // Add if not at max
        if (maxSelections && current.length >= maxSelections) {
          // At max, replace last selection
          const newValue = [...current.slice(0, -1), value];
          return { ...prev, [questionId]: newValue };
        }
        return { ...prev, [questionId]: [...current, value] };
      }
    });
  };

  const handleSelectSingle = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
          setIsVisible(true);
        }, 200);
      } else {
        processAnswersAndContinue();
      }
    }, 400);
  };

  const handleContinue = () => {
    if (currentQuestion < questions.length - 1) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setIsVisible(true);
      }, 200);
    } else {
      processAnswersAndContinue();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setIsVisible(true);
      }, 200);
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
    // Map customer job to template
    const jobToTemplateMap = {
      functional_quick: { template: 'vm', businessType: 'food' },
      emotional_perfect: { template: 'dd', businessType: 'premium' },
      trust_booking: { template: 'pbk', businessType: 'services' },
      convenience_fast: { template: 'qd', businessType: 'products' },
      social_status: { template: 'premium', businessType: 'premium' },
      discovery_explore: { template: 'pbk', businessType: 'services' },
    };

    // Use first selection as primary
    const primaryJob = answers.customerJobs[0];
    const selectedJob = jobToTemplateMap[primaryJob] || { template: 'qd', businessType: 'products' };

    // Map to smart add-ons based on business type
    const addonMap = {
      food: ['mpesa_stk', 'whatsapp_auto'],
      services: ['mpesa_stk'],
      products: ['mpesa_stk', 'whatsapp_auto'],
      premium: ['mpesa_stk', 'priority_support'],
    };

    updateData({
      businessType: selectedJob.businessType,
      customerJobs: answers.customerJobs, // Store all selected jobs
      primaryCustomerJob: primaryJob,      // Store primary job
      defaultTemplate: selectedJob.template,
      smartAddons: addonMap[selectedJob.businessType],
      jtbdAnswers: answers,
    });

    setTimeout(() => nextStep(), 500);
  };

  // Intro screen
  if (step === 'intro') {
    return (
      <div style={styles.introContainer}>
        <div style={{
          ...styles.introCard,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        }}>
          <h1 style={styles.introHeading}>
            Ready to grow your business?
          </h1>
          <p style={styles.introText}>
            You're about to create an online store that actually works for your business.
            Let's start by understanding what makes your business unique.
          </p>
          <p style={styles.introSubtext}>
            Takes 60 seconds. Every answer helps us set you up for success.
          </p>
          
          <button onClick={handleStartQuestionnaire} style={styles.startButton}>
            Build My Store →
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
      <div style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={styles.progressSection}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <p style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <div style={styles.questionSection}>
          <h2 style={styles.question}>{currentQ.question}</h2>
          <p style={styles.subtitle}>{currentQ.subtitle}</p>
          
          {/* Show selection counter for job question */}
          {currentQ.id === 'customerJobs' && (answers.customerJobs || []).length > 0 && (
            <p style={styles.selectionHelper}>
              {(answers.customerJobs || []).length} of 2 selected
              {(answers.customerJobs || []).length === 1 && ' • You can pick one more (optional)'}
            </p>
          )}
        </div>

        <div style={styles.optionsGrid}>
          {currentQ.options.map((option, index) => {
            const isSelected = currentQ.type === 'multi'
              ? (answers[currentQ.id] || []).includes(option.value)
              : answers[currentQ.id] === option.value;

            // Special styling for Question 2 (customer job)
            const isJobQuestion = currentQ.id === 'customerJobs';
            
            // Get selection order for multi-select job question
            const selectionIndex = isJobQuestion && isSelected 
              ? (answers[currentQ.id] || []).indexOf(option.value) + 1
              : null;
            
            // Extract primary color from gradient for clean border
            const getBorderColor = (gradient) => {
              if (!gradient) return '#667eea';
              // Map gradients to their primary colors
              const colorMap = {
                'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)': '#f59e0b', // Orange
                'linear-gradient(135deg, #ec4899 0%, #db2777 100%)': '#ec4899', // Pink
                'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)': '#8b5cf6', // Purple
                'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)': '#3b82f6', // Blue
                'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)': '#f59e0b', // Gold
                'linear-gradient(135deg, #10b981 0%, #059669 100%)': '#10b981', // Green
              };
              return colorMap[gradient] || '#667eea';
            };

            return (
              <button
                key={option.value}
                onMouseEnter={() => setHoveredCard(option.value)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => {
                  if (currentQ.type === 'multi') {
                    handleToggleMulti(currentQ.id, option.value);
                  } else {
                    handleSelectSingle(currentQ.id, option.value);
                  }
                }}
                style={{
                  ...styles.optionCard,
                  ...(isJobQuestion && styles.jobCard),
                  // Clean selection style for job question - solid color border
                  ...(isJobQuestion && {
                    borderColor: isSelected ? getBorderColor(option.gradient) : 'rgba(0, 0, 0, 0.08)',
                    borderWidth: isSelected ? '3px' : '2px',
                    background: 'white',
                  }),
                  // Default selection style for other questions
                  ...(!isJobQuestion && {
                    borderColor: isSelected ? '#667eea' : 'rgba(0, 0, 0, 0.08)',
                    background: isSelected ? 'rgba(102, 126, 234, 0.04)' : 'white',
                  }),
                  // Hover animation (desktop only)
                  ...(hoveredCard === option.value && {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: isJobQuestion 
                      ? `0 12px 24px ${getBorderColor(option.gradient)}20, 0 0 0 1px ${getBorderColor(option.gradient)}30`
                      : '0 12px 24px rgba(102, 126, 234, 0.15)',
                  }),
                  // Active/click animation
                  ...(hoveredCard === option.value && {
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }),
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Selection order badge for job question */}
                {isJobQuestion && selectionIndex && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '6px 14px',
                    borderRadius: '980px',
                    background: 'white',
                    border: `2px solid ${getBorderColor(option.gradient)}`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: getBorderColor(option.gradient),
                      letterSpacing: '0.5px',
                    }}>
                      {selectionIndex === 1 ? 'PRIMARY' : 'SECONDARY'}
                    </span>
                  </div>
                )}

                <div style={{
                  ...styles.iconCircle,
                  // Job question: gradient icon circle when selected
                  ...(isJobQuestion && isSelected && {
                    background: option.gradient,
                    color: 'white',
                  }),
                  // Job question: gray when not selected
                  ...(isJobQuestion && !isSelected && {
                    background: '#f5f5f7',
                    color: '#86868b',
                  }),
                  // Other questions: standard styling
                  ...(!isJobQuestion && {
                    background: isSelected 
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : '#f5f5f7',
                    color: isSelected ? 'white' : '#667eea',
                  }),
                }}
                  dangerouslySetInnerHTML={{ __html: option.svg }}
                />
                
                <div style={styles.optionContent}>
                  <div style={{
                    ...styles.optionLabel,
                    color: '#1d1d1f', // Always dark text
                  }}>
                    {option.label}
                  </div>
                  
                  {/* Show customer thinking for job question */}
                  {isJobQuestion && option.customerThinking && (
                    <div style={{
                      ...styles.customerThinking,
                      color: isSelected ? '#4b5563' : '#6b7280', // Darker when selected
                    }}>
                      {option.customerThinking}
                    </div>
                  )}
                  
                  <div style={{
                    ...styles.optionSubtext,
                    color: '#86868b', // Always gray
                  }}>
                    {isJobQuestion ? `Examples: ${option.examples}` : option.subtext}
                  </div>
                  
                  {/* Show template name for job question */}
                  {isJobQuestion && option.template && (
                    <div style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '980px',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginTop: '4px',
                      letterSpacing: '0.3px',
                      background: isSelected ? `${getBorderColor(option.gradient)}15` : 'rgba(0,0,0,0.05)',
                      color: isSelected ? getBorderColor(option.gradient) : '#667eea',
                      border: isSelected ? `1px solid ${getBorderColor(option.gradient)}30` : 'none',
                    }}>
                      Template: {option.template}
                    </div>
                  )}
                </div>

                {isSelected && !isJobQuestion && (
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
              {currentQuestion === questions.length - 1 ? "Start Growing My Business →" : 'Continue →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  introContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: '#f5f5f7',
    position: 'relative',
    overflow: 'hidden',
  },

  introCard: {
    maxWidth: '600px',
    width: '100%',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    padding: 'clamp(40px, 8vw, 64px) clamp(32px, 6vw, 48px)',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
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
    padding: '18px 48px',
    fontSize: '17px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '980px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
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

  container: {
    minHeight: '100vh',
    padding: '40px 20px 64px',
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
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 75%, #f5576c 100%)',
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

  selectionHelper: {
    fontSize: '14px',
    color: '#667eea',
    marginTop: '12px',
    fontWeight: 500,
  },

  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '48px',
  },

  optionCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '24px',
    border: '2px solid',
    borderRadius: '20px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    transform: 'scale(1)',
  },

  jobCard: {
    padding: '28px',
  },

  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
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
    marginBottom: '8px',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },

  customerThinking: {
    fontSize: '15px',
    fontStyle: 'italic',
    marginBottom: '10px',
    lineHeight: 1.5,
    fontWeight: 500,
  },

  optionSubtext: {
    fontSize: '14px',
    lineHeight: 1.5,
    marginBottom: '12px',
  },

  templateBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: 600,
    marginTop: '4px',
    letterSpacing: '0.3px',
  },

  selectedCheck: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '24px',
    height: '24px',
    color: '#667eea',
  },

  selectionBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '6px 12px',
    borderRadius: '980px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },

  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '16px',
  },

  backButton: {
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: 500,
    border: 'none',
    background: 'transparent',
    color: '#86868b',
    cursor: 'pointer',
    borderRadius: '980px',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },

  continueButton: {
    padding: '16px 40px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '980px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
    marginLeft: 'auto',
  },
};
