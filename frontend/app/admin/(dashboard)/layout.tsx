import { ReactNode } from 'react';
import { AdminAuthProvider } from '@/components/admin/providers/AdminAuthProvider';
import { SidebarProvider } from '@/components/admin/providers/SidebarContext';
import Sidebar from '@/components/admin/layout/Sidebar';
import TopBar from '@/components/admin/layout/TopBar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <SidebarProvider>
        <div
          className="flex h-screen overflow-hidden"
          style={{ background: 'var(--t-bg)' }}
        >
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TopBar />
            <main
              className="flex-1 overflow-y-auto p-6"
              style={{ background: 'var(--t-surface-2)' }}
            >
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthProvider>
  );
}
