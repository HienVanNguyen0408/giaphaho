import { Building2, Infinity, RefreshCw, AlertTriangle } from 'lucide-react'
import type { AnalyticsOverview } from '@/types'

interface OverviewCardsProps {
  data: AnalyticsOverview
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const cards = [
    {
      label: 'Tổng số họ',
      value: data.totalClans,
      Icon: Building2,
      color: 'var(--t-info)',
      desc: 'Trên toàn nền tảng',
    },
    {
      label: 'Vĩnh viễn',
      value: data.permanentClans,
      Icon: Infinity,
      color: 'var(--t-success)',
      desc: 'License PERMANENT',
    },
    {
      label: 'Thuê bao',
      value: data.subscriptionClans,
      Icon: RefreshCw,
      color: 'var(--t-warning)',
      desc: 'License SUBSCRIPTION',
    },
    {
      label: 'Sắp hết hạn',
      value: data.expiringIn30Days,
      Icon: AlertTriangle,
      color: 'var(--t-error)',
      desc: 'Trong 30 ngày tới',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.Icon
        return (
          <div
            key={card.label}
            className="page-panel rounded-lg p-4 overflow-hidden"
            style={{
              borderTop: `3px solid ${card.color}`,
            }}
          >
            <div className="relative z-10 flex items-center justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `color-mix(in oklch, ${card.color} 12%, transparent)`,
                  color: card.color,
                }}
              >
                <Icon size={15} />
              </div>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{
                  background: `color-mix(in oklch, ${card.color} 10%, transparent)`,
                  color: card.color,
                }}
              >
                {card.desc}
              </span>
            </div>
            <p
              className="relative z-10 text-2xl font-bold leading-none"
              style={{ color: 'var(--t-text)', fontVariantNumeric: 'tabular-nums' }}
            >
              {card.value}
            </p>
            <p className="relative z-10 text-[12px] mt-1.5 font-semibold" style={{ color: 'var(--t-text-2)' }}>
              {card.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}
