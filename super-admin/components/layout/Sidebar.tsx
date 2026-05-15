'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clans', label: 'Danh sách họ', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/notifications', label: 'Thông báo', icon: Bell },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
]

interface SidebarProps {
  unreadCount?: number
}

export function Sidebar({ unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="flex flex-col h-full transition-all duration-300 ease-in-out relative overflow-hidden"
      style={{
        width: collapsed ? '64px' : '232px',
        background:
          'linear-gradient(180deg, color-mix(in oklch, var(--t-sidebar-bg) 84%, var(--t-cyan)), color-mix(in oklch, var(--t-sidebar-bg) 88%, var(--t-accent)) 42%, var(--t-sidebar-bg))',
        borderRight: '1px solid var(--t-nav-border)',
        flexShrink: 0,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 30% 0%, color-mix(in oklch, var(--t-cyan) 24%, transparent), transparent 68%)' }}
      />
      {/* Logo */}
      <div
        className="relative z-10 flex items-center h-16 overflow-hidden"
        style={{
          borderBottom: '1px solid var(--t-nav-border)',
          padding: collapsed ? '0 18px' : '0 16px',
        }}
      >
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-[13px]"
          style={{
            background: 'linear-gradient(135deg, var(--t-cyan), var(--t-accent))',
            color: '#fff',
            boxShadow: '0 10px 28px color-mix(in oklch, var(--t-cyan) 28%, transparent)',
          }}
        >
          <ShieldCheck size={17} />
        </div>
        <div
          className="ml-3 overflow-hidden transition-all duration-300"
          style={{
            width: collapsed ? '0' : '160px',
            opacity: collapsed ? 0 : 1,
          }}
        >
          <p
            className="font-semibold text-[13px] whitespace-nowrap"
            style={{ color: 'var(--t-sidebar-text)' }}
          >
            Super Admin
          </p>
          <p
            className="text-[10px] whitespace-nowrap mt-0.5"
            style={{ color: 'var(--t-sidebar-text-2)', letterSpacing: '0.08em' }}
          >
            Gia Phả Hồ Control
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 py-3 overflow-hidden" style={{ padding: collapsed ? '12px 8px' : '12px 8px' }}>
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase" style={{ color: 'var(--t-sidebar-text-2)', letterSpacing: '0.16em' }}>
            Điều phối
          </p>
        )}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className="flex items-center rounded-lg text-sm transition-all duration-150 group relative"
                style={{
                  height: '40px',
                  padding: collapsed ? '0 12px' : '0 12px',
                  gap: '10px',
                  background: isActive
                    ? 'linear-gradient(90deg, color-mix(in oklch, var(--t-cyan) 24%, transparent), color-mix(in oklch, var(--t-accent) 14%, transparent))'
                    : 'transparent',
                  color: isActive ? '#fff' : 'var(--t-sidebar-text-2)',
                  border: isActive ? '1px solid color-mix(in oklch, var(--t-accent) 28%, var(--t-nav-border))' : '1px solid transparent',
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: 'var(--t-cyan)' }}
                  />
                )}
                <Icon
                  size={17}
                  className="flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
                />
                <span
                  className="overflow-hidden whitespace-nowrap transition-all duration-300 flex-1 flex items-center gap-2"
                  style={{
                    width: collapsed ? '0' : 'auto',
                    opacity: collapsed ? 0 : 1,
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                  {item.href === '/notifications' && unreadCount > 0 && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none"
                      style={{ background: 'var(--t-accent)', color: '#fff' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </span>
                {/* Notification dot when collapsed */}
                {collapsed && item.href === '/notifications' && unreadCount > 0 && (
                  <span
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ background: 'var(--t-accent)' }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Collapse toggle */}
      <div className="relative z-10" style={{ padding: '8px', borderTop: '1px solid var(--t-nav-border)' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-9 rounded-lg flex items-center transition-all duration-150 hover:opacity-80"
          style={{
            background: 'color-mix(in oklch, var(--t-accent) 6%, transparent)',
            color: 'var(--t-sidebar-text-2)',
            border: '1px solid color-mix(in oklch, var(--t-nav-border) 80%, transparent)',
            cursor: 'pointer',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 12px',
            gap: '8px',
          }}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <>
              <ChevronLeft size={15} />
              <span
                className="text-[12px] whitespace-nowrap overflow-hidden transition-all duration-300"
                style={{ opacity: collapsed ? 0 : 1 }}
              >
                Thu gọn
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
