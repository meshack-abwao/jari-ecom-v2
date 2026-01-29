import { useState, useEffect } from 'react';
import { settingsAPI, domainsAPI } from '../api/client';
import { 
  Save, Check, Crown, Palette, Type, ChevronDown, ChevronUp, 
  ExternalLink, Plus, Trash2, Image, FileText, Star, Globe, Wallet,
  Link2, CheckCircle, AlertCircle, Loader, Copy, RefreshCw
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

const DEFAULT_THEMES = [
  { slug: 'warm-sunset', name: 'Warm Sunset', colors: { gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }, is_premium: false },
  { slug: 'cool-ocean', name: 'Cool Ocean', colors: { gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' }, is_premium: false },
  { slug: 'royal-purple', name: 'Royal Purple', colors: { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }, is_premium: false },
  { slug: 'fresh-mint', name: 'Fresh Mint', colors: { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }, is_premium: false },
  { slug: 'midnight', name: 'Midnight Dark', colors: { gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }, is_premium: false },
  { slug: 'rose-gold', name: 'Rose Gold', colors: { gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' }, is_premium: true },
  { slug: 'cosmic', name: 'Cosmic Purple', colors: { gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }, is_premium: true },
];

const FONT_OPTIONS = [
  { value: 'Inter', name: 'Inter', preview: 'Modern & Clean' },
  { value: 'Poppins', name: 'Poppins', preview: 'Bold & Friendly' },
  { value: 'Roboto', name: 'Roboto', preview: 'Classic' },
  { value: 'Montserrat', name: 'Montserrat', preview: 'Elegant' },
  { value: 'Playfair Display', name: 'Playfair', preview: 'Luxury Serif' },
  { value: 'Space Grotesk', name: 'Space Grotesk', preview: 'Tech Modern' },
];

const parseTestimonials = (data) => {
  const defaultTestimonials = [{ quote: '', name: '', role: '' }];
  try {
    if (Array.isArray(data)) return data.length > 0 ? data : defaultTestimonials;
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTestimonials;
    }
  } catch (e) { /* silent */ }
  return defaultTestimonials;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themes, setThemes] = useState(DEFAULT_THEMES);
  const [storeUrl, setStoreUrl] = useState('');
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    domain: false,
    payment: false,
    hero: false,
    testimonials: false,
    policies: false,
    theme: true,
  });

  // Custom Domain State
  const [domainSettings, setDomainSettings] = useState({
    customDomain: '',
    domainVerified: false,
    domainSslStatus: 'pending',
    domainType: 'subdomain',
    domainAddedAt: null,
    domainVerifiedAt: null,
    verification: null,
    dnsInstructions: null,
  });
  const [domainInput, setDomainInput] = useState('');
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState('');
  const [domainSuccess, setDomainSuccess] = useState('');

  const [storeSettings, setStoreSettings] = useState({
    // Basic
    storeName: '',
    tagline: '',
    slug: '',
    logoUrl: '',
    contactPhone: '',
    // Payment (M-Pesa)
    paymentType: '', // 'paybill', 'till', or ''
    paybillNumber: '',
    paybillAccountNumber: '',
    tillNumber: '',
    paymentBusinessName: '',
    // Hero
    heroTitle: '',
    heroSubtitle: '',
    heroPhotoUrl: '',
    headerBgUrl: '',
    heroCtaPrimaryText: '',
    heroCtaPrimaryLink: '',
    heroCtaSecondaryText: '',
    heroCtaSecondaryLink: '',
    // Theme
    themeSlug: 'warm-sunset',
    fontFamily: 'Inter',
    // Testimonials
    showTestimonials: true,
    testimonials: [{ quote: '', name: '', role: '' }],
    // Policies
    privacyPolicy: '',
    termsOfService: '',
    refundPolicy: '',
  });

  useEffect(() => { loadSettings(); loadThemes(); loadDomainSettings(); }, []);

  // Load domain settings
  const loadDomainSettings = async () => {
    try {
      const response = await domainsAPI.getSettings();
      const data = response.data;
      setDomainSettings({
        customDomain: data.custom_domain || '',
        domainVerified: data.domain_verified || false,
        domainSslStatus: data.domain_ssl_status || 'pending',
        domainType: data.domain_type || 'subdomain',
        domainAddedAt: data.domain_added_at,
        domainVerifiedAt: data.domain_verified_at,
        verification: data.verification,
        dnsInstructions: null,
      });
      if (data.custom_domain) {
        setDomainInput(data.custom_domain);
      }
    } catch (err) {
      console.log('Domain settings not available:', err.message);
    }
  };

  // Setup domain
  const handleDomainSetup = async () => {
    if (!domainInput.trim()) {
      setDomainError('Please enter a domain');
      return;
    }
    
    setDomainLoading(true);
    setDomainError('');
    setDomainSuccess('');
    
    try {
      const response = await domainsAPI.setup(domainInput.trim());
      const data = response.data;
      
      setDomainSettings(prev => ({
        ...prev,
        customDomain: data.domain,
        domainType: data.domain_type,
        domainVerified: false,
        dnsInstructions: data.dns_instructions,
        verification: { verification_token: data.verification_token },
      }));
      
      setDomainSuccess('Domain added! Follow the DNS instructions below, then click Verify.');
    } catch (err) {
      setDomainError(err.response?.data?.error || 'Failed to setup domain');
    } finally {
      setDomainLoading(false);
    }
  };

  // Verify domain
  const handleDomainVerify = async () => {
    setDomainLoading(true);
    setDomainError('');
    setDomainSuccess('');
    
    try {
      const response = await domainsAPI.verify();
      const data = response.data;
      
      if (data.verified || data.already_verified) {
        setDomainSettings(prev => ({
          ...prev,
          domainVerified: true,
          domainSslStatus: 'active',
        }));
        setDomainSuccess(data.message || 'Domain verified successfully!');
      } else {
        setDomainError(data.error || 'Verification failed. Check your DNS settings.');
      }
    } catch (err) {
      setDomainError(err.response?.data?.error || 'Verification failed');
    } finally {
      setDomainLoading(false);
    }
  };

  // Remove domain
  const handleDomainRemove = async () => {
    if (!confirm('Are you sure you want to remove your custom domain?')) return;
    
    setDomainLoading(true);
    setDomainError('');
    
    try {
      await domainsAPI.remove();
      setDomainSettings({
        customDomain: '',
        domainVerified: false,
        domainSslStatus: 'pending',
        domainType: 'subdomain',
        domainAddedAt: null,
        domainVerifiedAt: null,
        verification: null,
        dnsInstructions: null,
      });
      setDomainInput('');
      setDomainSuccess('Domain removed successfully');
    } catch (err) {
      setDomainError(err.response?.data?.error || 'Failed to remove domain');
    } finally {
      setDomainLoading(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setDomainSuccess('Copied to clipboard!');
    setTimeout(() => setDomainSuccess(''), 2000);
  };

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      const store = response.data;
      const config = store?.config || {};
      
      setStoreSettings({
        storeName: config.store_name || config.storeName || config.logo_text || '',
        tagline: config.tagline || '',
        slug: store?.slug || '',
        logoUrl: config.logo_url || config.logoUrl || '',
        contactPhone: config.contact_phone || config.contactPhone || '',
        // Payment (M-Pesa)
        paymentType: config.payment_type || config.paymentType || '',
        paybillNumber: config.paybill_number || config.paybillNumber || '',
        paybillAccountNumber: config.paybill_account_number || config.paybillAccountNumber || '',
        tillNumber: config.till_number || config.tillNumber || '',
        paymentBusinessName: config.payment_business_name || config.paymentBusinessName || '',
        // Hero
        heroTitle: config.hero_title || config.heroTitle || '',
        heroSubtitle: config.hero_subtitle || config.heroSubtitle || '',
        heroPhotoUrl: config.hero_photo_url || config.heroPhotoUrl || '',
        headerBgUrl: config.header_bg_url || config.headerBgUrl || '',
        heroCtaPrimaryText: config.hero_cta_primary_text || config.heroCtaPrimaryText || '',
        heroCtaPrimaryLink: config.hero_cta_primary_link || config.heroCtaPrimaryLink || '',
        heroCtaSecondaryText: config.hero_cta_secondary_text || config.heroCtaSecondaryText || '',
        heroCtaSecondaryLink: config.hero_cta_secondary_link || config.heroCtaSecondaryLink || '',
        // Theme
        themeSlug: config.theme_slug || config.themeSlug || config.theme_color || 'warm-sunset',
        fontFamily: config.font_family || config.fontFamily || 'Inter',
        // Testimonials
        showTestimonials: config.show_testimonials !== false,
        testimonials: parseTestimonials(config.testimonials || config.collection_testimonials),
        // Policies
        privacyPolicy: config.privacy_policy || config.privacyPolicy || '',
        termsOfService: config.terms_of_service || config.termsOfService || '',
        refundPolicy: config.refund_policy || config.refundPolicy || '',
      });

      if (store?.slug) {
        const baseUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5173' 
          : 'https://jarisolutionsecom.store';
        setStoreUrl(`${baseUrl}?store=${store.slug}`);
      }
    } catch (error) { 
      console.error('Failed to load settings:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const loadThemes = async () => {
    try {
      const response = await settingsAPI.getThemes();
      if (response.data?.length > 0) {
        setThemes(response.data);
      }
    } catch (error) { 
      console.log('Using default themes'); 
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Filter empty testimonials
      const filteredTestimonials = storeSettings.testimonials.filter(
        t => t.quote?.trim() || t.name?.trim()
      );

      await settingsAPI.update({
        store_name: storeSettings.storeName,
        tagline: storeSettings.tagline,
        logo_url: storeSettings.logoUrl,
        contact_phone: storeSettings.contactPhone,
        // Payment (M-Pesa)
        payment_type: storeSettings.paymentType,
        paybill_number: storeSettings.paybillNumber,
        paybill_account_number: storeSettings.paybillAccountNumber,
        till_number: storeSettings.tillNumber,
        payment_business_name: storeSettings.paymentBusinessName,
        // Hero
        hero_title: storeSettings.heroTitle,
        hero_subtitle: storeSettings.heroSubtitle,
        hero_photo_url: storeSettings.heroPhotoUrl,
        header_bg_url: storeSettings.headerBgUrl,
        hero_cta_primary_text: storeSettings.heroCtaPrimaryText,
        hero_cta_primary_link: storeSettings.heroCtaPrimaryLink,
        hero_cta_secondary_text: storeSettings.heroCtaSecondaryText,
        hero_cta_secondary_link: storeSettings.heroCtaSecondaryLink,
        // Theme
        theme_slug: storeSettings.themeSlug,
        font_family: storeSettings.fontFamily,
        // Testimonials
        show_testimonials: storeSettings.showTestimonials,
        testimonials: filteredTestimonials,
        // Policies
        privacy_policy: storeSettings.privacyPolicy,
        terms_of_service: storeSettings.termsOfService,
        refund_policy: storeSettings.refundPolicy,
      }, storeSettings.slug || null);
      
      // Update store URL after save if slug was set
      if (storeSettings.slug) {
        const baseUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5173' 
          : 'https://jariecommstore.netlify.app';
        setStoreUrl(`${baseUrl}?store=${storeSettings.slug}`);
      }
      
      alert('✅ Settings saved! Refresh your store to see changes.');
    } catch (error) {
      console.error('Save error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save settings. Please try again.';
      alert(errorMsg);
    } finally { 
      setSaving(false); 
    }
  };

  const addTestimonial = () => {
    setStoreSettings({
      ...storeSettings,
      testimonials: [...storeSettings.testimonials, { quote: '', name: '', role: '' }]
    });
  };

  const removeTestimonial = (idx) => {
    const newTestimonials = storeSettings.testimonials.filter((_, i) => i !== idx);
    setStoreSettings({ ...storeSettings, testimonials: newTestimonials });
  };

  const updateTestimonial = (idx, field, value) => {
    const newTestimonials = [...storeSettings.testimonials];
    newTestimonials[idx] = { ...newTestimonials[idx], [field]: value };
    setStoreSettings({ ...storeSettings, testimonials: newTestimonials });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Store Settings</h1>
          <p style={styles.subtitle}>Customize your store appearance and content</p>
        </div>
        {storeUrl && (
          <button 
            onClick={() => window.open(storeUrl, '_blank')} 
            style={styles.previewBtn}
          >
            <ExternalLink size={18} />
            Preview Store
          </button>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* ========== BASIC INFORMATION ========== */}
        <div style={styles.card} className="glass-card">
          <div style={styles.sectionHeader} onClick={() => toggleSection('basic')}>
            <div style={styles.sectionTitle}>
              <Globe size={20} style={{ color: 'var(--accent-color)' }} />
              <h3 style={styles.cardTitle}>Basic Information</h3>
            </div>
            {expandedSections.basic ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.basic && (
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>STORE NAME</label>
                <input
                  type="text"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  placeholder="My Fashion Store"
                  className="dashboard-input"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>TAGLINE</label>
                <input
                  type="text"
                  value={storeSettings.tagline}
                  onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                  placeholder="Premium fashion for everyone"
                  className="dashboard-input"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>STORE SLUG</label>
                <div style={styles.slugInputWrapper}>
                  <span style={styles.slugPrefix}>jariecommstore.netlify.app/?store=</span>
                  <input 
                    type="text" 
                    value={storeSettings.slug} 
                    onChange={(e) => setStoreSettings({ ...storeSettings, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="mystore"
                    className="dashboard-input" 
                    style={styles.slugInput} 
                  />
                </div>
                <p style={styles.hint}>Your unique store URL (lowercase letters, numbers, and dashes only)</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>LOGO IMAGE <span style={styles.optional}>(Optional)</span></label>
                <ImageUploader
                  value={storeSettings.logoUrl}
                  onChange={(newUrl) => setStoreSettings({ ...storeSettings, logoUrl: newUrl })}
                  folder="branding"
                  placeholder="Logo image URL"
                  allowUrl={true}
                />
              </div>

              {/* Contact Phone */}
              <div style={styles.formGroup}>
                <label style={styles.label}>CONTACT PHONE <span style={styles.optional}>(For WhatsApp & Call buttons)</span></label>
                <input
                  type="tel"
                  value={storeSettings.contactPhone}
                  onChange={(e) => setStoreSettings({ ...storeSettings, contactPhone: e.target.value })}
                  placeholder="+254712345678"
                  className="dashboard-input"
                />
                <p style={styles.hint}>Used for hero WhatsApp & Call buttons. Include country code (e.g., +254)</p>
              </div>
            </div>
          )}
        </div>

        {/* ========== CUSTOM DOMAIN ========== */}
        <div style={styles.card} className="glass-card">
          <div style={styles.sectionHeader} onClick={() => toggleSection('domain')}>
            <div style={styles.sectionTitle}>
              <Link2 size={20} style={{ color: '#8b5cf6' }} />
              <h3 style={styles.cardTitle}>Custom Domain</h3>
              {domainSettings.domainVerified && (
                <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                  ACTIVE
                </span>
              )}
            </div>
            {expandedSections.domain ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.domain && (
            <div style={styles.sectionContent}>
              <p style={{ ...styles.hint, marginBottom: '20px', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                🔗 Use your own domain (e.g., shop.yourdomain.com or yourdomain.com) instead of the default store link.
              </p>

              {/* Error/Success Messages */}
              {domainError && (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                  <AlertCircle size={18} />
                  {domainError}
                </div>
              )}
              {domainSuccess && (
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <CheckCircle size={18} />
                  {domainSuccess}
                </div>
              )}

              {/* Current Domain Status */}
              {domainSettings.customDomain && (
                <div style={{ padding: '16px', background: domainSettings.domainVerified ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)', border: `1px solid ${domainSettings.domainVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`, borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600' }}>{domainSettings.customDomain}</span>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: domainSettings.domainVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: domainSettings.domainVerified ? '#10b981' : '#f59e0b' }}>
                      {domainSettings.domainVerified ? '✓ Verified' : '⏳ Pending Verification'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Type: {domainSettings.domainType === 'root' ? 'Root Domain' : 'Subdomain'} • SSL: {domainSettings.domainSslStatus}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {!domainSettings.domainVerified && (
                      <button type="button" onClick={handleDomainVerify} disabled={domainLoading} style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {domainLoading ? <Loader size={14} className="spin" /> : <RefreshCw size={14} />}
                        Verify Now
                      </button>
                    )}
                    <button type="button" onClick={handleDomainRemove} disabled={domainLoading} style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                      Remove Domain
                    </button>
                  </div>
                </div>
              )}

              {/* Domain Input */}
              <div style={styles.formGroup}>
                <label style={styles.label}>{domainSettings.customDomain ? 'CHANGE DOMAIN' : 'YOUR DOMAIN'}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
                    placeholder="shop.yourdomain.com or yourdomain.com"
                    className="dashboard-input"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={handleDomainSetup} disabled={domainLoading || !domainInput.trim()} style={{ padding: '12px 20px', background: domainInput.trim() ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'var(--bg-tertiary)', color: domainInput.trim() ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: domainInput.trim() ? 'pointer' : 'not-allowed', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {domainLoading ? <Loader size={16} className="spin" /> : <Plus size={16} />}
                    {domainSettings.customDomain ? 'Update' : 'Add Domain'}
                  </button>
                </div>
                <p style={styles.hint}>Examples: shop.mybusiness.com (subdomain) or mybusiness.com (root domain)</p>
              </div>

              {/* DNS Instructions */}
              {domainSettings.dnsInstructions && !domainSettings.domainVerified && (
                <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📋 DNS Setup Instructions
                  </h4>
                  
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Add these records at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):
                  </p>

                  {/* Verification TXT Record */}
                  <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#f59e0b' }}>Step 1: Verification (TXT Record)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                      <code style={{ padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>TXT</code>
                      <span></span>
                      <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
                      <code style={{ padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>_jari-verify</code>
                      <button type="button" onClick={() => copyToClipboard('_jari-verify')} style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}><Copy size={14} /></button>
                      <span style={{ color: 'var(--text-secondary)' }}>Value:</span>
                      <code style={{ padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', wordBreak: 'break-all', fontSize: '11px' }}>{domainSettings.verification?.verification_token}</code>
                      <button type="button" onClick={() => copyToClipboard(domainSettings.verification?.verification_token)} style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}><Copy size={14} /></button>
                    </div>
                  </div>

                  {/* Routing Records */}
                  <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#10b981' }}>Step 2: Routing ({domainSettings.domainType === 'root' ? 'A Records' : 'CNAME Record'})</div>
                    {domainSettings.dnsInstructions.routing?.map((record, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '8px', alignItems: 'center', fontSize: '13px', marginBottom: idx < domainSettings.dnsInstructions.routing.length - 1 ? '8px' : 0 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                        <code style={{ padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>{record.type}</code>
                        <span></span>
                        <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
                        <code style={{ padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>{record.name}</code>
                        <button type="button" onClick={() => copyToClipboard(record.name)} style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}><Copy size={14} /></button>
                        <span style={{ color: 'var(--text-secondary)' }}>Value:</span>
                        <code style={{ padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>{record.value}</code>
                        <button type="button" onClick={() => copyToClipboard(record.value)} style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}><Copy size={14} /></button>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '16px', padding: '8px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '6px' }}>
                    ⏱️ DNS changes can take up to 48 hours to propagate. Click "Verify Now" once you've added the records.
                  </p>
                </div>
              )}

              {/* Pricing Note */}
              {!domainSettings.customDomain && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Crown size={16} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>Premium Feature</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Subdomain (shop.domain.com): KES 500/mo • Root Domain (domain.com): KES 1,000/mo
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========== PAYMENT SETTINGS (M-Pesa) ========== */}
        <div style={styles.card} className="glass-card">
          <div style={styles.sectionHeader} onClick={() => toggleSection('payment')}>
            <div style={styles.sectionTitle}>
              <Wallet size={20} style={{ color: '#25D366' }} />
              <h3 style={styles.cardTitle}>Payment Settings (M-Pesa)</h3>
            </div>
            {expandedSections.payment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.payment && (
            <div style={styles.sectionContent}>
              <p style={{ ...styles.hint, marginBottom: '20px', padding: '12px', background: 'rgba(37, 211, 102, 0.1)', borderRadius: '8px', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
                📱 Your payment details will be shown to customers at checkout so they can pay via M-Pesa.
              </p>

              {/* Payment Type Selection */}
              <div style={styles.formGroup}>
                <label style={styles.label}>PAYMENT METHOD</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', border: storeSettings.paymentType === 'paybill' ? '2px solid var(--accent-color)' : '1px solid var(--border)', borderRadius: '8px', background: storeSettings.paymentType === 'paybill' ? 'rgba(139, 92, 246, 0.1)' : 'transparent' }}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="paybill"
                      checked={storeSettings.paymentType === 'paybill'}
                      onChange={(e) => setStoreSettings({ ...storeSettings, paymentType: e.target.value })}
                    />
                    <span>Paybill</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', border: storeSettings.paymentType === 'till' ? '2px solid var(--accent-color)' : '1px solid var(--border)', borderRadius: '8px', background: storeSettings.paymentType === 'till' ? 'rgba(139, 92, 246, 0.1)' : 'transparent' }}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="till"
                      checked={storeSettings.paymentType === 'till'}
                      onChange={(e) => setStoreSettings({ ...storeSettings, paymentType: e.target.value })}
                    />
                    <span>Till Number (Buy Goods)</span>
                  </label>
                </div>
              </div>

              {/* Paybill Fields */}
              {storeSettings.paymentType === 'paybill' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>PAYBILL NUMBER</label>
                    <input
                      type="text"
                      value={storeSettings.paybillNumber}
                      onChange={(e) => setStoreSettings({ ...storeSettings, paybillNumber: e.target.value })}
                      placeholder="e.g., 522522"
                      className="dashboard-input"
                      maxLength={10}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ACCOUNT NUMBER <span style={styles.optional}>(Optional)</span></label>
                    <input
                      type="text"
                      value={storeSettings.paybillAccountNumber}
                      onChange={(e) => setStoreSettings({ ...storeSettings, paybillAccountNumber: e.target.value })}
                      placeholder="e.g., Your Store Name or Order ID"
                      className="dashboard-input"
                    />
                    <p style={styles.hint}>Leave empty to use customer's order/booking reference</p>
                  </div>
                </>
              )}

              {/* Till Number Fields */}
              {storeSettings.paymentType === 'till' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>TILL NUMBER</label>
                  <input
                    type="text"
                    value={storeSettings.tillNumber}
                    onChange={(e) => setStoreSettings({ ...storeSettings, tillNumber: e.target.value })}
                    placeholder="e.g., 1234567"
                    className="dashboard-input"
                    maxLength={10}
                  />
                </div>
              )}

              {/* Business Name (for both) */}
              {storeSettings.paymentType && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>BUSINESS NAME <span style={styles.optional}>(Shown to customer)</span></label>
                  <input
                    type="text"
                    value={storeSettings.paymentBusinessName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, paymentBusinessName: e.target.value })}
                    placeholder="e.g., Nimoration Photography"
                    className="dashboard-input"
                  />
                  <p style={styles.hint}>Helps customers confirm they're paying the right business</p>
                </div>
              )}

              {!storeSettings.paymentType && (
                <p style={{ ...styles.hint, textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  Select a payment method above to configure M-Pesa details
                </p>
              )}
            </div>
          )}
        </div>
        <div style={styles.card} className="glass-card">
          <div style={styles.sectionHeader} onClick={() => toggleSection('hero')}>
            <div style={styles.sectionTitle}>
              <Image size={20} style={{ color: 'var(--accent-color)' }} />
              <h3 style={styles.cardTitle}>Hero Section</h3>
            </div>
            {expandedSections.hero ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.hero && (
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>HERO TITLE</label>
                <input
                  type="text"
                  value={storeSettings.heroTitle}
                  onChange={(e) => setStoreSettings({ ...storeSettings, heroTitle: e.target.value })}
                  placeholder="Your main headline"
                  className="dashboard-input"
                />
                <p style={styles.hint}>Defaults to store name if empty</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>HERO SUBTITLE</label>
                <input
                  type="text"
                  value={storeSettings.heroSubtitle}
                  onChange={(e) => setStoreSettings({ ...storeSettings, heroSubtitle: e.target.value })}
                  placeholder="Your tagline or description"
                  className="dashboard-input"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>PROFILE PHOTO</label>
                <ImageUploader
                  value={storeSettings.heroPhotoUrl}
                  onChange={(newUrl) => setStoreSettings({ ...storeSettings, heroPhotoUrl: newUrl })}
                  folder="branding"
                  placeholder="Profile photo URL"
                  allowUrl={true}
                />
                <p style={styles.hint}>Circular photo displayed in hero section</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>HERO BACKGROUND IMAGE</label>
                <ImageUploader
                  value={storeSettings.headerBgUrl}
                  onChange={(newUrl) => setStoreSettings({ ...storeSettings, headerBgUrl: newUrl })}
                  folder="branding"
                  placeholder="Background image URL"
                  allowUrl={true}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>PRIMARY CTA TEXT</label>
                  <input
                    type="text"
                    value={storeSettings.heroCtaPrimaryText}
                    onChange={(e) => setStoreSettings({ ...storeSettings, heroCtaPrimaryText: e.target.value })}
                    placeholder="Shop Now"
                    className="dashboard-input"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>PRIMARY CTA LINK</label>
                  <input
                    type="text"
                    value={storeSettings.heroCtaPrimaryLink}
                    onChange={(e) => setStoreSettings({ ...storeSettings, heroCtaPrimaryLink: e.target.value })}
                    placeholder="#products or URL"
                    className="dashboard-input"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>SECONDARY CTA TEXT</label>
                  <input
                    type="text"
                    value={storeSettings.heroCtaSecondaryText}
                    onChange={(e) => setStoreSettings({ ...storeSettings, heroCtaSecondaryText: e.target.value })}
                    placeholder="Contact Me"
                    className="dashboard-input"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>SECONDARY CTA LINK</label>
                  <input
                    type="text"
                    value={storeSettings.heroCtaSecondaryLink}
                    onChange={(e) => setStoreSettings({ ...storeSettings, heroCtaSecondaryLink: e.target.value })}
                    placeholder="https://wa.me/254..."
                    className="dashboard-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========== TESTIMONIALS ========== */}
        <div style={styles.card} className="glass-card">
          <div style={styles.sectionHeader} onClick={() => toggleSection('testimonials')}>
            <div style={styles.sectionTitle}>
              <Star size={20} style={{ color: 'var(--accent-color)' }} />
              <h3 style={styles.cardTitle}>Testimonials</h3>
            </div>
            {expandedSections.testimonials ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.testimonials && (
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={storeSettings.showTestimonials}
                    onChange={(e) => setStoreSettings({ ...storeSettings, showTestimonials: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Show testimonials section on store</span>
                </label>
              </div>

              {storeSettings.showTestimonials && (
                <>
                  {storeSettings.testimonials.map((testimonial, idx) => (
                    <div key={idx} style={styles.testimonialCard}>
                      <div style={styles.testimonialHeader}>
                        <span style={styles.testimonialNum}>Testimonial {idx + 1}</span>
                        {storeSettings.testimonials.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeTestimonial(idx)}
                            style={styles.removeBtn}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                      
                      <div style={styles.formGroup}>
                        <label style={styles.label}>TESTIMONIAL TEXT</label>
                        <textarea
                          value={testimonial.quote}
                          onChange={(e) => updateTestimonial(idx, 'quote', e.target.value)}
                          placeholder="Amazing products! Fast delivery..."
                          rows={2}
                          className="dashboard-input"
                          style={styles.textarea}
                        />
                      </div>

                      <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>CUSTOMER NAME</label>
                          <input
                            type="text"
                            value={testimonial.name}
                            onChange={(e) => updateTestimonial(idx, 'name', e.target.value)}
                            placeholder="Sarah M."
                            className="dashboard-input"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>ROLE / DETAIL</label>
                          <input
                            type="text"
                            value={testimonial.role}
                            onChange={(e) => updateTestimonial(idx, 'role', e.target.value)}
                            placeholder="Verified Buyer"
                            className="dashboard-input"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={addTestimonial} style={styles.addBtn}>
                    <Plus size={16} /> Add Another Testimonial
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ========== STORE POLICIES ========== */}
        <div style={styles.card} className="glass-card">
          <div style={styles.sectionHeader} onClick={() => toggleSection('policies')}>
            <div style={styles.sectionTitle}>
              <FileText size={20} style={{ color: 'var(--accent-color)' }} />
              <h3 style={styles.cardTitle}>Store Policies</h3>
            </div>
            {expandedSections.policies ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.policies && (
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>PRIVACY POLICY</label>
                <textarea
                  value={storeSettings.privacyPolicy}
                  onChange={(e) => setStoreSettings({ ...storeSettings, privacyPolicy: e.target.value })}
                  placeholder="Your privacy policy text..."
                  rows={4}
                  className="dashboard-input"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>TERMS OF SERVICE</label>
                <textarea
                  value={storeSettings.termsOfService}
                  onChange={(e) => setStoreSettings({ ...storeSettings, termsOfService: e.target.value })}
                  placeholder="Your terms of service..."
                  rows={4}
                  className="dashboard-input"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>REFUND POLICY</label>
                <textarea
                  value={storeSettings.refundPolicy}
                  onChange={(e) => setStoreSettings({ ...storeSettings, refundPolicy: e.target.value })}
                  placeholder="Your refund and return policy..."
                  rows={4}
                  className="dashboard-input"
                  style={styles.textarea}
                />
              </div>
            </div>
          )}
        </div>

        {/* ========== THEME & FONT ========== */}
        <div style={styles.card} className="glass-card">
          <div style={styles.sectionHeader} onClick={() => toggleSection('theme')}>
            <div style={styles.sectionTitle}>
              <Palette size={20} style={{ color: 'var(--accent-color)' }} />
              <h3 style={styles.cardTitle}>Theme & Font</h3>
            </div>
            {expandedSections.theme ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.theme && (
            <div style={styles.sectionContent}>
              <p style={styles.cardDesc}>Select a color theme for your store</p>
              
              <div style={styles.themesGrid}>
                {themes.map((theme) => (
                  <div
                    key={theme.slug}
                    onClick={() => setStoreSettings({ ...storeSettings, themeSlug: theme.slug })}
                    style={{
                      ...styles.themeCard,
                      border: storeSettings.themeSlug === theme.slug 
                        ? '2px solid var(--accent-color)' 
                        : '1px solid var(--border-color)',
                    }}
                    className="glass-card"
                  >
                    <div style={{ 
                      ...styles.themePreview, 
                      background: theme.colors?.gradient || theme.gradient 
                    }}>
                      {storeSettings.themeSlug === theme.slug && (
                        <div style={styles.themeCheck}><Check size={18} /></div>
                      )}
                    </div>
                    <p style={styles.themeName}>{theme.name}</p>
                    {theme.is_premium && (
                      <div style={styles.premiumBadge}><Crown size={10} /> Premium</div>
                    )}
                  </div>
                ))}
              </div>

              <h4 style={styles.fontSectionTitle}>
                <Type size={18} style={{ color: 'var(--accent-color)' }} />
                Choose Font
              </h4>
              
              <div style={styles.fontsGrid}>
                {FONT_OPTIONS.map((font) => (
                  <div
                    key={font.value}
                    onClick={() => setStoreSettings({ ...storeSettings, fontFamily: font.value })}
                    style={{
                      ...styles.fontCard,
                      border: storeSettings.fontFamily === font.value 
                        ? '2px solid var(--accent-color)' 
                        : '1px solid var(--border-color)',
                    }}
                    className="glass-card"
                  >
                    <div style={styles.fontPreview}>
                      <p style={{ ...styles.fontSample, fontFamily: font.value }}>Aa</p>
                      {storeSettings.fontFamily === font.value && (
                        <div style={styles.fontCheck}><Check size={14} /></div>
                      )}
                    </div>
                    <p style={styles.fontName}>{font.name}</p>
                    <p style={styles.fontDesc}>{font.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button type="submit" disabled={saving} className="btn btn-primary" style={styles.saveBtn}>
          <Save size={18} /> 
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  loadingContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh', 
    color: 'var(--text-muted)' 
  },
  spinner: { 
    width: '40px', 
    height: '40px', 
    border: '3px solid var(--border-color)', 
    borderTopColor: 'var(--accent-color)', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite', 
    marginBottom: '16px' 
  },
  
  header: { 
    marginBottom: '32px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  title: { 
    fontSize: '34px', 
    fontWeight: '700', 
    marginBottom: '6px', 
    color: 'var(--text-primary)', 
    letterSpacing: '-0.025em' 
  },
  subtitle: { 
    fontSize: '15px', 
    color: 'var(--text-muted)' 
  },
  previewBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 20px', 
    background: 'var(--accent-light)', 
    border: '1px solid var(--accent-color)', 
    borderRadius: '10px', 
    color: 'var(--accent-color)', 
    fontSize: '14px', 
    fontWeight: '600', 
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  
  card: { 
    padding: '24px', 
    marginBottom: '20px' 
  },
  sectionHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    cursor: 'pointer',
    color: 'var(--text-primary)',
  },
  sectionTitle: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px' 
  },
  sectionContent: { 
    paddingTop: '20px', 
    borderTop: '1px solid var(--border-color)', 
    marginTop: '16px' 
  },
  cardTitle: { 
    fontSize: '17px', 
    fontWeight: '600', 
    color: 'var(--text-primary)', 
    margin: 0 
  },
  cardDesc: { 
    fontSize: '14px', 
    color: 'var(--text-muted)', 
    marginBottom: '20px' 
  },
  
  formGroup: { 
    marginBottom: '20px' 
  },
  formRow: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '16px' 
  },
  label: { 
    fontSize: '11px', 
    fontWeight: '700', 
    color: 'var(--text-muted)', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px', 
    marginBottom: '8px', 
    display: 'block' 
  },
  optional: { 
    fontSize: '10px', 
    fontWeight: '400', 
    color: 'var(--text-muted)', 
    textTransform: 'none' 
  },
  inputDisabled: { 
    background: 'var(--bg-tertiary)', 
    color: 'var(--text-muted)', 
    cursor: 'not-allowed' 
  },
  slugInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-tertiary)',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)'
  },
  slugPrefix: {
    padding: '10px 12px',
    fontSize: '13px',
    color: 'var(--text-muted)',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-color)',
    whiteSpace: 'nowrap'
  },
  slugInput: {
    flex: 1,
    border: 'none',
    borderRadius: 0,
    background: 'transparent'
  },
  hint: { 
    fontSize: '12px', 
    color: 'var(--text-muted)', 
    marginTop: '6px' 
  },
  textarea: { 
    resize: 'vertical', 
    minHeight: '80px' 
  },
  
  imagePreview: { 
    marginTop: '12px', 
    width: '80px', 
    height: '80px', 
    borderRadius: '12px', 
    overflow: 'hidden', 
    border: '1px solid var(--border-color)' 
  },
  previewImg: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' 
  },
  bgPreview: { 
    marginTop: '12px', 
    borderRadius: '10px', 
    overflow: 'hidden', 
    height: '100px' 
  },
  bgPreviewImg: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover', 
    filter: 'brightness(0.7)' 
  },
  
  toggleLabel: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    cursor: 'pointer', 
    fontSize: '15px',
    color: 'var(--text-primary)',
  },
  checkbox: { 
    width: '18px', 
    height: '18px', 
    cursor: 'pointer',
    accentColor: 'var(--accent-color)',
  },
  
  testimonialCard: { 
    padding: '16px', 
    background: 'var(--bg-tertiary)', 
    border: '1px solid var(--border-color)', 
    borderRadius: '12px', 
    marginBottom: '16px' 
  },
  testimonialHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '12px' 
  },
  testimonialNum: { 
    fontSize: '13px', 
    fontWeight: '600', 
    color: 'var(--text-muted)' 
  },
  removeBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '6px 12px', 
    background: 'rgba(239, 68, 68, 0.1)', 
    border: '1px solid rgba(239, 68, 68, 0.2)', 
    borderRadius: '8px', 
    color: '#ef4444', 
    fontSize: '12px', 
    cursor: 'pointer' 
  },
  addBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    width: '100%', 
    padding: '12px', 
    background: 'var(--accent-light)', 
    border: '1px solid var(--accent-color)', 
    borderRadius: '10px', 
    color: 'var(--accent-color)', 
    fontSize: '14px', 
    fontWeight: '600', 
    cursor: 'pointer' 
  },
  
  themesGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
    gap: '14px',
    marginBottom: '28px',
  },
  themeCard: { 
    padding: '14px', 
    cursor: 'pointer', 
    transition: 'all 0.2s', 
    textAlign: 'center' 
  },
  themePreview: { 
    height: '70px', 
    borderRadius: '10px', 
    marginBottom: '10px', 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  themeCheck: { 
    width: '32px', 
    height: '32px', 
    borderRadius: '50%', 
    background: 'rgba(255,255,255,0.95)', 
    color: 'var(--accent-color)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  themeName: { 
    fontSize: '12px', 
    fontWeight: '600', 
    color: 'var(--text-primary)', 
    marginBottom: '4px' 
  },
  premiumBadge: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '4px', 
    padding: '3px 8px', 
    background: 'var(--accent-light)', 
    color: 'var(--accent-color)', 
    borderRadius: '6px', 
    fontSize: '10px', 
    fontWeight: '700' 
  },
  
  fontSectionTitle: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '15px', 
    fontWeight: '600', 
    color: 'var(--text-primary)', 
    marginBottom: '16px' 
  },
  fontsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
    gap: '12px' 
  },
  fontCard: { 
    padding: '14px', 
    cursor: 'pointer', 
    transition: 'all 0.2s', 
    textAlign: 'center' 
  },
  fontPreview: { 
    height: '60px', 
    borderRadius: '8px', 
    marginBottom: '8px', 
    background: 'var(--bg-tertiary)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative' 
  },
  fontSample: { 
    fontSize: '32px', 
    fontWeight: '700', 
    color: 'var(--text-primary)' 
  },
  fontCheck: { 
    position: 'absolute', 
    top: '6px', 
    right: '6px', 
    width: '22px', 
    height: '22px', 
    borderRadius: '50%', 
    background: 'var(--accent-color)', 
    color: 'white', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  fontName: { 
    fontSize: '11px', 
    fontWeight: '600', 
    color: 'var(--text-primary)', 
    marginBottom: '2px' 
  },
  fontDesc: { 
    fontSize: '9px', 
    color: 'var(--text-muted)' 
  },
  
  saveBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginTop: '8px' 
  },
};
