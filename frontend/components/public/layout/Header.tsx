'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/gia-pha', label: 'Gia phả' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/video', label: 'Video' },
  { href: '/tim-kiem', label: 'Tìm kiếm' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'var(--t-nav-bg)',
        borderBottom: '1px solid var(--t-nav-border)',
        boxShadow: '0 1px 20px -4px rgba(0,0,0,0.4)',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Top decorative line */}
      <div
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--t-gold), var(--t-accent-2, var(--t-gold)), transparent)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Trang chủ Họ Phùng Bát Tràng"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-105"
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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Điều hướng chính">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2 rounded text-sm transition-all duration-150"
                  style={isActive
                    ? {
                        background: 'var(--t-nav-active-bg)',
                        color: 'var(--t-nav-active-text)',
                        fontWeight: 600,
                      }
                    : {
                        color: 'var(--t-nav-text)',
                        fontWeight: 500,
                        opacity: 0.85,
                      }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.opacity = '1';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.opacity = '0.85';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

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
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="md:hidden px-4 pb-4 pt-2"
          aria-label="Menu di động"
          style={{
            background: 'color-mix(in oklch, var(--t-nav-bg) 95%, black)',
            borderTop: '1px solid var(--t-nav-border)',
          }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded text-sm font-medium mt-1 transition-all"
                style={isActive
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
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
