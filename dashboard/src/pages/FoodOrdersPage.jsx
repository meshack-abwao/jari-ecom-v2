import { useState, useEffect, useCallback } from 'react';
import { foodOrdersAPI } from '../api/client';
import { 
  UtensilsCrossed, Clock, Bell, DollarSign, 
  ChevronDown, X, Check, Phone, MapPin,
  RefreshCw, Truck, Package, AlertCircle, Download
} from 'lucide-react';

// ===========================================
// FOOD ORDERS PAGE - Visual Menu Template
// Unified design matching BookingsPage
// ===========================================

// Status configuration
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#3b82f6', bgColor: '#dbeafe', icon: Check },
  preparing: { label: 'Preparing', color: '#8b5cf6', bgColor: '#ede9fe', icon: UtensilsCrossed },
  ready: { label: 'Ready', color: '#10b981', bgColor: '#d1fae5', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: '#06b6d4', bgColor: '#cffafe', icon: Truck },
  delivered: { label: 'Delivered', color: '#22c55e', bgColor: '#dcfce7', icon: Check },
  picked_up: { label: 'Picked Up', color: '#22c55e', bgColor: '#dcfce7', icon: Check },
  cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2', icon: X }
};

// Status flow for next action
const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: null // Depends on order type (delivery vs pickup)
};

export default function FoodOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ today: 0, pending: 0, preparing: 0, completed: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'today', 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch orders and stats
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        foodOrdersAPI.getAll(),
        foodOrdersAPI.getStats()
      ]);
      setOrders(ordersRes.data.orders || []);
      setStats(statsRes.data.stats || { today: 0, pending: 0, preparing: 0, completed: 0, revenue: 0 });
    } catch (err) {
      console.error('Failed to fetch food orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status
  const handleStatusUpdate = async (orderId, newStatus, extraData = {}) => {
    try {
      // Get table number and estimated time from inputs if available
      const tableInput = document.getElementById('orderTableNumber');
      const timeInput = document.getElementById('orderEstimatedTime');
      
      const updateData = {
        status: newStatus,
        ...extraData
      };
      
      if (tableInput?.value) {
        updateData.table_number = tableInput.value;
      }
      if (timeInput?.value) {
        updateData.estimated_minutes = parseInt(timeInput.value, 10);
      }
      
      await foodOrdersAPI.updateStatus(orderId, newStatus, updateData);
      fetchData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ 
          ...prev, 
          status: newStatus,
          table_number: updateData.table_number || prev.table_number,
          estimated_minutes: updateData.estimated_minutes || prev.estimated_minutes
        }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  // Format price
  const formatPrice = (amount) => `KES ${(amount || 0).toLocaleString()}`;

  // Format time ago
  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Filter orders
  const getFilteredOrders = () => {
    let filtered = [...orders];
    
    // View filter (today, pending, etc.)
    if (viewFilter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(o => new Date(o.created_at).toDateString() === today);
    } else if (viewFilter === 'pending') {
      filtered = filtered.filter(o => o.status === 'pending');
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q) ||
        o.order_number?.toLowerCase().includes(q)
      );
    }
    
    // Sort by created_at desc
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  
  // Counts
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => ['delivered', 'picked_up'].includes(o.status));
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());

  // ==================== STYLES ====================
  const styles = {
    container: {
      padding: isMobile ? '16px' : '24px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    titleSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    title: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '700',
      color: 'var(--text-primary, #111)',
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: 'var(--text-muted, #6b7280)',
      margin: '4px 0 0',
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '10px',
      border: '1px solid var(--border-color, #e5e7eb)',
      background: 'var(--bg-secondary, white)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--text-primary, #111)',
      transition: 'all 0.2s',
    },
    
    // Stats Grid - Matching Bookings
    statsGrid: {
      display: 'grid',
      gap: '16px',
      marginBottom: '24px',
    },
    statCard: {
      background: 'var(--bg-secondary, white)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      border: '1px solid var(--border-color, #e5e7eb)',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    statCardActive: {
      borderColor: 'var(--accent-color, #8b5cf6)',
      boxShadow: '0 0 0 1px var(--accent-color, #8b5cf6)',
    },
    statCardAlert: {
      animation: 'pulse 2s infinite',
    },
    statIconBox: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    statInfo: {
      flex: 1,
      minWidth: 0,
    },
    statLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: 'var(--text-muted, #6b7280)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'var(--text-primary, #111)',
      lineHeight: 1.2,
    },
    
    // Filter Pills
    filterRow: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    filterPill: {
      padding: '8px 16px',
      borderRadius: '100px',
      border: '1px solid var(--border-color, #e5e7eb)',
      background: 'var(--bg-secondary, white)',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: 'var(--text-primary, #111)',
    },
    filterPillActive: {
      background: 'var(--accent-color, #8b5cf6)',
      borderColor: 'var(--accent-color, #8b5cf6)',
      color: 'white',
    },
    filterCount: {
      background: 'rgba(255,255,255,0.15)',
      padding: '2px 8px',
      borderRadius: '100px',
      fontSize: '11px',
    },
    
    // Search
    searchInput: {
      padding: '10px 16px',
      borderRadius: '10px',
      border: '1px solid var(--border-color, #e5e7eb)',
      background: 'var(--bg-secondary, white)',
      fontSize: '14px',
      width: isMobile ? '100%' : '280px',
      color: 'var(--text-primary, #111)',
    },
    
    // Needs Attention Section
    attentionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '16px',
    },
    attentionBadge: {
      background: '#fef3c7',
      color: '#d97706',
      padding: '4px 12px',
      borderRadius: '100px',
      fontSize: '13px',
      fontWeight: '600',
    },
    
    // Order Card
    orderCard: {
      background: 'var(--bg-secondary, white)',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '12px',
      border: '1px solid var(--border-color, #e5e7eb)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    orderDateBox: {
      width: '56px',
      height: '64px',
      borderRadius: '12px',
      background: 'var(--accent-color, #8b5cf6)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      flexShrink: 0,
    },
    orderDateDay: {
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase',
      opacity: 0.9,
    },
    orderDateNum: {
      fontSize: '22px',
      fontWeight: '700',
      lineHeight: 1,
    },
    orderDateMonth: {
      fontSize: '10px',
      fontWeight: '500',
      textTransform: 'uppercase',
      opacity: 0.9,
    },
    orderInfo: {
      flex: 1,
      minWidth: 0,
    },
    orderName: {
      fontSize: '15px',
      fontWeight: '600',
      color: 'var(--text-primary, #111)',
      marginBottom: '4px',
    },
    orderMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '13px',
      color: 'var(--text-muted, #6b7280)',
    },
    orderMetaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    orderActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    statusBadge: {
      padding: '6px 14px',
      borderRadius: '100px',
      fontSize: '12px',
      fontWeight: '600',
    },
    expandBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      color: 'var(--text-muted, #6b7280)',
      transition: 'all 0.2s',
    },
    
    // Empty State
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: 'var(--text-muted, #6b7280)',
    },
    emptyIcon: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: 'var(--bg-tertiary, #f3f4f6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
    },
    
    // Modal
    modalOverlay: {
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
      padding: '20px',
    },
    modal: {
      background: 'var(--bg-primary, white)',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '560px',
      maxHeight: '90vh',
      overflow: 'auto',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: '1px solid var(--border-color, #e5e7eb)',
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--text-primary, #111)',
    },
    closeBtn: {
      background: 'var(--bg-tertiary, #f3f4f6)',
      border: 'none',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'var(--text-muted, #6b7280)',
    },
    modalBody: {
      padding: '24px',
    },
    modalSection: {
      marginBottom: '24px',
    },
    modalSectionTitle: {
      fontSize: '13px',
      fontWeight: '600',
      color: 'var(--text-muted, #6b7280)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '12px',
    },
    modalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-color, #f3f4f6)',
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      padding: '20px 24px',
      borderTop: '1px solid var(--border-color, #e5e7eb)',
    },
    actionBtn: {
      flex: 1,
      padding: '12px 20px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
  };


  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted, #6b7280)' }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  // ==================== ORDER CARD COMPONENT ====================
  const OrderCard = ({ order }) => {
    const date = new Date(order.created_at);
    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const itemCount = order.items?.length || 0;
    
    return (
      <div 
        style={styles.orderCard}
        onClick={() => setSelectedOrder(order)}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color, #8b5cf6)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color, #e5e7eb)'}
      >
        <div style={{
          ...styles.orderDateBox,
          background: order.order_type === 'pickup' 
            ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        }}>
          <div style={styles.orderDateDay}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
          <div style={styles.orderDateNum}>{date.getDate()}</div>
          <div style={styles.orderDateMonth}>{date.toLocaleDateString('en-US', { month: 'short' })}</div>
        </div>
        
        <div style={styles.orderInfo}>
          <div style={styles.orderName}>{order.customer_name || 'Guest'}</div>
          <div style={styles.orderMeta}>
            <span style={styles.orderMetaItem}>
              {order.order_type === 'pickup' ? <Package size={14} /> : <Truck size={14} />}
              {order.order_type === 'pickup' ? 'Pickup' : 'Delivery'}
            </span>
            <span style={styles.orderMetaItem}>
              <Phone size={14} />
              {order.customer_phone || '-'}
            </span>
            <span style={{ fontWeight: '600', color: 'var(--text-primary, #111)' }}>
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
        
        <div style={styles.orderActions}>
          <span style={{
            ...styles.statusBadge,
            background: statusConfig.bgColor,
            color: statusConfig.color
          }}>
            {statusConfig.label}
          </span>
          <button style={styles.expandBtn}>
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    );
  };

  // ==================== ORDER DETAIL MODAL ====================
  const OrderDetailModal = () => {
    if (!selectedOrder) return null;
    
    const statusConfig = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending;
    const nextStatus = NEXT_STATUS[selectedOrder.status];
    const finalStatus = selectedOrder.order_type === 'pickup' ? 'picked_up' : 'delivered';
    
    return (
      <div style={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div>
              <div style={styles.modalTitle}>Order {selectedOrder.order_number}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {new Date(selectedOrder.created_at).toLocaleString()}
              </div>
            </div>
            <button style={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
              <X size={20} />
            </button>
          </div>
          
          <div style={styles.modalBody}>
            {/* Customer Info */}
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Customer</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{selectedOrder.customer_name || 'Guest'}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} /> {selectedOrder.customer_phone || '-'}
                  </div>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: statusConfig.bgColor,
                  color: statusConfig.color
                }}>
                  {statusConfig.label}
                </span>
              </div>
              {selectedOrder.delivery_address && (
                <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> 
                  {selectedOrder.delivery_address}
                </div>
              )}
            </div>
            
            {/* Order Items */}
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Items</div>
              {(selectedOrder.items || []).map((item, idx) => (
                <div key={idx} style={{ 
                  padding: '12px 0', 
                  borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--border-color, #f3f4f6)' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500' }}>{item.quantity}× {item.productName || item.product_name}</span>
                    <span style={{ fontWeight: '600' }}>{formatPrice(item.total || item.itemTotal)}</span>
                  </div>
                  {item.extras && item.extras.length > 0 && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '16px' }}>
                      {item.extras.map((extra, i) => (
                        <div key={i}>+ {extra.name} ({formatPrice(extra.price)})</div>
                      ))}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <div style={{ fontSize: '13px', color: '#f59e0b', marginTop: '4px' }}>
                      📝 {item.specialInstructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div style={styles.modalSection}>
              <div style={styles.modalRow}>
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.delivery_fee > 0 && (
                <div style={styles.modalRow}>
                  <span>Delivery Fee</span>
                  <span>{formatPrice(selectedOrder.delivery_fee)}</span>
                </div>
              )}
              <div style={{ ...styles.modalRow, borderBottom: 'none', fontWeight: '700', fontSize: '18px' }}>
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
            
            {/* Payment */}
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Payment</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedOrder.payment_method === 'mpesa' ? 'M-Pesa' : selectedOrder.payment_method || 'Cash'}</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: selectedOrder.payment_status === 'paid' ? '#dcfce7' : '#fef3c7',
                  color: selectedOrder.payment_status === 'paid' ? '#16a34a' : '#d97706'
                }}>
                  {selectedOrder.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                </span>
              </div>
              {selectedOrder.mpesa_receipt && (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Receipt: {selectedOrder.mpesa_receipt}
                </div>
              )}
            </div>
            
            {/* Table/Location & Estimated Time (editable when pending/confirmed) */}
            {['pending', 'confirmed'].includes(selectedOrder.status) && (
              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>Order Details</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {selectedOrder.order_type === 'pickup' || selectedOrder.order_type === 'dine_in' ? 'Table #' : 'Location Note'}
                    </label>
                    <input
                      type="text"
                      placeholder={selectedOrder.order_type === 'pickup' ? 'e.g. 5' : 'e.g. Gate'}
                      defaultValue={selectedOrder.table_number || ''}
                      id="orderTableNumber"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #e5e7eb)',
                        background: 'var(--bg-tertiary, #f9fafb)',
                        fontSize: '14px',
                        color: 'var(--text-primary, #111)'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Est. Time (mins)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 20"
                      defaultValue={selectedOrder.estimated_minutes || ''}
                      id="orderEstimatedTime"
                      min="1"
                      max="180"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #e5e7eb)',
                        background: 'var(--bg-tertiary, #f9fafb)',
                        fontSize: '14px',
                        color: 'var(--text-primary, #111)'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Show table/time if already set */}
            {!['pending', 'confirmed'].includes(selectedOrder.status) && (selectedOrder.table_number || selectedOrder.estimated_minutes) && (
              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>Order Details</div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {selectedOrder.table_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🍽️</span>
                      <span>Table {selectedOrder.table_number}</span>
                    </div>
                  )}
                  {selectedOrder.estimated_minutes && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>⏱️</span>
                      <span>~{selectedOrder.estimated_minutes} mins</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'picked_up' && selectedOrder.status !== 'cancelled' && (
            <div style={styles.modalActions}>
              {selectedOrder.status !== 'cancelled' && (
                <button
                  style={{ ...styles.actionBtn, background: '#fee2e2', color: '#dc2626' }}
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                >
                  <X size={16} /> Cancel
                </button>
              )}
              {nextStatus && (
                <button
                  style={{ ...styles.actionBtn, background: STATUS_CONFIG[nextStatus].bgColor, color: STATUS_CONFIG[nextStatus].color }}
                  onClick={() => handleStatusUpdate(selectedOrder.id, nextStatus)}
                >
                  <Check size={16} /> Mark {STATUS_CONFIG[nextStatus].label}
                </button>
              )}
              {selectedOrder.status === 'ready' && (
                <button
                  style={{ ...styles.actionBtn, background: '#dcfce7', color: '#16a34a' }}
                  onClick={() => handleStatusUpdate(selectedOrder.id, finalStatus)}
                >
                  <Check size={16} /> {selectedOrder.order_type === 'pickup' ? 'Picked Up' : 'Delivered'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };


  // ==================== RENDER ====================
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <UtensilsCrossed size={28} color="var(--accent-color, #8b5cf6)" />
          <div>
            <h1 style={styles.title}>Food Orders</h1>
            <p style={styles.subtitle}>Manage your restaurant orders</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={styles.refreshBtn} onClick={fetchData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button style={{ ...styles.refreshBtn, background: 'var(--accent-color, #8b5cf6)', color: 'white', borderColor: 'var(--accent-color, #8b5cf6)' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        ...styles.statsGrid,
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'
      }}>
        <div 
          style={{...styles.statCard, ...(viewFilter === 'today' ? styles.statCardActive : {})}}
          onClick={() => setViewFilter(viewFilter === 'today' ? 'all' : 'today')}
        >
          <div style={{...styles.statIconBox, background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'}}>
            <UtensilsCrossed size={22} color="white" />
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>TODAY</div>
            <div style={styles.statValue}>{todayOrders.length}</div>
          </div>
        </div>

        <div 
          style={{...styles.statCard, ...(viewFilter === 'pending' ? styles.statCardActive : {}), ...(pendingOrders.length > 0 ? { borderColor: '#f59e0b' } : {})}}
          onClick={() => setViewFilter(viewFilter === 'pending' ? 'all' : 'pending')}
        >
          <div style={{...styles.statIconBox, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
            <Clock size={22} color="white" />
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>PENDING</div>
            <div style={styles.statValue}>{pendingOrders.length}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIconBox, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
            <Bell size={22} color="white" />
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>PREPARING</div>
            <div style={styles.statValue}>{preparingOrders.length}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIconBox, background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'}}>
            <DollarSign size={22} color="white" />
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>REVENUE</div>
            <div style={styles.statValue}>{formatPrice(stats.revenue || completedOrders.reduce((sum, o) => sum + (o.total || 0), 0))}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterRow}>
        {[
          { key: 'all', label: 'All', count: orders.length },
          { key: 'pending', label: 'Pending', count: pendingOrders.length },
          { key: 'confirmed', label: 'Confirmed', count: confirmedOrders.length },
          { key: 'preparing', label: 'Preparing', count: preparingOrders.length },
          { key: 'ready', label: 'Ready', count: readyOrders.length },
          { key: 'completed', label: 'Completed', count: completedOrders.length },
        ].map(f => (
          <button
            key={f.key}
            style={{
              ...styles.filterPill,
              ...(statusFilter === f.key ? styles.filterPillActive : {})
            }}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
            <span style={{
              ...styles.filterCount,
              background: statusFilter === f.key ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)'
            }}>{f.count}</span>
          </button>
        ))}
        
        <input
          type="text"
          placeholder="Search by name, phone, order #"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Needs Attention */}
      {pendingOrders.length > 0 && statusFilter === 'all' && viewFilter === 'all' && (
        <div style={styles.attentionHeader}>
          <AlertCircle size={18} color="#d97706" />
          <span style={{ fontWeight: '600', color: 'var(--text-primary, #111)' }}>Needs Attention</span>
          <span style={styles.attentionBadge}>{pendingOrders.length}</span>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <UtensilsCrossed size={28} color="var(--text-muted, #9ca3af)" />
          </div>
          <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary, #111)' }}>No orders found</h3>
          <p style={{ margin: 0 }}>
            {statusFilter !== 'all' 
              ? `No ${statusFilter} orders` 
              : 'Orders from Visual Menu template will appear here'}
          </p>
        </div>
      ) : (
        <div>
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Modal */}
      <OrderDetailModal />
    </div>
  );
}
