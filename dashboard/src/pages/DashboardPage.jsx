import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, productsAPI, settingsAPI } from '../api/client';
import { DollarSign, ShoppingCart, Package, TrendingUp, ExternalLink, Eye, Calendar, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0, revenue: 0, pending_revenue: 0 });
  const [products, setProducts] = useState([]);
  const [storeUrl, setStoreUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // Set dynamic greeting
    const hour = new Date().getHours();
    const greetings = {
      morning: ["Good morning! Ready to grow?", "Rise and shine! Let's sell.", "Morning! Your store awaits."],
      afternoon: ["Good afternoon! How's business?", "Afternoon check-in time!", "Hey there! Sales looking good?"],
      evening: ["Good evening! Nice work today.", "Evening! Let's review the day.", "Winding down? Great progress!"]
    };
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const options = greetings[period];
    setGreeting(options[Math.floor(Math.random() * options.length)]);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, productsRes, settingsRes] = await Promise.all([
        ordersAPI.getStats(),
        productsAPI.getAll(),
        settingsAPI.getAll()
      ]);
      
      setStats(statsRes.data || { total: 0, pending: 0, delivered: 0, revenue: 0, pending_revenue: 0 });
      setProducts(productsRes.data?.products || []);
      
      // Build store URL from settings
      const settings = settingsRes.data?.store || settingsRes.data?.settings || {};
      const slug = settings.slug || settings.subdomain;
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

  const statCards = [
    {
      title: 'Total Revenue',
      value: `KES ${Number(stats.revenue || 0).toLocaleString()}`,
      icon: <DollarSign size={22} />,
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    },
    {
      title: 'Total Orders',
      value: stats.total || 0,
      icon: <ShoppingCart size={22} />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    },
    {
      title: 'Completed',
      value: stats.delivered || 0,
      icon: <Package size={22} />,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      title: 'Pending Revenue',
      value: `KES ${Number(stats.pending_revenue || 0).toLocaleString()}`,
      icon: <Clock size={22} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
  ];

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.subtitle}>{greeting}</p>
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

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} className="glass-card stat-card">
            <div className="stat-icon" style={{ background: card.gradient }}>
              {card.icon}
            </div>
            <div>
              <p className="stat-label">{card.title}</p>
              <p className="stat-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

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
          <div onClick={() => navigate('/templates')} className="glass-card action-card">
            <div className="action-icon">🎨</div>
            <h3 className="action-title">Templates</h3>
            <p className="action-desc">Choose page layouts</p>
          </div>
        </div>
      </div>

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
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', fontWeight: '400' },
  headerActions: { display: 'flex', gap: '12px' },
  viewStoreBtn: { display: 'flex', alignItems: 'center', gap: '8px' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' },
  
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
};
