import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { adminLogout as apiAdminLogout } from '../lib/adminApi.js';

type AdminAuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AdminAuthContextValue {
  status: AdminAuthStatus;
  markAuthenticated: () => void;
  markUnauthenticated: () => void;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminAuthStatus>('checking');

  const markAuthenticated = useCallback(() => setStatus('authenticated'), []);
  const markUnauthenticated = useCallback(() => setStatus('unauthenticated'), []);

  const logout = useCallback(async () => {
    await apiAdminLogout().catch(() => undefined);
    setStatus('unauthenticated');
  }, []);

  return (
    <AdminAuthContext.Provider value={{ status, markAuthenticated, markUnauthenticated, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
