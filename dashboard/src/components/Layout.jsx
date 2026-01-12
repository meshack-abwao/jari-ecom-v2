import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Package, ShoppingCart, Settings, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="jv2-layout">
      <aside className="jv2-sidebar">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--jv2-primary)' }}>
            Jari.Ecom
          </h1>
          <p style={{ fontSize: 11, color: 'var(--jv2-text-muted)', marginTop: 4 }}>
            Dashboard v2
          </p>
        </div>

        <div className="jv2-card" style={{ padding: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{user?.business_name || 'User'}</p>
          <p style={{ fontSize: 12, color: 'var(--jv2-text-muted)' }}>{user?.email}</p>
        </div>

        <nav className="jv2-nav">
          <NavLink to="/" end className={({ isActive }) => `jv2-nav-link ${isActive ? 'active' : ''}`}>
            <Home size={20} /> Overview
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `jv2-nav-link ${isActive ? 'active' : ''}`}>
            <Package size={20} /> Products
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `jv2-nav-link ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={20} /> Orders
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `jv2-nav-link ${isActive ? 'active' : ''}`}>
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        <button onClick={handleLogout} className="jv2-btn jv2-btn-secondary" style={{ marginTop: 'auto' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="jv2-main">
        <Outlet />
      </main>
    </div>
  );
}
