'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useSidebar } from '@/components/admin/providers/SidebarContext';
import { Suspense } from 'react';
import type { Role } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
}

function TreeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4m0 0a3 3 0 100 6 3 3 0 000-6zm0 6v3m-4 3h8M8 19a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" />
    </svg>
  );
}

function NewsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2zM9 12h6m-6 4h4" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 7a1 1 0 011-1h6a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7zm12 0a1 1 0 011-1h2a1 1 0 011 1v7a1 1 0 01-1 1h-2a1 1 0 01-1-1v-7z" />
    </svg>
  );
}

function FooterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16h16M4 19h10" />
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function LogIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function SidebarRailIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path strokeLinecap="round" d="M9 5v14" opacity="0.85" />
      {collapsed ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 9l4 3-4 3" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 9l-4 3 4 3" />
      )}
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Tổng quan', icon: <GridIcon /> },
  { href: '/admin/gia-pha', label: 'Gia phả', icon: <TreeIcon /> },
  { href: '/admin/tin-tuc', label: 'Tin tức', icon: <NewsIcon /> },
  { href: '/admin/video', label: 'Video', icon: <PlayIcon /> },
  { href: '/admin/section', label: 'Mục trang chủ', icon: <LayoutIcon /> },
  { href: '/admin/footer', label: 'Footer', icon: <FooterIcon /> },
  { href: '/admin/notification', label: 'Thông báo', icon: <BellIcon /> },
  { href: '/admin/activity-log', label: 'Nhật ký hoạt động', icon: <LogIcon />, superAdminOnly: true },
];

const roleMeta: Record<Role, { label: string; dot: string; badge: string; text: string }> = {
  SUPER_ADMIN: {
    label: 'Admin tổng',
    dot: '#f59e0b',
    badge: 'rgba(245,158,11,0.12)',
    text: 'rgba(251,191,36,0.85)',
  },
  CHI_ADMIN: {
    label: 'Quản trị chi',
    dot: '#38bdf8',
    badge: 'rgba(56,189,248,0.10)',
    text: 'rgba(125,211,252,0.85)',
  },
};

function SidebarContent() {
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

  const role = user?.role ?? 'CHI_ADMIN';
  const rm = roleMeta[role];
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '?';
  const showLabel = mobileOpen || !desktopCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col overflow-visible transition-all duration-300
          lg:relative lg:flex lg:z-auto
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${desktopCollapsed ? 'lg:w-16' : 'lg:w-64'}
        `}
        style={{ background: '#130f0a', borderRight: '1px solid rgba(80,50,20,0.35)' }}
      >
        {/* Brand */}
        <div
          className={`
            flex
            ${showLabel ? 'items-center gap-3 px-4 py-5' : 'flex-col items-center gap-2 px-2 py-4'}
          `}
          style={{ borderBottom: '1px solid rgba(80,50,20,0.3)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-100 font-bold text-sm flex-shrink-0 shadow-lg"
            style={{
              background: 'linear-gradient(145deg, #8b1a1a, #b45309)',
              boxShadow: '0 2px 12px rgba(139,26,26,0.35)',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.1rem',
            }}
          >
            P
          </div>
          {showLabel && (
            <span className="text-sm font-semibold truncate leading-tight" style={{ color: 'rgba(254,243,199,0.85)' }}>
              Họ Phùng Bát Tràng
            </span>
          )}
          <button
            type="button"
            className={`
              hidden lg:flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200
              hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70
              ${showLabel ? 'ml-auto' : ''}
            `}
            onClick={toggleDesktop}
            aria-label={desktopCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
            title={desktopCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
            style={{
              color: 'rgba(254,243,199,0.78)',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.16)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <SidebarRailIcon collapsed={desktopCollapsed} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {showLabel && (
            <p
              className="px-3 pt-1 pb-2 text-[9px] font-bold uppercase"
              style={{ color: 'rgba(120,80,30,0.5)', letterSpacing: '0.18em' }}
            >
              Quản trị
            </p>
          )}
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    className={`
                      group relative flex items-center rounded-xl text-sm font-medium transition-all
                      ${showLabel ? 'gap-3 px-3 py-2.5' : 'mx-auto h-11 w-11 justify-center'}
                    `}
                    title={!showLabel ? item.label : undefined}
                    style={
                      active
                        ? showLabel
                          ? {
                              background: 'rgba(139,26,26,0.18)',
                              color: 'rgba(252,165,165,0.9)',
                              borderLeft: '2px solid rgba(220,60,60,0.7)',
                              paddingLeft: '10px',
                            }
                          : {
                              background: 'linear-gradient(180deg, rgba(139,26,26,0.26), rgba(180,83,9,0.18))',
                              color: 'rgba(254,226,226,0.96)',
                              border: '1px solid rgba(248,113,113,0.24)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
                            }
                        : showLabel
                          ? {
                              color: 'rgba(168,162,158,0.6)',
                            }
                          : {
                              color: 'rgba(168,162,158,0.72)',
                            }
                    }
                  >
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">{item.icon}</span>
                    {showLabel && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        {showLabel && user && (
          <div
            className="px-3 py-4"
            style={{ borderTop: '1px solid rgba(80,50,20,0.3)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(145deg, rgba(139,26,26,0.5), rgba(180,83,9,0.4))',
                  border: '1px solid rgba(139,26,26,0.4)',
                  color: '#fde68a',
                }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: 'rgba(214,211,209,0.8)' }}>
                  {user.username}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md mt-0.5"
                  style={{ background: rm.badge, color: rm.text }}
                >
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: rm.dot }} />
                  {rm.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed user avatar */}
        {!showLabel && user && (
          <div className="px-2 py-4" style={{ borderTop: '1px solid rgba(80,50,20,0.3)' }}>
            <div
              className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[11px] font-bold"
              style={{
                background: 'linear-gradient(145deg, rgba(139,26,26,0.5), rgba(180,83,9,0.4))',
                border: '1px solid rgba(139,26,26,0.4)',
                color: '#fde68a',
              }}
              title={user.username}
            >
              {initials}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default function Sidebar() {
  return (
    <Suspense
      fallback={
        <aside
          className="w-64 hidden lg:block"
          style={{ background: '#130f0a', borderRight: '1px solid rgba(80,50,20,0.35)' }}
        />
      }
    >
      <SidebarContent />
    </Suspense>
  );
}
