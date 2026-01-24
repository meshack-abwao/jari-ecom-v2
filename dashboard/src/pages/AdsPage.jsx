import { useState, useEffect } from 'react';
import { pixelAPI, settingsAPI } from '../api/client';
import { TrendingUp, Users, Target, Copy, Check, ChevronDown, ChevronUp, Link2, Settings, AlertCircle, ShoppingCart, XCircle, CheckCircle } from 'lucide-react';

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
    }
  }, [timePeriod, storeId]);

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
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Ads Manager</h1>
          <p style={styles.subtitle}>Track conversions and optimize your campaigns</p>
        </div>
        <button onClick={() => setShowPixelModal(true)} style={styles.pixelSetupBtn}>
          <Settings size={18} />
          {hasPixelsConfigured ? 'Pixel Settings' : 'Setup Pixels'}
          {hasPixelsConfigured && <span style={styles.pixelDot}></span>}
        </button>
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

      {/* Stats Cards - Conversion Focused */}
      <div style={styles.statsGrid}>
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

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <XCircle size={22} />
          </div>
          <div>
            <p className="stat-label">Abandoned</p>
            <p className="stat-value">{abandonedCheckouts.toLocaleString()}</p>
            <p className="stat-change" style={{ color: '#ef4444' }}>{abandonmentRate}%</p>
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

      {/* UTM Links Generator */}
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
  
  // Setup Banner - Sleek inline style
  setupBanner: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
    marginBottom: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: '12px'
  },
  setupBannerText: { flex: 1 },
  setupBannerTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', margin: 0 },
  setupBannerDesc: { fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' },
  setupBannerBtn: {
    padding: '8px 16px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    whiteSpace: 'nowrap'
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
  
  // Funnel - THIN bars like traffic sources
  funnelContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  funnelStep: { display: 'flex', alignItems: 'center', gap: '12px' },
  funnelLabel: { width: '120px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  funnelStepName: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', textTransform: 'capitalize' },
  funnelStepValue: { fontSize: '13px', color: 'var(--text-muted)' },
  funnelBarContainer: { flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' },
  funnelBar: { height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a855f7)', borderRadius: '4px', transition: 'width 0.5s ease', minWidth: '4px' },
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
};
