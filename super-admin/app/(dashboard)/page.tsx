import Link from 'next/link'
import {
  Building2,
  CheckCircle2,
  PauseCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Plus,
  BarChart2,
  Bell,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { analyticsApi } from '@/lib/api'

async function getAnalyticsData() {
  try {
    const [overview, expiry] = await Promise.all([
      analyticsApi.overview(),
      analyticsApi.expiry(),
    ])
    return { overview, expiry }
  } catch {
    return { overview: null, expiry: null }
  }
}

export default async function DashboardPage() {
  const { overview, expiry } = await getAnalyticsData()

  const cards = overview
    ? [
        {
          label: 'Tổng số họ',
          value: overview.totalClans,
          color: 'var(--t-info)',
          Icon: Building2,
          href: '/clans',
          desc: 'Tất cả họ trên nền tảng',
        },
        {
          label: 'Đang hoạt động',
          value: overview.activeClans,
          color: 'var(--t-success)',
          Icon: CheckCircle2,
          href: '/clans',
          desc: 'License còn hiệu lực',
        },
        {
          label: 'Tạm dừng',
          value: overview.suspendedClans,
          color: 'var(--t-warning)',
          Icon: PauseCircle,
          href: '/clans',
          desc: 'Cần xử lý thủ công',
        },
        {
          label: 'Sắp hết hạn',
          value: overview.expiringIn30Days,
          color: 'var(--t-error)',
          Icon: Clock,
          href: '/analytics',
          desc: 'Trong vòng 30 ngày',
        },
      ]
    : []

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="page-panel rounded-lg overflow-hidden p-5 md:p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1
            className="relative z-10 text-2xl font-bold"
            style={{ color: 'var(--t-text)' }}
          >
            Tổng quan
          </h1>
          <p className="relative z-10 text-sm mt-1" style={{ color: 'var(--t-text-3)' }}>
            Hệ thống quản lý nền tảng Gia Phả Hồ
          </p>
        </div>
        <Link
          href="/clans/new"
          className="relative z-10 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-semibold transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--t-accent), var(--t-gold))', color: '#fff' }}
        >
          <Plus size={14} />
          Thêm họ mới
        </Link>
      </div>

      {/* Metric cards */}
      {cards.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((card) => {
            const Icon = card.Icon
            return (
              <Link key={card.label} href={card.href} className="block group">
                <div
                  className="page-panel rounded-lg p-4 h-full transition-all duration-200 group-hover:translate-y-[-2px]"
                  style={{
                    borderTop: `3px solid ${card.color}`,
                  }}
                >
                  <div className="relative z-10 flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `color-mix(in oklch, ${card.color} 12%, transparent)`,
                        color: card.color,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <ArrowRight
                      size={13}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
                      style={{ color: 'var(--t-text-3)' }}
                    />
                  </div>
                  <p
                    className="relative z-10 text-2xl font-bold leading-none"
                    style={{ color: 'var(--t-text)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {card.value}
                  </p>
                  <p className="relative z-10 text-[11px] mt-2 font-semibold uppercase" style={{ color: card.color }}>
                    {card.label}
                  </p>
                  <p className="relative z-10 text-[11px] mt-0.5" style={{ color: 'var(--t-text-3)' }}>
                    {card.desc}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4 animate-pulse"
              style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
            >
              <div className="w-8 h-8 rounded-lg mb-3" style={{ background: 'var(--t-surface-2)' }} />
              <div className="h-6 w-12 rounded mb-2" style={{ background: 'var(--t-surface-2)' }} />
              <div className="h-3 w-20 rounded" style={{ background: 'var(--t-surface-2)' }} />
            </div>
          ))}
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Expiry table */}
        <div className="lg:col-span-2">
          {expiry && expiry.clans && expiry.clans.length > 0 ? (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={15} style={{ color: 'var(--t-error)' }} />
                  <h2 className="text-[13px] font-semibold" style={{ color: 'var(--t-text)' }}>
                    License sắp hết hạn
                  </h2>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: 'color-mix(in oklch, var(--t-error) 10%, transparent)',
                      color: 'var(--t-error)',
                    }}
                  >
                    {expiry.clans.length} họ
                  </span>
                </div>
                <Link
                  href="/analytics"
                  className="text-[11px] flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--t-accent)' }}
                >
                  Xem thêm <ArrowRight size={11} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--t-border)' }}>
                      {['Họ', 'Code', 'Ngày hết hạn'].map((h) => (
                        <th
                          key={h}
                          className="text-left pb-2.5 pr-4 text-[11px] font-semibold uppercase"
                          style={{ color: 'var(--t-text-3)', letterSpacing: '0.06em' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      expiry.clans as unknown as Array<{
                        clan: { id: string; name: string; code: string }
                        expiresAt: string
                      }>
                    ).map((item, idx, arr) => (
                      <tr
                        key={item.clan.id}
                        style={{
                          borderBottom: idx < arr.length - 1 ? '1px solid var(--t-border)' : 'none',
                        }}
                      >
                        <td className="py-2.5 pr-4">
                          <Link
                            href={`/clans/${item.clan.id}`}
                            className="text-[13px] font-medium hover:underline"
                            style={{ color: 'var(--t-accent)' }}
                          >
                            {item.clan.name}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-[11px]" style={{ color: 'var(--t-text-3)' }}>
                          {item.clan.code}
                        </td>
                        <td className="py-2.5 text-[12px] font-semibold" style={{ color: 'var(--t-error)' }}>
                          {new Date(item.expiresAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex items-center gap-3 py-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'color-mix(in oklch, var(--t-success) 12%, transparent)',
                    color: 'var(--t-success)',
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--t-text)' }}>
                    Không có license sắp hết hạn
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-text-3)' }}>
                    Tất cả license đang hoạt động bình thường
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Quick actions */}
        <Card>
          <h2 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--t-text)' }}>
            Truy cập nhanh
          </h2>
          <div className="space-y-1.5">
            {[
              {
                href: '/clans/new',
                label: 'Thêm họ mới',
                desc: 'Tạo mới một họ trên nền tảng',
                icon: Plus,
                accent: true,
              },
              {
                href: '/analytics',
                label: 'Xem Analytics',
                desc: 'Thống kê và biểu đồ chi tiết',
                icon: BarChart2,
                accent: false,
              },
              {
                href: '/notifications',
                label: 'Thông báo',
                desc: 'Kiểm tra license sắp hết hạn',
                icon: Bell,
                accent: false,
              },
            ].map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-all group hover:translate-x-0.5"
                  style={{
                    background: link.accent
                      ? 'color-mix(in oklch, var(--t-accent) 8%, transparent)'
                      : 'var(--t-surface-2)',
                    border: link.accent
                      ? '1px solid color-mix(in oklch, var(--t-accent) 20%, transparent)'
                      : '1px solid var(--t-border)',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      background: link.accent
                        ? 'color-mix(in oklch, var(--t-accent) 15%, transparent)'
                        : 'var(--t-surface)',
                      color: link.accent ? 'var(--t-accent)' : 'var(--t-text-2)',
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[12px] font-semibold leading-tight"
                      style={{ color: link.accent ? 'var(--t-accent)' : 'var(--t-text)' }}
                    >
                      {link.label}
                    </p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--t-text-3)' }}>
                      {link.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={12}
                    className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-all duration-200"
                    style={{ color: link.accent ? 'var(--t-accent)' : 'var(--t-text-3)' }}
                  />
                </Link>
              )
            })}
          </div>

          {overview && (
            <div
              className="mt-3 pt-3 flex items-center gap-2"
              style={{ borderTop: '1px solid var(--t-border)' }}
            >
              <TrendingUp size={12} style={{ color: 'var(--t-text-3)' }} />
              <p className="text-[11px]" style={{ color: 'var(--t-text-3)' }}>
                {overview.permanentClans} vĩnh viễn · {overview.subscriptionClans} thuê bao
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
