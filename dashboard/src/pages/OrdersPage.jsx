import { useState, useEffect, useRef } from 'react';
import { ordersAPI } from '../api/client';
import { Clock, CheckCircle, XCircle, DollarSign, Package, Truck, Search, RefreshCw, Download, SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, delivered: 0, cancelled: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [filteredStats, setFilteredStats] = useState({ total: 0, pending: 0, paid: 0, delivered: 0, cancelled: 0, revenue: 0 });
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const dateDropdownRef = useRef(null);

  useEffect(() => { 
    loadOrders(); 
    loadStats();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeFilter, searchQuery, dateFilter]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
        setShowDateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data?.orders || []);
    } catch (error) { 
      console.error('Failed to load orders:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const loadStats = async () => {
    try {
      const response = await ordersAPI.getStats();
      setStats(response.data || { total: 0, pending: 0, paid: 0, delivered: 0, cancelled: 0, revenue: 0 });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    // Apply date filter first
    let dateFiltered = [...orders];
    if (dateFilter !== 'all') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let cutoffDate;
      if (dateFilter === 'today') {
        cutoffDate = startOfDay;
      } else if (dateFilter === 'week') {
        cutoffDate = new Date(startOfDay);
        cutoffDate.setDate(cutoffDate.getDate() - 7);
      } else if (dateFilter === 'month') {
        cutoffDate = new Date(startOfDay);
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      }
      
      dateFiltered = orders.filter(o => new Date(o.created_at) >= cutoffDate);
      filtered = dateFiltered;
    }
    
    // Compute stats from date-filtered orders (before status/search filters)
    const computedStats = {
      total: dateFiltered.length,
      pending: dateFiltered.filter(o => o.status === 'pending').length,
      paid: dateFiltered.filter(o => o.status === 'paid').length,
      delivered: dateFiltered.filter(o => o.status === 'delivered' || o.status === 'completed').length,
      cancelled: dateFiltered.filter(o => o.status === 'cancelled').length,
      revenue: dateFiltered.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
    };
    setFilteredStats(computedStats);
    
    // Apply status filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'completed') {
        filtered = filtered.filter(o => o.status === 'delivered' || o.status === 'completed');
      } else {
        filtered = filtered.filter(o => o.status === activeFilter);
      }
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.order_number?.toLowerCase().includes(query) ||
        o.customer_name?.toLowerCase().includes(query) ||
        o.customer_phone?.includes(query) ||
        o.product_name?.toLowerCase().includes(query)
      );
    }
    
    setFilteredOrders(filtered);
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      await loadOrders();
      await loadStats();
    } catch (error) { 
      alert('Failed to update order status'); 
    }
  };

  const exportCSV = () => {
    const headers = ['Order ID', 'Product', 'Customer', 'Phone', 'Location', 'Qty', 'Amount', 'Payment', 'Status', 'Date'];
    const rows = filteredOrders.map(o => [
      o.order_number,
      o.product_name || '',
      o.customer_name || '',
      o.customer_phone || '',
      o.customer_location || '',
      o.quantity || 1,
      o.total_amount || 0,
      o.payment_method || '',
      o.status,
      new Date(o.created_at).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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

  const dateFilterLabels = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    month: 'This Month'
  };

  const statCards = [
    { label: 'TOTAL ORDERS', value: filteredStats.total, icon: <Package size={22} />, color: '#8b5cf6' },
    { label: 'PENDING', value: filteredStats.pending, icon: <Clock size={22} />, color: '#f59e0b' },
    { label: 'COMPLETED', value: filteredStats.delivered, icon: <CheckCircle size={22} />, color: '#22c55e' },
    { label: 'REVENUE', value: `KES ${Number(filteredStats.revenue || 0).toLocaleString()}`, icon: <DollarSign size={22} />, color: '#3b82f6' },
  ];

  const filterTabs = [
    { key: 'all', label: 'All', count: filteredStats.total },
    { key: 'pending', label: 'Pending', count: filteredStats.pending },
    { key: 'paid', label: 'Paid', count: filteredStats.paid },
    { key: 'completed', label: 'Delivered', count: filteredStats.delivered },
    { key: 'cancelled', label: 'Cancelled', count: filteredStats.cancelled },
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Orders</h1>
          <p style={styles.subtitle}>Manage and track your orders</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => { loadOrders(); loadStats(); }} style={styles.iconBtn} title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button onClick={exportCSV} style={styles.exportBtn}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, idx) => (
          <div key={idx} style={styles.statCard} className="glass-card">
            <div style={{ ...styles.statIcon, background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p style={styles.statLabel}>{stat.label}</p>
              <p style={styles.statValue}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={styles.filtersContainer} className="glass-card">
        <div style={styles.filterRow}>
          <div style={styles.searchBox}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, phone, order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              className="dashboard-input"
            />
          </div>
          {/* Date Filter Dropdown */}
          <div style={styles.dateDropdownWrapper} ref={dateDropdownRef}>
            <button 
              style={styles.dateDropdownBtn}
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <SlidersHorizontal size={16} />
              <span>{dateFilterLabels[dateFilter]}</span>
              <ChevronDown size={14} style={{ opacity: 0.6 }} />
            </button>
            {showDateDropdown && (
              <div style={styles.dateDropdownMenu}>
                {Object.entries(dateFilterLabels).map(([key, label]) => (
                  <button
                    key={key}
                    style={{
                      ...styles.dateDropdownItem,
                      ...(dateFilter === key ? styles.dateDropdownItemActive : {})
                    }}
                    onClick={() => { setDateFilter(key); setShowDateDropdown(false); }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={styles.filterTabs}>
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                ...styles.filterTab,
                ...(activeFilter === tab.key ? styles.filterTabActive : {})
              }}
            >
              {tab.label}
              <span style={styles.filterCount}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div style={styles.empty} className="glass-card">
          <div style={styles.emptyIcon}>📦</div>
          <h3 style={styles.emptyTitle}>
            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          </h3>
          <p style={styles.emptyDesc}>
            {orders.length === 0 
              ? 'Orders will appear here when customers make purchases'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer} className="glass-card">
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>ORDER ID</th>
                <th style={styles.th}>PRODUCT</th>
                <th style={styles.th}>CUSTOMER</th>
                <th style={styles.th}>CONTACT</th>
                <th style={styles.th}>QTY</th>
                <th style={styles.th}>TOTAL</th>
                <th style={styles.th}>PAYMENT</th>
                <th style={styles.th}>STATUS</th>
                <th style={styles.th}>DATE</th>
                <th style={styles.th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <tr key={order.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <span style={styles.orderId}>{order.order_number}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.productCell}>
                        {order.product_image && (
                          <img src={order.product_image} alt="" style={styles.productThumb} />
                        )}
                        <span>{order.product_name || 'Product'}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{order.customer_name || '-'}</td>
                    <td style={styles.td}>
                      <div style={styles.contactCell}>
                        {order.customer_phone && (
                          <a href={`tel:${order.customer_phone}`} style={styles.contactLink} title="Call">
                            📞
                          </a>
                        )}
                        {order.customer_location && (
                          <span style={styles.locationBadge} title={order.customer_location}>
                            📍
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>{order.quantity || 1}</td>
                    <td style={styles.td}>
                      <span style={styles.amount}>
                        KES {Number(order.total_amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.payment}>
                        {(order.payment_method || 'N/A').toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ 
                        ...styles.statusBadge, 
                        background: statusStyle.bg, 
                        color: statusStyle.color 
                      }}>
                        {statusStyle.icon}
                        {order.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td style={styles.td}>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)} 
                        style={styles.statusSelect}
                        className="dashboard-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
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

const styles = {
  loadingContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh', 
    color: 'var(--text-muted)' 
  },
  spinner: { 
    width: '40px', 
    height: '40px', 
    border: '3px solid var(--border-color)', 
    borderTopColor: 'var(--accent-color)', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite', 
    marginBottom: '16px' 
  },
  
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: { 
    fontSize: '34px', 
    fontWeight: '700', 
    marginBottom: '6px', 
    color: 'var(--text-primary)', 
    letterSpacing: '-0.025em' 
  },
  subtitle: { 
    fontSize: '15px', 
    color: 'var(--text-muted)' 
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%'
  },
  iconBtn: {
    padding: '10px',
    background: 'var(--glass-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'var(--accent-color)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  
  // Date Filter Dropdown
  dateDropdownWrapper: {
    position: 'relative',
    flexShrink: 0
  },
  dateDropdownBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'var(--glass-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  dateDropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '6px',
    minWidth: '140px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    zIndex: 9999
  },
  dateDropdownItem: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s'
  },
  dateDropdownItemActive: {
    background: 'var(--accent-color)',
    color: 'white'
  },
  
  // Filters
  filtersContainer: {
    padding: '16px 20px',
    marginBottom: '24px'
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '16px'
  },
  searchBox: {
    position: 'relative',
    flex: 1
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)'
  },
  searchInput: {
    width: '100%',
    paddingLeft: '44px',
    background: 'var(--input-bg)',
    border: '1px solid var(--border-color)'
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    paddingBottom: '4px'
  },
  filterTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    flexShrink: 0
  },
  filterTabActive: {
    background: 'var(--accent-color)',
    borderColor: 'var(--accent-color)',
    color: 'white'
  },
  filterCount: {
    fontSize: '12px',
    opacity: 0.8
  },
  
  // Empty state
  empty: { 
    padding: '80px 40px', 
    textAlign: 'center' 
  },
  emptyIcon: { 
    fontSize: '64px', 
    marginBottom: '20px' 
  },
  emptyTitle: { 
    fontSize: '20px', 
    fontWeight: '600', 
    marginBottom: '8px', 
    color: 'var(--text-primary)' 
  },
  emptyDesc: { 
    fontSize: '14px', 
    color: 'var(--text-muted)' 
  },
  
  // Table
  tableContainer: { 
    padding: '0', 
    overflowX: 'auto' 
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse', 
    minWidth: '1000px' 
  },
  tableHeader: { 
    borderBottom: '1px solid var(--border-color)' 
  },
  th: { 
    padding: '14px 16px', 
    textAlign: 'left', 
    fontSize: '11px', 
    fontWeight: '700', 
    color: 'var(--text-muted)', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px', 
    whiteSpace: 'nowrap' 
  },
  tableRow: { 
    borderBottom: '1px solid var(--border-color)', 
    transition: 'background 0.2s' 
  },
  td: { 
    padding: '14px 16px', 
    fontSize: '13px', 
    color: 'var(--text-secondary)', 
    whiteSpace: 'nowrap' 
  },
  orderId: { 
    fontFamily: 'monospace', 
    fontSize: '12px', 
    color: 'var(--accent-color)' 
  },
  productCell: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px' 
  },
  productThumb: { 
    width: '36px', 
    height: '36px', 
    borderRadius: '6px', 
    objectFit: 'cover' 
  },
  contactCell: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  contactLink: {
    textDecoration: 'none',
    fontSize: '16px',
    cursor: 'pointer'
  },
  locationBadge: {
    fontSize: '16px',
    cursor: 'help'
  },
  amount: { 
    fontWeight: '600', 
    color: 'var(--accent-color)' 
  },
  payment: { 
    fontSize: '11px', 
    fontWeight: '600', 
    color: 'var(--text-muted)' 
  },
  statusBadge: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '5px', 
    padding: '5px 10px', 
    borderRadius: '6px', 
    fontSize: '11px', 
    fontWeight: '600', 
    textTransform: 'capitalize' 
  },
  statusSelect: { 
    padding: '6px 10px', 
    fontSize: '12px', 
    borderRadius: '6px', 
    minWidth: '110px' 
  },
};
