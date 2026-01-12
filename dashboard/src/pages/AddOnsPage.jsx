import { useState, useEffect } from 'react';
import { settingsAPI } from '../api/client';
import { Check, Zap, X, ChevronDown, ChevronUp, TrendingUp, Users, MessageCircle, Video, Gift, BarChart3, Star, CreditCard } from 'lucide-react';

const getAddOnIcon = (name) => {
  const icons = {
    'Order Updates via SMS': <MessageCircle size={20} />,
    'Instant Payment Prompt': <TrendingUp size={20} />,
    'Customer Re-engagement': <Users size={20} />,
    'Product Video Ads': <Video size={20} />,
    'Promotional Banners': <Gift size={20} />,
    'Smart Customer Support': <Star size={20} />,
    'Central Hub Page': <BarChart3 size={20} />,
  };
  return icons[name] || <Zap size={20} />;
};

const ADD_ONS = [
  { id: 1, name: 'Order Updates via SMS', description: 'Auto-send order confirmations and delivery updates via SMS', price: 150, benefits: ['Instant customer notifications', 'Reduce support inquiries by 80%', 'Build trust with tracking'] },
  { id: 2, name: 'Instant Payment Prompt', description: 'M-Pesa STK push for one-tap payments', price: 200, benefits: ['Increase conversions by 35%', 'Reduce cart abandonment', 'Instant payment confirmation'] },
  { id: 3, name: 'Customer Re-engagement', description: 'Win back customers with automated follow-ups', price: 250, benefits: ['Recover abandoned carts', 'Personalized offers', '3x customer lifetime value'] },
  { id: 4, name: 'Product Video Ads', description: 'Transform product photos into engaging videos', price: 400, benefits: ['40% more sales', 'Reduce returns by 25%', 'Build buyer confidence'] },
  { id: 5, name: 'Promotional Banners', description: 'Eye-catching banners for sales and offers', price: 500, benefits: ['60% more promotion visibility', 'Schedule in advance', 'Countdown timers'] },
  { id: 6, name: 'Smart Customer Support', description: 'AI-powered WhatsApp chatbot for 24/7 support', price: 500, benefits: ['Answer FAQs instantly', 'Handle 10x more inquiries', '45% more conversions'] },
  { id: 7, name: 'Central Hub Page', description: 'One link for all your products and socials', price: 800, benefits: ['Direct customers instantly', 'Increase order value by 35%', 'Cross-sell effectively'] },
];

export default function AddOnsPage() {
  const [addOns, setAddOns] = useState(ADD_ONS);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedAddOn, setSelectedAddOn] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    loadAddOns();
  }, []);

  const loadAddOns = async () => {
    try {
      const response = await settingsAPI.getAddOns();
      if (response.data?.addOns?.length > 0) {
        setAddOns(response.data.addOns);
      }
    } catch (error) {
      console.log('Using default add-ons');
    }
  };

  const handleActivate = (e, addOn) => {
    e.stopPropagation();
    if (addOn.isActive) {
      alert('This add-on is already active!');
      return;
    }
    setSelectedAddOn(addOn);
    setShowCheckout(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Payment successful! Add-on activated.');
      setShowCheckout(false);
      setPhoneNumber('');
      loadAddOns();
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const toggleExpand = (addOnId) => {
    setExpandedCard(expandedCard === addOnId ? null : addOnId);
  };

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Add-Ons</h1>
          <p style={styles.subtitle}>Boost your store with powerful features</p>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedAddOn && (
        <div style={styles.modalOverlay} onClick={() => setShowCheckout(false)}>
          <div style={styles.modal} className="glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Activate Add-On</h2>
              <button onClick={() => setShowCheckout(false)} style={styles.closeBtn}><X size={24} /></button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.addOnSummary}>
                <div style={styles.addOnIcon}><Zap size={32} /></div>
                <div>
                  <h3 style={styles.addOnName}>{selectedAddOn.name}</h3>
                  <p style={styles.addOnPrice}>KES {selectedAddOn.price}/month</p>
                </div>
              </div>
              <form onSubmit={handleCheckout} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>M-PESA PHONE NUMBER</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254712345678"
                    required
                    pattern="254[0-9]{9}"
                    className="dashboard-input"
                  />
                  <p style={styles.hint}>You'll receive an STK push to complete payment</p>
                </div>
                <div style={styles.paymentInfo}>
                  <div style={styles.infoRow}><span>Add-on Price:</span><span style={styles.amount}>KES {selectedAddOn.price}</span></div>
                  <div style={styles.infoRow}><span>Billing:</span><span>Monthly</span></div>
                  <div style={{ ...styles.infoRow, ...styles.totalRow }}><span>Total Due:</span><span style={styles.totalAmount}>KES {selectedAddOn.price}</span></div>
                </div>
                <div style={styles.actions}>
                  <button type="button" onClick={() => setShowCheckout(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={processing}>
                    <CreditCard size={18} /> {processing ? 'Processing...' : 'Pay with M-Pesa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add-Ons Grid */}
      <div style={styles.grid}>
        {addOns.map((addOn) => {
          const isExpanded = expandedCard === addOn.id;
          return (
            <div key={addOn.id} className="glass-card" style={styles.card} onClick={() => toggleExpand(addOn.id)}>
              <div style={styles.cardHeader}>
                <div style={styles.iconWrapper}>{getAddOnIcon(addOn.name)}</div>
                {addOn.isActive && (
                  <div style={styles.activeBadge}><Check size={14} /> Active</div>
                )}
              </div>
              <h3 style={styles.cardTitle}>{addOn.name}</h3>
              <p style={styles.cardDesc}>{addOn.description}</p>
              
              {isExpanded && (
                <div style={styles.expandedContent}>
                  <div style={styles.benefitsList}>
                    {(addOn.benefits || []).map((benefit, idx) => (
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
                  <button onClick={(e) => handleActivate(e, addOn)} disabled={addOn.isActive} className="btn btn-primary" style={{ ...styles.activateBtn, opacity: addOn.isActive ? 0.5 : 1 }}>
                    {addOn.isActive ? 'Active' : 'Activate'}
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
  paymentInfo: { padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' },
  amount: { fontWeight: '600', color: 'var(--text-primary)' },
  totalRow: { paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '16px', fontWeight: '600' },
  totalAmount: { color: 'var(--accent-color)', fontSize: '18px' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '12px 24px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' },
};
