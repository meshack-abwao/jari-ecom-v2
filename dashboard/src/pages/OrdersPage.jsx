import { useState, useEffect } from 'react';
import { ordersAPI } from '../api/client';
import { Clock, CheckCircle, XCircle, DollarSign, Package, Truck } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data?.orders || []);
    } catch (error) { console.error('Failed to load orders:', error); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      await loadOrders();
    } catch (error) { alert('Failed to update order status'); }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: 'rgba(251, 191, 36, 0.15)', color: '#f59e0b', icon: <Clock size={14} /> },
      paid: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', icon: <DollarSign size={14} /> },
      processing: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', icon: <Package size={14} /> },
      shipped: { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', icon: <Truck size={14} /> },
      delivered: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: <CheckCircle size={14} /> },
      completed: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: <CheckCircle size={14} /> },
      cancelled: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: <XCircle size={14} /> },
    };
    return styles[status] || styles.pending;
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div><p>Loading orders...</p></div>;

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Orders</h1>
          <p style={styles.subtitle}>Manage and track your orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={styles.empty} className="glass-card">
          <div style={styles.emptyIcon}>📦</div>
          <h3 style={styles.emptyTitle}>No orders yet</h3>
          <p style={styles.emptyDesc}>Orders will appear here when customers make purchases</p>
        </div>
      ) : (
        <div style={styles.tableContainer} className="glass-card">
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Payment</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <tr key={order.id} style={styles.tableRow}>
                    <td style={styles.td}><span style={styles.orderId}>{order.order_number}</span></td>
                    <td style={styles.td}>
                      <div style={styles.productCell}>
                        {order.product_image && <img src={order.product_image} alt="" style={styles.productThumb} />}
                        <span>{order.product_name || 'Product'}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{order.customer_name}</td>
                    <td style={styles.td}>{order.customer_phone}</td>
                    <td style={styles.td}>{order.customer_location}</td>
                    <td style={styles.td}><span style={styles.amount}>KES {parseInt(order.total_amount).toLocaleString()}</span></td>
                    <td style={styles.td}><span style={styles.payment}>{(order.payment_method || 'N/A').toUpperCase()}</span></td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.color }}>
                        {statusStyle.icon} {order.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={styles.td}>
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} style={styles.statusSelect} className="dashboard-select">
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
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

const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' },
  spinner: { width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' },
  
  header: { marginBottom: '32px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)' },
  
  empty: { padding: '80px 40px', textAlign: 'center' },
  emptyIcon: { fontSize: '64px', marginBottom: '20px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' },
  emptyDesc: { fontSize: '14px', color: 'var(--text-muted)' },
  
  tableContainer: { padding: '0', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  tableHeader: { borderBottom: '1px solid var(--border-color)' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tableRow: { borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' },
  td: { padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' },
  orderId: { fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent-color)' },
  productCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  productThumb: { width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' },
  amount: { fontWeight: '600', color: 'var(--text-primary)' },
  payment: { fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' },
  statusSelect: { padding: '6px 10px', fontSize: '12px', borderRadius: '6px', minWidth: '100px' },
};
