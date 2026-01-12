import { useState, useEffect } from 'react';
import { settingsAPI } from '../api/client';
import { Save, Check, Crown, Palette, Type } from 'lucide-react';

const DEFAULT_THEMES = [
  { id: 1, name: 'warm-sunset', display_name: 'Warm Sunset', gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', primary_color: '#f97316', is_premium: false },
  { id: 2, name: 'cool-ocean', display_name: 'Cool Ocean', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', primary_color: '#0ea5e9', is_premium: false },
  { id: 3, name: 'royal-purple', display_name: 'Royal Purple', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', primary_color: '#8b5cf6', is_premium: false },
  { id: 4, name: 'fresh-mint', display_name: 'Fresh Mint', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', primary_color: '#10b981', is_premium: false },
  { id: 5, name: 'midnight-dark', display_name: 'Midnight Dark', gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', primary_color: '#374151', is_premium: false },
  { id: 6, name: 'rose-gold', display_name: 'Rose Gold', gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', primary_color: '#ec4899', is_premium: true },
  { id: 7, name: 'cosmic-purple', display_name: 'Cosmic Purple', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', primary_color: '#6366f1', is_premium: true },
];

const FONT_OPTIONS = [
  { value: 'Inter', name: 'Inter', preview: 'Modern & Clean' },
  { value: 'Poppins', name: 'Poppins', preview: 'Bold & Friendly' },
  { value: 'Roboto', name: 'Roboto', preview: 'Classic' },
  { value: 'Montserrat', name: 'Montserrat', preview: 'Elegant' },
  { value: 'Playfair Display', name: 'Playfair', preview: 'Luxury Serif' },
  { value: 'Space Grotesk', name: 'Space Grotesk', preview: 'Tech Modern' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themes, setThemes] = useState(DEFAULT_THEMES);
  const [storeSettings, setStoreSettings] = useState({
    logoText: '',
    tagline: '',
    subdomain: '',
    themeColor: '',
    fontFamily: 'Inter',
  });

  useEffect(() => { loadSettings(); loadThemes(); }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      const settings = response.data?.settings || {};
      setStoreSettings({
        logoText: settings.logo_text || settings.logoText || '',
        tagline: settings.tagline || '',
        subdomain: settings.subdomain || '',
        themeColor: settings.theme_color || settings.themeColor || 'warm-sunset',
        fontFamily: settings.font_family || settings.fontFamily || 'Inter',
      });
    } catch (error) { console.error('Failed to load settings:', error); }
    finally { setLoading(false); }
  };

  const loadThemes = async () => {
    try {
      const response = await settingsAPI.getThemes();
      if (response.data?.themes?.length > 0) {
        setThemes(response.data.themes);
      }
    } catch (error) { console.log('Using default themes'); }
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update({
        logo_text: storeSettings.logoText,
        tagline: storeSettings.tagline,
        theme_color: storeSettings.themeColor,
        font_family: storeSettings.fontFamily,
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings. Please try again.');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div><p>Loading settings...</p></div>;

  return (
    <div className="fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Store Settings</h1>
        <p style={styles.subtitle}>Customize how your store looks to customers</p>
      </div>

      <form onSubmit={handleSaveStore}>
        {/* Basic Info */}
        <div style={styles.card} className="glass-card">
          <h3 style={styles.cardTitle}>Basic Information</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>STORE NAME</label>
            <input type="text" value={storeSettings.logoText} onChange={(e) => setStoreSettings({ ...storeSettings, logoText: e.target.value })} placeholder="My Fashion Store" className="dashboard-input" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>TAGLINE</label>
            <input type="text" value={storeSettings.tagline} onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })} placeholder="Premium fashion for everyone" className="dashboard-input" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>STORE URL</label>
            <input type="text" value={storeSettings.subdomain} disabled className="dashboard-input" style={styles.inputDisabled} />
            <p style={styles.hint}>jari.ecom/{storeSettings.subdomain}</p>
          </div>
        </div>

        {/* Theme Selection */}
        <div style={styles.card} className="glass-card">
          <div style={styles.cardHeader}>
            <Palette size={20} style={{ color: 'var(--accent-color)' }} />
            <h3 style={styles.cardTitle}>Choose Your Theme</h3>
          </div>
          <p style={styles.cardDesc}>Select a color theme that matches your brand</p>
          <div style={styles.themesGrid}>
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setStoreSettings({ ...storeSettings, themeColor: theme.name })}
                style={{
                  ...styles.themeCard,
                  border: storeSettings.themeColor === theme.name ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                }}
                className="glass-card"
              >
                <div style={{ ...styles.themePreview, background: theme.gradient }}>
                  {storeSettings.themeColor === theme.name && (
                    <div style={styles.themeCheck}><Check size={20} /></div>
                  )}
                </div>
                <p style={styles.themeName}>{theme.display_name}</p>
                {theme.is_premium && (
                  <div style={styles.premiumBadge}><Crown size={12} /> Premium</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div style={styles.card} className="glass-card">
          <div style={styles.cardHeader}>
            <Type size={20} style={{ color: 'var(--accent-color)' }} />
            <h3 style={styles.cardTitle}>Choose Your Font</h3>
          </div>
          <p style={styles.cardDesc}>Select a font that represents your brand personality</p>
          <div style={styles.fontsGrid}>
            {FONT_OPTIONS.map((font) => (
              <div
                key={font.value}
                onClick={() => setStoreSettings({ ...storeSettings, fontFamily: font.value })}
                style={{
                  ...styles.fontCard,
                  border: storeSettings.fontFamily === font.value ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                }}
                className="glass-card"
              >
                <div style={styles.fontPreview}>
                  <p style={{ ...styles.fontSample, fontFamily: font.value }}>Aa</p>
                  {storeSettings.fontFamily === font.value && (
                    <div style={styles.fontCheck}><Check size={16} /></div>
                  )}
                </div>
                <p style={styles.fontName}>{font.name}</p>
                <p style={styles.fontDesc}>{font.preview}</p>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={styles.saveBtn}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' },
  spinner: { width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' },
  
  header: { marginBottom: '32px' },
  title: { fontSize: '34px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)' },
  
  card: { padding: '28px', marginBottom: '24px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 },
  cardDesc: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' },
  
  formGroup: { marginBottom: '20px' },
  label: { fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' },
  inputDisabled: { background: 'var(--bg-tertiary)', color: 'var(--text-muted)', cursor: 'not-allowed' },
  hint: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' },
  
  themesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' },
  themeCard: { padding: '16px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center' },
  themePreview: { height: '80px', borderRadius: '12px', marginBottom: '12px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  themeCheck: { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  themeName: { fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' },
  premiumBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'var(--accent-light)', color: 'var(--accent-color)', borderRadius: '6px', fontSize: '10px', fontWeight: '700' },
  
  fontsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' },
  fontCard: { padding: '16px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center' },
  fontPreview: { height: '70px', borderRadius: '10px', marginBottom: '10px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  fontSample: { fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)' },
  fontCheck: { position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fontName: { fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' },
  fontDesc: { fontSize: '10px', color: 'var(--text-muted)' },
  
  saveBtn: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' },
};
