import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { apiGet, apiPost, apiPut } from '../lib/api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ecom_token');
    if (token) {
      apiGet('/auth/me').then((u: User) => setUser(u)).catch(() => { localStorage.removeItem('ecom_token'); }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiPost('/auth/login', { email, password });
      localStorage.setItem('ecom_token', res.token);
      const { token, ...u } = res;
      setUser(u);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Invalid email or password' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await apiPost('/auth/register', { name, email, password });
      localStorage.setItem('ecom_token', res.token);
      const { token, ...u } = res;
      setUser(u);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Error' };
    }
  };

  const logout = () => {
    apiPost('/auth/logout', {}).catch(() => {});
    localStorage.removeItem('ecom_token');
    setUser(null);
  };

  const updateProfile = async (patch: Partial<User>) => {
    if (!user) return;
    const updated = await apiPut('/users/' + user.id, patch);
    setUser(updated);
  };

  const verifyPassword = async (password: string) => {
    if (!user) return false;
    const r = await apiPost('/auth/verify', { password });
    return !!r.ok;
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout, updateProfile, verifyPassword }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside provider');
  return c;
}