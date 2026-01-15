import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, productsAPI, settingsAPI, pixelAPI } from '../api/client';
import { DollarSign, ShoppingCart, Package, TrendingUp, ExternalLink, Eye, Calendar, Clock, Users, ChevronDown, ChevronUp, Info, Copy, Check, Share2, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0, revenue: 0, pending_revenue: 0 });
  const [products, setProducts] = useState([]);
  const [storeUrl, setStoreUrl] = useState('');
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [traffic, setTraffic] = useState({ total: 0, sources: [] });
  const [trafficExpanded, setTrafficExpanded] = useState(false);
  const [timePeriod, setTimePeriod] = useState('all');
  const [shareExpanded, setShareExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [filteredStats, setFilteredStats] = useState({ total: 0, pending: 0, delivered: 0, revenue: 0, pending_revenue: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [topProductsView, setTopProductsView] = useState('orders'); // 'orders' or 'revenue'
  const [showAnalysis, setShowAnalysis] = useState(null); // which stat card analysis to show
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);
  
  // Reload stats when time period changes
  useEffect(() => {
    loadFilteredStats();
  }, [timePeriod]);

  const loadData = async () => {
    try {
      const [statsRes, productsRes, settingsRes] = await Promise.all([
        ordersAPI.getStats(timePeriod),
        productsAPI.getAll(),
        settingsAPI.getAll()
      ]);
      
      const statsData = statsRes.data || { total: 0, pending: 0, delivered: 0, revenue: 0, pending_revenue: 0 };
      setStats(statsData);
      setFilteredStats(statsData);
      setProducts(productsRes.data?.products || []);
      
      // Build store URL from settings - API returns store object directly
      const store = settingsRes.data;
      const slug = store?.slug;
      const id = store?.id;
      
      if (id) {
        setStoreId(id);
        // Load traffic stats
        try {
          const trafficRes = await pixelAPI.getStats(id, timePeriod);
          setTraffic(trafficRes.data || { total: 0, sources: [] });
        } catch (e) {
          console.log('Traffic stats not available yet');
        }
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
  
  const loadFilteredStats = async () => {
    try {
      const [statsRes, topProductsRes] = await Promise.all([
        ordersAPI.getStats(timePeriod),
        ordersAPI.getTopProducts(timePeriod)
      ]);
      setFilteredStats(statsRes.data || { total: 0, pending: 0, delivered: 0, revenue: 0, pending_revenue: 0 });
      setTopProducts(topProductsRes.data || []);
      
      // Also reload traffic for the period
      if (storeId) {
        const trafficRes = await pixelAPI.getStats(storeId, timePeriod);
        setTraffic(trafficRes.data || { total: 0, sources: [] });
      }
    } catch (error) {
      console.error('Failed to load filtered stats:', error);
    }
  };

  const viewProduct = (productId) => {
    if (storeUrl) {
      window.open(`${storeUrl}&product=${productId}`, '_blank');
    }
  };

  const viewStore = () => {
    if (storeUrl) {
      window.open(storeUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  // Generate analysis based on stats
  const getAnalysis = (key) => {
    const ordersDown = filteredStats.total < (stats.total * 0.8);
    const hasPending = filteredStats.pending > 0;
    const lowTraffic = traffic.total < 100;
    
    const analyses = {
      revenue: {
        title: '💰 Revenue Analysis',
        points: [
          filteredStats.revenue > 0 ? `Strong revenue of KES ${Number(filteredStats.revenue).toLocaleString()}` : 'No revenue yet this period',
          hasPending ? `${filteredStats.pending} pending orders worth KES ${Number(filteredStats.pending_revenue).toLocaleString()}` : null,
          lowTraffic ? '💡 Tip: Share your store links to drive more traffic' : null,
        ].filter(Boolean)
      },
      orders: {
        title: '📦 Orders Analysis',
        points: [
          filteredStats.total > 0 ? `${filteredStats.total} orders received this period` : 'No orders yet this period',
          ordersDown ? '⚠️ Orders seem lower than usual' : null,
          filteredStats.delivered > 0 ? `${filteredStats.delivered} orders completed (${Math.round((filteredStats.delivered/filteredStats.total)*100)}% completion rate)` : null,
          ordersDown ? '💡 Tip: Try running a promotion or boosting your ads' : null,
        ].filter(Boolean)
      },
      completed: {
        title: '✅ Completion Analysis',
        points: [
          filteredStats.delivered > 0 ? `${filteredStats.delivered} orders delivered successfully` : 'No completed orders yet',
          filteredStats.total > 0 ? `Completion rate: ${Math.round((filteredStats.delivered/filteredStats.total)*100)}%` : null,
          (filteredStats.total - filteredStats.delivered - filteredStats.pending) > 0 ? `${filteredStats.total - filteredStats.delivered - filteredStats.pending} orders cancelled` : null,
        ].filter(Boolean)
      },
      pending: {
        title: '⏳ Pending Analysis',
        points: [
          hasPending ? `${filteredStats.pending} orders awaiting action` : 'No pending orders - great!',
          hasPending ? `Potential revenue: KES ${Number(filteredStats.pending_revenue).toLocaleString()}` : null,
          hasPending ? '💡 Tip: Process pending orders quickly to improve customer satisfaction' : null,
        ].filter(Boolean)
      }
    };
    return analyses[key];
  };

  const statCards = [
    {
      key: 'revenue',
      title: 'Total Revenue',
      value: `KES ${Number(filteredStats.revenue || 0).toLocaleString()}`,
      icon: <DollarSign size={22} />,
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    },
    {
      key: 'orders',
      title: 'Total Orders',
      value: filteredStats.total || 0,
      icon: <ShoppingCart size={22} />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    },
    {
      key: 'completed',
      title: 'Completed',
      value: filteredStats.delivered || 0,
      icon: <Package size={22} />,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      key: 'pending',
      title: 'Pending Revenue',
      value: `KES ${Number(filteredStats.pending_revenue || 0).toLocaleString()}`,
      icon: <Clock size={22} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
  ];

  // Calculate conversion rate (orders / visitors)
  const conversionRate = traffic.total > 0 
    ? ((filteredStats.total / traffic.total) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.subtitle}>Your store performance at a glance</p>
        </div>
        <div style={styles.headerActions}>
          {storeUrl && (
            <button onClick={viewStore} className="btn btn-primary" style={styles.viewStoreBtn}>
              <ExternalLink size={18} />
              <span>View Live Store</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Time Period Filter - Below header like v1 */}
      <div style={styles.filterRow}>
        <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
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

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="glass-card stat-card" 
            style={{ 
              position: 'relative', 
              overflow: 'visible',
              zIndex: showAnalysis === card.key ? 999 : 1 
            }}
          >
            <div className="stat-icon" style={{ background: card.gradient }}>
              {card.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p className="stat-label">{card.title}</p>
              <p className="stat-value">{card.value}</p>
            </div>
            <button 
              onClick={() => setShowAnalysis(showAnalysis === card.key ? null : card.key)}
              style={styles.infoIconBtn}
            >
              <Info size={16} />
            </button>
            {/* Analysis Popup */}
            {showAnalysis === card.key && (
              <div style={styles.analysisPopup}>
                <h4 style={styles.analysisTitle}>{getAnalysis(card.key).title}</h4>
                <ul style={styles.analysisList}>
                  {getAnalysis(card.key).points.map((point, i) => (
                    <li key={i} style={styles.analysisPoint}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        
        {/* Traffic Card - Expandable */}
        <div className="glass-card stat-card" style={{ cursor: 'pointer' }} onClick={() => setTrafficExpanded(!trafficExpanded)}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
            <Users size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <p className="stat-label">Traffic</p>
            <p className="stat-value">{traffic.total?.toLocaleString() || 0}</p>
          </div>
          <div style={{ color: '#9ca3af' }}>
            {trafficExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
            <TrendingUp size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <p className="stat-label">Conversion</p>
            <p className="stat-value">{conversionRate}%</p>
          </div>
        </div>
      </div>
      
      {/* Traffic Breakdown - Expandable */}
      {trafficExpanded && (
        <div className="glass-card" style={styles.trafficBreakdown}>
          <h3 style={styles.trafficTitle}>Traffic Sources</h3>
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
            <p style={styles.noData}>No traffic data yet. Share your store link to start tracking!</p>
          )}
        </div>
      )}

      {/* Share Your Store - UTM Links */}
      {storeUrl && (
        <div className="glass-card" style={styles.shareSection}>
          <div 
            style={styles.shareHeader} 
            onClick={() => setShareExpanded(!shareExpanded)}
          >
            <div style={styles.shareHeaderLeft}>
              <Share2 size={20} style={{ color: 'var(--accent-color)' }} />
              <div>
                <h3 style={styles.shareTitle}>Share Your Store</h3>
                <p style={styles.shareSubtitle}>Copy trackable links for each platform</p>
              </div>
            </div>
            <div style={{ color: '#9ca3af' }}>
              {shareExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          
          {shareExpanded && (
            <div style={styles.shareLinksList}>
              {[
                { platform: 'Instagram Bio', source: 'instagram', medium: 'bio', emoji: '📸' },
                { platform: 'Instagram Story', source: 'instagram', medium: 'story', emoji: '📱' },
                { platform: 'WhatsApp Status', source: 'whatsapp', medium: 'status', emoji: '💬' },
                { platform: 'WhatsApp Chat', source: 'whatsapp', medium: 'chat', emoji: '📲' },
                { platform: 'Facebook Post', source: 'facebook', medium: 'post', emoji: '👍' },
                { platform: 'TikTok Bio', source: 'tiktok', medium: 'bio', emoji: '🎵' },
                { platform: 'Twitter/X', source: 'twitter', medium: 'post', emoji: '🐦' },
              ].map((link, idx) => {
                const fullUrl = `${storeUrl}&utm_source=${link.source}&utm_medium=${link.medium}`;
                const isCopied = copiedLink === idx;
                
                return (
                  <div key={idx} style={styles.shareLinkRow}>
                    <span style={styles.shareLinkEmoji}>{link.emoji}</span>
                    <span style={styles.shareLinkPlatform}>{link.platform}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(fullUrl);
                        setCopiedLink(idx);
                        setTimeout(() => setCopiedLink(null), 2000);
                      }}
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

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <div onClick={() => navigate('/products')} className="glass-card action-card">
            <div className="action-icon">📦</div>
            <h3 className="action-title">Add Product</h3>
            <p className="action-desc">Start selling something new</p>
          </div>
          <div onClick={() => navigate('/orders')} className="glass-card action-card">
            <div className="action-icon">📋</div>
            <h3 className="action-title">View Orders</h3>
            <p className="action-desc">Manage your orders</p>
          </div>
          <div onClick={() => navigate('/ads')} className="glass-card action-card">
            <div className="action-icon">📢</div>
            <h3 className="action-title">Boost Ads</h3>
            <p className="action-desc">Track & share your store</p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Top Products</h2>
            <div style={styles.toggleGroup}>
              <button 
                onClick={() => setTopProductsView('orders')}
                style={{ ...styles.toggleBtn, ...(topProductsView === 'orders' ? styles.toggleBtnActive : {}) }}
              >
                Orders
              </button>
              <button 
                onClick={() => setTopProductsView('revenue')}
                style={{ ...styles.toggleBtn, ...(topProductsView === 'revenue' ? styles.toggleBtnActive : {}) }}
              >
                Revenue
              </button>
            </div>
          </div>
          <div className="glass-card" style={styles.topProductsList}>
            {[...topProducts]
              .sort((a, b) => topProductsView === 'orders' 
                ? (b.order_count || 0) - (a.order_count || 0)
                : (b.total_revenue || 0) - (a.total_revenue || 0)
              )
              .map((product, idx) => (
                <div key={product.id} style={styles.topProductRow}>
                  <span style={styles.topProductRank}>{idx + 1}</span>
                  <div style={styles.topProductImg}>
                    {product.image ? (
                      <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div style={styles.topProductInfo}>
                    <p style={styles.topProductName}>{product.name || 'Product'}</p>
                    <p style={styles.topProductMeta}>
                      {topProductsView === 'orders' 
                        ? `${product.order_count || 0} orders`
                        : `KES ${Number(product.total_revenue || 0).toLocaleString()}`
                      }
                    </p>
                  </div>
                  <div style={styles.topProductValue}>
                    {topProductsView === 'orders' 
                      ? <span style={styles.orderBadge}>{product.order_count || 0}</span>
                      : <span style={styles.revenueBadge}>KES {Number(product.total_revenue || 0).toLocaleString()}</span>
                    }
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Recent Products */}
      {products.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Products</h2>
            {products.length > 1 && storeUrl && (
              <button onClick={viewStore} style={styles.viewAllBtn}>
                <Eye size={16} /> View Store
              </button>
            )}
          </div>
          <div style={styles.productsList}>
            {products.slice(0, 4).map((product) => {
              const data = product.data || {};
              const media = product.media || {};
              const imageUrl = media.images?.[0] || null;
              
              return (
                <div key={product.id} className="glass-card product-card">
                  <div className="product-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={data.name} style={styles.productImg} />
                    ) : (
                      <div style={styles.productPlaceholder}>📸</div>
                    )}
                  </div>
                  <div style={styles.productInfo}>
                    <h3 className="product-name">{data.name || 'Product'}</h3>
                    <p className="product-price">KES {Number(data.price || 0).toLocaleString()}</p>
                    <div style={styles.productFooter}>
                      <span style={{
                        ...styles.productStatus,
                        background: product.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: product.status === 'active' ? '#22c55e' : '#ef4444',
                      }}>
                        {product.status === 'active' ? '● Live' : '● Draft'}
                      </span>
                      {storeUrl && (
                        <button onClick={() => viewProduct(product.id)} style={styles.viewProductBtn}>
                          <Eye size={14} /> View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <div style={styles.emptyState} className="glass-card">
          <div style={styles.emptyIcon}>🚀</div>
          <h3 style={styles.emptyTitle}>Ready to launch?</h3>
          <p style={styles.emptyDesc}>Add your first product to start selling</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ marginTop: 16 }}>
            Add First Product
          </button>
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
  headerActions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  viewStoreBtn: { display: 'flex', alignItems: 'center', gap: '8px' },
  
  // Filter row - below header like v1 with breathing room
  filterRow: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', marginBottom: '32px' },
  periodSelector: { display: 'flex', gap: '6px' },
  periodBtn: { padding: '8px 16px', border: 'none', background: 'transparent', borderRadius: '20px', fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' },
  periodBtnActive: { background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-color)' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px', position: 'relative', zIndex: 1 },
  
  // Info icon and analysis popup
  infoIconBtn: { position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '50%', transition: 'all 0.2s', opacity: 0.6 },
  analysisPopup: { position: 'absolute', top: 'calc(100% + 8px)', left: '-8px', right: '-8px', padding: '16px', zIndex: 9999, borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.4)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' },
  analysisTitle: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' },
  analysisList: { listStyle: 'none', padding: 0, margin: 0 },
  analysisPoint: { fontSize: '13px', color: 'var(--text-secondary)', padding: '6px 0', borderBottom: '1px solid var(--border-color)', lineHeight: '1.5' },
  
  // Traffic breakdown
  trafficBreakdown: { padding: '20px', marginBottom: '24px' },
  trafficTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' },
  sourcesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sourceRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  sourceInfo: { width: '120px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sourceName: { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', textTransform: 'capitalize' },
  sourceCount: { fontSize: '13px', color: 'var(--text-muted)' },
  sourceBarContainer: { flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' },
  sourceBar: { height: '100%', background: 'linear-gradient(90deg, #06b6d4, #0891b2)', borderRadius: '4px', transition: 'width 0.3s ease' },
  sourcePercent: { width: '40px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'right' },
  noData: { fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' },
  
  section: { marginBottom: '40px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' },
  viewAllBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--accent-light)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--accent-color)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  
  productsList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' },
  productImg: { width: '100%', height: '100%', objectFit: 'cover' },
  productPlaceholder: { width: '100%', height: '100%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  productInfo: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 },
  productFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  productStatus: { display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' },
  viewProductBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'var(--icon-btn-bg)', border: '1px solid var(--icon-btn-border)', borderRadius: '6px', color: 'var(--icon-btn-color)', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
  
  emptyState: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: '56px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' },
  emptyDesc: { fontSize: '14px', color: 'var(--text-muted)' },
  
  // Share section
  shareSection: { padding: '0', marginBottom: '24px', overflow: 'hidden' },
  shareHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', transition: 'background 0.2s' },
  shareHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  shareTitle: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  shareSubtitle: { fontSize: '12px', color: 'var(--text-muted)', margin: 0 },
  shareLinksList: { padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  shareLinkRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px' },
  shareLinkEmoji: { fontSize: '18px' },
  shareLinkPlatform: { flex: 1, fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' },
  copyBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' },
  copyBtnCopied: { background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' },
  
  // Top Products
  toggleGroup: { display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px' },
  toggleBtn: { padding: '6px 12px', border: 'none', background: 'transparent', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' },
  toggleBtnActive: { background: 'var(--bg-primary)', color: 'var(--text-primary)' },
  topProductsList: { padding: '12px' },
  topProductRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', transition: 'background 0.2s' },
  topProductRank: { width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' },
  topProductImg: { width: '44px', height: '44px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  topProductInfo: { flex: 1, minWidth: 0 },
  topProductName: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  topProductMeta: { fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' },
  topProductValue: { textAlign: 'right' },
  orderBadge: { display: 'inline-block', padding: '4px 10px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '12px', fontSize: '13px', fontWeight: '600', color: '#8b5cf6' },
  revenueBadge: { display: 'inline-block', padding: '4px 10px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '12px', fontSize: '13px', fontWeight: '600', color: '#22c55e' },
};
