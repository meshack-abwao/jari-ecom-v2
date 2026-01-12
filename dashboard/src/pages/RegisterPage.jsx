import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', businessName: '', instagram: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="jv2-card" style={styles.card}>
        <h1 style={styles.title}>Jari.Ecom</h1>
        <p style={styles.subtitle}>Create your store in minutes</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label className="jv2-label">Business Name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="jv2-input"
              placeholder="My Fashion Store"
              required
            />
          </div>

          <div>
            <label className="jv2-label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="jv2-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="jv2-label">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="jv2-input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="jv2-label">Instagram Handle (optional)</label>
            <input
              type="text"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="jv2-input"
              placeholder="@yourhandle"
            />
            <p style={{ fontSize: 12, color: 'var(--jv2-text-muted)', marginTop: 6 }}>
              This becomes your store URL
            </p>
          </div>

          <button type="submit" disabled={loading} className="jv2-btn jv2-btn-primary" style={{ width: '100%' }}>
            {loading ? 'Creating...' : 'Create Store'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 40
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 8,
    background: 'linear-gradient(135deg, #ff9f0a, #ff375f)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--jv2-text-muted)',
    marginBottom: 32
  },
  error: {
    padding: 12,
    background: 'rgba(255,55,95,0.1)',
    border: '1px solid rgba(255,55,95,0.3)',
    borderRadius: 8,
    color: '#ff375f',
    fontSize: 14,
    marginBottom: 20
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    color: 'var(--jv2-text-muted)'
  },
  link: {
    color: 'var(--jv2-primary)',
    textDecoration: 'none'
  }
};
