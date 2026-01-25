import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1_BusinessType from './signup/Step1_BusinessType';
import Step2_TemplatePreview from './signup/Step2_TemplatePreview';
import Step3_BasicInfo from './signup/Step3_BasicInfo';
import Step4_PlanSelector from './signup/Step4_PlanSelector';
import Step5_VerificationTier from './signup/Step5_VerificationTier';
import Step6_Payment from './signup/Step6_Payment';
import Step7_Success from './signup/Step7_Success';

const LOGO_URL = 'https://res.cloudinary.com/dmfrtzgkv/image/upload/v1737283841/jari/Jari-Business-Solutions-1_r2z9ow.png';

export default function SignupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState({
    // Step 1
    businessType: '',
    defaultTemplate: '',
    smartAddons: [],
    
    // Step 3
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    
    // Step 4
    selectedAddons: [],
    
    // Step 5
    verificationTier: 'BASIC',
    nationalIdFront: null,
    nationalIdBack: null,
    businessRegDoc: null,
    kraDoc: null,
    
    // Step 6
    paymentRef: '',
    paymentStatus: 'pending',
    
    // Step 7 (Response data)
    token: '',
    storeId: '',
    slug: '',
    storeUrl: '',
    dashboardUrl: ''
  });
  
  const navigate = useNavigate();

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updateData = (newData) => {
    setSignupData(prev => ({ ...prev, ...newData }));
  };

  const goToDashboard = () => {
    navigate('/');
  };

  // Progress indicator
  const progress = (currentStep / 7) * 100;

  return (
    <div style={styles.container}>
      {/* Apple-style sticky header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <a href="https://jarisolutionsecom.store" style={styles.logoLink}>
            <img src={LOGO_URL} alt="Jari" style={styles.logoImg} />
            <div style={styles.logoSeparator}></div>
            <span style={styles.logoText}>
              Jari<span style={styles.logoAccent}>.Ecom</span>
            </span>
          </a>
          
          {currentStep < 7 && (
            <div style={styles.headerRight}>
              <span style={styles.stepIndicator}>
                Step {currentStep} of 7
              </span>
              <a href="/login" style={styles.loginLink}>
                Already have an account?
              </a>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        {currentStep < 7 && (
          <div style={styles.progressBarContainer}>
            <div style={{
              ...styles.progressBarFill,
              width: `${progress}%`
            }} />
          </div>
        )}
      </header>

      {/* Main content area */}
      <main style={styles.main}>
        {/* Title section */}
        {currentStep < 7 && (
          <div style={styles.titleSection}>
            <h1 style={styles.mainTitle}>
              {getTitleForStep(currentStep)}
            </h1>
            <p style={styles.subtitle}>
              {getSubtitleForStep(currentStep)}
            </p>
          </div>
        )}

        {/* Step content */}
        <div style={styles.stepContent}>
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
              updateData={updateData}
              nextStep={nextStep}
              prevStep={prevStep}
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
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2026 Jari Business Solutions. Built for Kenyan entrepreneurs.
        </p>
      </footer>
    </div>
  );
}

// Helper functions for dynamic titles
function getTitleForStep(step) {
  const titles = {
    1: "What are you selling?",
    2: "See your store come to life",
    3: "Let's create your account",
    4: "Choose your plan",
    5: "Build customer trust",
    6: "Complete your setup",
    7: "Welcome to Jari!"
  };
  return titles[step] || "";
}

function getSubtitleForStep(step) {
  const subtitles = {
    1: "We'll recommend the perfect template for your business",
    2: "This is how your store will look to customers",
    3: "Quick and easy - takes less than 2 minutes",
    4: "Start free, upgrade anytime. No credit card required.",
    5: "Higher trust = more sales. Upload documents to unlock better limits.",
    6: "Activate M-Pesa payments and start selling",
    7: ""
  };
  return subtitles[step] || "";
}

// Apple-inspired styling
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f5f5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
  },
  
  // Header (sticky)
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  },
  
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '12px 24px',
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
    width: '2px',
    height: '30px',
    background: '#d2d2d7',
  },
  
  logoText: {
    fontSize: '21px',
    fontWeight: 600,
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  
  logoAccent: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
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
    fontSize: '14px',
    color: '#86868b',
    fontWeight: 500,
  },
  
  loginLink: {
    fontSize: '14px',
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 400,
  },
  
  progressBarContainer: {
    height: '3px',
    background: '#e8e8ed',
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  
  // Main content
  main: {
    flex: 1,
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    padding: '48px 24px',
  },
  
  titleSection: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  
  mainTitle: {
    fontSize: '40px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '12px',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  
  subtitle: {
    fontSize: '19px',
    color: '#86868b',
    fontWeight: 400,
    lineHeight: 1.47,
    maxWidth: '600px',
    margin: '0 auto',
  },
  
  stepContent: {
    background: 'white',
    borderRadius: '18px',
    padding: '40px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  
  // Footer
  footer: {
    padding: '32px 24px',
    textAlign: 'center',
    borderTop: '1px solid #d2d2d7',
    background: 'white',
  },
  
  footerText: {
    fontSize: '12px',
    color: '#86868b',
    margin: 0,
  },
};
