import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionsAPI, mpesaAPI, kycAPI, settingsAPI } from '../api/client';
import { Check, Zap, X, ChevronDown, ChevronUp, MessageCircle, CreditCard, BarChart3, Headphones, Loader, Shield, AlertCircle } from 'lucide-react';

// Add-on icons mapping
const getAddOnIcon = (id) => {
  const icons = {
    'mpesa_stk': <CreditCard size={20} />,
    'whatsapp_auto': <MessageCircle size={20} />,
    'advanced_analytics': <BarChart3 size={20} />,
    'priority_support': <Headphones size={20} />,
  };
  return icons[id] || <Zap size={20} />;
};

export default function AddOnsPage() {
  const navigate = useNavigate();
  const [addOns, setAddOns] = useState([]);
  const [activeAddons, setActiveAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [selectedAddOn, setSelectedAddOn] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [defaultBillingPhone, setDefaultBillingPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    loadSubscriptionData();
    loadBillingPhone();
  }, []);

  // Load billing phone from settings
  const loadBillingPhone = async () => {
    try {
      const response = await settingsAPI.getAll();
      const config = response.data?.config || response.data?.settings || {};
      const mpesaNumber = config.mpesa_number || '';
      setDefaultBillingPhone(mpesaNumber);
    } catch (error) {
      console.error('Failed to load billing phone:', error);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getStatus();
      const data = response.data;
      
      // Map available addons with active status
      setAddOns(data.availableAddons || []);
      setActiveAddons(data.activeAddons || []);
    } catch (error) {
      console.error('Failed to load add-ons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e, addOn) => {
    e.stopPropagation();
    if (addOn.active) {
      alert('This add-on is already active!');
      return;
    }
    
    // Check KYC status for M-Pesa STK addon
    if (addOn.id === 'mpesa_stk') {
      try {
        const response = await kycAPI.getStatus();
        const kyc = response.data;
        setKycStatus(kyc);
        
        if (!kyc.exists || kyc.status === 'draft' || kyc.status === 'docs_uploaded') {
          // KYC not submitted
          setSelectedAddOn(addOn);
          setShowKycModal(true);
          return;
        }
        
        if (kyc.status === 'submitted_to_intasend') {
          // Under review
          alert('Your KYC is under review. Please wait 3-7 business days for approval.');
          return;
        }
        
        if (kyc.status === 'rejected') {
          // Rejected - prompt resubmission
          setSelectedAddOn(addOn);
          setShowKycModal(true);
          return;
        }
        
        if (kyc.status === 'approved') {
          // Approved - proceed with activation
          setSelectedAddOn(addOn);
          setShowCheckout(true);
          setPaymentStatus(null);
          return;
        }
      } catch (error) {
        console.error('Failed to check KYC status:', error);
        alert('Failed to verify KYC status. Please try again.');
        return;
      }
    } else {
      // Non-M-Pesa addons - proceed normally
      setSelectedAddOn(addOn);
      setShowCheckout(true);
      setPaymentStatus(null);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    
    setProcessing(true);
    setPaymentStatus('initiating');
    
    try {
      // Initiate M-Pesa STK Push
      const response = await mpesaAPI.stkPush(
        phoneNumber,
        selectedAddOn.price,
        'addon',
        selectedAddOn.id,
        selectedAddOn.name
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
        // Activate the addon
        await subscriptionsAPI.activateAddon(selectedAddOn.id, result.mpesaRef);
        
        setTimeout(() => {
          setShowCheckout(false);
          setPhoneNumber('');
          setPaymentStatus(null);
          loadSubscriptionData();
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

  // Demo mode: Activate without real payment (for testing)
  const handleDemoActivate = async () => {
    setProcessing(true);
    try {
      const demoRef = `DEMO-${Date.now()}`;
      await subscriptionsAPI.activateAddon(selectedAddOn.id, demoRef);
      setPaymentStatus('success');
      setTimeout(() => {
        setShowCheckout(false);
        setPhoneNumber('');
        setPaymentStatus(null);
        loadSubscriptionData();
      }, 1500);
    } catch (error) {
      console.error('Demo activation error:', error);
      alert('Activation failed');
    } finally {
      setProcessing(false);
    }
  };

  const toggleExpand = (addOnId) => {
    setExpandedCard(expandedCard === addOnId ? null : addOnId);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size={32} className="spin" style={{ color: 'var(--accent-color)' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading add-ons...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Add-Ons</h1>
          <p style={styles.subtitle}>Boost your store with powerful features</p>
        </div>
      </div>

      {/* KYC Required Modal */}
      {showKycModal && selectedAddOn && (
        <div style={styles.modalOverlay} onClick={() => setShowKycModal(false)}>
          <div style={styles.modal} className="glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>KYC Verification Required</h2>
              <button onClick={() => setShowKycModal(false)} style={styles.closeBtn}><X size={24} /></button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.kycIcon}>
                <Shield size={48} />
              </div>
              
              {kycStatus?.status === 'rejected' ? (
                <>
                  <h3 style={styles.kycTitle}>KYC Rejected</h3>
                  <p style={styles.kycText}>
                    Your KYC submission was rejected. Please review the feedback and resubmit your documents.
                  </p>
                  {kycStatus.rejection_reason && (
                    <div style={styles.rejectionBox}>
                      <AlertCircle size={18} />
                      <p><strong>Reason:</strong> {kycStatus.rejection_reason}</p>
                    </div>
                  )}
                  <button 
                    onClick={() => { setShowKycModal(false); navigate('/kyc'); }}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '16px' }}
                  >
                    Resubmit KYC Documents
                  </button>
                </>
              ) : (
                <>
                  <h3 style={styles.kycTitle}>Complete KYC to Activate M-Pesa STK Push</h3>
                  <p style={styles.kycText}>
                    To enable M-Pesa auto-checkout, you need to complete KYC verification. This is required by IntaSend (our payment partner) and takes 3-7 business days to process.
                  </p>
                  <div style={styles.kycBenefits}>
                    <div style={styles.benefitItem}>
                      <span style={styles.checkIcon}>✓</span>
                      <span>One-tap M-Pesa payments for customers</span>
                    </div>
                    <div style={styles.benefitItem}>
                      <span style={styles.checkIcon}>✓</span>
                      <span>Automatic payment confirmation</span>
                    </div>
                    <div style={styles.benefitItem}>
                      <span style={styles.checkIcon}>✓</span>
                      <span>35% higher conversion rates</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setShowKycModal(false); navigate('/kyc'); }}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '16px' }}
                  >
                    Complete KYC Verification
                  </button>
                  <p style={styles.kycHint}>
                    Already submitted? <a href="/kyc" style={{ color: 'var(--accent-color)' }}>Check status</a>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedAddOn && (
        <div style={styles.modalOverlay} onClick={() => !processing && setShowCheckout(false)}>
          <div style={styles.modal} className="glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Activate Add-On</h2>
              {!processing && (
                <button onClick={() => setShowCheckout(false)} style={styles.closeBtn}><X size={24} /></button>
              )}
            </div>
            <div style={styles.modalContent}>
              <div style={styles.addOnSummary}>
                <div style={styles.addOnIcon}>{getAddOnIcon(selectedAddOn.id)}</div>
                <div>
                  <h3 style={styles.addOnName}>{selectedAddOn.name}</h3>
                  <p style={styles.addOnPrice}>KES {selectedAddOn.price}/month</p>
                </div>
              </div>
              
              {paymentStatus === 'success' ? (
                <div style={styles.successMessage}>
                  <div style={styles.successIcon}>✓</div>
                  <h3>Payment Successful!</h3>
                  <p>{selectedAddOn.name} has been activated.</p>
                </div>
              ) : (
                <form onSubmit={handleCheckout} style={styles.form}>
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
                    <div style={styles.infoRow}><span>Add-on Price:</span><span style={styles.amount}>KES {selectedAddOn.price}</span></div>
                    <div style={styles.infoRow}><span>Billing:</span><span>Monthly</span></div>
                    <div style={{ ...styles.infoRow, ...styles.totalRow }}><span>Total Due:</span><span style={styles.totalAmount}>KES {selectedAddOn.price}</span></div>
                  </div>
                  <div style={styles.actions}>
                    <button type="button" onClick={() => setShowCheckout(false)} style={styles.cancelBtn} disabled={processing}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={processing} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={18} /> {processing ? 'Processing...' : 'Pay with M-Pesa'}
                    </button>
                  </div>
                  
                  {/* Demo mode button for testing */}
                  <button 
                    type="button" 
                    onClick={handleDemoActivate} 
                    disabled={processing}
                    style={styles.demoBtn}
                  >
                    Demo: Activate without payment
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add-Ons Grid */}
      <div style={styles.grid}>
        {addOns.map((addOn) => {
          const isExpanded = expandedCard === addOn.id;
          const benefits = {
            mpesa_stk: ['One-tap M-Pesa payments', 'Increase conversions by 35%', 'Instant payment confirmation'],
            whatsapp_auto: ['Auto-reply to inquiries', '24/7 customer support', 'Order confirmations'],
            advanced_analytics: ['Detailed sales insights', 'Customer behavior tracking', 'Conversion optimization'],
            priority_support: ['24/7 priority support', 'Dedicated account manager', 'Faster response times'],
          };
          
          return (
            <div key={addOn.id} className="glass-card" style={styles.card} onClick={() => toggleExpand(addOn.id)}>
              <div style={styles.cardHeader}>
                <div style={styles.iconWrapper}>{getAddOnIcon(addOn.id)}</div>
                {addOn.active && (
                  <div style={styles.activeBadge}><Check size={14} /> Active</div>
                )}
              </div>
              <h3 style={styles.cardTitle}>{addOn.name}</h3>
              <p style={styles.cardDesc}>{addOn.description}</p>
              
              {isExpanded && (
                <div style={styles.expandedContent}>
                  <div style={styles.benefitsList}>
                    {(benefits[addOn.id] || []).map((benefit, idx) => (
                      <div key={idx} style={styles.benefitItem}>
                        <span style={styles.checkIcon}>✓</span> {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={styles.cardFooter}>
                <div style={styles.pricing}>
                  <span style={styles.price}>+KES {addOn.price}</span>
                  <span style={styles.period}>/mo</span>
                </div>
                <div style={styles.footerActions}>
                  <button onClick={(e) => { e.stopPropagation(); toggleExpand(addOn.id); }} style={styles.learnMoreBtn}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isExpanded ? 'Less' : 'More'}
                  </button>
                  <button 
                    onClick={(e) => handleActivate(e, addOn)} 
                    disabled={addOn.active} 
                    className="btn btn-primary" 
                    style={{ ...styles.activateBtn, opacity: addOn.active ? 0.5 : 1 }}
                  >
                    {addOn.active ? 'Active' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  header: { marginBottom: '32px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  
  card: { padding: '24px', cursor: 'pointer', transition: 'all 0.3s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  iconWrapper: { width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' },
  activeBadge: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: '6px', fontSize: '11px', fontWeight: '600' },
  
  cardTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' },
  cardDesc: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' },
  
  expandedContent: { padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '16px' },
  benefitsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  benefitItem: { display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' },
  checkIcon: { color: '#22c55e', fontWeight: '700' },
  
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' },
  pricing: { display: 'flex', alignItems: 'baseline', gap: '2px' },
  price: { fontSize: '20px', fontWeight: '700', color: 'var(--accent-color)' },
  period: { fontSize: '13px', color: 'var(--text-muted)' },
  
  footerActions: { display: 'flex', gap: '8px' },
  learnMoreBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: 'var(--icon-btn-bg)', border: '1px solid var(--icon-btn-border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  activateBtn: { padding: '8px 16px', fontSize: '13px' },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { width: '100%', maxWidth: '500px', padding: '32px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  modalContent: { display: 'flex', flexDirection: 'column', gap: '24px' },
  addOnSummary: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--accent-light)', borderRadius: '12px' },
  addOnIcon: { width: '56px', height: '56px', borderRadius: '14px', background: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  addOnName: { fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' },
  addOnPrice: { fontSize: '15px', color: 'var(--accent-color)', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  hint: { fontSize: '12px', color: 'var(--text-muted)' },
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
  
  // KYC Modal
  kycIcon: { width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  kycTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '12px' },
  kycText: { fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6', marginBottom: '20px' },
  kycBenefits: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', marginBottom: '8px' },
  kycHint: { textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' },
  rejectionBox: { display: 'flex', gap: '12px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#ef4444', fontSize: '14px', marginBottom: '8px' },
};
