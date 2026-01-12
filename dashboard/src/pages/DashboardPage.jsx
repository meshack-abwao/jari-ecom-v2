import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, productsAPI, settingsAPI } from '../api/client';
import { DollarSign, ShoppingCart, Package, TrendingUp, ExternalLink, Eye, Calendar, LayoutGrid } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total_orders: 0, pending_revenue: 0, total_revenue: 0 });
  const [products, setProducts] = useState([]);
  const [storeUrl, setStoreUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, productsRes, settingsRes] = await Promise.all([
        ordersAPI.getAll(),
        productsAPI.getAll(),
        settingsAPI.getAll()
      ]);
      
      const orders = ordersRes.data?.orders || [];
      const prods = productsRes.data?.products || [];
      const settings = settingsRes.data?.settings || {};
      
      // Calculate stats from orders
      const totalRevenue = orders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        
      const pendingRevenue = orders
        .filter(o => o.status === 'pending')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      
      setStats({
        total_revenue: totalRevenue,
        pending_revenue: pendingRevenue,
        total_orders: orders.length,
      });
      
      setProducts(prods);
      
      // Build store URL
      if (settings.subdomain) {
        const baseUrl = import.meta.env.VITE_STORE_URL || 'https://jariecommstore.netlify.app';
        setStoreUrl(`${baseUrl}/s/${settings.subdomain}`);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewProduct = (productId) => {
    if (storeUrl) {
      window.open(`${storeUrl}?product=${productId}`, '_blank');
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
      value: `KES ${parseInt(stats?.total_revenue || 0).toLocaleString()}`,
      icon: <DollarSign size={22} />,
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: <ShoppingCart size={22} />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    },
    {
      title: 'Active Products',
      value: products.filter(p => p.is_active).length,
      icon: <Package size={22} />,
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    },
    {
      title: 'Pending Revenue',
      value: `KES ${parseInt(stats?.pending_revenue || 0).toLocaleString()}`,
      icon: <TrendingUp size={22} />,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
  ];

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.subtitle}>Let's review what's working!</p>
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

      {/* Time Filter */}
      <div style={styles.filterContainer}>
        <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
        {['Today', 'Week', 'Month', 'All'].map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter.toLowerCase())}
            className={`filter-btn ${timeFilter === filter.toLowerCase() ? 'active' : ''}`}
          >
            {filter}
          </button>
        ))}
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
                <Eye size={16} /> View Collections
              </button>
            )}
          </div>
          <div style={styles.productsList}>
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="glass-card product-card">
                <div className="product-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={styles.productImg} />
                  ) : (
                    <div style={styles.productPlaceholder}>📸</div>
                  )}
                </div>
                <div style={styles.productInfo}>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">KES {parseInt(product.price).toLocaleString()}</p>
                  <div style={styles.productFooter}>
                    <span style={{
                      ...styles.productStatus,
                      background: product.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: product.is_active ? '#22c55e' : '#ef4444',
                    }}>
                      {product.is_active ? '● Live' : '● Draft'}
                    </span>
                    {storeUrl && (
                      <button onClick={() => viewProduct(product.id)} style={styles.viewProductBtn}>
                        <Eye size={14} /> View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
  
  filterContainer: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' },
  
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
