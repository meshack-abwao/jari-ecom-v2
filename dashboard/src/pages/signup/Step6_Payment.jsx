import { useState } from 'react';
import { authAPI } from '../../api/client';

export default function Step6_Payment({ data, updateData, nextStep, prevStep }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // Calculate total (will be used for M-Pesa in real implementation)
  const calculateTotal = () => {
    const basePlan = 1200;
    const addonPrices = {
      mpesa_stk: 300,
      whatsapp_auto: 80,
      advanced_analytics: 200,
      priority_support: 500,
    };

    const addonsTotal = (data.selectedAddons || []).reduce((sum, addonId) => {
      return sum + (addonPrices[addonId] || 0);
    }, 0);

    return basePlan + addonsTotal;
  };

  const handleCompleteSignup = async () => {
    setLoading(true);
    setError('');

    try {
      // Call complete signup endpoint
      const response = await authAPI.post('/auth/signup/complete', {
        businessType: data.businessType,
        storeName: data.storeName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        selectedAddons: data.selectedAddons,
        verificationTier: data.verificationTier,
      });

      // Save response data
      updateData({
        token: response.data.token,
        storeId: response.data.store.id,
        slug: response.data.store.slug,
        storeUrl: response.data.store.storeUrl,
        dashboardUrl: response.data.store.dashboardUrl,
      });

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);

      // Move to success step
      nextStep();
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await authAPI.post('/otp/send', { phone: data.phone });
      setOtpSent(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  const verifyAndComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Verify OTP
      await authAPI.post('/otp/verify', { phone: data.phone, otp });

      // OTP verified, complete signup
      await handleCompleteSignup();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={prevStep} style={styles.backButton} disabled={loading}>
          ← Back
        </button>

        <h2 style={styles.heading}>Almost There!</h2>
        <p style={styles.subheading}>Verify your phone to complete setup</p>

        <div style={styles.card}>
          {/* Summary */}
          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>Your Plan Summary</h3>
            
            <div style={styles.summaryRow}>
              <span>Base Platform</span>
              <span>KES 1,200</span>
            </div>

            {data.selectedAddons?.map((addonId) => {
              const prices = {
                mpesa_stk: 300,
                whatsapp_auto: 80,
                advanced_analytics: 200,
                priority_support: 500,
              };
              const names = {
                mpesa_stk: 'M-Pesa STK Push',
                whatsapp_auto: 'WhatsApp Auto-Reply',
                advanced_analytics: 'Advanced Analytics',
                priority_support: 'Priority Support',
              };

              return (
                <div key={addonId} style={styles.summaryRow}>
                  <span>{names[addonId]}</span>
                  <span>KES {prices[addonId]}</span>
                </div>
              );
            })}

            <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
              <span>Monthly Total</span>
              <span>KES {calculateTotal()}</span>
            </div>
          </div>

          {/* OTP Verification */}
          {!otpSent ? (
            <div style={styles.otpSection}>
              <p style={styles.otpText}>
                We'll send a verification code to <strong>{data.phone}</strong>
              </p>
              <button onClick={sendOTP} disabled={loading} style={styles.sendOtpButton}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          ) : (
            <div style={styles.otpSection}>
              <p style={styles.otpText}>
                Enter the 6-digit code sent to {data.phone}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength="6"
                style={styles.otpInput}
                disabled={loading}
              />
              <div style={styles.otpActions}>
                <button onClick={verifyAndComplete} disabled={loading || otp.length !== 6} style={styles.verifyButton}>
                  {loading ? 'Verifying...' : 'Verify & Complete Setup'}
                </button>
                <button onClick={() => setOtpSent(false)} style={styles.resendButton} disabled={loading}>
                  Resend Code
                </button>
              </div>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          {/* Note about payment */}
          <div style={styles.paymentNote}>
            <p style={styles.noteText}>
              💳 <strong>Payment will be collected after 7-day free trial</strong>
            </p>
            <p style={styles.noteSubtext}>
              No charges today. Cancel anytime during trial period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  
  content: {
    width: '100%',
    maxWidth: '600px',
  },
  
  backButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  
  subheading: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '2rem',
  },
  
  summary: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  
  summaryTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: '#4b5563',
    marginBottom: '0.75rem',
  },
  
  totalRow: {
    borderTop: '2px solid #e5e7eb',
    paddingTop: '0.75rem',
    marginTop: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  
  otpSection: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  
  otpText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  
  sendOtpButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  
  otpInput: {
    width: '100%',
    maxWidth: '200px',
    padding: '1rem',
    fontSize: '1.5rem',
    textAlign: 'center',
    letterSpacing: '0.5rem',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  
  otpActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  
  verifyButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  
  resendButton: {
    background: 'none',
    color: '#3b82f6',
    border: 'none',
    padding: '0.5rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  
  paymentNote: {
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid #bfdbfe',
  },
  
  noteText: {
    fontSize: '0.875rem',
    color: '#1e40af',
    marginBottom: '0.25rem',
  },
  
  noteSubtext: {
    fontSize: '0.75rem',
    color: '#3b82f6',
  },
};
