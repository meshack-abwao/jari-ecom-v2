import { useState } from 'react';

export default function Step1_BusinessType({ data, updateData, nextStep }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    mainJob: null,          // What job are they hiring our platform to do?
    sellingWhat: null,      // What are they selling?
    biggestPain: null,      // What's their biggest pain point?
    idealOutcome: null,     // What does success look like?
  });

  // JTBD/ODI-Aligned Questions
  const questions = [
    {
      id: 'mainJob',
      question: "What's the #1 thing slowing down your sales right now?",
      subtitle: "Be honest—we've heard it all 😊",
      options: [
        {
          value: 'customer_questions',
          label: "Answering the same questions over and over",
          subtext: "'What colors?', 'Is it available?', 'How much?'",
          icon: '💬',
        },
        {
          value: 'payment_chaos',
          label: "Chasing payments and confirming orders",
          subtext: "Lost M-Pesa codes, screenshot confusion",
          icon: '💸',
        },
        {
          value: 'no_showcase',
          label: "Can't show my products properly",
          subtext: "WhatsApp compresses photos, stories disappear",
          icon: '📸',
        },
        {
          value: 'booking_mess',
          label: "Scheduling appointments is a nightmare",
          subtext: "Double bookings, no-shows, phone tag",
          icon: '📅',
        },
        {
          value: 'looking_unprofessional',
          label: "My business looks too casual/amateur",
          subtext: "Need to compete with bigger brands",
          icon: '✨',
        },
      ],
    },
    {
      id: 'sellingWhat',
      question: "What are you selling?",
      subtitle: "This helps us set up the right template for you",
      options: [
        {
          value: 'food',
          label: "Food & Drinks",
          subtext: "Restaurant, cafe, catering, food delivery",
          icon: '🍽️',
        },
        {
          value: 'services',
          label: "Services & Appointments",
          subtext: "Photography, salon, consulting, training",
          icon: '📸',
        },
        {
          value: 'products',
          label: "Physical Products",
          subtext: "Fashion, electronics, beauty, merchandise",
          icon: '🛍️',
        },
        {
          value: 'premium',
          label: "High-End Products",
          subtext: "Jewelry, luxury goods, custom items",
          icon: '💎',
        },
        {
          value: 'events',
          label: "Events & Tickets",
          subtext: "Workshops, concerts, conferences",
          icon: '🎫',
        },
      ],
    },
    {
      id: 'biggestPain',
      question: "Which one would make your life SO much easier?",
      subtitle: "Pick your biggest wish",
      options: [
        {
          value: 'auto_orders',
          label: "Customers order without asking questions",
          subtext: "They see the menu/catalog, pick, pay, done",
          icon: '🎯',
        },
        {
          value: 'auto_booking',
          label: "Customers book themselves",
          subtext: "They pick a time, confirm, I just show up",
          icon: '✅',
        },
        {
          value: 'look_professional',
          label: "Look as professional as big brands",
          subtext: "Not just screenshots and WhatsApp status",
          icon: '🏆',
        },
        {
          value: 'payment_tracking',
          label: "Automatically track who paid",
          subtext: "No more 'Did you send?', 'Check your phone'",
          icon: '💰',
        },
        {
          value: 'showcase_products',
          label: "Show products in their best light",
          subtext: "High-quality photos, all details visible",
          icon: '🌟',
        },
      ],
    },
    {
      id: 'idealOutcome',
      question: "What does success look like for you?",
      subtitle: "Dream big—we're here to help you get there",
      options: [
        {
          value: 'save_time',
          label: "Save 5+ hours per week",
          subtext: "Less customer service, more business growth",
          icon: '⏰',
        },
        {
          value: 'increase_sales',
          label: "Double my sales in 3 months",
          subtext: "More customers, bigger orders, repeat buyers",
          icon: '📈',
        },
        {
          value: 'scale_up',
          label: "Hire staff and scale my business",
          subtext: "Systems that work without me",
          icon: '🚀',
        },
        {
          value: 'look_legit',
          label: "Be taken seriously as a business",
          subtext: "Professional presence, trust signals",
          icon: '💼',
        },
        {
          value: 'less_stress',
          label: "Run my business without burning out",
          subtext: "Enjoy it again, not just survive",
          icon: '😌',
        },
      ],
    },
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    // Auto-advance after brief pause (visual feedback)
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // All questions answered - determine business type and advance
        processAnswersAndContinue(newAnswers);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const processAnswersAndContinue = (finalAnswers) => {
    // Map sellingWhat to template
    const templateMap = {
      food: 'vm',
      services: 'pbk',
      products: 'qd',
      premium: 'dd',
      events: 'events',
    };

    // Map to smart add-ons based on pain points
    const addonMap = {
      food: ['mpesa_stk', 'whatsapp_auto'],
      services: ['mpesa_stk'],
      products: ['mpesa_stk', 'whatsapp_auto'],
      premium: ['mpesa_stk', 'priority_support'],
      events: ['mpesa_stk', 'whatsapp_auto'],
    };

    updateData({
      businessType: finalAnswers.sellingWhat,
      defaultTemplate: templateMap[finalAnswers.sellingWhat],
      smartAddons: addonMap[finalAnswers.sellingWhat],
      jtbdAnswers: finalAnswers, // Store for later personalization
    });

    // Small delay then advance
    setTimeout(() => {
      nextStep();
    }, 500);
  };

  return (
    <div style={styles.container}>
      {/* Progress indicator */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${progress}%`,
          }} />
        </div>
        <p style={styles.progressText}>
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div style={styles.questionSection}>
        <h1 style={styles.question}>{currentQ.question}</h1>
        <p style={styles.subtitle}>{currentQ.subtitle}</p>
      </div>

      {/* Options */}
      <div style={styles.optionsContainer}>
        {currentQ.options.map((option) => {
          const isSelected = answers[currentQ.id] === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              style={{
                ...styles.optionButton,
                background: isSelected ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                color: isSelected ? 'white' : '#1d1d1f',
                transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                boxShadow: isSelected 
                  ? '0 8px 24px rgba(102, 126, 234, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div style={styles.optionIcon}>{option.icon}</div>
              <div style={styles.optionContent}>
                <div style={{
                  ...styles.optionLabel,
                  color: isSelected ? 'white' : '#1d1d1f',
                }}>
                  {option.label}
                </div>
                <div style={{
                  ...styles.optionSubtext,
                  color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#86868b',
                }}>
                  {option.subtext}
                </div>
              </div>
              {isSelected && (
                <div style={styles.checkmark}>✓</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Back button */}
      {currentQuestion > 0 && (
        <button onClick={handleBack} style={styles.backButton}>
          ← Back
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  progressContainer: {
    marginBottom: '48px',
  },

  progressBar: {
    height: '4px',
    background: 'rgba(0, 0, 0, 0.08)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '12px',
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    borderRadius: '2px',
  },

  progressText: {
    fontSize: '13px',
    color: '#86868b',
    fontWeight: 500,
    margin: 0,
  },

  questionSection: {
    marginBottom: '40px',
    textAlign: 'center',
  },

  question: {
    fontSize: 'clamp(24px, 5vw, 36px)',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '12px',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: 'clamp(15px, 3vw, 18px)',
    color: '#86868b',
    margin: 0,
    lineHeight: 1.4,
  },

  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px',
  },

  optionButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    position: 'relative',
  },

  optionIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },

  optionContent: {
    flex: 1,
    minWidth: 0,
  },

  optionLabel: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '4px',
    letterSpacing: '-0.01em',
  },

  optionSubtext: {
    fontSize: '14px',
    lineHeight: 1.4,
  },

  checkmark: {
    fontSize: '20px',
    fontWeight: 'bold',
    flexShrink: 0,
  },

  backButton: {
    alignSelf: 'flex-start',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 500,
    border: 'none',
    background: 'transparent',
    color: '#86868b',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },
};
