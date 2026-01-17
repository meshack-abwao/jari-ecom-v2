import { useState, useEffect } from 'react';
import { bookingsAPI } from '../api/client';
import { 
  Calendar, Clock, Settings, Users, DollarSign, 
  ChevronDown, ChevronRight, Plus, X, Check,
  Bell, Zap, CalendarX, RefreshCw
} from 'lucide-react';

export default function BookingsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'settings'
  
  // Bookings data
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Settings data
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

  // Working hours
  const [workingHours, setWorkingHours] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  
  // UI state
  const [savingSettings, setSavingSettings] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    schedule: true,
    slots: false,
    advance: false,
    premium: false,
    payment: false,
    reminders: false,
    blocked: false
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, settingsRes, hoursRes, blockedRes] = await Promise.all([
        bookingsAPI.getAll(),
        bookingsAPI.getSettings(),
        bookingsAPI.getWorkingHours(),
        bookingsAPI.getBlockedDates()
      ]);
      
      setBookings(bookingsRes.data || []);
      if (settingsRes.data && Object.keys(settingsRes.data).length > 0) {
        setSettings(prev => ({ ...prev, ...settingsRes.data }));
      }
      setWorkingHours(hoursRes.data || []);
      setBlockedDates(blockedRes.data || []);
    } catch (error) {
      console.error('Failed to load booking data:', error);
    } finally {
      setLoading(false);
    }
  };


  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await bookingsAPI.updateSettings(settings);
      // Show success toast or notification
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSavingSettings(false);
    }
  };

  const updateWorkingHour = async (day, field, value) => {
    const existingHour = workingHours.find(h => h.day_of_week === day);
    const newData = { ...existingHour, [field]: value };
    
    try {
      await bookingsAPI.updateWorkingHours(day, newData);
      setWorkingHours(prev => 
        prev.map(h => h.day_of_week === day ? { ...h, [field]: value } : h)
      );
    } catch (error) {
      console.error('Failed to update working hours:', error);
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
    } catch (error) {
      console.error('Failed to add blocked date:', error);
    }
  };

  const removeBlockedDate = async (id) => {
    try {
      await bookingsAPI.removeBlockedDate(id);
      setBlockedDates(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to remove blocked date:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getWorkingHour = (day) => {
    return workingHours.find(h => h.day_of_week === day) || { is_open: false, start_time: '09:00', end_time: '17:00' };
  };


  // ==================== STYLES ====================
  const styles = {
    container: { padding: '0' },
    header: {
      marginBottom: '24px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '4px',
    },
    subtitle: {
      color: 'var(--text-secondary)',
      fontSize: '14px',
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid var(--border-color)',
      paddingBottom: '12px',
    },
    tab: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      background: 'transparent',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
    },
    tabActive: {
      background: 'var(--primary-color)',
      color: 'white',
    },
    section: {
      background: 'var(--card-bg)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      marginBottom: '16px',
      overflow: 'hidden',
    },
    sectionHeader: {
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      borderBottom: '1px solid transparent',
    },
    sectionHeaderExpanded: {
      borderBottom: '1px solid var(--border-color)',
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '15px',
      fontWeight: '600',
      color: 'var(--text-primary)',
    },
    sectionContent: {
      padding: '20px',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border-color)',
    },
    rowLast: {
      borderBottom: 'none',
    },
    label: {
      fontSize: '14px',
      color: 'var(--text-primary)',
    },
    sublabel: {
      fontSize: '12px',
      color: 'var(--text-secondary)',
      marginTop: '2px',
    },
    input: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-color)',
      color: 'var(--text-primary)',
      fontSize: '14px',
      width: '120px',
    },
    select: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-color)',
      color: 'var(--text-primary)',
      fontSize: '14px',
      cursor: 'pointer',
    },
    toggle: {
      position: 'relative',
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      background: 'var(--border-color)',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    toggleActive: {
      background: 'var(--primary-color)',
    },
    toggleKnob: {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'white',
      transition: 'transform 0.2s',
    },
    toggleKnobActive: {
      transform: 'translateX(20px)',
    },
    dayRow: {
      display: 'grid',
      gridTemplateColumns: '100px 50px 1fr',
      alignItems: 'center',
      gap: '16px',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-color)',
    },
    dayName: {
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--text-primary)',
    },
    timeInputs: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    timeInput: {
      padding: '6px 10px',
      borderRadius: '6px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-color)',
      color: 'var(--text-primary)',
      fontSize: '13px',
      width: '90px',
    },
    saveButton: {
      padding: '12px 24px',
      borderRadius: '10px',
      border: 'none',
      background: 'var(--primary-color)',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '20px',
    },
    blockedItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      background: 'var(--bg-color)',
      borderRadius: '8px',
      marginBottom: '8px',
    },
    addBlockedRow: {
      display: 'flex',
      gap: '10px',
      marginTop: '12px',
    },
    addButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      background: 'var(--primary-color)',
      color: 'white',
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    removeButton: {
      padding: '4px',
      borderRadius: '6px',
      border: 'none',
      background: 'transparent',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: 'var(--text-secondary)',
    },
  };


  // ==================== RENDER COMPONENTS ====================
  
  const Toggle = ({ checked, onChange }) => (
    <div 
      style={{ ...styles.toggle, ...(checked ? styles.toggleActive : {}) }}
      onClick={() => onChange(!checked)}
    >
      <div style={{ ...styles.toggleKnob, ...(checked ? styles.toggleKnobActive : {}) }} />
    </div>
  );

  const Section = ({ id, icon: Icon, title, children }) => (
    <div style={styles.section}>
      <div 
        style={{ 
          ...styles.sectionHeader, 
          ...(expandedSections[id] ? styles.sectionHeaderExpanded : {}) 
        }}
        onClick={() => toggleSection(id)}
      >
        <div style={styles.sectionTitle}>
          <Icon size={18} />
          {title}
        </div>
        {expandedSections[id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </div>
      {expandedSections[id] && (
        <div style={styles.sectionContent}>
          {children}
        </div>
      )}
    </div>
  );


  const renderSettings = () => (
    <div>
      {/* Working Schedule */}
      <Section id="schedule" icon={Clock} title="Working Schedule">
        {[1, 2, 3, 4, 5, 6, 0].map(day => {
          const hour = getWorkingHour(day);
          return (
            <div key={day} style={{ ...styles.dayRow, ...(day === 0 ? styles.rowLast : {}) }}>
              <span style={styles.dayName}>{dayNames[day]}</span>
              <Toggle 
                checked={hour.is_open} 
                onChange={(val) => updateWorkingHour(day, 'is_open', val)} 
              />
              {hour.is_open && (
                <div style={styles.timeInputs}>
                  <input 
                    type="time" 
                    value={hour.start_time?.substring(0, 5) || '09:00'} 
                    onChange={(e) => updateWorkingHour(day, 'start_time', e.target.value)}
                    style={styles.timeInput}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>to</span>
                  <input 
                    type="time" 
                    value={hour.end_time?.substring(0, 5) || '17:00'} 
                    onChange={(e) => updateWorkingHour(day, 'end_time', e.target.value)}
                    style={styles.timeInput}
                  />
                </div>
              )}
            </div>
          );
        })}
      </Section>


      {/* Slot Settings */}
      <Section id="slots" icon={Users} title="Slot Settings">
        <div style={styles.row}>
          <div>
            <div style={styles.label}>Duration per booking</div>
            <div style={styles.sublabel}>How long each appointment slot lasts</div>
          </div>
          <select 
            value={settings.slot_duration_minutes} 
            onChange={(e) => setSettings(s => ({ ...s, slot_duration_minutes: parseInt(e.target.value) }))}
            style={styles.select}
          >
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
            <option value={240}>4 hours</option>
            <option value={480}>Full day</option>
          </select>
        </div>
        <div style={styles.row}>
          <div>
            <div style={styles.label}>Max bookings per slot</div>
            <div style={styles.sublabel}>1 for exclusive, higher for group classes</div>
          </div>
          <input 
            type="number" 
            min={1} 
            max={50}
            value={settings.max_bookings_per_slot}
            onChange={(e) => setSettings(s => ({ ...s, max_bookings_per_slot: parseInt(e.target.value) }))}
            style={{ ...styles.input, width: '80px' }}
          />
        </div>
        <div style={{ ...styles.row, ...styles.rowLast }}>
          <div>
            <div style={styles.label}>Max bookings per day</div>
            <div style={styles.sublabel}>Total appointments you can handle daily</div>
          </div>
          <input 
            type="number" 
            min={1} 
            max={100}
            value={settings.max_bookings_per_day}
            onChange={(e) => setSettings(s => ({ ...s, max_bookings_per_day: parseInt(e.target.value) }))}
            style={{ ...styles.input, width: '80px' }}
          />
        </div>
      </Section>


      {/* Advance Booking Rules */}
      <Section id="advance" icon={Calendar} title="Advance Booking Rules">
        <div style={styles.row}>
          <div>
            <div style={styles.label}>Minimum notice</div>
            <div style={styles.sublabel}>How far in advance clients must book</div>
          </div>
          <select 
            value={settings.min_notice_hours} 
            onChange={(e) => setSettings(s => ({ ...s, min_notice_hours: parseInt(e.target.value) }))}
            style={styles.select}
          >
            <option value={0}>No minimum</option>
            <option value={2}>2 hours</option>
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>2 days</option>
            <option value={72}>3 days</option>
            <option value={120}>5 days</option>
            <option value={168}>1 week</option>
          </select>
        </div>
        <div style={{ ...styles.row, ...styles.rowLast }}>
          <div>
            <div style={styles.label}>Book up to</div>
            <div style={styles.sublabel}>How far in the future clients can book</div>
          </div>
          <select 
            value={settings.max_advance_days} 
            onChange={(e) => setSettings(s => ({ ...s, max_advance_days: parseInt(e.target.value) }))}
            style={styles.select}
          >
            <option value={7}>1 week</option>
            <option value={14}>2 weeks</option>
            <option value={30}>1 month</option>
            <option value={60}>2 months</option>
            <option value={90}>3 months</option>
          </select>
        </div>
      </Section>


      {/* Premium: Jump the Line */}
      <Section id="premium" icon={Zap} title="Premium: Jump the Line">
        <div style={styles.row}>
          <div>
            <div style={styles.label}>Enable "Jump the Line"</div>
            <div style={styles.sublabel}>Let clients pay extra to book within minimum notice</div>
          </div>
          <Toggle 
            checked={settings.jump_line_enabled} 
            onChange={(val) => setSettings(s => ({ ...s, jump_line_enabled: val }))} 
          />
        </div>
        {settings.jump_line_enabled && (
          <div style={{ ...styles.row, ...styles.rowLast }}>
            <div>
              <div style={styles.label}>Skip wait fee (KES)</div>
              <div style={styles.sublabel}>Extra charge for urgent bookings</div>
            </div>
            <input 
              type="number" 
              min={0}
              value={settings.jump_line_fee}
              onChange={(e) => setSettings(s => ({ ...s, jump_line_fee: parseFloat(e.target.value) || 0 }))}
              style={styles.input}
            />
          </div>
        )}
      </Section>


      {/* Payment Settings */}
      <Section id="payment" icon={DollarSign} title="Payment Settings">
        <div style={styles.row}>
          <div>
            <div style={styles.label}>Accept deposits</div>
            <div style={styles.sublabel}>Let clients pay a portion upfront</div>
          </div>
          <Toggle 
            checked={settings.deposit_enabled} 
            onChange={(val) => setSettings(s => ({ ...s, deposit_enabled: val }))} 
          />
        </div>
        {settings.deposit_enabled && (
          <div style={styles.row}>
            <div>
              <div style={styles.label}>Deposit percentage</div>
              <div style={styles.sublabel}>Portion of total required upfront</div>
            </div>
            <select 
              value={settings.deposit_percentage} 
              onChange={(e) => setSettings(s => ({ ...s, deposit_percentage: parseInt(e.target.value) }))}
              style={styles.select}
            >
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={25}>25%</option>
              <option value={30}>30%</option>
              <option value={50}>50%</option>
            </select>
          </div>
        )}
        <div style={{ ...styles.row, ...styles.rowLast }}>
          <div>
            <div style={styles.label}>Inquiry fee (KES)</div>
            <div style={styles.sublabel}>Charge for serious inquiries (0 = free)</div>
          </div>
          <input 
            type="number" 
            min={0}
            value={settings.inquiry_fee}
            onChange={(e) => setSettings(s => ({ ...s, inquiry_fee: parseFloat(e.target.value) || 0 }))}
            style={styles.input}
          />
        </div>
      </Section>


      {/* Reminders */}
      <Section id="reminders" icon={Bell} title="Reminders">
        <div style={styles.row}>
          <div>
            <div style={styles.label}>Enable reminders</div>
            <div style={styles.sublabel}>Send notifications before appointments</div>
          </div>
          <Toggle 
            checked={settings.reminders_enabled} 
            onChange={(val) => setSettings(s => ({ ...s, reminders_enabled: val }))} 
          />
        </div>
        {settings.reminders_enabled && (
          <div style={{ ...styles.row, ...styles.rowLast }}>
            <div>
              <div style={styles.label}>Reminder method</div>
              <div style={styles.sublabel}>How to notify clients</div>
            </div>
            <select 
              value={settings.reminder_method} 
              onChange={(e) => setSettings(s => ({ ...s, reminder_method: e.target.value }))}
              style={styles.select}
            >
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="both">Both</option>
            </select>
          </div>
        )}
      </Section>


      {/* Blocked Dates */}
      <Section id="blocked" icon={CalendarX} title="Blocked Dates">
        {blockedDates.length > 0 ? (
          blockedDates.map(date => (
            <div key={date.id} style={styles.blockedItem}>
              <div>
                <div style={styles.label}>
                  {new Date(date.blocked_date).toLocaleDateString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                  })}
                </div>
                {date.reason && <div style={styles.sublabel}>{date.reason}</div>}
              </div>
              <button 
                style={styles.removeButton}
                onClick={() => removeBlockedDate(date.id)}
              >
                <X size={16} />
              </button>
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
            No blocked dates
          </div>
        )}
        <div style={styles.addBlockedRow}>
          <input 
            type="date" 
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            style={{ ...styles.input, width: '150px' }}
          />
          <input 
            type="text" 
            placeholder="Reason (optional)"
            value={newBlockedReason}
            onChange={(e) => setNewBlockedReason(e.target.value)}
            style={{ ...styles.input, flex: 1 }}
          />
          <button style={styles.addButton} onClick={addBlockedDate}>
            <Plus size={14} /> Add
          </button>
        </div>
      </Section>

      {/* Save Button */}
      <button style={styles.saveButton} onClick={saveSettings} disabled={savingSettings}>
        {savingSettings ? <RefreshCw size={16} className="spin" /> : <Check size={16} />}
        {savingSettings ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
