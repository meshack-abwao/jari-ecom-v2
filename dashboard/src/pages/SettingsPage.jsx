import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [store, setStore] = useState(null);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', tagline: '', theme: 'warm-sunset' });

  useEffect(() => {
    Promise.all([api.getStore(), api.getThemes()])
      .then(([s, t]) => {
        setStore(s);
        setThemes(t);
        setForm({
          name: s.config?.name || '',
          tagline: s.config?.tagline || '',
          theme: s.config?.theme || 'warm-sunset'
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateStore(form);
      alert('Settings saved!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div className="jv2-page-header">
        <h1 className="jv2-page-title">Settings</h1>
        <p className="jv2-page-subtitle">Customize your store appearance</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="jv2-card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Store Information</h3>

          <div style={{ marginBottom: 20 }}>
            <label className="jv2-label">Store Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="jv2-input"
              placeholder="My Fashion Store"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="jv2-label">Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="jv2-input"
              placeholder="Premium fashion for everyone"
            />
          </div>

          <div>
            <label className="jv2-label">Store URL</label>
            <input
              type="text"
              value={store?.slug || ''}
              className="jv2-input"
              disabled
              style={{ opacity: 0.5 }}
            />
            <p style={{ fontSize: 12, color: 'var(--jv2-text-muted)', marginTop: 8 }}>
              Your store: jari.ecom/{store?.slug}
            </p>
          </div>
        </div>

        <div className="jv2-card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Theme</h3>
          <p style={{ color: 'var(--jv2-text-muted)', marginBottom: 20, fontSize: 14 }}>
            Choose a color theme for your store
          </p>

          <div className="jv2-grid jv2-grid-4">
            {themes.map((t) => (
              <div
                key={t.slug}
                onClick={() => setForm({ ...form, theme: t.slug })}
                style={{
                  cursor: 'pointer',
                  padding: 16,
                  borderRadius: 12,
                  border: form.theme === t.slug ? '2px solid var(--jv2-primary)' : '1px solid var(--jv2-border)',
                  background: 'var(--jv2-surface)'
                }}
              >
                <div style={{
                  height: 80,
                  borderRadius: 8,
                  marginBottom: 12,
                  background: t.colors?.gradient || t.colors?.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {form.theme === t.slug && <Check size={24} color="white" />}
                </div>
                <p style={{ fontWeight: 600, textAlign: 'center' }}>{t.name}</p>
                {t.is_premium && (
                  <p style={{ fontSize: 11, color: 'var(--jv2-primary)', textAlign: 'center', marginTop: 4 }}>
                    Premium
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="jv2-btn jv2-btn-primary">
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
