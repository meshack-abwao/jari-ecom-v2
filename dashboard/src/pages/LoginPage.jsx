import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard} className="glass-card">
        <div style={styles.header}>
          <img src="https://jarisolutions.com/wp-content/uploads/2024/09/cropped-cropped-jari-solutions-logo-180x180.png" alt="Jari" style={styles.logo} />
          <h1 style={styles.title}>Jari.Ecom</h1>
          <p style={styles.subtitle}>Sign in to your dashboard</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="dashboard-input" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="dashboard-input" />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={styles.submitBtn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Create one</Link>
        </p>
      </div>

      <div style={styles.bgGlow}></div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' },
  formCard: { width: '100%', maxWidth: '420px', padding: '40px 36px', position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: '32px' },
  logo: { width: '64px', height: '64px', borderRadius: '16px', marginBottom: '16px' },
  title: { fontSize: '28px', fontWeight: '700', marginBottom: '8px', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
  error: { padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#ef4444', fontSize: '13px', marginBottom: '20px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  submitBtn: { marginTop: '8px', padding: '14px', fontSize: '15px' },
  footer: { textAlign: 'center', marginTop: '28px', fontSize: '14px', color: 'var(--text-muted)' },
  link: { color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' },
  bgGlow: { position: 'fixed', width: '800px', height: '800px', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', opacity: 0.4 },
};
