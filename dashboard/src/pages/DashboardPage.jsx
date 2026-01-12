import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0 });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getOrderStats(), api.getProducts()])
      .then(([s, p]) => { setStats(s); setProducts(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  const statCards = [
    { label: 'Revenue', value: `KES ${Number(stats.revenue || 0).toLocaleString()}`, icon: DollarSign, color: '#ff9f0a' },
    { label: 'Orders', value: stats.total || 0, icon: ShoppingCart, color: '#bf5af2' },
    { label: 'Products', value: products.length, icon: Package, color: '#0a84ff' },
    { label: 'Pending', value: stats.pending || 0, icon: TrendingUp, color: '#30d158' }
  ];

  return (
    <div>
      <div className="jv2-page-header">
        <h1 className="jv2-page-title">Overview</h1>
        <p className="jv2-page-subtitle">Your store at a glance</p>
      </div>

      <div className="jv2-grid jv2-grid-4" style={{ marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <div key={i} className="jv2-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${s.color}20`, color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <s.icon size={24} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--jv2-text-muted)', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
      <div className="jv2-grid jv2-grid-3">
        <div className="jv2-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate('/products')}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Add Product</h3>
          <p style={{ fontSize: 13, color: 'var(--jv2-text-muted)' }}>Create a new listing</p>
        </div>
        <div className="jv2-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate('/orders')}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>View Orders</h3>
          <p style={{ fontSize: 13, color: 'var(--jv2-text-muted)' }}>Manage orders</p>
        </div>
        <div className="jv2-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate('/settings')}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Settings</h3>
          <p style={{ fontSize: 13, color: 'var(--jv2-text-muted)' }}>Customize store</p>
        </div>
      </div>
    </div>
  );
}
