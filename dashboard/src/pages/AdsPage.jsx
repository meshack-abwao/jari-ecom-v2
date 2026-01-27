import { useState, useEffect } from 'react';
import { pixelAPI, settingsAPI, subscriptionsAPI } from '../api/client';
import { TrendingUp, Users, Target, Copy, Check, ChevronDown, ChevronUp, Link2, Settings, AlertCircle, ShoppingCart, XCircle, CheckCircle, Download, Phone, MessageCircle, Eye, Lock, Zap, Star, X } from 'lucide-react';

export default function AdsPage() {
  const [storeId, setStoreId] = useState(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [storeConfig, setStoreConfig] = useState({});
  const [timePeriod, setTimePeriod] = useState('week');
  const [traffic, setTraffic] = useState({ total: 0, sources: [], funnel: {} });
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(null);
  const [showUtmSection, setShowUtmSection] = useState(false);
  const [showPixelModal, setShowPixelModal] = useState(false);
  const [customUtm, setCustomUtm] = useState({ source: '', medium: '', campaign: '' });
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Paywall state - now fetched from backend
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAbandonedPopup, setShowAbandonedPopup] = useState(false);
  const [abandonedFeatureAccess, setAbandonedFeatureAccess] = useState({ status: 'loading' });
  const [selectedTier, setSelectedTier] = useState('starter');
  const [startingTrial, setStartingTrial] = useState(false);
  
  // Abandoned checkouts state
  const [abandonedData, setAbandonedData] = useState({
    abandonments: [],
    funnel: { step_1: 0, step_2: 0, step_3: 0 },
    bySource: [],
    recovery: { recovered: 0, contacted: 0, total: 0 },
    anomalies: [],
    total: 0
  });
  const [loadingAbandoned, setLoadingAbandoned] = useState(false);
  
  // Pixel configuration state
  const [pixels, setPixels] = useState({
    meta_pixel_id: '',
    tiktok_pixel_id: '',
    google_tag_id: ''
  });
  const [savingPixels, setSavingPixels] = useState(false);
  const [pixelSaveStatus, setPixelSaveStatus] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (storeId) {
      loadTraffic();
      if (activeTab === 'abandoned') {
        loadAbandoned();
      }
    }
  }, [timePeriod, storeId, activeTab]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAbandonedPopup && !e.target.closest('.abandoned-popup-container')) {
        setShowAbandonedPopup(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAbandonedPopup]);

  const loadAbandoned = async () => {
    if (!storeId) return;
    setLoadingAbandoned(true);
    try {
      const res = await pixelAPI.getAbandoned(storeId, timePeriod);
      setAbandonedData(res.data || {
        abandonments: [],
        funnel: { step_1: 0, step_2: 0, step_3: 0 },
        bySource: [],
        recovery: { recovered: 0, contacted: 0, total: 0 },
        anomalies: [],
        total: 0
      });
    } catch (error) {
      console.error('Failed to load abandoned data:', error);
    } finally {
      setLoadingAbandoned(false);
    }
  };

  const downloadAbandonedCSV = () => {
    const headers = ['Date', 'Product', 'Quantity', 'Amount', 'Step', 'Name', 'Phone', 'Location', 'Source', 'Device', 'Time Spent'];
    const rows = abandonedData.abandonments.map(a => [
      new Date(a.created_at).toLocaleDateString(),
      a.product_name || '-',
      a.quantity || 1,
      a.total_amount || 0,
      `Step ${a.step_reached}`,
      a.customer_name || '-',
      a.customer_phone || '-',
      a.customer_location || '-',
      a.utm_source || 'direct',
      a.device || '-',
      `${a.time_spent || 0}s`
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `abandoned-checkouts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openWhatsApp = (phone, productName) => {
    const message = encodeURIComponent(`Hi! I noticed you were interested in "${productName}". Can I help you complete your order?`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  // Handle tab click with paywall check
  const handleTabClick = (key, isPremium) => {
    if (isPremium && key === 'abandoned') {
      // Check if user has access
      // Check if user has access (from backend canAccess flag)
      if (!abandonedFeatureAccess.canAccess && abandonedFeatureAccess.status !== 'loading') {
        setShowPaywall(true);
        return;
      }
    }
    setActiveTab(key);
  };

  // Start free trial - now uses backend API
  const startFreeTrial = async () => {
    setStartingTrial(true);
    try {
      const response = await subscriptionsAPI.startTrial('abandoned_checkouts');
      if (response.data.success) {
        setAbandonedFeatureAccess({
          status: 'trial',
          canAccess: true,
          trialEndsAt: response.data.trialEndsAt,
          daysRemaining: response.data.daysRemaining
        });
        setShowPaywall(false);
        setActiveTab('abandoned');
      }
    } catch (error) {
      console.error('Failed to start trial:', error);
      // Fallback to allow access anyway (graceful degradation)
      setAbandonedFeatureAccess({ status: 'trial', canAccess: true });
      setShowPaywall(false);
      setActiveTab('abandoned');
    } finally {
      setStartingTrial(false);
    }
  };

  // Get trial days remaining
  const getTrialDaysRemaining = () => {
    if (abandonedFeatureAccess.daysRemaining) return abandonedFeatureAccess.daysRemaining;
    if (abandonedFeatureAccess.status !== 'trial' || !abandonedFeatureAccess.trialEndsAt) return 0;
    const diff = new Date(abandonedFeatureAccess.trialEndsAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Load subscription status from backend
  const loadSubscriptionStatus = async () => {
    try {
      const response = await subscriptionsAPI.getStatus('abandoned_checkouts');
      setAbandonedFeatureAccess(response.data);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
      // Fallback: allow access (graceful degradation for new users)
      setAbandonedFeatureAccess({ status: 'none', canAccess: false, trialAvailable: true });
    }
  };

  const loadData = async () => {
    try {
      const settingsRes = await settingsAPI.getAll();
      const store = settingsRes.data;
      const slug = store?.slug;
      const id = store?.id;
      const config = store?.config || {};
      
      setStoreConfig(config);
      
      // Load saved pixel IDs
      if (config.pixels) {
        setPixels({
          meta_pixel_id: config.pixels.meta_pixel_id || '',
          tiktok_pixel_id: config.pixels.tiktok_pixel_id || '',
          google_tag_id: config.pixels.google_tag_id || ''
        });
      }
      
      if (id) {
        setStoreId(id);
        try {
          const trafficRes = await pixelAPI.getStats(id, timePeriod);
          setTraffic(trafficRes.data || { total: 0, sources: [], funnel: {} });
        } catch (e) { /* Stats not available yet */ }
      }
      
      if (slug) {
        setStoreSlug(slug);
        const baseUrl = import.meta.env.VITE_STORE_URL || 'https://jariecommstore.netlify.app';
        setStoreUrl(`${baseUrl}/?store=${slug}`);
      }
      
      // Load subscription status for abandoned checkouts feature
      await loadSubscriptionStatus();
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTraffic = async () => {
    try {
      const trafficRes = await pixelAPI.getStats(storeId, timePeriod);
      setTraffic(trafficRes.data || { total: 0, sources: [], funnel: {} });
    } catch (error) {
      console.error('Failed to load traffic:', error);
    }
  };

  const savePixels = async () => {
    setSavingPixels(true);
    setPixelSaveStatus(null);
    
    try {
      await settingsAPI.update({
        ...storeConfig,
        pixels: {
          meta_pixel_id: pixels.meta_pixel_id.trim(),
          tiktok_pixel_id: pixels.tiktok_pixel_id.trim(),
          google_tag_id: pixels.google_tag_id.trim()
        }
      });
      
      setPixelSaveStatus('success');
      setTimeout(() => {
        setShowPixelModal(false);
        setPixelSaveStatus(null);
      }, 1500);
    } catch (error) {
      console.error('Failed to save pixels:', error);
      setPixelSaveStatus('error');
    } finally {
      setSavingPixels(false);
    }
  };

  const copyLink = (idx, url) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(idx);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const generateCustomLink = () => {
    if (!customUtm.source) return storeUrl;
    let url = `${storeUrl}&utm_source=${customUtm.source}`;
    if (customUtm.medium) url += `&utm_medium=${customUtm.medium}`;
    if (customUtm.campaign) url += `&utm_campaign=${customUtm.campaign}`;
    return url;
  };

  // Check if any pixels are configured
  const hasPixelsConfigured = pixels.meta_pixel_id || pixels.tiktok_pixel_id || pixels.google_tag_id;
  
  // Calculate conversion metrics from funnel
  const funnel = traffic.funnel || {};
  const checkoutsStarted = (funnel.checkout_start || 0) + (funnel.initiate_checkout || 0);
  const purchases = funnel.purchase || 0;
  const abandonedCheckouts = Math.max(0, checkoutsStarted - purchases);
  const conversionRate = traffic.total > 0 ? ((purchases / traffic.total) * 100).toFixed(1) : '0.0';
  const abandonmentRate = checkoutsStarted > 0 ? ((abandonedCheckouts / checkoutsStarted) * 100).toFixed(1) : '0.0';

  const utmLinks = [
    { platform: 'Instagram Bio', source: 'instagram', medium: 'bio', emoji: '📸', desc: 'Link in your bio' },
    { platform: 'Instagram Story', source: 'instagram', medium: 'story', emoji: '📱', desc: 'Swipe up links' },
    { platform: 'Instagram Ad', source: 'instagram', medium: 'ad', emoji: '💰', desc: 'Paid promotions' },
    { platform: 'WhatsApp Status', source: 'whatsapp', medium: 'status', emoji: '💬', desc: 'Status updates' },
    { platform: 'WhatsApp Chat', source: 'whatsapp', medium: 'chat', emoji: '📲', desc: 'Direct messages' },
    { platform: 'Facebook Post', source: 'facebook', medium: 'post', emoji: '👍', desc: 'Organic posts' },
    { platform: 'Facebook Ad', source: 'facebook', medium: 'ad', emoji: '💵', desc: 'Paid ads' },
    { platform: 'TikTok Bio', source: 'tiktok', medium: 'bio', emoji: '🎵', desc: 'Profile link' },
    { platform: 'TikTok Ad', source: 'tiktok', medium: 'ad', emoji: '🎬', desc: 'Promoted content' },
    { platform: 'Google Ad', source: 'google', medium: 'cpc', emoji: '🔍', desc: 'Search ads' },
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading ads data...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Floating gradient background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '-10%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Marketing</h1>
          <p style={styles.subtitle}>Track conversions and optimize your campaigns</p>
        </div>
        <button onClick={() => setShowPixelModal(true)} style={styles.pixelSetupBtn}>
          <Settings size={18} />
          {hasPixelsConfigured ? 'Pixel Settings' : 'Setup Pixels'}
          {hasPixelsConfigured && <span style={styles.pixelDot}></span>}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        {[
          { key: 'overview', label: 'Overview', icon: TrendingUp },
          { key: 'abandoned', label: 'Abandoned Checkouts', icon: XCircle, premium: true },
          { key: 'utm', label: 'UTM Links', icon: Link2 },
        ].map(({ key, label, icon: Icon, premium }) => (
          <button
            key={key}
            onClick={() => handleTabClick(key, premium)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === key ? styles.tabBtnActive : {})
            }}
          >
            <Icon size={16} />
            {label}
            {premium && !abandonedFeatureAccess.canAccess && abandonedFeatureAccess.status !== 'loading' && <Lock size={12} style={{ marginLeft: 4, opacity: 0.6 }} />}
          </button>
        ))}
      </div>

      {/* Pixel Status Banner */}
      {!hasPixelsConfigured && (
        <div style={styles.setupBanner} className="glass-card">
          <AlertCircle size={20} style={{ color: '#f59e0b' }} />
          <div style={styles.setupBannerText}>
            <p style={styles.setupBannerTitle}>Connect your ad pixels to track conversions</p>
            <p style={styles.setupBannerDesc}>Add your Meta, TikTok, or Google pixel IDs to automatically track purchases from your ads.</p>
          </div>
          <button onClick={() => setShowPixelModal(true)} style={styles.setupBannerBtn}>
            Setup Now
          </button>
        </div>
      )}

      {/* Time Period Filter */}
      <div style={styles.filterRow}>
        <div style={styles.periodSelector}>
          {[
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
            { key: 'quarter', label: 'Quarter' },
            { key: 'year', label: 'Year' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimePeriod(key)}
              style={{
                ...styles.periodBtn,
                ...(timePeriod === key ? styles.periodBtnActive : {})
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards - Conversion Focused with floating gradients */}
          <div style={{ position: 'relative' }}>
            {/* Floating gradient accents */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '10%',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
              filter: 'blur(20px)'
            }} />
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '5%',
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
              filter: 'blur(15px)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '30%',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
              filter: 'blur(15px)'
            }} />
            
          <div style={{ ...styles.statsGrid, position: 'relative', zIndex: 1 }}>
            <div className="glass-card stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
                <Users size={22} />
              </div>
              <div>
                <p className="stat-label">Total Visitors</p>
                <p className="stat-value">{traffic.total?.toLocaleString() || 0}</p>
              </div>
            </div>
            
            <div className="glass-card stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }}>
                <ShoppingCart size={22} />
          </div>
          <div>
            <p className="stat-label">Checkouts Started</p>
            <p className="stat-value">{checkoutsStarted.toLocaleString()}</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="stat-label">Purchases</p>
            <p className="stat-value">{purchases.toLocaleString()}</p>
            <p className="stat-change" style={{ color: '#22c55e' }}>{conversionRate}% CR</p>
          </div>
        </div>

        <div 
          className="glass-card stat-card abandoned-popup-container" 
          style={{ 
            cursor: 'pointer', 
            position: 'relative',
            zIndex: showAbandonedPopup ? 9999 : 1
          }}
          onClick={() => setShowAbandonedPopup(!showAbandonedPopup)}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <XCircle size={22} />
          </div>
          <div>
            <p className="stat-label">Abandoned</p>
            <p className="stat-value">{abandonedCheckouts.toLocaleString()}</p>
            <p className="stat-change" style={{ color: '#ef4444' }}>{abandonmentRate}%</p>
          </div>
          
          {/* Glassmorphic Popup */}
          {showAbandonedPopup && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '12px',
                width: '340px',
                padding: '24px',
                background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.95) 0%, rgba(30, 25, 40, 0.98) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
                zIndex: 9999
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-30%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', position: 'relative' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '14px', 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)'
                }}>
                  <XCircle size={24} color="white" />
                </div>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                    {abandonedCheckouts} Lost Sales
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: '500' }}>
                    This {timePeriod}
                  </p>
                </div>
              </div>
              
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '20px', position: 'relative' }}>
                Recover <span style={{ color: '#22c55e', fontWeight: '600' }}>10-15%</span> of abandoned carts with personalized WhatsApp follow-ups. See exactly who dropped off and why.
              </p>
              
              <button
                onClick={() => {
                  setShowAbandonedPopup(false);
                  handleTabClick('abandoned', true);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.4)';
                }}
              >
                View Abandoned Checkouts
                {!abandonedFeatureAccess.canAccess && abandonedFeatureAccess.status !== 'loading' && (
                  <span style={{ 
                    padding: '3px 8px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '6px', 
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    PRO
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Conversion Funnel */}
      <div className="glass-card" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Conversion Funnel</h2>
        </div>
        
        <div style={styles.funnelContainer}>
          {[
            { key: 'page_view', label: 'Visitors', value: traffic.total || 0 },
            { key: 'product_view', label: 'Product Views', value: funnel.product_view || 0 },
            { key: 'add_to_cart', label: 'Add to Cart', value: funnel.add_to_cart || 0 },
            { key: 'checkout_start', label: 'Checkout', value: checkoutsStarted },
            { key: 'purchase', label: 'Purchase', value: purchases }
          ].map((step, idx, arr) => {
            const maxValue = arr[0].value || 1;
            const percentage = maxValue > 0 ? Math.round((step.value / maxValue) * 100) : 0;
            const dropOff = idx > 0 && arr[idx-1].value > 0 
              ? Math.round(((arr[idx-1].value - step.value) / arr[idx-1].value) * 100)
              : 0;
            
            return (
              <div key={step.key} style={styles.funnelStep}>
                <div style={styles.funnelLabel}>
                  <span style={styles.funnelStepName}>{step.label}</span>
                  <span style={styles.funnelStepValue}>{step.value.toLocaleString()}</span>
                </div>
                <div style={styles.funnelBarContainer}>
                  <div style={{ ...styles.funnelBar, width: `${percentage}%` }} />
                </div>
                {idx > 0 && dropOff > 0 && (
                  <span style={styles.funnelDropOff}>-{dropOff}%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Traffic Sources with Conversion Rate */}
      <div className="glass-card" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Traffic Sources</h2>
        </div>
        
        {traffic.sources && traffic.sources.length > 0 ? (
          <div style={styles.sourcesList}>
            {traffic.sources.map((source, idx) => {
              const percentage = traffic.total > 0 ? Math.round((source.visitors / traffic.total) * 100) : 0;
              return (
                <div key={idx} style={styles.sourceRow}>
                  <div style={styles.sourceInfo}>
                    <span style={styles.sourceName}>
                      {source.source 
                        ? source.source.charAt(0).toUpperCase() + source.source.slice(1) 
                        : 'Direct'}
                    </span>
                    <span style={styles.sourceCount}>{source.visitors?.toLocaleString()}</span>
                  </div>
                  <div style={styles.sourceBarContainer}>
                    <div style={{ ...styles.sourceBar, width: `${percentage}%` }} />
                  </div>
                  <span style={styles.sourcePercent}>{percentage}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No traffic data yet</p>
            <p style={styles.emptyHint}>Share your store links below to start tracking visitors!</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* UTM LINKS TAB */}
      {activeTab === 'utm' && (
      <div className="glass-card" style={styles.section}>
        <div 
          style={styles.sectionHeaderClickable}
          onClick={() => setShowUtmSection(!showUtmSection)}
        >
          <div>
            <h2 style={styles.sectionTitle}>📢 Share Your Store</h2>
            <p style={styles.sectionSubtitle}>Copy trackable links for each platform</p>
          </div>
          {showUtmSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {showUtmSection && (
          <>
            {!storeUrl ? (
              <div style={styles.setupNotice}>
                <AlertCircle size={20} />
                <div>
                  <p style={styles.setupTitle}>Store URL not configured</p>
                  <p style={styles.setupDesc}>Go to Settings → Store to set up your store slug first.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Quick Links Grid */}
                <div style={styles.utmGrid}>
                  {utmLinks.map((link, idx) => {
                    const fullUrl = `${storeUrl}&utm_source=${link.source}&utm_medium=${link.medium}`;
                    const isCopied = copiedLink === idx;
                    return (
                      <div key={idx} style={styles.utmCard} className="glass-card">
                        <div style={styles.utmCardHeader}>
                          <span style={styles.utmEmoji}>{link.emoji}</span>
                          <div>
                            <p style={styles.utmPlatform}>{link.platform}</p>
                            <p style={styles.utmDesc}>{link.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyLink(idx, fullUrl)}
                          style={{
                            ...styles.copyBtn,
                            ...(isCopied ? styles.copyBtnCopied : {})
                          }}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          {isCopied ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Custom UTM Builder */}
                <div style={styles.customUtmSection}>
                  <h3 style={styles.customUtmTitle}>
                    <Link2 size={18} />
                    Custom Campaign Link
                  </h3>
                  <div style={styles.customUtmForm}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>Source *</label>
                      <input
                        type="text"
                        placeholder="e.g., newsletter, influencer"
                        value={customUtm.source}
                        onChange={(e) => setCustomUtm({...customUtm, source: e.target.value})}
                        style={styles.input}
                        className="dashboard-input"
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>Medium</label>
                      <input
                        type="text"
                        placeholder="e.g., email, referral"
                        value={customUtm.medium}
                        onChange={(e) => setCustomUtm({...customUtm, medium: e.target.value})}
                        style={styles.input}
                        className="dashboard-input"
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>Campaign</label>
                      <input
                        type="text"
                        placeholder="e.g., january_sale"
                        value={customUtm.campaign}
                        onChange={(e) => setCustomUtm({...customUtm, campaign: e.target.value})}
                        style={styles.input}
                        className="dashboard-input"
                      />
                    </div>
                  </div>
                  {customUtm.source && (
                    <div style={styles.generatedLink}>
                      <p style={styles.generatedLinkLabel}>Your Link:</p>
                      <div style={styles.generatedLinkBox}>
                        <code style={styles.generatedLinkCode}>{generateCustomLink()}</code>
                        <button
                          onClick={() => copyLink('custom', generateCustomLink())}
                          style={{
                            ...styles.copyBtnSmall,
                            ...(copiedLink === 'custom' ? styles.copyBtnCopied : {})
                          }}
                        >
                          {copiedLink === 'custom' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
      )}

      {/* ABANDONED CHECKOUTS TAB */}
      {activeTab === 'abandoned' && (
        <div>
          {/* Abandonment Funnel */}
          <div style={styles.abandonedGrid}>
            <div className="glass-card" style={styles.funnelCard}>
              <h3 style={styles.cardTitle}>Where They Abandoned</h3>
              <div style={styles.abandonFunnel}>
                {[
                  { step: 1, label: 'Review Order', color: '#06b6d4' },
                  { step: 2, label: 'Delivery Details', color: '#f59e0b' },
                  { step: 3, label: 'Payment', color: '#ef4444' }
                ].map(({ step, label, color }) => {
                  const count = abandonedData.funnel?.[`step_${step}`] || 0;
                  const total = abandonedData.total || 1;
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={step} style={styles.abandonStep}>
                      <div style={styles.abandonStepHeader}>
                        <span style={{ ...styles.abandonStepDot, background: color }}>{step}</span>
                        <span style={styles.abandonStepLabel}>{label}</span>
                      </div>
                      <div style={styles.abandonBarContainer}>
                        <div style={{ ...styles.abandonBar, width: `${percentage}%`, background: color }} />
                      </div>
                      <span style={styles.abandonCount}>{count} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Anomaly Alerts */}
            <div className="glass-card" style={styles.anomalyCard}>
              <h3 style={styles.cardTitle}>⚠️ Insights & Alerts</h3>
              {abandonedData.anomalies?.length > 0 ? (
                <div style={styles.anomalyList}>
                  {abandonedData.anomalies.map((anomaly, idx) => (
                    <div key={idx} style={{
                      ...styles.anomalyItem,
                      borderLeftColor: anomaly.type === 'error' ? '#ef4444' : anomaly.type === 'warning' ? '#f59e0b' : '#06b6d4'
                    }}>
                      <p style={styles.anomalyTitle}>{anomaly.title}</p>
                      <p style={styles.anomalyMsg}>{anomaly.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noAnomalies}>
                  <CheckCircle size={24} style={{ color: '#22c55e' }} />
                  <p>No issues detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Abandoned Checkouts */}
          <div className="glass-card" style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Abandoned Checkouts</h2>
              <button onClick={downloadAbandonedCSV} style={styles.downloadBtn}>
                <Download size={16} />
                Download CSV
              </button>
            </div>

            {loadingAbandoned ? (
              <div style={styles.loadingInline}>Loading...</div>
            ) : abandonedData.abandonments?.length > 0 ? (
              <div style={styles.abandonedTable}>
                <div style={styles.tableHeader}>
                  <span style={styles.thProduct}>Product</span>
                  <span style={styles.thStep}>Step</span>
                  <span style={styles.thData}>Data Captured</span>
                  <span style={styles.thTime}>Time</span>
                  <span style={styles.thSource}>Source</span>
                  <span style={styles.thActions}>Actions</span>
                </div>
                {abandonedData.abandonments.slice(0, 20).map((item, idx) => (
                  <div key={idx} style={styles.tableRow}>
                    <span style={styles.tdProduct}>
                      <strong>{item.product_name || '-'}</strong>
                      <span style={styles.tdAmount}>KES {(item.total_amount || 0).toLocaleString()}</span>
                    </span>
                    <span style={{
                      ...styles.tdStep,
                      background: item.step_reached === 1 ? '#06b6d4' : item.step_reached === 2 ? '#f59e0b' : '#ef4444'
                    }}>
                      {item.step_reached}
                    </span>
                    <span style={styles.tdData}>
                      {item.customer_name || item.customer_phone ? (
                        <>
                          {item.customer_name && <span>{item.customer_name}</span>}
                          {item.customer_phone && <span style={styles.tdPhone}>{item.customer_phone}</span>}
                          {item.customer_location && <span style={styles.tdLocation}>{item.customer_location}</span>}
                        </>
                      ) : (
                        <span style={styles.tdNoData}>No data entered</span>
                      )}
                    </span>
                    <span style={styles.tdTime}>{item.time_spent ? `${item.time_spent}s` : '-'}</span>
                    <span style={styles.tdSource}>{item.utm_source || 'direct'}</span>
                    <span style={styles.tdActions}>
                      {item.customer_phone && (
                        <button 
                          onClick={() => openWhatsApp(item.customer_phone, item.product_name)}
                          style={styles.actionBtn}
                          title="Contact via WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <XCircle size={32} style={{ color: '#9ca3af', marginBottom: 12 }} />
                <p style={styles.emptyText}>No abandoned checkouts yet</p>
                <p style={styles.emptyHint}>When customers start but don't complete checkout, they'll appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pixel Setup Modal */}
      {showPixelModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPixelModal(false)}>
          <div style={styles.modal} className="glass-card" onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>⚙️ Ad Pixel Configuration</h2>
            <p style={styles.modalDesc}>
              Connect your ad platforms to track conversions and optimize your campaigns automatically.
            </p>
            
            {/* Meta Pixel */}
            <div style={styles.pixelInputSection}>
              <div style={styles.pixelHeader}>
                <span style={styles.pixelIcon}>📘</span>
                <div>
                  <p style={styles.pixelName}>Meta Pixel (Facebook & Instagram)</p>
                  <p style={styles.pixelHint}>Find in Meta Events Manager → Data Sources</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Enter your Pixel ID (e.g., 123456789012345)"
                value={pixels.meta_pixel_id}
                onChange={(e) => setPixels({...pixels, meta_pixel_id: e.target.value})}
                style={styles.pixelInput}
                className="dashboard-input"
              />
            </div>

            {/* TikTok Pixel */}
            <div style={styles.pixelInputSection}>
              <div style={styles.pixelHeader}>
                <span style={styles.pixelIcon}>🎵</span>
                <div>
                  <p style={styles.pixelName}>TikTok Pixel</p>
                  <p style={styles.pixelHint}>Find in TikTok Ads Manager → Assets → Events</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Enter your Pixel ID (e.g., ABCD1234)"
                value={pixels.tiktok_pixel_id}
                onChange={(e) => setPixels({...pixels, tiktok_pixel_id: e.target.value})}
                style={styles.pixelInput}
                className="dashboard-input"
              />
            </div>

            {/* Google Tag */}
            <div style={styles.pixelInputSection}>
              <div style={styles.pixelHeader}>
                <span style={styles.pixelIcon}>🔍</span>
                <div>
                  <p style={styles.pixelName}>Google Tag (GA4 / Google Ads)</p>
                  <p style={styles.pixelHint}>Find in Google Analytics → Admin → Data Streams</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Enter Measurement ID (e.g., G-XXXXXXXXXX)"
                value={pixels.google_tag_id}
                onChange={(e) => setPixels({...pixels, google_tag_id: e.target.value})}
                style={styles.pixelInput}
                className="dashboard-input"
              />
            </div>

            {/* Events Info */}
            <div style={styles.eventsInfo}>
              <p style={styles.eventsInfoTitle}>✅ Events we'll track automatically:</p>
              <ul style={styles.eventsList}>
                <li>Page views</li>
                <li>Product views</li>
                <li>Add to cart</li>
                <li>Checkout started</li>
                <li>Purchase completed</li>
              </ul>
            </div>

            {/* Save Status */}
            {pixelSaveStatus === 'success' && (
              <div style={styles.saveSuccess}>
                <CheckCircle size={18} />
                Pixels saved successfully!
              </div>
            )}
            {pixelSaveStatus === 'error' && (
              <div style={styles.saveError}>
                <AlertCircle size={18} />
                Failed to save. Please try again.
              </div>
            )}

            {/* Modal Actions */}
            <div style={styles.modalActions}>
              <button 
                onClick={() => setShowPixelModal(false)} 
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button 
                onClick={savePixels} 
                style={styles.modalSaveBtn}
                disabled={savingPixels}
              >
                {savingPixels ? 'Saving...' : '💾 Save Pixels'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <div style={styles.modalOverlay} onClick={() => setShowPaywall(false)}>
          <div style={{...styles.modal, maxWidth: '600px'}} className="glass-card" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowPaywall(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Zap size={28} color="white" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Unlock Abandoned Cart Recovery
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {abandonedData.total > 0 
                  ? `You had ${abandonedData.total} abandoned checkouts this period. Recover 10-15% of lost sales with WhatsApp follow-ups.`
                  : 'See exactly where customers drop off and recover lost sales with WhatsApp follow-ups.'}
              </p>
            </div>

            {/* Feature List */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>What you get:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['Funnel visualization', 'Customer contact info', 'WhatsApp follow-up', 'CSV export', 'Smart insights', 'Recovery tracking'].map(feature => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={16} color="#22c55e" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Tiers */}
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>After 30-day free trial:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { key: 'starter', name: 'Starter', price: 300, orders: '0-50 orders/mo' },
                { key: 'growth', name: 'Growth', price: 700, orders: '51-200 orders/mo' },
                { key: 'pro', name: 'Pro', price: 1500, orders: '200+ orders/mo' }
              ].map(tier => (
                <div 
                  key={tier.key}
                  onClick={() => setSelectedTier(tier.key)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedTier === tier.key ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    background: selectedTier === tier.key ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{tier.name}</p>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-color)', marginBottom: '4px' }}>KES {tier.price}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tier.orders}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button 
              onClick={startFreeTrial}
              disabled={startingTrial}
              style={{
                width: '100%',
                padding: '16px',
                background: startingTrial ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                border: 'none',
                borderRadius: '12px',
                color: startingTrial ? 'var(--text-muted)' : 'white',
                fontSize: '16px',
                fontWeight: '700',
                cursor: startingTrial ? 'not-allowed' : 'pointer',
                boxShadow: startingTrial ? 'none' : '0 4px 16px rgba(139, 92, 246, 0.3)'
              }}
            >
              {startingTrial ? 'Starting Trial...' : '🎁 Start 30-Day Free Trial'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      )}

      {/* Trial Banner */}
      {abandonedFeatureAccess.status === 'trial' && activeTab === 'abandoned' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🎁 Free trial: {getTrialDaysRemaining()} days remaining
          <button 
            onClick={() => setShowPaywall(true)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Upgrade Now
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  spinner: { width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { marginTop: '16px', color: 'var(--text-muted)' },
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', fontWeight: '400' },
  
  pixelSetupBtn: { 
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', 
    borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', 
    cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
  },
  pixelDot: {
    position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px',
    background: '#22c55e', borderRadius: '50%'
  },
  
  // Setup Banner
  setupBanner: {
    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
    marginBottom: '24px', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)'
  },
  setupBannerText: { flex: 1 },
  setupBannerTitle: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  setupBannerDesc: { fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' },
  setupBannerBtn: {
    padding: '10px 20px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  },
  
  filterRow: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', marginBottom: '24px' },
  periodSelector: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  periodBtn: { padding: '8px 16px', border: 'none', background: 'transparent', borderRadius: '20px', fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' },
  periodBtnActive: { background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-color)' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
  
  section: { padding: '20px', marginBottom: '24px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionHeaderClickable: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', cursor: 'pointer', color: 'var(--text-muted)' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  sectionSubtitle: { fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' },
  
  // Funnel
  funnelContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  funnelStep: { display: 'flex', alignItems: 'center', gap: '12px' },
  funnelLabel: { width: '140px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  funnelStepName: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
  funnelStepValue: { fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' },
  funnelBarContainer: { flex: 1, height: '24px', background: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden' },
  funnelBar: { height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a855f7)', borderRadius: '6px', transition: 'width 0.5s ease', minWidth: '4px' },
  funnelDropOff: { width: '50px', fontSize: '12px', fontWeight: '600', color: '#ef4444', textAlign: 'right' },
  
  // Sources
  sourcesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sourceRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  sourceInfo: { width: '120px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sourceName: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', textTransform: 'capitalize' },
  sourceCount: { fontSize: '13px', color: 'var(--text-muted)' },
  sourceBarContainer: { flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' },
  sourceBar: { height: '100%', background: 'linear-gradient(90deg, #06b6d4, #0891b2)', borderRadius: '4px', transition: 'width 0.3s ease' },
  sourcePercent: { width: '40px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'right' },
  
  emptyState: { textAlign: 'center', padding: '40px 20px' },
  emptyText: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' },
  emptyHint: { fontSize: '14px', color: 'var(--text-muted)' },
  
  // Setup Notice
  setupNotice: { display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '20px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', color: '#f59e0b' },
  setupTitle: { fontSize: '15px', fontWeight: '600', margin: 0 },
  setupDesc: { fontSize: '13px', margin: '4px 0 0 0', opacity: 0.9 },
  
  // UTM Links Grid
  utmGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' },
  utmCard: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  utmCardHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  utmEmoji: { fontSize: '28px' },
  utmPlatform: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  utmDesc: { fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' },
  copyBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' },
  copyBtnCopied: { background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' },
  copyBtnSmall: { padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  // Custom UTM Builder
  customUtmSection: { borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '8px' },
  customUtmTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' },
  customUtmForm: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '10px 14px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-primary)' },
  generatedLink: { marginTop: '16px' },
  generatedLinkLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' },
  generatedLinkBox: { display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' },
  generatedLinkCode: { flex: 1, fontSize: '12px', color: 'var(--text-secondary)', wordBreak: 'break-all', fontFamily: 'monospace' },
  
  // Modal
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '20px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' },
  modalDesc: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' },
  
  // Pixel Input Sections
  pixelInputSection: { marginBottom: '20px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' },
  pixelHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  pixelIcon: { fontSize: '28px' },
  pixelName: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  pixelHint: { fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' },
  pixelInput: { width: '100%', padding: '12px 14px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-primary)', boxSizing: 'border-box' },
  
  // Events Info
  eventsInfo: { padding: '16px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '12px', marginBottom: '20px' },
  eventsInfoTitle: { fontSize: '14px', fontWeight: '600', color: '#22c55e', margin: '0 0 8px 0' },
  eventsList: { margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' },
  
  // Save Status
  saveSuccess: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: '#22c55e', fontSize: '14px', fontWeight: '500', marginBottom: '16px' },
  saveError: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444', fontSize: '14px', fontWeight: '500', marginBottom: '16px' },
  
  // Modal Actions
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  modalCancelBtn: { padding: '12px 24px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  modalSaveBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' },
  
  // Tab Navigation
  tabNav: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' },
  tabBtnActive: { background: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'white' },
  
  // Abandoned Tab Styles
  abandonedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' },
  funnelCard: { padding: '20px' },
  anomalyCard: { padding: '20px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' },
  
  abandonFunnel: { display: 'flex', flexDirection: 'column', gap: '16px' },
  abandonStep: { display: 'flex', alignItems: 'center', gap: '12px' },
  abandonStepHeader: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' },
  abandonStepDot: { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700' },
  abandonStepLabel: { fontSize: '14px', color: 'var(--text-primary)' },
  abandonBarContainer: { flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' },
  abandonBar: { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' },
  abandonCount: { fontSize: '13px', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'right' },
  
  anomalyList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  anomalyItem: { padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid' },
  anomalyTitle: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' },
  anomalyMsg: { fontSize: '13px', color: 'var(--text-muted)', margin: 0 },
  noAnomalies: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' },
  
  downloadBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer' },
  loadingInline: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)' },
  
  abandonedTable: { display: 'flex', flexDirection: 'column', gap: '8px' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 60px 2fr 60px 80px 60px', gap: '12px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 60px 2fr 60px 80px 60px', gap: '12px', padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', alignItems: 'center' },
  
  thProduct: {}, thStep: { textAlign: 'center' }, thData: {}, thTime: { textAlign: 'center' }, thSource: {}, thActions: { textAlign: 'center' },
  
  tdProduct: { display: 'flex', flexDirection: 'column', gap: '2px' },
  tdAmount: { fontSize: '12px', color: 'var(--text-muted)' },
  tdStep: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700', margin: '0 auto' },
  tdData: { display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px' },
  tdPhone: { color: 'var(--text-muted)', fontSize: '12px' },
  tdLocation: { color: 'var(--text-muted)', fontSize: '11px' },
  tdNoData: { color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' },
  tdTime: { fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' },
  tdSource: { fontSize: '13px', color: 'var(--text-secondary)' },
  tdActions: { display: 'flex', justifyContent: 'center' },
  actionBtn: { padding: '6px', background: 'rgba(37, 211, 102, 0.1)', border: 'none', borderRadius: '6px', color: '#25d366', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
