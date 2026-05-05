'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextValue {
  mobileOpen: boolean;
  desktopCollapsed: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
  toggleDesktop: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Close mobile sidebar on route changes (resize guard)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        mobileOpen,
        desktopCollapsed,
        toggleMobile: () => setMobileOpen((v) => !v),
        closeMobile: () => setMobileOpen(false),
        toggleDesktop: () => setDesktopCollapsed((v) => !v),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
