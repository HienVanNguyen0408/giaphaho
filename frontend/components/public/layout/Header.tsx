'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, Suspense } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/gia-pha', label: 'Gia phả' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/video', label: 'Video' },
  { href: '/tim-kiem', label: 'Tìm kiếm' },
];

function HeaderContent() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50"
      style={{ transition: 'background 0.3s ease' }}
    >
      {/* ── TẦNG 1: Utility bar — VNA-style thin top strip ── */}
      <div
        className="hidden md:block"
        style={{
          background: 'color-mix(in oklch, var(--t-nav-bg) 80%, black)',
          borderBottom: '1px solid color-mix(in oklch, var(--t-gold) 15%, transparent)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <span
            className="text-[11px] tracking-wide"
            style={{ color: 'color-mix(in oklch, var(--t-nav-text) 60%, transparent)' }}
          >
            Dòng họ Phùng Bát Tràng · Bát Tràng, Hà Nội
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link
              href="/admin"
              className="transition-opacity hover:opacity-100"
              style={{ color: 'color-mix(in oklch, var(--t-nav-text) 65%, transparent)' }}
            >
              Quản trị
            </Link>
            <span
              aria-hidden="true"
              style={{ color: 'color-mix(in oklch, var(--t-nav-text) 25%, transparent)' }}
            >
              |
            </span>
            <span
              className="font-semibold tracking-widest"
              style={{ color: 'color-mix(in oklch, var(--t-gold) 80%, transparent)' }}
            >
              VI
            </span>
          </div>
        </div>
      </div>

      {/* ── TẦNG 2: Main nav — VNA-style primary bar with gold border ── */}
      <div
        style={{
          background: 'var(--t-nav-bg)',
          borderBottom: '2px solid var(--t-gold)',
          boxShadow: '0 2px 24px -6px rgba(0,0,0,0.6)',
          transition: 'background 0.3s ease',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0"
              aria-label="Trang chủ Họ Phùng Bát Tràng"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-md shrink-0 transition-transform duration-200 group-hover:scale-105"
                style={{ background: 'var(--t-gold)' }}
              >
                <span
                  className="font-bold text-lg leading-none select-none"
                  style={{ color: 'var(--t-nav-bg)', fontFamily: 'var(--t-display-font)' }}
                >
                  鳳
                </span>
              </div>
              <div className="leading-tight">
                <span
                  className="block text-base sm:text-lg tracking-wide transition-opacity group-hover:opacity-90"
                  style={{
                    color: 'var(--t-nav-text)',
                    fontFamily: 'var(--t-display-font)',
                    fontWeight: 'var(--t-heading-weight)' as React.CSSProperties['fontWeight'],
                  }}
                >
                  Họ Phùng Bát Tràng
                </span>
                <span
                  className="block text-[10px] tracking-widest uppercase"
                  style={{ color: 'color-mix(in oklch, var(--t-gold) 70%, transparent)' }}
                >
                  Gia phả dòng tộc
                </span>
              </div>
            </Link>

            {/* Desktop nav — VNA-style with bottom indicator on active */}
            <nav className="hidden md:flex items-center h-full" aria-label="Điều hướng chính">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive =
                  pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center h-full px-4 text-sm font-medium transition-all duration-150 group"
                    style={
                      isActive
                        ? { color: 'var(--t-gold)' }
                        : { color: 'var(--t-nav-text)', opacity: 0.85 }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.opacity = '0.85';
                    }}
                  >
                    {label}
                    {/* Bottom border indicator — VNA-style */}
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-200 origin-center"
                      style={{
                        background: 'var(--t-gold)',
                        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      }}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right utilities: search icon */}
            <div className="flex items-center gap-1">
              <Link
                href="/tim-kiem"
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/10"
                style={{ color: 'var(--t-nav-text)' }}
                aria-label="Tìm kiếm thành viên"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
              </Link>

              {/* Mobile hamburger */}
              <button
                type="button"
                className="md:hidden p-2 rounded transition-colors"
                style={{ color: 'var(--t-nav-text)' }}
                aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="md:hidden px-4 pb-4 pt-2"
          aria-label="Menu di động"
          style={{
            background: 'color-mix(in oklch, var(--t-nav-bg) 96%, black)',
            borderBottom: '1px solid color-mix(in oklch, var(--t-gold) 20%, transparent)',
          }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium mt-1 transition-all"
                style={
                  isActive
                    ? {
                        background: 'var(--t-nav-active-bg)',
                        color: 'var(--t-nav-active-text)',
                      }
                    : {
                        color: 'var(--t-nav-text)',
                        opacity: 0.85,
                      }
                }
              >
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--t-nav-active-text)' }}
                    aria-hidden="true"
                  />
                )}
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<header className="h-16 w-full md:h-24" />}>
      <HeaderContent />
    </Suspense>
  );
}
