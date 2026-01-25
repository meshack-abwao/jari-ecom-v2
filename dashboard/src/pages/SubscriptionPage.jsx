import { useState, useEffect } from 'react';
import { subscriptionsAPI, mpesaAPI } from '../api/client';
import { Check, X, CreditCard, Loader, Crown, Zap, Calendar, AlertCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(1);

  const PLAN_PRICE = 1200; // KES per month

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getStatus();
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    
    setProcessing(true);
    setPaymentStatus('initiating');
    
    try {
      const totalAmount = PLAN_PRICE * selectedMonths;
      
      // Initiate M-Pesa STK Push
      const response = await mpesaAPI.stkPush(
        phoneNumber,
        totalAmount,
        'subscription',
        'base',
        `Jari Base Plan (${selectedMonths} month${selectedMonths > 1 ? 's' : ''})`
      );
      
      if (!response.data.success) {
        setPaymentStatus('failed');
        alert(response.data.error || 'Failed to initiate payment');
        return;
      }
      
      setPaymentStatus('waiting');
      
      // Poll for payment status
      const result = await mpesaAPI.pollStatus(response.data.paymentId);
      
      if (result.success) {
        setPaymentStatus('success');
        await subscriptionsAPI.activate(result.mpesaRef, selectedMonths);
        
        setTimeout(() => {
          setShowPayment(false);
          setPhoneNumber('');
          setPaymentStatus(null);
          loadSubscription();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        alert(result.message || 'Payment was not completed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Demo mode activation
  const handleDemoSubscribe = async () => {
    setProcessing(true);
    try {
      const demoRef = `DEMO-${Date.now()}`;
      await subscriptionsAPI.activate(demoRef, selectedMonths);
      setPaymentStatus('success');
      setTimeout(() => {
        setShowPayment(false);
        setPhoneNumber('');
        setPaymentStatus(null);
        loadSubscription();
      }, 1500);
    } catch (error) {
      console.error('Demo activation error:', error);
      alert('Activation failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size={32} className="spin" style={{ color: 'var(--accent-color)' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading subscription...</p>
      </div>
    );
  }

  const isActive = subscription?.status === 'active';
  const isTrial = subscription?.status === 'trial';
  const isExpired = subscription?.status === 'expired';

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Subscription</h1>
          <p style={styles.subtitle}>Manage your Jari platform subscription</p>
        </div>
      </div>

      {/* Current Status Card */}
      <div className="glass-card" style={styles.statusCard}>
        <div style={styles.statusHeader}>
          <div style={{
            ...styles.statusIcon,
            background: isActive ? 'rgba(34, 197, 94, 0.15)' : isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isActive ? '#22c55e' : isExpired ? '#ef4444' : '#f59e0b'
          }}>
            {isActive ? <Crown size={24} /> : isExpired ? <AlertCircle size={24} /> : <Calendar size={24} />}
          </div>
          <div>
            <h2 style={styles.statusTitle}>
              {isActive ? 'Active Subscription' : isTrial ? 'Free Trial' : 'Subscription Expired'}
            </h2>
            <p style={styles.statusDesc}>
              {isActive 
                ? `Your subscription is active until ${new Date(subscription.subscriptionExpires).toLocaleDateString()}`
                : isTrial 
                  ? `${subscription.daysRemaining} days remaining in your trial`
                  : 'Subscribe to continue using all features'
              }
            </p>
          </div>
        </div>
        
        {!isActive && (
          <button onClick={() => setShowPayment(true)} className="btn btn-primary" style={styles.subscribeBtn}>
            <Zap size={18} />
            {isExpired ? 'Subscribe Now' : 'Upgrade to Pro'}
          </button>
        )}
      </div>

      {/* Plan Details */}
      <div className="glass-card" style={styles.planCard}>
        <div style={styles.planHeader}>
          <div>
            <h3 style={styles.planName}>Base Plan</h3>
            <p style={styles.planPrice}>KES 1,200<span style={styles.planPeriod}>/month</span></p>
          </div>
          {isActive && <div style={styles.currentPlanBadge}>Current Plan</div>}
        </div>
        
        <div style={styles.features}>
          <h4 style={styles.featuresTitle}>What's included:</h4>
          <div style={styles.featuresList}>
            {[
              '3 Product Cards',
              'Basic Analytics Dashboard',
              'Email Support',
              'Custom Store URL',
              'Mobile-Optimized Storefront',
              'Order Management',
              'M-Pesa Integration (add-on)',
              'WhatsApp Integration (add-on)',
            ].map((feature, idx) => (
              <div key={idx} style={styles.featureItem}>
                <Check size={16} style={{ color: '#22c55e' }} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {isActive && (
          <div style={styles.renewSection}>
            <p style={styles.renewText}>
              <Calendar size={16} />
              Renews on {new Date(subscription.subscriptionExpires).toLocaleDateString()}
            </p>
            <button onClick={() => setShowPayment(true)} style={styles.renewBtn}>
              Extend Subscription
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div style={styles.modalOverlay} onClick={() => !processing && setShowPayment(false)}>
          <div style={styles.modal} className="glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{isActive ? 'Extend Subscription' : 'Subscribe'}</h2>
              {!processing && (
                <button onClick={() => setShowPayment(false)} style={styles.closeBtn}><X size={24} /></button>
              )}
            </div>
            
            {paymentStatus === 'success' ? (
              <div style={styles.successMessage}>
                <div style={styles.successIcon}>✓</div>
                <h3>Payment Successful!</h3>
                <p>Your subscription has been {isActive ? 'extended' : 'activated'}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={styles.form}>
                {/* Duration Selection */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>SUBSCRIPTION DURATION</label>
                  <div style={styles.durationOptions}>
                    {[1, 3, 6, 12].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setSelectedMonths(months)}
                        style={{
                          ...styles.durationBtn,
                          ...(selectedMonths === months ? styles.durationBtnActive : {})
                        }}
                      >
                        {months} {months === 1 ? 'month' : 'months'}
                        {months >= 6 && <span style={styles.saveBadge}>Save {months === 6 ? '10%' : '20%'}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>M-PESA PHONE NUMBER</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254712345678"
                    required
                    disabled={processing}
                    className="dashboard-input"
                  />
                  <p style={styles.hint}>You'll receive an STK push to complete payment</p>
                </div>
                
                {paymentStatus === 'waiting' && (
                  <div style={styles.waitingMessage}>
                    <Loader size={20} className="spin" />
                    <span>Waiting for M-Pesa confirmation...</span>
                  </div>
                )}
                
                <div style={styles.paymentInfo}>
                  <div style={styles.infoRow}>
                    <span>Base Plan × {selectedMonths} month{selectedMonths > 1 ? 's' : ''}</span>
                    <span style={styles.amount}>KES {(PLAN_PRICE * selectedMonths).toLocaleString()}</span>
                  </div>
                  {selectedMonths >= 6 && (
                    <div style={styles.infoRow}>
                      <span style={{ color: '#22c55e' }}>Discount</span>
                      <span style={{ color: '#22c55e' }}>-{selectedMonths === 6 ? '10' : '20'}%</span>
                    </div>
                  )}
                  <div style={{ ...styles.infoRow, ...styles.totalRow }}>
                    <span>Total Due</span>
                    <span style={styles.totalAmount}>
                      KES {Math.round(PLAN_PRICE * selectedMonths * (selectedMonths >= 12 ? 0.8 : selectedMonths >= 6 ? 0.9 : 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div style={styles.actions}>
                  <button type="button" onClick={() => setShowPayment(false)} style={styles.cancelBtn} disabled={processing}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={processing} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} /> {processing ? 'Processing...' : 'Pay with M-Pesa'}
                  </button>
                </div>
                
                <button 
                  type="button" 
                  onClick={handleDemoSubscribe} 
                  disabled={processing}
                  style={styles.demoBtn}
                >
                  Demo: Activate without payment
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  header: { marginBottom: '32px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)' },
  
  statusCard: { padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  statusHeader: { display: 'flex', alignItems: 'center', gap: '16px' },
  statusIcon: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
  statusDesc: { fontSize: '14px', color: 'var(--text-muted)' },
  subscribeBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' },
  
  planCard: { padding: '24px' },
  planHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' },
  planName: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
  planPrice: { fontSize: '32px', fontWeight: '700', color: 'var(--accent-color)' },
  planPeriod: { fontSize: '16px', fontWeight: '400', color: 'var(--text-muted)' },
  currentPlanBadge: { padding: '6px 12px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  
  features: { marginBottom: '24px' },
  featuresTitle: { fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  featuresList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' },
  
  renewSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid var(--border-color)' },
  renewText: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' },
  renewBtn: { padding: '10px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { width: '100%', maxWidth: '500px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  hint: { fontSize: '12px', color: 'var(--text-muted)' },
  
  durationOptions: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  durationBtn: { padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', position: 'relative' },
  durationBtnActive: { background: 'var(--accent-light)', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' },
  saveBadge: { display: 'block', fontSize: '11px', color: '#22c55e', marginTop: '4px' },
  
  waitingMessage: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '10px', color: 'var(--accent-color)', fontSize: '14px' },
  successMessage: { textAlign: 'center', padding: '32px 0' },
  successIcon: { width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  
  paymentInfo: { padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' },
  amount: { fontWeight: '600', color: 'var(--text-primary)' },
  totalRow: { paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '16px', fontWeight: '600' },
  totalAmount: { color: 'var(--accent-color)', fontSize: '18px' },
  
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '12px 24px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' },
  demoBtn: { padding: '10px', background: 'transparent', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', marginTop: '8px' },
};
