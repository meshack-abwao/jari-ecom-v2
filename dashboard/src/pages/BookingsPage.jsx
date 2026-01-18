import { useState, useEffect, memo, useCallback } from 'react';
import { bookingsAPI } from '../api/client';
import { 
  Calendar, Clock, Settings, Users, DollarSign, 
  ChevronDown, ChevronUp, Plus, X, Check,
  Bell, Zap, CalendarX, Save, AlertCircle, Info
} from 'lucide-react';

// ==================== MODERN TOGGLE SWITCH ====================
const Toggle = memo(({ checked, onChange, label }) => (
  <label style={toggleStyles.container}>
    <div style={{
      ...toggleStyles.track,
      background: checked ? 'var(--accent-color, #8b5cf6)' : '#e5e7eb'
    }}>
      <div style={{
        ...toggleStyles.thumb,
        transform: checked ? 'translateX(20px)' : 'translateX(0)'
      }} />
    </div>
    {label && <span style={toggleStyles.label}>{label}</span>}
  </label>
));

const toggleStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  track: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    padding: '2px',
    transition: 'background 0.2s',
  },
  thumb: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
  },
  label: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  }
};

// ==================== CLEAN SECTION CARD ====================
const SectionCard = memo(({ icon: Icon, title, description, children, accent = '#8b5cf6' }) => (
  <div style={cardStyles.container}>
    <div style={cardStyles.header}>
      <div style={{ ...cardStyles.iconWrap, background: `${accent}15`, color: accent }}>
        <Icon size={20} />
      </div>
      <div>
        <h3 style={cardStyles.title}>{title}</h3>
        {description && <p style={cardStyles.desc}>{description}</p>}
      </div>
    </div>
    <div style={cardStyles.content}>
      {children}
    </div>
  </div>
));

const cardStyles = {
  container: {
    background: 'var(--bg-secondary, white)',
    borderRadius: '16px',
    border: '1px solid var(--border-color, #e5e7eb)',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-color, #e5e7eb)',
  },
  iconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary, #111)',
    margin: 0,
  },
  desc: {
    fontSize: '13px',
    color: 'var(--text-muted, #6b7280)',
    margin: '4px 0 0',
  },
  content: {
    padding: '20px 24px',
  }
};

// ==================== SETTING ROW ====================
const SettingRow = memo(({ label, hint, children, noBorder }) => (
  <div style={{
    ...rowStyles.container,
    borderBottom: noBorder ? 'none' : '1px solid var(--border-color, #f3f4f6)'
  }}>
    <div style={rowStyles.info}>
      <span style={rowStyles.label}>{label}</span>
      {hint && <span style={rowStyles.hint}>{hint}</span>}
    </div>
    <div style={rowStyles.control}>
      {children}
    </div>
  </div>
));

const rowStyles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    gap: '20px',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary, #111)',
  },
  hint: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text-muted, #9ca3af)',
    marginTop: '2px',
  },
  control: {
    flexShrink: 0,
  }
};

// ==================== MAIN COMPONENT ====================
export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [settings, setSettings] = useState({
    slot_duration_minutes: 60,
    max_bookings_per_slot: 1,
    max_bookings_per_day: 5,
    min_notice_hours: 24,
    max_advance_days: 30,
    jump_line_enabled: false,
    jump_line_fee: 500,
    deposit_enabled: false,
    deposit_percentage: 20,
    inquiry_fee: 0,
    reminders_enabled: false,
    reminder_method: 'whatsapp'
  });

  const [workingHours, setWorkingHours] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
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
      setError('Failed to load settings');
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
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateWorkingHour = useCallback(async (day, field, value) => {
    const existing = workingHours.find(h => h.day_of_week === day);
    const current = existing || { day_of_week: day, is_open: false, start_time: '09:00', end_time: '17:00' };
    const newData = { ...current, [field]: value };
    
    if (existing) {
      setWorkingHours(prev => prev.map(h => h.day_of_week === day ? newData : h));
    } else {
      setWorkingHours(prev => [...prev, newData]);
    }
    
    try {
      await bookingsAPI.updateWorkingHours(day, newData);
    } catch (err) {
      loadData();
    }
  }, [workingHours]);

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
      alert('Failed to add date');
    }
  };

  const removeBlockedDate = async (id) => {
    try {
      await bookingsAPI.removeBlockedDate(id);
      setBlockedDates(prev => prev.filter(d => d.id !== id));
    } catch (err) {}
  };

  const getWorkingHour = useCallback((day) => {
    return workingHours.find(h => h.day_of_week === day) || 
           { is_open: false, start_time: '09:00', end_time: '17:00' };
  }, [workingHours]);

  const updateSetting = (key, value) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  // ==================== RENDER SETTINGS ====================
  const renderSettings = () => (
    <div>
      {/* Working Hours */}
      <SectionCard icon={Clock} title="Working Hours" description="Set when you're available for bookings" accent="#10b981">
        <div style={styles.scheduleGrid}>
          {[1, 2, 3, 4, 5, 6, 0].map(day => {
            const hour = getWorkingHour(day);
            return (
              <div key={day} style={styles.dayRow}>
                <div style={styles.dayLeft}>
                  <Toggle 
                    checked={hour.is_open} 
                    onChange={() => updateWorkingHour(day, 'is_open', !hour.is_open)} 
                  />
                  <span style={{ 
                    ...styles.dayName, 
                    color: hour.is_open ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: hour.is_open ? '600' : '400'
                  }}>
                    {dayNames[day]}
                  </span>
                </div>
                {hour.is_open && (
                  <div style={styles.timeInputs}>
                    <input 
                      type="time" 
                      value={hour.start_time?.substring(0, 5) || '09:00'} 
                      onChange={(e) => updateWorkingHour(day, 'start_time', e.target.value)}
                      style={styles.timeInput}
                    />
                    <span style={styles.timeSep}>→</span>
                    <input 
                      type="time" 
                      value={hour.end_time?.substring(0, 5) || '17:00'} 
                      onChange={(e) => updateWorkingHour(day, 'end_time', e.target.value)}
                      style={styles.timeInput}
                    />
                  </div>
                )}
                {!hour.is_open && <span style={styles.closedText}>Closed</span>}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Booking Slots */}
      <SectionCard icon={Users} title="Appointment Settings" description="How bookings work" accent="#3b82f6">
        <SettingRow label="Appointment duration" hint="Length of each booking slot">
          <select 
            value={settings.slot_duration_minutes} 
            onChange={(e) => updateSetting('slot_duration_minutes', parseInt(e.target.value))}
            style={styles.select}
          >
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
            <option value={240}>Half day</option>
            <option value={480}>Full day</option>
          </select>
        </SettingRow>

        <SettingRow label="Clients per time slot" hint="1 = private, higher for group sessions">
          <div style={styles.stepperWrap}>
            <button 
              style={styles.stepperBtn} 
              onClick={() => updateSetting('max_bookings_per_slot', Math.max(1, settings.max_bookings_per_slot - 1))}
            >−</button>
            <span style={styles.stepperValue}>{settings.max_bookings_per_slot}</span>
            <button 
              style={styles.stepperBtn}
              onClick={() => updateSetting('max_bookings_per_slot', settings.max_bookings_per_slot + 1)}
            >+</button>
          </div>
        </SettingRow>

        <SettingRow label="Maximum bookings per day" hint="Total appointments you can handle" noBorder>
          <div style={styles.stepperWrap}>
            <button 
              style={styles.stepperBtn}
              onClick={() => updateSetting('max_bookings_per_day', Math.max(1, settings.max_bookings_per_day - 1))}
            >−</button>
            <span style={styles.stepperValue}>{settings.max_bookings_per_day}</span>
            <button 
              style={styles.stepperBtn}
              onClick={() => updateSetting('max_bookings_per_day', settings.max_bookings_per_day + 1)}
            >+</button>
          </div>
        </SettingRow>
      </SectionCard>

      {/* Booking Rules */}
      <SectionCard icon={Calendar} title="Booking Rules" description="Control when clients can book" accent="#f59e0b">
        <SettingRow label="Minimum notice required" hint="How far ahead clients must book">
          <select 
            value={settings.min_notice_hours} 
            onChange={(e) => updateSetting('min_notice_hours', parseInt(e.target.value))}
            style={styles.select}
          >
            <option value={0}>No minimum</option>
            <option value={2}>2 hours</option>
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>1 day</option>
            <option value={48}>2 days</option>
            <option value={72}>3 days</option>
            <option value={168}>1 week</option>
          </select>
        </SettingRow>

        <SettingRow label="Book up to" hint="How far in advance clients can schedule" noBorder>
          <select 
            value={settings.max_advance_days} 
            onChange={(e) => updateSetting('max_advance_days', parseInt(e.target.value))}
            style={styles.select}
          >
            <option value={7}>1 week ahead</option>
            <option value={14}>2 weeks ahead</option>
            <option value={30}>1 month ahead</option>
            <option value={60}>2 months ahead</option>
            <option value={90}>3 months ahead</option>
          </select>
        </SettingRow>
      </SectionCard>

      {/* Payment & Pricing */}
      <SectionCard icon={DollarSign} title="Payment Options" description="Deposits and fees" accent="#8b5cf6">
        <SettingRow label="Accept deposits" hint="Let clients pay a portion upfront to secure booking">
          <Toggle 
            checked={settings.deposit_enabled} 
            onChange={() => updateSetting('deposit_enabled', !settings.deposit_enabled)} 
          />
        </SettingRow>

        {settings.deposit_enabled && (
          <SettingRow label="Deposit amount" hint="Percentage of total required">
            <select 
              value={settings.deposit_percentage} 
              onChange={(e) => updateSetting('deposit_percentage', parseInt(e.target.value))}
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

        <SettingRow label="Inquiry fee" hint="Charge for booking inquiries (0 = free)" noBorder>
          <div style={styles.currencyInput}>
            <span style={styles.currencyLabel}>KES</span>
            <input 
              type="number" 
              min={0}
              value={settings.inquiry_fee}
              onChange={(e) => updateSetting('inquiry_fee', parseFloat(e.target.value) || 0)}
              style={styles.numberInput}
              placeholder="0"
            />
          </div>
        </SettingRow>
      </SectionCard>

      {/* Jump the Line */}
      <SectionCard icon={Zap} title="Priority Booking" description="Let clients pay extra when you're fully booked" accent="#ef4444">
        <SettingRow label="Enable Jump the Line" hint="Clients can pay a fee to book even when slots are full">
          <Toggle 
            checked={settings.jump_line_enabled} 
            onChange={() => updateSetting('jump_line_enabled', !settings.jump_line_enabled)} 
          />
        </SettingRow>

        {settings.jump_line_enabled && (
          <SettingRow label="Priority fee" hint="Extra charge for urgent bookings" noBorder>
            <div style={styles.currencyInput}>
              <span style={styles.currencyLabel}>KES</span>
              <input 
                type="number" 
                min={0}
                value={settings.jump_line_fee}
                onChange={(e) => updateSetting('jump_line_fee', parseFloat(e.target.value) || 0)}
                style={styles.numberInput}
                placeholder="500"
              />
            </div>
          </SettingRow>
        )}
      </SectionCard>

      {/* Reminders */}
      <SectionCard icon={Bell} title="Reminders" description="Notify clients before their appointment" accent="#06b6d4">
        <SettingRow label="Send reminders" hint="Automatic notifications before bookings">
          <Toggle 
            checked={settings.reminders_enabled} 
            onChange={() => updateSetting('reminders_enabled', !settings.reminders_enabled)} 
          />
        </SettingRow>

        {settings.reminders_enabled && (
          <SettingRow label="Send via" hint="How to notify clients" noBorder>
            <select 
              value={settings.reminder_method} 
              onChange={(e) => updateSetting('reminder_method', e.target.value)}
              style={styles.select}
            >
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="both">Both</option>
            </select>
          </SettingRow>
        )}
      </SectionCard>

      {/* Blocked Dates */}
      <SectionCard icon={CalendarX} title="Blocked Dates" description="Days you're unavailable" accent="#6b7280">
        {blockedDates.length > 0 && (
          <div style={styles.blockedList}>
            {blockedDates.map(date => (
              <div key={date.id} style={styles.blockedItem}>
                <div>
                  <span style={styles.blockedDate}>
                    {new Date(date.blocked_date).toLocaleDateString('en-US', { 
                      weekday: 'short', month: 'short', day: 'numeric' 
                    })}
                  </span>
                  {date.reason && <span style={styles.blockedReason}> — {date.reason}</span>}
                </div>
                <button style={styles.removeBtn} onClick={() => removeBlockedDate(date.id)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div style={styles.addBlockedForm}>
          <input 
            type="date" 
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            style={styles.dateInput}
            min={new Date().toISOString().split('T')[0]}
          />
          <input 
            type="text" 
            placeholder="Reason (optional)"
            value={newBlockedReason}
            onChange={(e) => setNewBlockedReason(e.target.value)}
            style={styles.reasonInput}
          />
          <button style={styles.addBtn} onClick={addBlockedDate} disabled={!newBlockedDate}>
            <Plus size={16} /> Add
          </button>
        </div>
      </SectionCard>

      {/* Save Button */}
      <button 
        onClick={saveSettings}
        disabled={saving}
        style={{
          ...styles.saveBtn,
          background: saveSuccess ? '#10b981' : 'var(--accent-color, #8b5cf6)'
        }}
      >
        {saving ? 'Saving...' : saveSuccess ? (
          <><Check size={18} /> Saved!</>
        ) : (
          <><Save size={18} /> Save All Settings</>
        )}
      </button>
    </div>
  );

  // ==================== RENDER CALENDAR / BOOKINGS ====================
  const [expandedBooking, setExpandedBooking] = useState(null);
  
  const updateBookingStatus = async (id, status) => {
    try {
      await bookingsAPI.updateStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      alert('Failed to update booking');
    }
  };

  const renderCalendar = () => {
    if (bookings.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}><Calendar size={40} /></div>
          <h3 style={styles.emptyTitle}>No bookings yet</h3>
          <p style={styles.emptyText}>When customers book your services, they'll appear here.</p>
        </div>
      );
    }

    // Group bookings by status
    const pending = bookings.filter(b => b.status === 'pending');
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const completed = bookings.filter(b => b.status === 'completed');

    const renderBookingCard = (booking) => {
      const isExpanded = expandedBooking === booking.id;
      const bookingDate = new Date(booking.booking_date);
      const isPast = bookingDate < new Date();
      
      return (
        <div key={booking.id} style={styles.bookingCardWrap}>
          {/* Main Card - Clickable */}
          <div 
            style={styles.bookingCard}
            onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
          >
            <div style={styles.bookingDate}>
              <span style={styles.bookingDay}>{bookingDate.getDate()}</span>
              <span style={styles.bookingMonth}>
                {bookingDate.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </div>
            
            <div style={styles.bookingMain}>
              <div style={styles.bookingCustomer}>{booking.customer_name}</div>
              <div style={styles.bookingMeta}>
                <span>🕐 {booking.booking_time?.substring(0, 5)}</span>
                <span>📞 {booking.customer_phone}</span>
              </div>
            </div>
            
            <div style={styles.bookingRight}>
              <div style={{
                ...styles.statusBadge,
                background: booking.status === 'confirmed' ? '#dcfce7' : 
                           booking.status === 'pending' ? '#fef3c7' : 
                           booking.status === 'completed' ? '#e0e7ff' : '#fee2e2',
                color: booking.status === 'confirmed' ? '#166534' : 
                       booking.status === 'pending' ? '#92400e' : 
                       booking.status === 'completed' ? '#3730a3' : '#991b1b'
              }}>
                {booking.status}
              </div>
              <ChevronDown 
                size={18} 
                style={{ 
                  color: 'var(--text-muted)',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s'
                }} 
              />
            </div>
          </div>
          
          {/* Expanded Details */}
          {isExpanded && (
            <div style={styles.bookingExpanded}>
              <div style={styles.expandedGrid}>
                <div style={styles.expandedSection}>
                  <span style={styles.expandedLabel}>Service</span>
                  <span style={styles.expandedValue}>
                    {booking.package_name || booking.service_name || 'Booking'}
                  </span>
                </div>
                
                <div style={styles.expandedSection}>
                  <span style={styles.expandedLabel}>Price</span>
                  <span style={styles.expandedValue}>
                    KES {parseInt(booking.total_amount || booking.package_price || 0).toLocaleString()}
                  </span>
                </div>
                
                <div style={styles.expandedSection}>
                  <span style={styles.expandedLabel}>Payment</span>
                  <span style={styles.expandedValue}>
                    {booking.payment_type === 'deposit' ? `Deposit (${booking.deposit_percentage || 20}%)` :
                     booking.payment_type === 'inquiry' ? 'Inquiry' : 'Full Payment'}
                  </span>
                </div>
                
                <div style={styles.expandedSection}>
                  <span style={styles.expandedLabel}>Email</span>
                  <span style={styles.expandedValue}>
                    {booking.customer_email || '—'}
                  </span>
                </div>
              </div>
              
              {booking.notes && (
                <div style={styles.expandedNotes}>
                  <span style={styles.expandedLabel}>Notes</span>
                  <p style={styles.notesText}>{booking.notes}</p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div style={styles.bookingActions}>
                {booking.status === 'pending' && (
                  <>
                    <button 
                      style={styles.actionBtnConfirm}
                      onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'confirmed'); }}
                    >
                      <Check size={16} /> Confirm
                    </button>
                    <button 
                      style={styles.actionBtnCancel}
                      onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'cancelled'); }}
                    >
                      <X size={16} /> Decline
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && !isPast && (
                  <button 
                    style={styles.actionBtnComplete}
                    onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'completed'); }}
                  >
                    <Check size={16} /> Mark Complete
                  </button>
                )}
                <a 
                  href={`tel:${booking.customer_phone}`} 
                  style={styles.actionBtnCall}
                  onClick={(e) => e.stopPropagation()}
                >
                  📞 Call
                </a>
                <a 
                  href={`https://wa.me/${booking.customer_phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.actionBtnWhatsApp}
                  onClick={(e) => e.stopPropagation()}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div>
        {/* Pending - Needs Attention */}
        {pending.length > 0 && (
          <div style={styles.bookingGroup}>
            <div style={styles.groupHeader}>
              <span style={styles.groupTitle}>🔔 Needs Attention</span>
              <span style={styles.groupCount}>{pending.length}</span>
            </div>
            {pending.map(renderBookingCard)}
          </div>
        )}
        
        {/* Upcoming Confirmed */}
        {confirmed.length > 0 && (
          <div style={styles.bookingGroup}>
            <div style={styles.groupHeader}>
              <span style={styles.groupTitle}>✅ Upcoming</span>
              <span style={styles.groupCount}>{confirmed.length}</span>
            </div>
            {confirmed.map(renderBookingCard)}
          </div>
        )}
        
        {/* Completed */}
        {completed.length > 0 && (
          <div style={styles.bookingGroup}>
            <div style={styles.groupHeader}>
              <span style={styles.groupTitle}>📋 Completed</span>
              <span style={styles.groupCount}>{completed.length}</span>
            </div>
            {completed.map(renderBookingCard)}
          </div>
        )}
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Bookings</h1>
        <p style={styles.pageDesc}>Manage your calendar and booking settings</p>
      </div>

      <div style={styles.tabs}>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'calendar' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('calendar')}
        >
          <Calendar size={18} /> Calendar
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'settings' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      {activeTab === 'calendar' ? renderCalendar() : renderSettings()}
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  page: { maxWidth: '800px' },
  header: { marginBottom: '28px' },
  pageTitle: { 
    fontSize: '28px', 
    fontWeight: '700', 
    color: 'var(--text-primary)', 
    margin: '0 0 4px',
    letterSpacing: '-0.02em'
  },
  pageDesc: { 
    fontSize: '15px', 
    color: 'var(--text-muted)', 
    margin: 0 
  },
  
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    padding: '4px',
    background: 'var(--bg-tertiary, #f3f4f6)',
    borderRadius: '12px',
    width: 'fit-content',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--bg-secondary, white)',
    color: 'var(--text-primary)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },

  // Schedule / Working Hours
  scheduleGrid: { display: 'flex', flexDirection: 'column' },
  dayRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color, #f3f4f6)',
  },
  dayLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  dayName: {
    fontSize: '14px',
    minWidth: '90px',
  },
  timeInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  timeInput: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '8px',
    background: 'var(--bg-secondary, white)',
    color: 'var(--text-primary)',
    width: '100px',
  },
  timeSep: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  closedText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },

  // Inputs
  select: {
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '10px',
    background: 'var(--bg-secondary, white)',
    color: 'var(--text-primary)',
    minWidth: '160px',
    cursor: 'pointer',
  },
  numberInput: {
    padding: '10px 14px',
    fontSize: '14px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-primary)',
    width: '80px',
    textAlign: 'right',
  },
  currencyInput: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '10px',
    background: 'var(--bg-secondary, white)',
    overflow: 'hidden',
  },
  currencyLabel: {
    padding: '10px 12px',
    fontSize: '14px',
    color: 'var(--text-muted)',
    background: 'var(--bg-tertiary, #f9fafb)',
    borderRight: '1px solid var(--border-color, #e5e7eb)',
  },
  
  // Stepper
  stepperWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: '36px',
    height: '36px',
    border: 'none',
    background: 'var(--bg-tertiary, #f9fafb)',
    color: 'var(--text-primary)',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: '50px',
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },

  // Blocked dates
  blockedList: { marginBottom: '16px' },
  blockedItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'var(--bg-tertiary, #f9fafb)',
    borderRadius: '10px',
    marginBottom: '8px',
  },
  blockedDate: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  blockedReason: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  removeBtn: {
    width: '28px',
    height: '28px',
    border: 'none',
    borderRadius: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBlockedForm: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  dateInput: {
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '10px',
    background: 'var(--bg-secondary, white)',
  },
  reasonInput: {
    flex: 1,
    minWidth: '150px',
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '10px',
    background: 'var(--bg-secondary, white)',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'var(--accent-color, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },

  // Save button
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s',
  },

  // Loading
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '16px',
    color: 'var(--text-muted)',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid var(--border-color)',
    borderTopColor: 'var(--accent-color)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'var(--bg-secondary, white)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
  },
  emptyIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    borderRadius: '16px',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-muted)',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
  },

  // Bookings list
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  bookingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'var(--bg-secondary, white)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  bookingDate: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 14px',
    background: 'var(--accent-light, #f3e8ff)',
    borderRadius: '10px',
    minWidth: '55px',
  },
  bookingDay: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--accent-color, #8b5cf6)',
    lineHeight: 1,
  },
  bookingMonth: {
    fontSize: '11px',
    color: 'var(--accent-color, #8b5cf6)',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  bookingInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  // Booking Groups
  bookingGroup: {
    marginBottom: '24px',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  groupTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  groupCount: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--accent-color)',
    background: 'var(--accent-light)',
    padding: '2px 8px',
    borderRadius: '10px',
  },

  // Booking Card (Expandable)
  bookingCardWrap: {
    marginBottom: '10px',
  },
  bookingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'var(--bg-secondary, white)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  bookingMain: {
    flex: 1,
    minWidth: 0,
  },
  bookingCustomer: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  bookingMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  bookingRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  // Expanded Section
  bookingExpanded: {
    background: 'var(--bg-tertiary, #f9fafb)',
    borderRadius: '0 0 12px 12px',
    padding: '16px 20px',
    marginTop: '-8px',
    borderTop: '1px dashed var(--border-color)',
  },
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '16px',
  },
  expandedSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  expandedLabel: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text-muted)',
  },
  expandedValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  expandedNotes: {
    marginBottom: '16px',
  },
  notesText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    background: 'var(--bg-secondary)',
    padding: '10px 12px',
    borderRadius: '8px',
    margin: '6px 0 0',
    fontStyle: 'italic',
  },

  // Action Buttons
  bookingActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  actionBtnConfirm: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  actionBtnCancel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  actionBtnComplete: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  actionBtnCall: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '500',
    textDecoration: 'none',
  },
  actionBtnWhatsApp: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#25d366',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    textDecoration: 'none',
  },
};
