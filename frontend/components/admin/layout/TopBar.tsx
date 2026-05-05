'use client';

import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useSidebar } from '@/components/admin/providers/SidebarContext';

export default function TopBar() {
  const { user, logout } = useAdminAuth();
  const { toggleMobile } = useSidebar();

  return (
    <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleMobile}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label="Mở menu"
        >
          ☰
        </button>
        <span className="text-sm text-stone-700">
          Xin chào,{' '}
          <span className="font-semibold text-stone-900">{user?.username ?? '...'}</span>
        </span>
      </div>
      <button
        onClick={logout}
        className="text-sm text-stone-500 hover:text-red-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
      >
        Đăng xuất
      </button>
    </header>
  );
}
