import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND } from '../constants/brand';
import Step1_BusinessType from './signup/Step1_BusinessType';
import Step2_TemplatePreview from './signup/Step2_TemplatePreview';
import Step3_BasicInfo from './signup/Step3_BasicInfo';
import Step4_PlanSelector from './signup/Step4_PlanSelector';
import Step5_VerificationTier from './signup/Step5_VerificationTier';
import Step6_Payment from './signup/Step6_Payment';
import Step7_Success from './signup/Step7_Success';

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
    navigate('/dashboard');
  };

  // Progress indicator
  const progress = (currentStep / 7) * 100;

  return (
    <div style={styles.container}>
      {/* Header with progress */}
      <div style={styles.header}>
        <img src={BRAND.LOGO_URL} alt="Jari" style={styles.logo} />
        <h1 style={styles.title}>
          {currentStep === 7 ? '🎉 Welcome to Jari!' : 'Create Your Store'}
        </h1>
        
        {currentStep < 7 && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <p style={styles.progressText}>Step {currentStep} of 7</p>
          </div>
        )}
      </div>

      {/* Step content */}
      <div style={styles.content}>
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

      {/* Footer - only show on steps 1-6 */}
      {currentStep < 7 && (
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account? <a href="/login" style={styles.link}>Sign in</a>
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
  },
  
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    maxWidth: '600px',
    width: '100%',
  },
  
  logo: {
    height: '48px',
    marginBottom: '1rem',
  },
  
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1rem',
  },
  
  progressContainer: {
    marginTop: '1.5rem',
  },
  
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    transition: 'width 0.3s ease',
    borderRadius: '4px',
  },
  
  progressText: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  content: {
    width: '100%',
    maxWidth: '800px',
    marginBottom: '2rem',
  },
  
  footer: {
    textAlign: 'center',
    marginTop: 'auto',
  },
  
  footerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.875rem',
  },
  
  link: {
    color: 'white',
    fontWeight: '600',
    textDecoration: 'underline',
  },
};
