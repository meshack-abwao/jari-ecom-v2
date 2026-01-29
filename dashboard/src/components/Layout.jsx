import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { settingsAPI, subscriptionsAPI, cardsAPI } from '../api/client';
import { BRAND } from '../constants/brand';
import { Home, Package, ShoppingCart, Settings, Zap, LogOut, Sun, Moon, Menu, X, User, Store, Crown, ArrowUpRight, LayoutGrid, Megaphone, Calendar, UtensilsCrossed, CreditCard, Phone, Edit2, Check, Clock, AlertCircle, ChevronDown, Shield } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [accountData, setAccountData] = useState({
    businessName: user?.business_name || '',
    instagramHandle: user?.instagram_handle || '',
    mpesaNumber: '',
    whatsappNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [cardBalance, setCardBalance] = useState({ cardLimit: 3, cardsUsed: 0, cardsRemaining: 3 });
  const [editingMpesa, setEditingMpesa] = useState(false);
  const [tempMpesaNumber, setTempMpesaNumber] = useState('');

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Safety reset on mount
  useEffect(() => {
    setShowAccountModal(false);
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  }, []);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowAccountModal(false);
        setMobileMenuOpen(false);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = (showAccountModal || mobileMenuOpen) ? 'hidden' : '';
  }, [showAccountModal, mobileMenuOpen]);

  const loadMpesaNumber = async () => {
    try {
      const response = await settingsAPI.getAll();
      const settings = response.data?.settings || response.data?.config || {};
      setAccountData(prev => ({
        ...prev,
        mpesaNumber: settings.mpesa_number || '',
        whatsappNumber: settings.whatsapp_number || '',
      }));
      setTempMpesaNumber(settings.mpesa_number || '');
    } catch (error) {
      console.error('Failed to load account data:', error);
    }
  };

  const loadSubscriptionAndCards = async () => {
    try {
      const [subRes, cardsRes] = await Promise.all([
        subscriptionsAPI.getStatus().catch(() => ({ data: null })),
        cardsAPI.getBalance().catch(() => ({ data: { cardLimit: 3, cardsUsed: 0, cardsRemaining: 3 } }))
      ]);
      if (subRes.data) setSubscription(subRes.data);
      if (cardsRes.data) setCardBalance(cardsRes.data);
    } catch (error) {
      console.error('Failed to load subscription/cards:', error);
    }
  };

  const handleShowAccount = () => {
    loadMpesaNumber();
    loadSubscriptionAndCards();
    setShowAccountModal(true);
    setMobileMenuOpen(false);
    setEditingMpesa(false);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update({ 
        mpesa_number: accountData.mpesaNumber,
        whatsapp_number: accountData.whatsappNumber 
      });
      alert('Account settings saved successfully!');
      setShowAccountModal(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };
  
  const closeAccountModal = () => {
    setShowAccountModal(false);
    document.body.style.overflow = '';
  };

  return (
    <div className="dashboard-container">
      {/* Account & Billing Modal */}
      {showAccountModal && (
        <div style={styles.modalOverlay} onClick={closeAccountModal}>
          <div style={styles.modal} className="glass-card" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Account & Billing</h2>
              <button onClick={closeAccountModal} style={styles.closeBtn}><X size={24} /></button>
            </div>
            <div style={styles.modalContent}>
              {/* Business Info */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Business Info</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoBox}>
                    <User size={18} style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <p style={styles.infoLabel}>Business Name</p>
                      <p style={styles.infoValue}>{accountData.businessName || 'Not set'}</p>
                    </div>
                  </div>
                  <div style={styles.infoBox}>
                    <Store size={18} style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <p style={styles.infoLabel}>Instagram</p>
                      <p style={styles.infoValue}>{accountData.instagramHandle || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method - M-Pesa */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Payment Method</h3>
                <div style={styles.mpesaCard}>
                  <div style={styles.mpesaHeader}>
                    <div style={styles.mpesaIcon}>
                      <Phone size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={styles.mpesaLabel}>M-Pesa Number</p>
                      {!editingMpesa ? (
                        <p style={styles.mpesaNumber}>
                          {accountData.mpesaNumber ? accountData.mpesaNumber : 'Not set'}
                        </p>
                      ) : (
                        <input
                          type="tel"
                          value={tempMpesaNumber}
                          onChange={(e) => setTempMpesaNumber(e.target.value)}
                          placeholder="254712345678"
                          className="dashboard-input"
                          style={{ marginTop: '4px', padding: '8px 12px', fontSize: '14px' }}
                          autoFocus
                        />
                      )}
                    </div>
                    {!editingMpesa ? (
                      <button 
                        onClick={() => { setEditingMpesa(true); setTempMpesaNumber(accountData.mpesaNumber); }}
                        style={styles.editBtn}
                      >
                        <Edit2 size={14} /> {accountData.mpesaNumber ? 'Change' : 'Add'}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => setEditingMpesa(false)}
                          style={{ ...styles.editBtn, background: 'var(--bg-tertiary)' }}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await settingsAPI.update({ mpesa_number: tempMpesaNumber });
                              setAccountData(prev => ({ ...prev, mpesaNumber: tempMpesaNumber }));
                              setEditingMpesa(false);
                            } catch (e) {
                              alert('Failed to save');
                            }
                          }}
                          style={{ ...styles.editBtn, background: 'var(--accent-color)', color: '#fff' }}
                        >
                          <Check size={14} /> Save
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={styles.mpesaHint}>
                    This number will be used for all purchases. You can change it anytime.
                  </p>
                </div>
              </div>

              {/* Subscription Status */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Subscription</h3>
                <div style={{
                  ...styles.subscriptionCard,
                  borderColor: subscription?.status === 'active' ? 'rgba(34, 197, 94, 0.3)' : 
                               subscription?.status === 'expired' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={styles.subscriptionHeader}>
                    <div style={{
                      ...styles.statusIcon,
                      background: subscription?.status === 'active' ? 'rgba(34, 197, 94, 0.15)' :
                                  subscription?.status === 'expired' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: subscription?.status === 'active' ? '#22c55e' :
                             subscription?.status === 'expired' ? '#ef4444' : '#f59e0b'
                    }}>
                      {subscription?.status === 'active' ? <Crown size={20} /> :
                       subscription?.status === 'expired' ? <AlertCircle size={20} /> : <Clock size={20} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={styles.subscriptionStatus}>
                        {subscription?.status === 'active' ? 'Active' :
                         subscription?.status === 'expired' ? 'Expired' : 'Trial'}
                      </p>
                      <p style={styles.subscriptionExpiry}>
                        {subscription?.status === 'active' && subscription?.subscriptionExpires
                          ? `Renews ${new Date(subscription.subscriptionExpires).toLocaleDateString()}`
                          : subscription?.status === 'trial'
                          ? `${subscription?.daysRemaining || 14} days remaining`
                          : 'Subscribe to continue'
                        }
                      </p>
                    </div>
                    <div style={styles.priceBox}>
                      <span style={styles.priceAmount}>KES 1,200</span>
                      <span style={styles.pricePeriod}>/month</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { closeAccountModal(); navigate('/subscription'); }}
                    style={{
                      ...styles.subscriptionBtn,
                      background: subscription?.status === 'active' ? 'var(--bg-tertiary)' : 'var(--accent-color)',
                      color: subscription?.status === 'active' ? 'var(--text-primary)' : '#fff'
                    }}
                  >
                    {subscription?.status === 'active' ? 'Manage Plan' : 
                     subscription?.status === 'expired' ? 'Subscribe Now' : 'Upgrade'}
                  </button>
                </div>
              </div>

              {/* Cards & Templates */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Your Assets</h3>
                <div style={styles.assetsGrid}>
                  <div style={styles.assetCard}>
                    <div style={styles.assetIcon}>🎴</div>
                    <div>
                      <p style={styles.assetValue}>{cardBalance.cardsRemaining}/{cardBalance.cardLimit}</p>
                      <p style={styles.assetLabel}>Product Cards</p>
                    </div>
                    <button 
                      onClick={() => { closeAccountModal(); navigate('/products'); }}
                      style={styles.assetBtn}
                    >
                      Buy More
                    </button>
                  </div>
                  <div style={styles.assetCard}>
                    <div style={styles.assetIcon}>🎨</div>
                    <div>
                      <p style={styles.assetValue}>1</p>
                      <p style={styles.assetLabel}>Templates</p>
                    </div>
                    <button 
                      onClick={() => { closeAccountModal(); navigate('/templates'); }}
                      style={styles.assetBtn}
                    >
                      Browse
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp Number */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Notifications</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>WHATSAPP NUMBER</label>
                  <input
                    type="tel"
                    value={accountData.whatsappNumber}
                    onChange={(e) => setAccountData({ ...accountData, whatsappNumber: e.target.value })}
                    placeholder="254712345678"
                    className="dashboard-input"
                  />
                  <p style={styles.hint}>Receive order notifications & customer inquiries</p>
                </div>
                <button 
                  onClick={handleSaveAccount}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  {saving ? 'Saving...' : 'Save WhatsApp Number'}
                </button>
              </div>

              {/* Quick Links */}
              <div style={styles.quickLinks}>
                <button onClick={() => { closeAccountModal(); navigate('/add-ons'); }} style={styles.quickLink}>
                  <Zap size={16} /> Add-Ons
                </button>
                <button onClick={() => { closeAccountModal(); navigate('/settings'); }} style={styles.quickLink}>
                  <Settings size={16} /> Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="mobile-header glass-card">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="hamburger-btn">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h2 className="mobile-logo">Jari.Ecom</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu}></div>}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar glass-card ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={styles.logo}>
          <img src={BRAND.LOGO_URL} alt="Jari" style={styles.logoImg} />
          <div>
            <h2 style={styles.logoText}>{BRAND.APP_NAME}</h2>
            <p style={styles.logoSub}>{BRAND.TAGLINE_SIDEBAR}</p>
          </div>
        </div>

        <nav style={styles.nav}>
          {/* Main Section */}
          <button className="nav-section-toggle" onClick={() => setCollapsedSections(s => ({...s, main: !s.main}))}>
            <span>Main</span>
            <ChevronDown size={14} className={`nav-section-chevron ${collapsedSections.main ? 'collapsed' : ''}`} />
          </button>
          <div className={`nav-section-content ${collapsedSections.main ? 'collapsed' : ''}`}>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <Home size={20} /><span>Overview</span>
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <Package size={20} /><span>My Store</span>
            </NavLink>
            <NavLink to="/ads" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <Megaphone size={20} /><span>Marketing</span>
            </NavLink>
          </div>
          
          {/* Orders Section */}
          <button className="nav-section-toggle" onClick={() => setCollapsedSections(s => ({...s, orders: !s.orders}))}>
            <span>Orders</span>
            <ChevronDown size={14} className={`nav-section-chevron ${collapsedSections.orders ? 'collapsed' : ''}`} />
          </button>
          <div className={`nav-section-content ${collapsedSections.orders ? 'collapsed' : ''}`}>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <ShoppingCart size={20} /><span>Orders</span>
            </NavLink>
            <NavLink to="/food-orders" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <UtensilsCrossed size={20} /><span>Food Orders</span>
            </NavLink>
            <NavLink to="/bookings" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <Calendar size={20} /><span>Bookings</span>
            </NavLink>
            <NavLink to="/kyc" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <Shield size={20} /><span>KYC (M-Pesa)</span>
            </NavLink>
          </div>
          
          {/* Customize Section */}
          <button className="nav-section-toggle" onClick={() => setCollapsedSections(s => ({...s, customize: !s.customize}))}>
            <span>Customize</span>
            <ChevronDown size={14} className={`nav-section-chevron ${collapsedSections.customize ? 'collapsed' : ''}`} />
          </button>
          <div className={`nav-section-content ${collapsedSections.customize ? 'collapsed' : ''}`}>
            <NavLink to="/templates" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <LayoutGrid size={20} /><span>Store Design</span>
            </NavLink>
            <NavLink to="/add-ons" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <Zap size={20} /><span>Features</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'} onClick={closeMobileMenu}>
              <Settings size={20} /><span>Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Theme Toggle - Bottom */}
        <button onClick={toggleTheme} style={styles.themeToggle} className="glass-card theme-toggle-btn">
          <div className={`toggle-track ${theme === 'dark' ? 'dark' : 'light'}`}>
            <div className="toggle-thumb">
              {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            </div>
          </div>
          <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <div style={{ ...styles.userCard, cursor: 'pointer' }} className="glass-card" onClick={handleShowAccount}>
          <div style={styles.avatar}>{user?.business_name?.charAt(0) || 'U'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.userName}>{user?.business_name || 'User'}</p>
            <p style={styles.userEmail}>{user?.instagram_handle || user?.email}</p>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} /><span>Logout</span>
        </button>
      </aside>

      <main className="dashboard-main" data-page><Outlet /></main>
    </div>
  );
}

const styles = {
  logo: { display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' },
  logoImg: { width: '48px', height: '48px', objectFit: 'contain', borderRadius: '10px' },
  logoText: { fontSize: '20px', fontWeight: '800', background: 'var(--logo-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoSub: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  userCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' },
  avatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'var(--avatar-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: 'white', flexShrink: 0 },
  userName: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  themeToggle: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', transition: 'all 0.3s', border: 'none' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, justifyContent: 'center' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' },
  
  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '8px' },
  modalContent: { display: 'flex', flexDirection: 'column', gap: '20px' },
  
  // Sections
  section: { padding: '0' },
  sectionTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' },
  
  // Info Grid
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  infoBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '12px' },
  infoLabel: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' },
  infoValue: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' },
  
  // M-Pesa Card
  mpesaCard: { padding: '16px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '14px' },
  mpesaHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  mpesaIcon: { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' },
  mpesaLabel: { fontSize: '12px', color: 'var(--text-muted)' },
  mpesaNumber: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' },
  mpesaHint: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(34, 197, 94, 0.1)' },
  editBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer' },
  
  // Subscription Card
  subscriptionCard: { padding: '18px', background: 'var(--bg-tertiary)', border: '1px solid', borderRadius: '14px' },
  subscriptionHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' },
  statusIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  subscriptionStatus: { fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' },
  subscriptionExpiry: { fontSize: '13px', color: 'var(--text-muted)' },
  priceBox: { textAlign: 'right' },
  priceAmount: { fontSize: '22px', fontWeight: '700', color: 'var(--accent-color)', display: 'block', lineHeight: '1' },
  pricePeriod: { fontSize: '12px', color: 'var(--text-muted)' },
  subscriptionBtn: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  
  // Assets Grid
  assetsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  assetCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '12px' },
  assetIcon: { fontSize: '24px' },
  assetValue: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' },
  assetLabel: { fontSize: '12px', color: 'var(--text-muted)' },
  assetBtn: { marginLeft: 'auto', padding: '6px 12px', background: 'var(--accent-light)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--accent-color)', cursor: 'pointer' },
  
  // Form
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  hint: { fontSize: '11px', color: 'var(--text-muted)' },
  
  // Quick Links
  quickLinks: { display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' },
  quickLink: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer' },
};
