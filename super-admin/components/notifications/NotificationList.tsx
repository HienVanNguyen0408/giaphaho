import { Button } from '../shared/Button'
import { AlertTriangle, Ban, CircleDot } from 'lucide-react'
import type { Notification } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  LICENSE_EXPIRY_WARNING: 'var(--t-warning)',
  LICENSE_EXPIRED: 'var(--t-error)',
  CLAN_SUSPENDED: 'var(--t-error)',
}

const TYPE_LABELS: Record<string, string> = {
  LICENSE_EXPIRY_WARNING: 'Sắp hết hạn',
  LICENSE_EXPIRED: 'Hết hạn',
  CLAN_SUSPENDED: 'Tạm dừng',
}

const TYPE_ICONS = {
  LICENSE_EXPIRY_WARNING: AlertTriangle,
  LICENSE_EXPIRED: CircleDot,
  CLAN_SUSPENDED: Ban,
}

interface NotificationListProps {
  notifications: Notification[]
  loading?: boolean
  onMarkRead: (id: string) => void
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  return `${Math.floor(hrs / 24)} ngày trước`
}

export function NotificationList({ notifications, loading, onMarkRead }: NotificationListProps) {
  if (loading) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--t-border)', background: 'var(--t-surface)' }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-4 py-3.5 animate-pulse"
            style={{ borderBottom: i < 4 ? '1px solid var(--t-border)' : 'none' }}
          >
            <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: 'var(--t-surface-2)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded w-3/4" style={{ background: 'var(--t-surface-2)' }} />
              <div className="h-2.5 rounded w-1/3" style={{ background: 'var(--t-surface-2)' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--t-border)', background: 'var(--t-surface)' }}
    >
      {notifications.map((n, idx) => {
        const typeColor = TYPE_COLORS[n.type] ?? 'var(--t-text-3)'
        const typeLabel = TYPE_LABELS[n.type] ?? n.type
        const Icon = TYPE_ICONS[n.type as keyof typeof TYPE_ICONS] ?? CircleDot
        const isLast = idx === notifications.length - 1
        return (
          <div
            key={n.id}
            className="flex items-start gap-3.5 px-4 py-3.5 transition-colors"
            style={{
              background: !n.isRead
                ? 'color-mix(in oklch, var(--t-accent) 3%, var(--t-surface))'
                : 'var(--t-surface)',
              borderBottom: isLast ? 'none' : '1px solid var(--t-border)',
            }}
          >
            {/* Type indicator */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: `color-mix(in oklch, ${typeColor} 10%, transparent)`,
              }}
            >
              <Icon size={15} style={{ color: typeColor }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-0.5">
                <p
                  className="text-[13px] flex-1"
                  style={{
                    color: 'var(--t-text)',
                    fontWeight: n.isRead ? 400 : 500,
                    lineHeight: '1.5',
                  }}
                >
                  {n.message}
                </p>
                {!n.isRead && (
                  <span
                    className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ background: 'var(--t-accent)' }}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{
                    background: `color-mix(in oklch, ${typeColor} 10%, transparent)`,
                    color: typeColor,
                  }}
                >
                  {typeLabel}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--t-text-3)' }}>
                  {timeAgo(n.createdAt)}
                </span>
              </div>
            </div>

            {/* Action */}
            {!n.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkRead(n.id)}
                className="flex-shrink-0"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                Đã đọc
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
