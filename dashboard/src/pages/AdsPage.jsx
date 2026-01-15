import { useState, useEffect } from 'react';
import { pixelAPI, settingsAPI } from '../api/client';
import { TrendingUp, Users, DollarSign, Target, Copy, Check, ExternalLink, Info, ChevronDown, ChevronUp, Link2, Zap, AlertCircle } from 'lucide-react';

export default function AdsPage() {
  const [storeId, setStoreId] = useState(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [timePeriod, setTimePeriod] = useState('week');
  const [traffic, setTraffic] = useState({ total: 0, sources: [] });
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(null);
  const [showUtmSection, setShowUtmSection] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [customUtm, setCustomUtm] = useState({ source: '', medium: '', campaign: '' });

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
      // The API returns the store object directly
      const store = settingsRes.data;
      const slug = store?.slug;
      const id = store?.id;
      
      console.log('AdsPage loadData - store:', store, 'slug:', slug, 'id:', id);
      
      if (id) {
        setStoreId(id);
        try {
          const trafficRes = await pixelAPI.getStats(id, timePeriod);
          setTraffic(trafficRes.data || { total: 0, sources: [] });
        } catch (e) {
          console.log('Traffic stats not available yet');
        }
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
      setTraffic(trafficRes.data || { total: 0, sources: [] });
    } catch (error) {
      console.error('Failed to load traffic:', error);
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
          <p style={styles.subtitle}>Track traffic sources and manage your campaigns</p>
        </div>
        <button onClick={() => setShowConnectModal(true)} style={styles.connectBtn}>
          <Zap size={18} />
          Connect Ad Account
        </button>
      </div>

      {/* Time Period Filter */}
      <div style={styles.filterRow}>
        <div style={styles.periodSelector}>
          {[
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
            { key: 'all', label: 'All' }
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

      {/* Stats Cards */}
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
            <Target size={22} />
          </div>
          <div>
            <p className="stat-label">Top Source</p>
            <p className="stat-value" style={{ textTransform: 'capitalize' }}>
              {traffic.sources?.[0]?.utm_source || 'N/A'}
            </p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="stat-label">Sources Tracked</p>
            <p className="stat-value">{traffic.sources?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Traffic Sources Breakdown */}
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
                    <span style={styles.sourceName}>{source.utm_source || 'Direct'}</span>
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

      {/* Connect Ad Account Modal */}
      {showConnectModal && (
        <div style={styles.modalOverlay} onClick={() => setShowConnectModal(false)}>
          <div style={styles.modal} className="glass-card" onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Connect Ad Account</h2>
            <p style={styles.modalDesc}>Link your advertising accounts to track campaign performance and ROAS directly in your dashboard.</p>
            
            <div style={styles.platformList}>
              <div style={styles.platformItem}>
                <div style={styles.platformIcon}>📘</div>
                <div style={styles.platformInfo}>
                  <p style={styles.platformName}>Meta (Facebook & Instagram)</p>
                  <p style={styles.platformStatus}>Track ad spend, conversions, and ROAS</p>
                </div>
                <span style={styles.comingSoonBadge}>Coming Soon</span>
              </div>
              
              <div style={styles.platformItem}>
                <div style={styles.platformIcon}>🎵</div>
                <div style={styles.platformInfo}>
                  <p style={styles.platformName}>TikTok Ads</p>
                  <p style={styles.platformStatus}>Connect your TikTok Business Center</p>
                </div>
                <span style={styles.comingSoonBadge}>Coming Soon</span>
              </div>
              
              <div style={styles.platformItem}>
                <div style={styles.platformIcon}>🔍</div>
                <div style={styles.platformInfo}>
                  <p style={styles.platformName}>Google Ads</p>
                  <p style={styles.platformStatus}>Search and display ad tracking</p>
                </div>
                <span style={styles.comingSoonBadge}>Coming Soon</span>
              </div>
            </div>

            <div style={styles.modalNote}>
              <AlertCircle size={18} />
              <p>We're working on direct ad platform integrations. For now, use the UTM links above to track your campaigns!</p>
            </div>

            <button onClick={() => setShowConnectModal(false)} style={styles.modalCloseBtn}>
              Got it
            </button>
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
  connectBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' },
  
  filterRow: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', marginBottom: '32px' },
  periodSelector: { display: 'flex', gap: '6px' },
  periodBtn: { padding: '8px 16px', border: 'none', background: 'transparent', borderRadius: '20px', fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' },
  periodBtnActive: { background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-color)' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  
  section: { padding: '20px', marginBottom: '24px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionHeaderClickable: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', cursor: 'pointer', color: 'var(--text-muted)' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  sectionSubtitle: { fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' },
  
  sourcesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sourceRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  sourceInfo: { width: '120px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sourceName: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', textTransform: 'capitalize' },
  sourceCount: { fontSize: '13px', color: 'var(--text-muted)' },
  sourceBarContainer: { flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' },
  sourceBar: { height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a855f7)', borderRadius: '4px', transition: 'width 0.3s ease' },
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
  modal: { width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '20px' },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' },
  modalDesc: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' },
  platformList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  platformItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px' },
  platformIcon: { fontSize: '28px' },
  platformInfo: { flex: 1 },
  platformName: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  platformStatus: { fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' },
  comingSoonBadge: { padding: '4px 10px', background: 'rgba(251, 191, 36, 0.15)', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#f59e0b' },
  modalNote: { display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', marginBottom: '20px', color: '#3b82f6', fontSize: '13px', lineHeight: '1.5' },
  modalCloseBtn: { width: '100%', padding: '14px', background: 'var(--accent-color)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
};
