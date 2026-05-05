import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  initials: string;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
  gender?: string;
  dob?: string;
  wishlist?: string[];
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, token: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem('accessToken');
      if (!stored) { setLoading(false); return; }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
        setToken(stored);
      } catch {
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (form: { name: string; email: string; phone?: string; password: string }) => {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem('accessToken', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
