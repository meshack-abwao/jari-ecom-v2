import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1_BusinessType from './signup/Step1_BusinessType';
import Step2_TemplatePreview from './signup/Step2_TemplatePreview';
import Step3_BasicInfo from './signup/Step3_BasicInfo';
import Step4_PlanSelector from './signup/Step4_PlanSelector';
import Step5_VerificationTier from './signup/Step5_VerificationTier';
import Step6_Payment from './signup/Step6_Payment';
import Step7_Success from './signup/Step7_Success';
import { BRAND } from '../constants/brand';

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
    verificationTier: 'BASIC',
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
    
    // Trigger transition animation
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const updateData = (newData) => setSignupData(prev => ({ ...prev, ...newData }));
  const goToDashboard = () => navigate('/');

  const progress = (currentStep / 7) * 100;

  // Dynamic titles based on step
  const getTitles = () => {
    switch (currentStep) {
      case 1: return null; // No title for Step 1 (JTBD has its own header)
      case 2: return null; // Auto-skips
      case 3: return { title: "Let's create your account", subtitle: "Quick and easy—takes less than 2 minutes" };
      case 4: return { title: "Choose your plan", subtitle: "Start free, upgrade anytime" };
      case 5: return { title: "Build customer trust", subtitle: "Higher trust = more sales" };
      case 6: return { title: "Complete your setup", subtitle: "Activate M-Pesa payments and start selling" };
      case 7: return null; // Success has its own layout
      default: return { title: "", subtitle: "" };
    }
  };

  const titles = getTitles();

  return (
    <div style={styles.container}>
      {/* Minimal sticky header - Only for steps 2-7 */}
      {currentStep > 1 && currentStep < 7 && (
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <a href="https://jarisolutionsecom.store" style={styles.logoLink}>
              <img src={BRAND.LOGO_URL} alt="Jari" style={styles.logo} />
            </a>
            
            <div style={styles.headerRight}>
              <span style={styles.stepText}>Step {currentStep} of 7</span>
              <a href="/login" style={styles.loginLink}>Sign in</a>
            </div>
          </div>
          
          {/* Thin progress bar */}
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }} />
          </div>
        </header>
      )}

      {/* Main content - No nested containers */}
      <main style={{
        ...styles.main,
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Contextual title (for steps 3-6) */}
        {titles && (
          <div style={styles.titleSection}>
            <h1 style={styles.mainTitle}>{titles.title}</h1>
            <p style={styles.mainSubtitle}>{titles.subtitle}</p>
          </div>
        )}

        {/* Step content - Direct rendering, no wrapper */}
        {currentStep === 1 && (
          <Step1_BusinessType 
            data={signupData} 
            updateData={updateData} 
            nextStep={nextStep} 
          />
        )}
        
        {currentStep === 2 && (
          <Step2_TemplatePreview 
            data={signupData} 
            nextStep={nextStep} 
          />
        )}
        
        {currentStep === 3 && (
          <Step3_BasicInfo 
            data={signupData} 
            updateData={updateData} 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        )}
        
        {currentStep === 4 && (
          <Step4_PlanSelector 
            data={signupData} 
            updateData={updateData} 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        )}
        
        {currentStep === 5 && (
          <Step5_VerificationTier 
            data={signupData} 
            updateData={updateData} 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        )}
        
        {currentStep === 6 && (
          <Step6_Payment 
            data={signupData} 
            updateData={updateData} 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        )}
        
        {currentStep === 7 && (
          <Step7_Success 
            data={signupData} 
            goToDashboard={goToDashboard} 
          />
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f7',
  },

  // Minimal sticky header
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'saturate(180%) blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  },

  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logoLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },

  logo: {
    height: '40px',
    width: 'auto',
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },

  stepText: {
    fontSize: '13px',
    color: '#86868b',
    fontWeight: 500,
  },

  loginLink: {
    fontSize: '14px',
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 500,
  },

  // Thin gradient progress bar
  progressBar: {
    height: '3px',
    background: 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Main content area - No padding on Step 1
  main: {
    width: '100%',
    paddingTop: '0',
  },

  // Title section (Steps 3-6 only)
  titleSection: {
    textAlign: 'center',
    padding: '64px 24px 48px',
    maxWidth: '800px',
    margin: '0 auto',
  },

  mainTitle: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '12px',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },

  mainSubtitle: {
    fontSize: 'clamp(16px, 3vw, 18px)',
    color: '#86868b',
    margin: 0,
    lineHeight: 1.5,
  },
};
