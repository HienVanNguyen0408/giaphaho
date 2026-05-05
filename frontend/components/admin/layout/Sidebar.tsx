'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useSidebar } from '@/components/admin/providers/SidebarContext';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Tổng quan', icon: '▦' },
  { href: '/admin/gia-pha', label: 'Gia phả', icon: '🌳' },
  { href: '/admin/tin-tuc', label: 'Tin tức', icon: '📰' },
  { href: '/admin/video', label: 'Video', icon: '▶' },
  { href: '/admin/section', label: 'Mục trang chủ', icon: '⊞' },
  { href: '/admin/footer', label: 'Footer', icon: '◻' },
  { href: '/admin/notification', label: 'Thông báo', icon: '🔔' },
  { href: '/admin/activity-log', label: 'Nhật ký hoạt động', icon: '📋', superAdminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const { mobileOpen, desktopCollapsed, closeMobile, toggleDesktop } = useSidebar();

  const visibleItems = navItems.filter(
    (item) => !item.superAdminOnly || user?.role === 'SUPER_ADMIN',
  );

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 bg-stone-900 flex flex-col transition-all duration-300
          lg:relative lg:flex lg:z-auto
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${desktopCollapsed ? 'lg:w-16' : 'lg:w-64'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-stone-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-700 to-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            P
          </div>
          {(!desktopCollapsed || mobileOpen) && (
            <span className="text-white font-semibold text-sm leading-tight truncate">
              Họ Phùng Bát Tràng
            </span>
          )}
          <button
            className="ml-auto text-stone-500 hover:text-stone-300 transition-colors hidden lg:flex"
            onClick={toggleDesktop}
            aria-label={desktopCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
          >
            {desktopCollapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const active = isActive(item.href);
              const showLabel = mobileOpen || !desktopCollapsed;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      active
                        ? 'bg-red-700/20 text-red-400'
                        : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                    title={!showLabel ? item.label : undefined}
                  >
                    <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
                    {showLabel && <span className="truncate">{item.label}</span>}
                    {active && showLabel && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {(!desktopCollapsed || mobileOpen) && (
          <div className="px-4 py-4 border-t border-stone-800">
            <p className="text-xs text-stone-600 truncate">
              {user?.role === 'SUPER_ADMIN' ? 'Quản trị viên cao cấp' : 'Quản trị chi'}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
