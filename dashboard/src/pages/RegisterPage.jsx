import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    instagramHandle: '',
    phone: '',
    affiliateCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      if (response.data.success) {
        navigate('/login');
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (err) {
      // Better error messages for common cases
      if (err.response?.status === 409) {
        setError('This email or store URL already exists. Try logging in instead.');
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard} className="glass-card">
        <div style={styles.header}>
          <img src="https://jarisolutions.com/wp-content/uploads/2024/09/cropped-cropped-jari-solutions-logo-180x180.png" alt="Jari" style={styles.logo} />
          <h1 style={styles.title}>Join Jari.Ecom</h1>
          <p style={styles.subtitle}>Start selling in under 5 minutes</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Business Name</label>
            <input type="text" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} placeholder="Jari Solutions" required className="dashboard-input" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" required className="dashboard-input" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required minLength="6" className="dashboard-input" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Instagram Handle</label>
            <input type="text" value={formData.instagramHandle} onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })} placeholder="@yourhandle" required className="dashboard-input" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="254712345678" required className="dashboard-input" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Affiliate Code <span style={styles.optional}>(Optional)</span></label>
            <input type="text" value={formData.affiliateCode} onChange={(e) => setFormData({ ...formData, affiliateCode: e.target.value.toUpperCase() })} placeholder="PARTNER123" className="dashboard-input" />
            <p style={styles.hint}>Have a referral code? Enter it for special benefits</p>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>

      <div style={styles.bgGlow}></div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' },
  formCard: { width: '100%', maxWidth: '460px', padding: '36px 32px', position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: '28px' },
  logo: { width: '56px', height: '56px', borderRadius: '14px', marginBottom: '14px' },
  title: { fontSize: '26px', fontWeight: '700', marginBottom: '6px', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
  error: { padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  optional: { fontSize: '10px', fontWeight: '400', color: 'var(--text-muted)', textTransform: 'none' },
  hint: { fontSize: '11px', color: 'var(--text-muted)' },
  submitBtn: { marginTop: '8px', padding: '14px', fontSize: '15px' },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' },
  link: { color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' },
  bgGlow: { position: 'fixed', width: '800px', height: '800px', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', opacity: 0.4 },
};
