'use client'

import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationApi } from '@/lib/api'
import { NotificationList } from '@/components/notifications/NotificationList'
import { Button } from '@/components/shared/Button'
import type { Notification } from '@/types'

type Filter = 'all' | 'unread' | 'license' | 'suspended'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    notificationApi
      .list()
      .then((d) => setNotifications(d.notifications))
      .finally(() => setLoading(false))
  }, [])

  async function handleMarkAllRead() {
    setMarkingAll(true)
    try {
      await notificationApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } finally {
      setMarkingAll(false)
    }
  }

  async function handleMarkOne(id: string) {
    await notificationApi.markRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'license') return n.type.includes('LICENSE')
    if (filter === 'suspended') return n.type === 'CLAN_SUSPENDED'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const tabs: { id: Filter; label: string; count?: number }[] = [
    { id: 'all', label: 'Tất cả', count: notifications.length },
    { id: 'unread', label: 'Chưa đọc', count: unreadCount },
    { id: 'license', label: 'License' },
    { id: 'suspended', label: 'Tạm dừng' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="page-panel rounded-lg overflow-hidden p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="relative z-10 text-2xl font-bold"
            style={{ color: 'var(--t-text)' }}
          >
            Thông báo
          </h1>
          <p className="relative z-10 text-sm mt-0.5" style={{ color: 'var(--t-text-3)' }}>
            {loading ? '—' : unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            loading={markingAll}
            onClick={handleMarkAllRead}
          >
            <CheckCheck size={13} />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0.5 rounded-lg p-0.5 w-fit" style={{ background: 'var(--t-surface-2)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 flex items-center gap-1.5"
            style={{
              background: filter === tab.id ? 'var(--t-surface)' : 'transparent',
              color: filter === tab.id ? 'var(--t-text)' : 'var(--t-text-3)',
              border: filter === tab.id ? '1px solid var(--t-border)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none"
                style={{
                  background: tab.id === 'unread'
                    ? 'var(--t-accent)'
                    : filter === tab.id
                    ? 'var(--t-surface-2)'
                    : 'color-mix(in oklch, var(--t-border) 80%, transparent)',
                  color: tab.id === 'unread' ? '#fff' : 'var(--t-text-3)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {!loading && filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'var(--t-surface-2)' }}
          >
            <Bell size={18} style={{ color: 'var(--t-text-3)' }} />
          </div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--t-text-2)' }}>
            Không có thông báo nào
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--t-text-3)' }}>
            {filter !== 'all' ? 'Thử chọn tab khác' : 'Hệ thống hoạt động bình thường'}
          </p>
        </div>
      ) : (
        <NotificationList notifications={filtered} loading={loading} onMarkRead={handleMarkOne} />
      )}
    </div>
  )
}
