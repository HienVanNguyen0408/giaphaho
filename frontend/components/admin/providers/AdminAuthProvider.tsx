'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, logout as apiLogout } from '@/lib/api';
import type { User } from '@/types';

interface AdminAuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function AuthLoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: '#0e0a06' }}
      aria-label="Đang xác thực..."
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, #8b1a1a, #b45309)',
            boxShadow: '0 8px 32px rgba(139,26,26,0.4)',
          }}
        >
          <span
            className="text-[1.4rem] text-amber-100"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            P
          </span>
        </div>
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(217,119,6,0.2)', borderTopColor: '#d97706' }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        setUser(null);
        router.replace('/admin/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore errors — redirect regardless
    } finally {
      setUser(null);
      router.push('/admin/login');
    }
  }, [router]);

  if (loading) return <AuthLoadingScreen />;
  if (!user) return null;

  return (
    <AdminAuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
