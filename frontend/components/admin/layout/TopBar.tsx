'use client';

import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useSidebar } from '@/components/admin/providers/SidebarContext';
import type { Role } from '@/types';
import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { search } from '@/lib/api';
import type { SearchResults } from '@/types';

const roleMeta: Record<Role, { label: string; bg: string; text: string; border: string }> = {
  SUPER_ADMIN: {
    label: 'Admin tổng',
    bg: 'color-mix(in oklch, var(--t-warning) 10%, transparent)',
    text: 'var(--t-warning)',
    border: 'color-mix(in oklch, var(--t-warning) 25%, transparent)',
  },
  CHI_ADMIN: {
    label: 'Quản trị chi',
    bg: 'color-mix(in oklch, var(--t-info) 8%, transparent)',
    text: 'var(--t-info)',
    border: 'color-mix(in oklch, var(--t-info) 20%, transparent)',
  },
};

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await search(q);
      setResults(res.data);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) handleSearch(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const totalCount = results
    ? results.members.length + results.news.length + results.videos.length
    : 0;

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--t-text-3)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) setShowDropdown(false);
          }}
          onFocus={() => {
            if (query && results) setShowDropdown(true);
          }}
          placeholder="Tìm kiếm hệ thống..."
          className="w-64 lg:w-80 pl-9 pr-4 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            background: 'var(--t-surface-2)',
            border: '1px solid var(--t-border)',
            color: 'var(--t-text)',
          }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        )}
      </div>

      {showDropdown && query && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {!loading && totalCount === 0 ? (
              <div className="p-4 text-center text-sm text-stone-500">
                Không tìm thấy kết quả nào
              </div>
            ) : null}

            {results && results.members.length > 0 && (
              <div className="border-b border-stone-100 last:border-0">
                <div className="px-3 py-2 bg-stone-50 text-xs font-semibold text-stone-500 uppercase">
                  Thành viên ({results.members.length})
                </div>
                <ul className="py-1">
                  {results.members.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/admin/gia-pha/${m.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-stone-800 truncate">{m.fullName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results && results.news.length > 0 && (
              <div className="border-b border-stone-100 last:border-0">
                <div className="px-3 py-2 bg-stone-50 text-xs font-semibold text-stone-500 uppercase">
                  Tin tức ({results.news.length})
                </div>
                <ul className="py-1">
                  {results.news.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={`/admin/tin-tuc/${n.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-stone-800 truncate">{n.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results && results.videos.length > 0 && (
              <div className="border-b border-stone-100 last:border-0">
                <div className="px-3 py-2 bg-stone-50 text-xs font-semibold text-stone-500 uppercase">
                  Video ({results.videos.length})
                </div>
                <ul className="py-1">
                  {results.videos.map((v) => (
                    <li key={v.id}>
                      <Link
                        href={`/admin/video`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-stone-800 truncate">{v.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopBar() {
  const { user, logout } = useAdminAuth();
  const { toggleMobile } = useSidebar();

  const rm = user ? roleMeta[user.role] : null;

  return (
    <header
      className="h-14 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 relative z-20"
      style={{
        background: 'var(--t-nav-bg)',
        borderBottom: '1px solid var(--t-border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleMobile}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--t-text-3)' }}
          aria-label="Mở menu"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2.5">
          <span className="text-sm" style={{ color: 'var(--t-text-3)' }}>
            Xin chào,{' '}
            <span className="font-semibold" style={{ color: 'var(--t-text)' }}>
              {user?.username ?? '...'}
            </span>
          </span>

          {rm && (
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: rm.bg,
                color: rm.text,
                border: `1px solid ${rm.border}`,
                letterSpacing: '0.05em',
              }}
            >
              <span
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: rm.text }}
              />
              {rm.label}
            </span>
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all group"
          style={{ color: 'var(--t-text-3)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-accent)';
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-red-50)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text-3)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
