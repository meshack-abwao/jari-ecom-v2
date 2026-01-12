import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const statusConfig = {
  pending: { color: '#ff9f0a', icon: Clock, label: 'Pending' },
  confirmed: { color: '#0a84ff', icon: CheckCircle, label: 'Confirmed' },
  processing: { color: '#bf5af2', icon: Clock, label: 'Processing' },
  shipped: { color: '#00d4ff', icon: Truck, label: 'Shipped' },
  delivered: { color: '#30d158', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: '#ff375f', icon: XCircle, label: 'Cancelled' }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = () => {
    api.getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    try {
      await api.updateOrder(id, { status });
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div className="jv2-page-header">
        <h1 className="jv2-page-title">Orders</h1>
        <p className="jv2-page-subtitle">Manage customer orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="jv2-card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h3 style={{ marginBottom: 8 }}>No orders yet</h3>
          <p style={{ color: 'var(--jv2-text-muted)' }}>Orders will appear here when customers make purchases</p>
        </div>
      ) : (
        <div className="jv2-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--jv2-border)' }}>
                <th style={thStyle}>Order</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const cfg = statusConfig[o.status] || statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--jv2-border)' }}>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--jv2-primary)' }}>
                        {o.order_number}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div>{o.customer?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--jv2-text-muted)' }}>{o.customer?.phone}</div>
                    </td>
                    <td style={tdStyle}>{o.product_name || 'N/A'}</td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700 }}>KES {Number(o.items?.[0]?.total || 0).toLocaleString()}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        background: `${cfg.color}20`,
                        color: cfg.color,
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        <Icon size={14} /> {cfg.label}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="jv2-input"
                        style={{ padding: '8px 12px', width: 'auto' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: 16,
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--jv2-text-muted)',
  textTransform: 'uppercase'
};

const tdStyle = {
  padding: 16,
  fontSize: 14
};
