import { useState, useEffect } from 'react';
import { pixelAPI, settingsAPI } from '../api/client';
import { TrendingUp, Users, DollarSign, Target, Copy, Check, ExternalLink, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdsPage() {
  const [storeId, setStoreId] = useState(null);
  const [storeUrl, setStoreUrl] = useState('');
  const [timePeriod, setTimePeriod] = useState('week');
  const [traffic, setTraffic] = useState({ total: 0, sources: [] });
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(null);
  const [showUtmSection, setShowUtmSection] = useState(true);

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
      const settings = settingsRes.data?.store || settingsRes.data?.settings || {};
      const slug = settings.slug || settings.subdomain;
      const id = settings.id;
      
      if (id) {
        setStoreId(id);
        const trafficRes = await pixelAPI.getStats(id, timePeriod);
        setTraffic(trafficRes.data || { total: 0, sources: [] });
      }
      
      if (slug) {
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

  const utmLinks = [
    { platform: 'Instagram Bio', source: 'instagram', medium: 'bio', emoji: '📸' },
    { platform: 'Instagram Story', source: 'instagram', medium: 'story', emoji: '📱' },
    { platform: 'Instagram Ad', source: 'instagram', medium: 'ad', emoji: '💰' },
    { platform: 'WhatsApp Status', source: 'whatsapp', medium: 'status', emoji: '💬' },
    { platform: 'WhatsApp Chat', source: 'whatsapp', medium: 'chat', emoji: '📲' },
    { platform: 'Facebook Post', source: 'facebook', medium: 'post', emoji: '👍' },
    { platform: 'Facebook Ad', source: 'facebook', medium: 'ad', emoji: '💵' },
    { platform: 'TikTok Bio', source: 'tiktok', medium: 'bio', emoji: '🎵' },
    { platform: 'TikTok Ad', source: 'tiktok', medium: 'ad', emoji: '🎬' },
    { platform: 'Google Ad', source: 'google', medium: 'cpc', emoji: '🔍' },
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
          <button style={styles.infoBtn}>
            <Info size={16} />
          </button>
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

      {/* UTM Links Section */}
      {storeUrl && (
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
            <div style={styles.utmGrid}>
              {utmLinks.map((link, idx) => {
                const fullUrl = `${storeUrl}&utm_source=${link.source}&utm_medium=${link.medium}`;
                const isCopied = copiedLink === idx;
                return (
                  <div key={idx} style={styles.utmRow}>
                    <span style={styles.utmEmoji}>{link.emoji}</span>
                    <span style={styles.utmPlatform}>{link.platform}</span>
                    <button
                      onClick={() => copyLink(idx, fullUrl)}
                      style={{
                        ...styles.copyBtn,
                        ...(isCopied ? styles.copyBtnCopied : {})
                      }}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Coming Soon - Campaign Management */}
      <div className="glass-card" style={styles.comingSoon}>
        <div style={styles.comingSoonIcon}>🚀</div>
        <h3 style={styles.comingSoonTitle}>Campaign Management Coming Soon</h3>
        <p style={styles.comingSoonText}>
          Connect your Meta & TikTok ad accounts to track ROAS, manage campaigns, and optimize your ad spend directly from here.
        </p>
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  spinner: { width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { marginTop: '16px', color: 'var(--text-muted)' },
  
  header: { marginBottom: '16px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', fontWeight: '400' },
  
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
  infoBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' },
  
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
  
  utmGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  utmRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: '10px' },
  utmEmoji: { fontSize: '20px' },
  utmPlatform: { flex: 1, fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
  copyBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' },
  copyBtnCopied: { background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' },
  
  comingSoon: { textAlign: 'center', padding: '40px 20px' },
  comingSoonIcon: { fontSize: '48px', marginBottom: '16px' },
  comingSoonTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' },
  comingSoonText: { fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' },
};
