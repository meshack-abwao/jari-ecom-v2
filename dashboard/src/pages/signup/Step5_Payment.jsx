import { useState, useEffect } from 'react';
import { authAPI } from '../../api/client';

// ========================================
// STEP 5: PAYMENT / ACCOUNT CREATION
// Premium Apple-Inspired Design
// ========================================

export default function Step5_Payment({ data, updateData, nextStep, prevStep }) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Auto-create account (payment integration coming later)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCreateAccount();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateAccount = async () => {
    setCreating(true);
    setError('');

    try {
      const response = await authAPI.post('/auth/signup/complete', {
        storeName: data.storeName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        businessType: data.businessType,
        verificationTier: data.verificationTier || 'BASIC',
        selectedAddons: data.selectedAddons || [],
      });

      const { token, store } = response.data;
      localStorage.setItem('token', token);

      updateData({
        token,
        storeId: store.id,
        slug: store.slug,
        storeUrl: `https://jarisolutionsecom.store/?store=${store.slug}`,
        dashboardUrl: 'https://dashboard.jarisolutionsecom.store',
      });

      nextStep();
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
      setCreating(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Creating State */}
        {creating && !error && (
          <div style={styles.loadingSection}>
            <div style={styles.spinnerContainer}>
              <svg style={styles.spinner} viewBox="0 0 50 50">
                <circle style={styles.spinnerPath} cx="25" cy="25" r="20" fill="none" strokeWidth="4"/>
              </svg>
            </div>
            <h3 style={styles.loadingTitle}>Creating your store</h3>
            <p style={styles.loadingText}>Setting up your dashboard, templates, and payment integration...</p>
            
            <div style={styles.progressSteps}>
              <div style={styles.progressStep}>
                <svg style={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>Account created</span>
              </div>
              <div style={styles.progressStep}>
                <svg style={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>Dashboard ready</span>
              </div>
              <div style={{...styles.progressStep, ...styles.progressStepActive}}>
                <div style={styles.stepDot}></div>
                <span>Configuring templates...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.errorSection}>
            <div style={styles.errorIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3 style={styles.errorTitle}>Something went wrong</h3>
            <p style={styles.errorText}>{error}</p>
            <button onClick={handleCreateAccount} style={styles.retryButton}>
              Try again
            </button>
          </div>
        )}

        {/* Summary (before creating) */}
        {!creating && !error && (
          <div style={styles.summarySection}>
            <div style={styles.summaryIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 style={styles.summaryTitle}>Ready to launch</h3>
            
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Store</span>
                <span style={styles.summaryValue}>{data.storeName}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Type</span>
                <span style={styles.summaryValue}>
                  {data.businessType?.charAt(0).toUpperCase() + data.businessType?.slice(1)}
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Owner</span>
                <span style={styles.summaryValue}>{data.ownerName}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Email</span>
                <span style={styles.summaryValue}>{data.email}</span>
              </div>
            </div>

            <p style={styles.autoMessage}>Creating your store automatically...</p>
          </div>
        )}

        {/* Back Button (only when not creating) */}
        {!creating && (
          <button onClick={prevStep} style={styles.backButton}>
            <svg style={styles.backIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to plan selection
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '0 24px',
  },

  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '48px 40px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
  },

  // Loading State
  loadingSection: {
    textAlign: 'center',
    padding: '20px 0',
  },

  spinnerContainer: {
    width: '64px',
    height: '64px',
    margin: '0 auto 32px',
  },

  spinner: {
    width: '100%',
    height: '100%',
    animation: 'spin 1s linear infinite',
  },

  spinnerPath: {
    stroke: '#667eea',
    strokeLinecap: 'round',
    animation: 'dash 1.5s ease-in-out infinite',
  },

  loadingTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },

  loadingText: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '32px',
    lineHeight: 1.5,
  },

  progressSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '280px',
    margin: '0 auto',
  },

  progressStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#34c759',
    fontWeight: 500,
  },

  progressStepActive: {
    color: '#667eea',
    animation: 'pulse 1.5s ease-in-out infinite',
  },

  checkIcon: {
    width: '20px',
    height: '20px',
  },

  stepDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },

  // Error State
  errorSection: {
    textAlign: 'center',
    padding: '20px 0',
  },

  errorIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 24px',
    color: '#ef4444',
  },

  errorTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px',
  },

  errorText: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '24px',
    lineHeight: 1.5,
  },

  retryButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '980px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },

  // Summary State
  summarySection: {
    textAlign: 'center',
  },

  summaryIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 24px',
    color: '#667eea',
  },

  summaryTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '32px',
    letterSpacing: '-0.02em',
  },

  summaryGrid: {
    display: 'grid',
    gap: '12px',
    marginBottom: '32px',
  },

  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#f5f5f7',
    borderRadius: '12px',
  },

  summaryLabel: {
    fontSize: '14px',
    color: '#86868b',
    fontWeight: 500,
  },

  summaryValue: {
    fontSize: '14px',
    color: '#1d1d1f',
    fontWeight: 600,
  },

  autoMessage: {
    fontSize: '14px',
    color: '#86868b',
    fontStyle: 'italic',
  },

  // Back Button
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    marginTop: '24px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 500,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    background: 'transparent',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  },

  backIcon: {
    width: '18px',
    height: '18px',
  },
};
