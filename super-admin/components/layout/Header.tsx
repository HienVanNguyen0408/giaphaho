'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown, Search, Command } from 'lucide-react'
import { authApi, ApiError } from '@/lib/api'
import { NotificationBell } from './NotificationBell'

interface HeaderProps {
  breadcrumb?: string
}

export function Header({ breadcrumb }: HeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    setMenuOpen(false)
    try {
      await authApi.logout()
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('Logout failed:', err.message)
      }
    }
    router.push('/login')
  }

  return (
    <header
      className="flex flex-shrink-0 items-center justify-between px-4 md:px-5"
      style={{
        height: '64px',
        background: 'color-mix(in oklch, var(--t-surface) 86%, transparent)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid color-mix(in oklch, var(--t-border) 84%, transparent)',
        boxShadow: '0 10px 30px color-mix(in oklch, var(--t-text) 4%, transparent)',
      }}
    >
      {/* Left: breadcrumb / page context */}
      <div className="flex items-center gap-3 min-w-0">
        {breadcrumb ? (
          <p
            className="text-xs font-medium"
            style={{ color: 'var(--t-text-3)', letterSpacing: '0.04em' }}
          >
            {breadcrumb}
          </p>
        ) : (
          <div
            className="hidden min-w-[300px] items-center gap-2 rounded-lg px-3 py-2 md:flex"
            style={{
              background: 'color-mix(in oklch, var(--t-surface-2) 48%, transparent)',
              border: '1px solid var(--t-border)',
              color: 'var(--t-text-3)',
            }}
          >
            <Search size={14} />
            <span className="text-[12px] flex-1">Tìm họ, license, thông báo...</span>
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]"
              style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
            >
              <Command size={10} /> K
            </span>
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <NotificationBell />

        {/* Divider */}
        <div
          className="w-px h-5 mx-2"
          style={{ background: 'var(--t-border)' }}
        />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-[var(--t-surface-2)]"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--t-text-2)',
            }}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--t-cyan), var(--t-accent))',
                color: '#fff',
              }}
            >
              SA
            </div>
            <span className="text-[13px] font-medium hidden sm:block" style={{ color: 'var(--t-text)' }}>
              Admin
            </span>
            <ChevronDown
              size={13}
              className="transition-transform duration-200"
              style={{
                color: 'var(--t-text-3)',
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              {/* Dropdown */}
              <div
                className="absolute right-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden z-20"
                style={{
                  background: 'var(--t-surface)',
                  border: '1px solid var(--t-border)',
                  boxShadow: '0 8px 32px color-mix(in oklch, var(--t-text) 10%, transparent)',
                }}
              >
                {/* User info */}
                <div
                  className="px-3 py-2.5"
                  style={{ borderBottom: '1px solid var(--t-border)' }}
                >
                  <p className="text-xs font-semibold" style={{ color: 'var(--t-text)' }}>
                    Super Admin
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-text-3)' }}>
                    admin@giaphaho.vn
                  </p>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors hover:bg-[var(--t-surface-2)]"
                    style={{
                      color: 'var(--t-error)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={13} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
