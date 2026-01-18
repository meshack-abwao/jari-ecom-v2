import { useState, useEffect, memo, useCallback } from 'react';
import { bookingsAPI } from '../api/client';
import { 
  Calendar, Clock, Settings, Users, DollarSign, 
  ChevronDown, ChevronUp, Plus, X, Check,
  Bell, Zap, CalendarX, Save, AlertCircle
} from 'lucide-react';

// ==================== SUB-COMPONENTS (Outside main component to prevent re-creation) ====================

const sectionStyles = {
  card: { marginBottom: 16 },
  sectionHeader: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    padding: '16px', cursor: 'pointer', borderBottom: '1px solid #eee' 
  },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 12 },
  sectionIcon: { 
    width: 36, height: 36, borderRadius: 8, background: '#f0f0f0',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666'
  },
  cardTitle: { fontSize: 15, fontWeight: 600, margin: 0 },
  cardDesc: { fontSize: 13, color: '#888', margin: '4px 0 0' },
  sectionContent: { padding: 16 }
};

const Section = memo(({ id, icon: Icon, title, description, isExpanded, onToggle, children }) => (
  <div className="card" style={sectionStyles.card}>
    <div style={sectionStyles.sectionHeader} onClick={() => onToggle(id)}>
      <div style={sectionStyles.sectionTitle}>
        <div style={sectionStyles.sectionIcon}>
          <Icon size={18} />
        </div>
        <div>
          <h3 style={sectionStyles.cardTitle}>{title}</h3>
          {description && <p style={sectionStyles.cardDesc}>{description}</p>}
        </div>
      </div>
      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
    {isExpanded && <div style={sectionStyles.sectionContent}>{children}</div>}
  </div>
));

const settingRowStyles = {
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  info: { flex: 1 },
  label: { fontSize: 14, color: '#333' },
  hint: { fontSize: 12, color: '#888', marginTop: 2 },
  control: { marginLeft: 16 }
};

const SettingRow = memo(({ label, hint, children }) => (
  <div style={settingRowStyles.row}>
    <div style={settingRowStyles.info}>
      <span style={settingRowStyles.label}>{label}</span>
      {hint && <p style={settingRowStyles.hint}>{hint}</p>}
    </div>
    <div style={settingRowStyles.control}>
      {children}
    </div>
  </div>
));

// ==================== MAIN COMPONENT ====================

export default function BookingsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState('calendar');
  
  // Data
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Settings
  const [settings, setSettings] = useState({
    slot_duration_minutes: 60,
    max_bookings_per_slot: 1,
    max_bookings_per_day: 5,
    min_notice_hours: 24,
    max_advance_days: 30,
    jump_line_enabled: false,
    jump_line_fee: 0,
    deposit_enabled: false,
    deposit_percentage: 20,
    inquiry_fee: 0,
    reminders_enabled: false,
    reminder_method: 'sms'
  });

  // Working hours & blocked dates
  const [workingHours, setWorkingHours] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  
  // Collapsed sections
  const [expandedSections, setExpandedSections] = useState({
    schedule: true,
    slots: true,
    advance: true,
    premium: false,
    payment: false,
    reminders: false,
    blocked: true
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, settingsRes, hoursRes, blockedRes] = await Promise.all([
        bookingsAPI.getAll().catch(() => ({ data: [] })),
        bookingsAPI.getSettings().catch(() => ({ data: {} })),
        bookingsAPI.getWorkingHours().catch(() => ({ data: [] })),
        bookingsAPI.getBlockedDates().catch(() => ({ data: [] }))
      ]);
      
      setBookings(bookingsRes.data || []);
      if (settingsRes.data && Object.keys(settingsRes.data).length > 0) {
        setSettings(prev => ({ ...prev, ...settingsRes.data }));
      }
      setWorkingHours(hoursRes.data || []);
      setBlockedDates(blockedRes.data || []);
    } catch (err) {
      console.error('Failed to load booking data:', err);
      setError('Failed to load settings. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await bookingsAPI.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateWorkingHour = async (day, field, value) => {
    const existingHour = workingHours.find(h => h.day_of_week === day);
    const defaultHour = { day_of_week: day, is_open: false, start_time: '09:00', end_time: '17:00' };
    const currentHour = existingHour || defaultHour;
    const newData = { ...currentHour, [field]: value };
    
    // Optimistic update
    if (existingHour) {
      setWorkingHours(prev => prev.map(h => h.day_of_week === day ? newData : h));
    } else {
      setWorkingHours(prev => [...prev, newData]);
    }
    
    try {
      const result = await bookingsAPI.updateWorkingHours(day, newData);
      // Update with server response
      setWorkingHours(prev => 
        prev.map(h => h.day_of_week === day ? { ...h, ...result.data } : h)
      );
    } catch (err) {
      console.error('Failed to update working hours:', err);
      // Revert on error
      loadData();
    }
  };

  const addBlockedDate = async () => {
    if (!newBlockedDate) return;
    try {
      const result = await bookingsAPI.addBlockedDate({ 
        blocked_date: newBlockedDate, 
        reason: newBlockedReason 
      });
      setBlockedDates(prev => [...prev, result.data]);
      setNewBlockedDate('');
      setNewBlockedReason('');
    } catch (err) {
      console.error('Failed to add blocked date:', err);
      alert('Failed to add blocked date. Please try again.');
    }
  };

  const removeBlockedDate = async (id) => {
    try {
      await bookingsAPI.removeBlockedDate(id);
      setBlockedDates(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to remove blocked date:', err);
    }
  };

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const getWorkingHour = useCallback((day) => {
    return workingHours.find(h => h.day_of_week === day) || 
           { is_open: false, start_time: '09:00', end_time: '17:00' };
  }, [workingHours]);

  // Helper to render Section with expanded state
  const renderSection = (id, icon, title, description, children) => (
    <Section
      id={id}
      icon={icon}
      title={title}
      description={description}
      isExpanded={expandedSections[id]}
      onToggle={toggleSection}
    >
      {children}
    </Section>
  );

  // ==================== RENDER SETTINGS ====================
  
  const renderSettings = () => (
    <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }}>
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Working Schedule */}
      <Section 
        id="schedule" 
        icon={Clock} 
        title="Working Schedule"
        description="Set your availability for each day of the week"
        isExpanded={expandedSections.schedule}
        onToggle={toggleSection}
      >
        <div style={styles.scheduleGrid}>
          {[1, 2, 3, 4, 5, 6, 0].map(day => {
            const hour = getWorkingHour(day);
            const isOpen = hour.is_open;
            return (
              <div key={day} style={styles.dayRow}>
                <div style={styles.dayInfo}>
                  <span style={{ ...styles.dayName, opacity: isOpen ? 1 : 0.5 }}>
                    {dayNames[day]}
                  </span>
                  <label style={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={isOpen}
                      onChange={(e) => updateWorkingHour(day, 'is_open', e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span style={styles.toggleText}>{isOpen ? 'Open' : 'Closed'}</span>
                  </label>
                </div>
                {isOpen && (
                  <div style={styles.timeInputs}>
                    <input 
                      type="time" 
                      value={hour.start_time?.substring(0, 5) || '09:00'} 
                      onChange={(e) => updateWorkingHour(day, 'start_time', e.target.value)}
                      className="input"
                      style={styles.timeInput}
                    />
                    <span style={styles.timeSeparator}>to</span>
                    <input 
                      type="time" 
                      value={hour.end_time?.substring(0, 5) || '17:00'} 
                      onChange={(e) => updateWorkingHour(day, 'end_time', e.target.value)}
                      className="input"
                      style={styles.timeInput}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Slot Settings */}
      <Section 
        id="slots" 
        icon={Users} 
        title="Booking Slots"
        description="Configure how appointments are scheduled"
        isExpanded={expandedSections.slots}
        onToggle={toggleSection}
      >
        <SettingRow label="Duration per booking" hint="How long each appointment lasts">
          <select 
            value={settings.slot_duration_minutes} 
            onChange={(e) => setSettings(s => ({ ...s, slot_duration_minutes: parseInt(e.target.value) }))}
            className="input"
            style={styles.select}
          >
            <option value={30}>30 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
            <option value={240}>4 hours</option>
            <option value={480}>Full day</option>
          </select>
        </SettingRow>

        <SettingRow label="Max bookings per slot" hint="1 = exclusive, higher for group classes">
          <input 
            type="number" 
            min={1} 
            max={50}
            value={settings.max_bookings_per_slot}
            onChange={(e) => setSettings(s => ({ ...s, max_bookings_per_slot: parseInt(e.target.value) || 1 }))}
            className="input"
            style={styles.numberInput}
          />
        </SettingRow>

        <SettingRow label="Max bookings per day" hint="Total appointments you can handle">
          <input 
            type="number" 
            min={1} 
            max={100}
            value={settings.max_bookings_per_day}
            onChange={(e) => setSettings(s => ({ ...s, max_bookings_per_day: parseInt(e.target.value) || 1 }))}
            className="input"
            style={styles.numberInput}
          />
        </SettingRow>
      </Section>

      {/* Advance Booking Rules */}
      <Section 
        id="advance" 
        icon={Calendar} 
        title="Advance Booking"
        description="Control when clients can book"
        isExpanded={expandedSections.advance}
        onToggle={toggleSection}
      >
        <SettingRow label="Minimum notice" hint="How far in advance clients must book">
          <select 
            value={settings.min_notice_hours} 
            onChange={(e) => setSettings(s => ({ ...s, min_notice_hours: parseInt(e.target.value) }))}
            className="input"
            style={styles.select}
          >
            <option value={0}>No minimum</option>
            <option value={2}>2 hours</option>
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>2 days</option>
            <option value={72}>3 days</option>
            <option value={168}>1 week</option>
          </select>
        </SettingRow>

        <SettingRow label="Book up to" hint="How far in the future clients can book">
          <select 
            value={settings.max_advance_days} 
            onChange={(e) => setSettings(s => ({ ...s, max_advance_days: parseInt(e.target.value) }))}
            className="input"
            style={styles.select}
          >
            <option value={7}>1 week</option>
            <option value={14}>2 weeks</option>
            <option value={30}>1 month</option>
            <option value={60}>2 months</option>
            <option value={90}>3 months</option>
          </select>
        </SettingRow>
      </Section>

      {/* Premium: Jump the Line */}
      <Section 
        id="premium" 
        icon={Zap} 
        title="Jump the Line"
        description="Let clients pay extra for urgent bookings"
        isExpanded={expandedSections.premium}
        onToggle={toggleSection}
      >
        <SettingRow label="Enable skip-the-wait fee" hint="Clients can pay to book within minimum notice">
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={settings.jump_line_enabled}
              onChange={(e) => setSettings(s => ({ ...s, jump_line_enabled: e.target.checked }))}
              style={styles.checkbox}
            />
          </label>
        </SettingRow>

        {settings.jump_line_enabled && (
          <SettingRow label="Skip wait fee (KES)" hint="Extra charge for urgent bookings">
            <input 
              type="number" 
              min={0}
              value={settings.jump_line_fee}
              onChange={(e) => setSettings(s => ({ ...s, jump_line_fee: parseFloat(e.target.value) || 0 }))}
              className="input"
              style={styles.numberInput}
              placeholder="0"
            />
          </SettingRow>
        )}
      </Section>

      {/* Payment Settings */}
      <Section 
        id="payment" 
        icon={DollarSign} 
        title="Payment"
        description="Configure deposits and fees"
        isExpanded={expandedSections.payment}
        onToggle={toggleSection}
      >
        <SettingRow label="Accept deposits" hint="Let clients pay a portion upfront">
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={settings.deposit_enabled}
              onChange={(e) => setSettings(s => ({ ...s, deposit_enabled: e.target.checked }))}
              style={styles.checkbox}
            />
          </label>
        </SettingRow>

        {settings.deposit_enabled && (
          <SettingRow label="Deposit percentage" hint="Portion required upfront">
            <select 
              value={settings.deposit_percentage} 
              onChange={(e) => setSettings(s => ({ ...s, deposit_percentage: parseInt(e.target.value) }))}
              className="input"
              style={styles.select}
            >
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={25}>25%</option>
              <option value={30}>30%</option>
              <option value={50}>50%</option>
            </select>
          </SettingRow>
        )}

        <SettingRow label="Inquiry fee (KES)" hint="Charge for serious inquiries (0 = free)">
          <input 
            type="number" 
            min={0}
            value={settings.inquiry_fee}
            onChange={(e) => setSettings(s => ({ ...s, inquiry_fee: parseFloat(e.target.value) || 0 }))}
            className="input"
            style={styles.numberInput}
            placeholder="0"
          />
        </SettingRow>
      </Section>

      {/* Reminders */}
      <Section 
        id="reminders" 
        icon={Bell} 
        title="Reminders"
        description="Notify clients before appointments"
        isExpanded={expandedSections.reminders}
        onToggle={toggleSection}
      >
        <SettingRow label="Enable reminders" hint="Send notifications before appointments">
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={settings.reminders_enabled}
              onChange={(e) => setSettings(s => ({ ...s, reminders_enabled: e.target.checked }))}
              style={styles.checkbox}
            />
          </label>
        </SettingRow>

        {settings.reminders_enabled && (
          <SettingRow label="Reminder method" hint="How to notify clients">
            <select 
              value={settings.reminder_method} 
              onChange={(e) => setSettings(s => ({ ...s, reminder_method: e.target.value }))}
              className="input"
              style={styles.select}
            >
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="both">Both</option>
            </select>
          </SettingRow>
        )}
      </Section>

      {/* Blocked Dates */}
      <Section 
        id="blocked" 
        icon={CalendarX} 
        title="Blocked Dates"
        description="Mark days you're unavailable"
        isExpanded={expandedSections.blocked}
        onToggle={toggleSection}
      >
        {blockedDates.length > 0 ? (
          <div style={styles.blockedList}>
            {blockedDates.map(date => (
              <div key={date.id} style={styles.blockedItem}>
                <div style={styles.blockedInfo}>
                  <span style={styles.blockedDate}>
                    {new Date(date.blocked_date).toLocaleDateString('en-US', { 
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                    })}
                  </span>
                  {date.reason && <span style={styles.blockedReason}>{date.reason}</span>}
                </div>
                <button 
                  type="button"
                  style={styles.removeBtn}
                  onClick={() => removeBlockedDate(date.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>No blocked dates</p>
        )}
        
        <div style={styles.addBlockedForm}>
          <input 
            type="date" 
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="input"
            style={styles.dateInput}
          />
          <input 
            type="text" 
            placeholder="Reason (optional)"
            value={newBlockedReason}
            onChange={(e) => setNewBlockedReason(e.target.value)}
            className="input"
            style={styles.reasonInput}
          />
          <button 
            type="button" 
            style={styles.addBtn} 
            onClick={addBlockedDate}
            disabled={!newBlockedDate}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </Section>

      {/* Save Button */}
      <button 
        type="submit"
        style={{
          ...styles.saveBtn,
          ...(saveSuccess ? { background: '#10b981' } : {})
        }} 
        disabled={saving}
      >
        {saving ? (
          <>
            <div style={styles.spinner} />
            Saving...
          </>
        ) : saveSuccess ? (
          <>
            <Check size={18} />
            Saved!
          </>
        ) : (
          <>
            <Save size={18} />
            Save Settings
          </>
        )}
      </button>
    </form>
  );

  // ==================== RENDER CALENDAR ====================
  
  const renderCalendar = () => {
    if (bookings.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <Calendar size={48} />
          </div>
          <h3 style={styles.emptyTitle}>No bookings yet</h3>
          <p style={styles.emptyText}>When customers book your services, they'll appear here.</p>
        </div>
      );
    }

    return (
      <div style={styles.bookingsList}>
        {bookings.map(booking => (
          <div key={booking.id} style={styles.bookingCard}>
            <div style={styles.bookingHeader}>
              <div style={styles.bookingDate}>
                <span style={styles.bookingDay}>
                  {new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                </span>
                <span style={styles.bookingMonth}>
                  {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>
              <div style={styles.bookingInfo}>
                <h4 style={styles.bookingCustomer}>{booking.customer_name}</h4>
                <p style={styles.bookingService}>{booking.package_name || booking.service_name || 'Service'}</p>
                <p style={styles.bookingTime}>
                  <Clock size={14} /> {booking.booking_time?.substring(0, 5)} · {booking.customer_phone}
                </p>
              </div>
              <div style={styles.bookingStatus}>
                <span style={{
                  ...styles.statusBadge,
                  ...(booking.status === 'confirmed' ? styles.statusConfirmed : 
                     booking.status === 'pending' ? styles.statusPending :
                     booking.status === 'cancelled' ? styles.statusCancelled :
                     styles.statusCompleted)
                }}>
                  {booking.status}
                </span>
                <span style={styles.bookingPrice}>
                  KES {parseInt(booking.total_amount || booking.package_price || 0).toLocaleString()}
                </span>
              </div>
            </div>
            {booking.notes && (
              <p style={styles.bookingNotes}>Note: {booking.notes}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <span>Loading bookings...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Bookings</h1>
          <p style={styles.subtitle}>Manage your calendar and booking settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'calendar' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('calendar')}
        >
          <Calendar size={18} />
          <span>Calendar</span>
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'settings' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'calendar' ? renderCalendar() : renderSettings()}
    </div>
  );
}

// ==================== STYLES ====================

const styles = {
  // Loading
  loadingContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh', 
    color: 'var(--text-muted)',
    gap: '16px'
  },
  loadingSpinner: { 
    width: '40px', 
    height: '40px', 
    border: '3px solid var(--border-color)', 
    borderTopColor: 'var(--accent-color)', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite'
  },
  
  // Header
  header: { 
    marginBottom: '32px'
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
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '28px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 20px',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: 'var(--accent-color)',
    borderBottomColor: 'var(--accent-color)',
  },
  
  // Cards / Sections
  card: { 
    padding: '0', 
    marginBottom: '20px',
    overflow: 'hidden'
  },
  sectionHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '20px 24px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'background 0.2s',
  },
  sectionTitle: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '14px' 
  },
  sectionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'var(--accent-light)',
    color: 'var(--accent-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { 
    fontSize: '16px', 
    fontWeight: '600', 
    color: 'var(--text-primary)', 
    margin: 0 
  },
  cardDesc: { 
    fontSize: '13px', 
    color: 'var(--text-muted)', 
    margin: '4px 0 0'
  },
  sectionContent: { 
    padding: '20px 24px', 
    borderTop: '1px solid var(--border-color)'
  },
  
  // Form elements
  formGroup: { 
    marginBottom: '20px' 
  },
  label: { 
    fontSize: '11px', 
    fontWeight: '700', 
    color: 'var(--text-muted)', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px', 
    marginBottom: '8px', 
    display: 'block' 
  },
  hint: { 
    fontSize: '12px', 
    color: 'var(--text-muted)', 
    marginTop: '6px' 
  },
  
  // Setting rows
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid var(--border-color)',
  },
  settingInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  settingLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  settingHint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  settingControl: {
    flexShrink: 0,
  },
  
  // Inputs
  select: {
    minWidth: '140px',
    padding: '10px 14px',
    fontSize: '14px',
  },
  numberInput: {
    width: '100px',
    padding: '10px 14px',
    fontSize: '14px',
    textAlign: 'center',
  },
  dateInput: {
    width: '160px',
    padding: '10px 14px',
    fontSize: '14px',
  },
  reasonInput: {
    flex: 1,
    padding: '10px 14px',
    fontSize: '14px',
  },
  
  // Toggle / Checkbox
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: 'var(--accent-color)',
  },
  toggleText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  
  // Schedule
  scheduleGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  dayRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid var(--border-color)',
  },
  dayInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  dayName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    width: '100px',
  },
  timeInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  timeInput: {
    width: '110px',
    padding: '8px 12px',
    fontSize: '14px',
  },
  timeSeparator: {
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  
  // Blocked dates
  blockedList: {
    marginBottom: '16px',
  },
  blockedItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'var(--bg-tertiary)',
    borderRadius: '10px',
    marginBottom: '8px',
  },
  blockedInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  blockedDate: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  blockedReason: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  removeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    border: 'none',
    borderRadius: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    cursor: 'pointer',
  },
  addBlockedForm: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'var(--accent-light)',
    border: '1px solid var(--accent-color)',
    borderRadius: '10px',
    color: 'var(--accent-color)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  
  // Save button
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '16px',
    background: 'var(--accent-color)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-muted)',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  
  // Error
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '20px',
  },
  
  // Bookings List
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  bookingCard: {
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid var(--border-color)',
  },
  bookingHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  bookingDate: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'var(--accent-light)',
    borderRadius: '10px',
    minWidth: '60px',
  },
  bookingDay: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--accent-color)',
  },
  bookingMonth: {
    fontSize: '12px',
    color: 'var(--accent-color)',
    textTransform: 'uppercase',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingCustomer: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '0 0 4px',
  },
  bookingService: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '0 0 6px',
  },
  bookingTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  bookingStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusPending: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
  },
  statusConfirmed: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
  },
  statusCancelled: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },
  statusCompleted: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  },
  bookingPrice: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  bookingNotes: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-color)',
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
};
