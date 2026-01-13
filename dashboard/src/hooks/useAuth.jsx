import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jv2_token');
    if (token) {
      authAPI.getMe()
        .then((response) => setUser(response.data?.user || response.data))
        .catch(() => localStorage.removeItem('jv2_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const data = response.data;
    // API returns { token, user } directly (no success wrapper)
    if (data.token) {
      localStorage.setItem('jv2_token', data.token);
      setUser(data.user);
      return data.user;
    } else {
      throw new Error(data.error || 'Login failed');
    }
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const data = response.data;
    // API returns { token, user } directly (no success wrapper)
    if (data.token) {
      localStorage.setItem('jv2_token', data.token);
      setUser(data.user);
      return data.user;
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('jv2_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
