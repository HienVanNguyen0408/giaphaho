'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Bell, ArrowRight, AlertTriangle, Ban, CircleDot } from 'lucide-react'
import { notificationApi } from '@/lib/api'
import type { Notification } from '@/types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  return `${Math.floor(hrs / 24)} ngày trước`
}

const TYPE_ICONS = {
  LICENSE_EXPIRY_WARNING: AlertTriangle,
  LICENSE_EXPIRED: CircleDot,
  CLAN_SUSPENDED: Ban,
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    notificationApi
      .list()
      .then((data) => setNotifications(data.notifications.slice(0, 5)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
        style={{
          background: open ? 'var(--t-surface-2)' : 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--t-text-2)',
        }}
        aria-label="Thông báo"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center leading-none"
            style={{ background: 'var(--t-accent)', color: '#fff' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-lg overflow-hidden z-30"
          style={{
            width: '296px',
            background: 'var(--t-surface)',
            border: '1px solid var(--t-border)',
            boxShadow: '0 12px 40px color-mix(in oklch, var(--t-text) 12%, transparent)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--t-border)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--t-text)' }}>
                Thông báo
              </span>
              {unreadCount > 0 && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'color-mix(in oklch, var(--t-accent) 12%, transparent)', color: 'var(--t-accent)' }}
                >
                  {unreadCount} mới
                </span>
              )}
            </div>
            <Link
              href="/notifications"
              className="flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--t-accent)' }}
              onClick={() => setOpen(false)}
            >
              Tất cả <ArrowRight size={11} />
            </Link>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--t-text-3)' }} />
              <p className="text-[13px]" style={{ color: 'var(--t-text-3)' }}>
                Không có thông báo
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((n, idx) => (
                <div
                  key={n.id}
                  className="px-4 py-3 flex items-start gap-3 transition-colors hover:bg-[var(--t-surface-2)]"
                  style={{
                    background: !n.isRead
                      ? 'color-mix(in oklch, var(--t-accent) 4%, transparent)'
                      : 'transparent',
                    borderBottom: idx < notifications.length - 1 ? '1px solid var(--t-border)' : 'none',
                  }}
                >
                  <span
                    className="flex-shrink-0 mt-0.5"
                    style={{
                      color: n.type === 'LICENSE_EXPIRY_WARNING'
                        ? 'var(--t-warning)'
                        : n.type === 'LICENSE_EXPIRED'
                        ? 'var(--t-error)'
                        : 'var(--t-text-3)',
                    }}
                  >
                    {(() => {
                      const Icon = TYPE_ICONS[n.type as keyof typeof TYPE_ICONS] ?? CircleDot
                      return <Icon size={14} />
                    })()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[12px] leading-relaxed"
                      style={{ color: 'var(--t-text)', fontWeight: n.isRead ? 400 : 500 }}
                    >
                      {n.message}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--t-text-3)' }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: 'var(--t-accent)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
