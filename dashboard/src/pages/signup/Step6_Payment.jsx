import { useState, useEffect } from 'react';
import { authAPI } from '../../api/client';

export default function Step6_Payment({ data, updateData, nextStep, prevStep }) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Auto-bypass payment for now since Africa's Talking and M-Pesa not configured
  useEffect(() => {
    // Show brief message then auto-create account
    const timer = setTimeout(() => {
      handleSkipPayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSkipPayment = async () => {
    setCreating(true);
    setError('');

    try {
      // Create account without payment verification
      const response = await authAPI.post('/auth/signup/complete', {
        storeName: data.storeName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        businessType: data.businessType,
        verificationTier: data.verificationTier,
        selectedAddons: data.selectedAddons,
      });

      const { token, store } = response.data;

      // Store auth token
      localStorage.setItem('token', token);

      // Update signup data with response
      updateData({
        token,
        storeId: store.id,
        slug: store.slug,
        storeUrl: `https://jarisolutionsecom.store/?store=${store.slug}`,
        dashboardUrl: 'https://dashboard.jarisolutionsecom.store',
      });

      // Move to success step
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
        {/* Info Banner */}
        <div style={styles.infoBanner}>
          <div style={styles.infoIcon}>ℹ️</div>
          <div style={styles.infoContent}>
            <h4 style={styles.infoTitle}>Payment Setup Coming Soon</h4>
            <p style={styles.infoText}>
              M-Pesa and SMS verification will be configured shortly. 
              For now, you can create your store and start setting up products.
            </p>
          </div>
        </div>

        {/* Creating Account State */}
        {creating && (
          <div style={styles.loadingSection}>
            <div style={styles.spinner}></div>
            <h3 style={styles.loadingTitle}>Creating Your Store...</h3>
            <p style={styles.loadingText}>
              Setting up your dashboard, templates, and M-Pesa integration
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.errorBanner}>
            <p style={styles.errorText}>{error}</p>
            <button onClick={handleSkipPayment} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {/* Summary (before creating) */}
        {!creating && !error && (
          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>Your Store Summary</h3>
            
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Store Name</span>
                <span style={styles.summaryValue}>{data.storeName}</span>
              </div>
              
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Business Type</span>
                <span style={styles.summaryValue}>
                  {data.businessType?.charAt(0).toUpperCase() + data.businessType?.slice(1)}
                </span>
              </div>
              
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Verification Level</span>
                <span style={styles.summaryValue}>{data.verificationTier}</span>
              </div>
              
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Add-ons</span>
                <span style={styles.summaryValue}>
                  {data.selectedAddons?.length || 0} selected
                </span>
              </div>
            </div>

            <p style={styles.autoMessage}>
              Creating your account automatically...
            </p>
          </div>
        )}

        {/* Back Button */}
        {!creating && (
          <button onClick={prevStep} style={styles.backButton}>
            ← Back to Verification
          </button>
        )}
      </div>

      {/* CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },

  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },

  infoBanner: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    background: '#eff6ff',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    marginBottom: '32px',
  },

  infoIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d4ed8',
    marginBottom: '6px',
    margin: 0,
  },

  infoText: {
    fontSize: '14px',
    color: '#1e40af',
    lineHeight: 1.5,
    margin: 0,
  },

  loadingSection: {
    textAlign: 'center',
    padding: '40px 20px',
  },

  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    margin: '0 auto 24px',
    animation: 'spin 0.8s linear infinite',
  },

  loadingTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px',
  },

  loadingText: {
    fontSize: '14px',
    color: '#86868b',
    margin: 0,
  },

  errorBanner: {
    padding: '16px',
    background: '#fef2f2',
    border: '2px solid #ef4444',
    borderRadius: '12px',
    marginBottom: '24px',
  },

  errorText: {
    fontSize: '14px',
    color: '#dc2626',
    marginBottom: '12px',
  },

  retryButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    background: '#ef4444',
    color: 'white',
    cursor: 'pointer',
  },

  summary: {
    marginBottom: '24px',
  },

  summaryTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '20px',
  },

  summaryGrid: {
    display: 'grid',
    gap: '16px',
    marginBottom: '24px',
  },

  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#f9fafb',
    borderRadius: '10px',
  },

  summaryLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500,
  },

  summaryValue: {
    fontSize: '14px',
    color: '#1d1d1f',
    fontWeight: 600,
  },

  autoMessage: {
    fontSize: '13px',
    color: '#86868b',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  backButton: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 500,
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: 'white',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },
};
