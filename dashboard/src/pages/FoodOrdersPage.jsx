import { useState, useEffect } from 'react';
import { foodOrdersAPI } from '../api/client';

// ===========================================
// FOOD ORDERS PAGE - Visual Menu Template
// Kanban-style order management
// ===========================================

// Status configuration
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', bgColor: '#dbeafe' },
  preparing: { label: 'Preparing', color: '#8b5cf6', bgColor: '#ede9fe' },
  ready: { label: 'Ready', color: '#10b981', bgColor: '#d1fae5' },
  out_for_delivery: { label: 'Out for Delivery', color: '#06b6d4', bgColor: '#cffafe' },
  delivered: { label: 'Delivered', color: '#22c55e', bgColor: '#dcfce7' },
  picked_up: { label: 'Picked Up', color: '#22c55e', bgColor: '#dcfce7' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2' }
};

// Status flow for next action
const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: null // Depends on order type
};

export default function FoodOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('active'); // 'active', 'completed', 'all'
  
  // Fetch orders and stats
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        foodOrdersAPI.getAll(),
        foodOrdersAPI.getStats()
      ]);
      setOrders(ordersRes.data.orders || []);
      setStats(statsRes.data.stats || {});
    } catch (err) {
      console.error('Failed to fetch food orders:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await foodOrdersAPI.updateStatus(orderId, newStatus);
      fetchData(); // Refresh
      if (selectedOrder?.id === orderId) {
        const res = await foodOrdersAPI.getById(orderId);
        setSelectedOrder(res.data.order);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };
  
  // Filter orders by status groups
  const getOrdersByStatus = (statuses) => {
    return orders.filter(o => statuses.includes(o.status));
  };
  
  // Format price
  const formatPrice = (amount) => {
    return `KES ${(amount || 0).toLocaleString()}`;
  };
  
  // Format time ago
  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Styles
  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1600px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    statsRow: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '16px 20px',
      minWidth: '120px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1f2937'
    },
    kanban: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px',
      alignItems: 'start'
    },
    column: {
      background: '#f3f4f6',
      borderRadius: '12px',
      padding: '12px',
      minHeight: '400px'
    },
    columnHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      padding: '0 4px'
    },
    columnTitle: {
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    columnCount: {
      background: '#e5e7eb',
      borderRadius: '100px',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: '500'
    },
    orderCard: {
      background: 'white',
      borderRadius: '10px',
      padding: '14px',
      marginBottom: '10px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s'
    },
    orderNumber: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px'
    },
    orderCustomer: {
      fontSize: '13px',
      color: '#4b5563',
      marginBottom: '8px'
    },
    orderMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#6b7280'
    },
    orderType: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '100px',
      background: '#f3f4f6',
      fontSize: '11px'
    },
    orderTotal: {
      fontWeight: '600',
      color: '#1f2937'
    }
  };

  
  // Modal styles
  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      background: 'white',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: '1px solid #e5e7eb'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '600'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    modalBody: {
      padding: '24px'
    },
    section: {
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      marginBottom: '12px'
    },
    customerInfo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    infoLabel: {
      fontSize: '11px',
      color: '#9ca3af'
    },
    infoValue: {
      fontSize: '14px',
      color: '#1f2937'
    },
    itemsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    itemRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '8px'
    },
    itemName: {
      fontSize: '14px',
      fontWeight: '500'
    },
    itemExtras: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    itemPrice: {
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'right'
    },
    totals: {
      borderTop: '1px solid #e5e7eb',
      paddingTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px'
    },
    grandTotal: {
      fontWeight: '600',
      fontSize: '16px',
      paddingTop: '8px',
      borderTop: '1px solid #e5e7eb'
    },
    actionBtn: {
      width: '100%',
      padding: '14px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '16px'
    },
    primaryBtn: {
      background: '#2563eb',
      color: 'white'
    },
    secondaryBtn: {
      background: '#f3f4f6',
      color: '#374151'
    }
  };


  // Order Card Component
  const OrderCard = ({ order }) => (
    <div 
      style={styles.orderCard}
      onClick={() => setSelectedOrder(order)}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
    >
      <div style={styles.orderNumber}>{order.order_number}</div>
      <div style={styles.orderCustomer}>{order.customer_name || 'Guest'}</div>
      <div style={styles.orderMeta}>
        <span style={styles.orderType}>
          {order.order_type === 'delivery' ? '🚚' : '🏪'} 
          {order.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
        </span>
        <span>{(order.items || []).length} items</span>
      </div>
      <div style={{ ...styles.orderMeta, marginTop: '8px' }}>
        <span style={styles.orderTotal}>{formatPrice(order.total)}</span>
        <span>⏱️ {timeAgo(order.created_at)}</span>
      </div>
    </div>
  );
  
  // Kanban Column Component
  const KanbanColumn = ({ title, status, color, orders }) => (
    <div style={styles.column}>
      <div style={styles.columnHeader}>
        <span style={{ ...styles.columnTitle, color }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: color 
          }}></span>
          {title}
        </span>
        <span style={styles.columnCount}>{orders.length}</span>
      </div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
      {orders.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#9ca3af', 
          fontSize: '13px',
          padding: '40px 20px' 
        }}>
          No orders
        </div>
      )}
    </div>
  );


  // Order Detail Modal
  const OrderModal = ({ order, onClose }) => {
    if (!order) return null;
    
    const items = order.items || [];
    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const nextStatus = NEXT_STATUS[order.status];
    
    // For ready status, next depends on order type
    const getNextStatusForReady = () => {
      if (order.order_type === 'delivery') return 'out_for_delivery';
      return 'picked_up';
    };
    
    const finalNextStatus = order.status === 'ready' 
      ? getNextStatusForReady() 
      : nextStatus;
    
    return (
      <div style={modalStyles.overlay} onClick={onClose}>
        <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
          <div style={modalStyles.modalHeader}>
            <div>
              <div style={modalStyles.modalTitle}>Order {order.order_number}</div>
              <div style={{ 
                display: 'inline-block',
                marginTop: '8px',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: '500',
                background: statusConfig.bgColor,
                color: statusConfig.color
              }}>
                {statusConfig.label}
              </div>
            </div>
            <button style={modalStyles.closeBtn} onClick={onClose}>×</button>
          </div>
          
          <div style={modalStyles.modalBody}>
            {/* Customer Info */}
            <div style={modalStyles.section}>
              <div style={modalStyles.sectionTitle}>Customer</div>
              <div style={modalStyles.customerInfo}>
                <div style={modalStyles.infoItem}>
                  <span style={modalStyles.infoLabel}>Name</span>
                  <span style={modalStyles.infoValue}>{order.customer_name || 'Guest'}</span>
                </div>
                <div style={modalStyles.infoItem}>
                  <span style={modalStyles.infoLabel}>Phone</span>
                  <span style={modalStyles.infoValue}>{order.customer_phone || '-'}</span>
                </div>
                <div style={modalStyles.infoItem}>
                  <span style={modalStyles.infoLabel}>Order Type</span>
                  <span style={modalStyles.infoValue}>
                    {order.order_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                  </span>
                </div>
                {order.order_type === 'delivery' && (
                  <div style={modalStyles.infoItem}>
                    <span style={modalStyles.infoLabel}>Address</span>
                    <span style={modalStyles.infoValue}>{order.delivery_address || '-'}</span>
                  </div>
                )}
              </div>
              {order.delivery_instructions && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#fef3c7', borderRadius: '8px', fontSize: '13px' }}>
                  📝 {order.delivery_instructions}
                </div>
              )}
            </div>
            
            {/* Order Items */}
            <div style={modalStyles.section}>
              <div style={modalStyles.sectionTitle}>Items</div>
              <div style={modalStyles.itemsList}>
                {items.map((item, idx) => (
                  <div key={idx} style={modalStyles.itemRow}>
                    <div>
                      <div style={modalStyles.itemName}>
                        {item.quantity}× {item.productName}
                      </div>
                      {item.extras && item.extras.length > 0 && (
                        <div style={modalStyles.itemExtras}>
                          {item.extras.map((e, i) => `+ ${e.name}`).join(', ')}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div style={{ ...modalStyles.itemExtras, fontStyle: 'italic' }}>
                          "{item.specialInstructions}"
                        </div>
                      )}
                    </div>
                    <div style={modalStyles.itemPrice}>
                      {formatPrice(item.itemTotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Totals */}
            <div style={modalStyles.totals}>
              <div style={modalStyles.totalRow}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div style={modalStyles.totalRow}>
                  <span>Delivery Fee</span>
                  <span>{formatPrice(order.delivery_fee)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div style={{ ...modalStyles.totalRow, color: '#22c55e' }}>
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div style={{ ...modalStyles.totalRow, ...modalStyles.grandTotal }}>
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
            
            {/* Payment Status */}
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: order.payment_status === 'paid' ? '#dcfce7' : '#fef3c7',
              borderRadius: '8px',
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>{order.payment_method === 'mpesa' ? 'M-Pesa' : order.payment_method || 'Cash'}</span>
              <span style={{ fontWeight: '500' }}>
                {order.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
              </span>
            </div>
            
            {/* Action Buttons */}
            {finalNextStatus && order.status !== 'cancelled' && (
              <button 
                style={{ ...modalStyles.actionBtn, ...modalStyles.primaryBtn }}
                onClick={() => handleStatusUpdate(order.id, finalNextStatus)}
              >
                Mark as {STATUS_CONFIG[finalNextStatus]?.label}
              </button>
            )}
            
            {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'picked_up' && (
              <button 
                style={{ ...modalStyles.actionBtn, ...modalStyles.secondaryBtn, marginTop: '8px' }}
                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };


  // Main render
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          Loading food orders...
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          🍽️ Food Orders
        </h1>
        <button 
          onClick={fetchData}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: 'white',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          ↻ Refresh
        </button>
      </div>
      
      {/* Stats Row */}
      {stats && (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Today's Orders</div>
            <div style={styles.statValue}>{stats.total || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pending</div>
            <div style={{ ...styles.statValue, color: '#f59e0b' }}>{stats.pending || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Preparing</div>
            <div style={{ ...styles.statValue, color: '#8b5cf6' }}>{stats.preparing || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Completed</div>
            <div style={{ ...styles.statValue, color: '#22c55e' }}>{stats.completed || 0}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Revenue</div>
            <div style={styles.statValue}>{formatPrice(stats.revenue)}</div>
          </div>
        </div>
      )}
      
      {/* Kanban Board */}
      <div style={styles.kanban}>
        <KanbanColumn 
          title="Pending" 
          status="pending"
          color="#f59e0b"
          orders={getOrdersByStatus(['pending'])}
        />
        <KanbanColumn 
          title="Confirmed" 
          status="confirmed"
          color="#3b82f6"
          orders={getOrdersByStatus(['confirmed'])}
        />
        <KanbanColumn 
          title="Preparing" 
          status="preparing"
          color="#8b5cf6"
          orders={getOrdersByStatus(['preparing'])}
        />
        <KanbanColumn 
          title="Ready" 
          status="ready"
          color="#10b981"
          orders={getOrdersByStatus(['ready', 'out_for_delivery'])}
        />
      </div>
      
      {/* Completed Section */}
      {getOrdersByStatus(['delivered', 'picked_up']).length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#6b7280',
            marginBottom: '12px'
          }}>
            ✓ Completed Today ({getOrdersByStatus(['delivered', 'picked_up']).length})
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap' 
          }}>
            {getOrdersByStatus(['delivered', 'picked_up']).slice(0, 10).map(order => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                style={{
                  padding: '8px 12px',
                  background: '#dcfce7',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {order.order_number} ✓
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}
