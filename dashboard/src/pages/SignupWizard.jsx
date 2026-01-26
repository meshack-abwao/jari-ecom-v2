import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1_BusinessType from './signup/Step1_BusinessType';
import Step2_TemplatePreview from './signup/Step2_TemplatePreview';
import Step3_BasicInfo from './signup/Step3_BasicInfo';
import Step4_PlanSelector from './signup/Step4_PlanSelector';
import Step5_Payment from './signup/Step5_Payment';
import Step6_Success from './signup/Step6_Success';
import { BRAND } from '../constants/brand';

// ========================================
// SIGNUP WIZARD - Premium Apple-Inspired Design
// Following Why Fonts Matter + Grid Principles
// ========================================

const TOTAL_STEPS = 6;

export default function SignupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [signupData, setSignupData] = useState({
    businessType: '',
    defaultTemplate: '',
    smartAddons: [],
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    selectedAddons: [],
    verificationTier: 'BASIC', // Default, can upgrade in dashboard later
    token: '',
    storeId: '',
    slug: '',
    storeUrl: '',
    dashboardUrl: ''
  });
  
  const navigate = useNavigate();

  // Scroll to top smoothly whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const updateData = (newData) => setSignupData(prev => ({ ...prev, ...newData }));
  const goToDashboard = () => navigate('/');

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Dynamic titles based on step - JTBD focused messaging
  const getTitles = () => {
    switch (currentStep) {
      case 1: return null; // Step 1 has its own header
      case 2: return null; // Template preview auto-skips
      case 3: return { 
        title: "Let's set up your store", 
        subtitle: "Quick and easy—takes less than 2 minutes" 
      };
      case 4: return { 
        title: "Choose what works for you", 
        subtitle: "Start with the essentials, add more as you grow" 
      };
      case 5: return { 
        title: "Almost there", 
        subtitle: "Complete your setup and start selling" 
      };
      case 6: return null; // Success has its own layout
      default: return { title: "", subtitle: "" };
    }
  };

  const titles = getTitles();

  return (
    <div style={styles.container}>
      {/* Glassmorphic sticky header - matching landing page */}
      {currentStep > 1 && currentStep < TOTAL_STEPS && (
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <a href="https://jarisolutionsecom.store" style={styles.logoLink}>
              <img src={BRAND.LOGO_URL} alt="Jari" style={styles.logoImg} />
              <div style={styles.logoSeparator}></div>
              <span style={styles.logoText}>Jari<span style={styles.logoAccent}>.Ecom</span></span>
            </a>
            
            <div style={styles.headerRight}>
              <span style={styles.stepIndicator}>Step {currentStep} of {TOTAL_STEPS}</span>
              <a href="/login" style={styles.signInLink}>Already have an account?</a>
            </div>
          </div>
          
          {/* Gradient progress bar */}
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }} />
          </div>
        </header>
      )}

      {/* Main content with slide animation */}
      <main style={{
        ...styles.main,
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'translateY(24px)' : 'translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Contextual title section */}
        {titles && (
          <div style={styles.titleSection}>
            <h1 style={styles.mainTitle}>{titles.title}</h1>
            <p style={styles.mainSubtitle}>{titles.subtitle}</p>
          </div>
        )}

        {/* Step 1: Business Type Selection */}
        {currentStep === 1 && (
          <Step1_BusinessType 
            data={signupData} 
            updateData={updateData} 
            nextStep={nextStep} 
          />
        )}
        
        {/* Step 2: Template Preview (auto-skips) */}
        {currentStep === 2 && (
          <Step2_TemplatePreview 
            data={signupData} 
            nextStep={nextStep} 
          />
        )}
        
        {/* Step 3: Basic Info (Name, Email, Phone, Password) */}
        {currentStep === 3 && (
          <Step3_BasicInfo 
            data={signupData} 
            updateData={updateData} 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        )}
        
        {/* Step 4: Plan & Add-ons Selection */}
        {currentStep === 4 && (
          <Step4_PlanSelector 
            data={signupData} 
            updateData={updateData} 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        )}
        
        {/* Step 5: Payment (Setup Fee) */}
        {currentStep === 5 && (
          <Step5_Payment 
            data={signupData} 
            updateData={updateData} 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        )}
        
        {/* Step 6: Success */}
        {currentStep === 6 && (
          <Step6_Success 
            data={signupData} 
            goToDashboard={goToDashboard} 
          />
        )}
      </main>
    </div>
  );
}

// ========================================
// STYLES - Premium Design System
// Based on Why Fonts Matter + Grid Principles
// ========================================
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },

  // Glassmorphic header - matches landing page
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  },

  headerContent: {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },

  logoImg: {
    height: '36px',
    width: 'auto',
  },

  logoSeparator: {
    width: '1px',
    height: '24px',
    background: 'rgba(0, 0, 0, 0.1)',
  },

  logoText: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },

  logoAccent: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },

  stepIndicator: {
    fontSize: '13px',
    color: '#86868b',
    fontWeight: 500,
    letterSpacing: '0.01em',
  },

  signInLink: {
    fontSize: '14px',
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },

  // Gradient progress bar
  progressBar: {
    height: '3px',
    background: 'rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Main content
  main: {
    width: '100%',
    paddingBottom: '64px',
  },

  // Title section - Premium typography
  titleSection: {
    textAlign: 'center',
    padding: '64px 24px 48px',
    maxWidth: '680px',
    margin: '0 auto',
  },

  mainTitle: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '16px',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },

  mainSubtitle: {
    fontSize: 'clamp(16px, 2.5vw, 19px)',
    color: '#86868b',
    margin: 0,
    lineHeight: 1.5,
    fontWeight: 400,
  },
};
