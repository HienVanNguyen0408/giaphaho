import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { OverviewCards } from '@/components/analytics/OverviewCards'
import { Charts } from '@/components/analytics/Charts'
import { analyticsApi } from '@/lib/api'

async function getData() {
  try {
    const [overview, clans, licenses, expiry] = await Promise.all([
      analyticsApi.overview(),
      analyticsApi.clans(),
      analyticsApi.licenses(),
      analyticsApi.expiry(),
    ])
    return { overview, clans, licenses, expiry }
  } catch {
    return { overview: null, clans: null, licenses: null, expiry: null }
  }
}

export default async function AnalyticsPage() {
  const { overview, clans, licenses, expiry } = await getData()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-panel rounded-lg overflow-hidden p-5">
        <h1
          className="relative z-10 text-2xl font-bold"
          style={{ color: 'var(--t-text)' }}
        >
          Analytics
        </h1>
        <p className="relative z-10 text-sm mt-0.5" style={{ color: 'var(--t-text-3)' }}>
          Thống kê nền tảng Gia Phả Hồ
        </p>
      </div>

      {overview && <OverviewCards data={overview} />}

      {clans && licenses && (
        <Charts
          monthlyData={clans.data}
          licenseBreakdown={{ permanent: licenses.permanent, subscription: licenses.subscription }}
        />
      )}

      {expiry && expiry.clans && expiry.clans.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--t-text)' }}>
              Sắp hết hạn trong 30 ngày
            </h2>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'color-mix(in oklch, var(--t-error) 10%, transparent)',
                color: 'var(--t-error)',
              }}
            >
              {expiry.clans.length} họ
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--t-border)' }}>
                  {['Họ', 'Code', 'Email liên hệ', 'Hết hạn', ''].map((h) => (
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
                    clan: { id: string; name: string; code: string; contactEmail?: string }
                    expiresAt: string
                  }>
                ).map((item, idx, arr) => (
                  <tr
                    key={item.clan.id}
                    style={{ borderBottom: idx < arr.length - 1 ? '1px solid var(--t-border)' : 'none' }}
                  >
                    <td className="py-2.5 pr-4 text-[13px] font-medium" style={{ color: 'var(--t-text)' }}>
                      {item.clan.name}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className="font-mono text-[11px] px-2 py-1 rounded"
                        style={{ background: 'var(--t-surface-2)', color: 'var(--t-text-3)' }}
                      >
                        {item.clan.code}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[12px]" style={{ color: 'var(--t-text-2)' }}>
                      {item.clan.contactEmail ?? '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-[12px] font-semibold" style={{ color: 'var(--t-error)' }}>
                      {new Date(item.expiresAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-2.5">
                      <Link
                        href={`/clans/${item.clan.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
                        style={{ color: 'var(--t-accent)' }}
                      >
                        Xem <ArrowUpRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
