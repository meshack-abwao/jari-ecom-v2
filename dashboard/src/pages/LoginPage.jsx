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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="jv2-card" style={styles.card}>
        <h1 style={styles.title}>Jari.Ecom</h1>
        <p style={styles.subtitle}>Sign in to your dashboard</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label className="jv2-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="jv2-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="jv2-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="jv2-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="jv2-btn jv2-btn-primary" style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
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
    maxWidth: 400,
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
