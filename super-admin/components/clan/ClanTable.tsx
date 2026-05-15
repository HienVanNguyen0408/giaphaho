'use client'

import Link from 'next/link'
import { Home, ArrowUpRight } from 'lucide-react'
import { StatusBadge, LicenseBadge } from './StatusBadge'
import type { Clan } from '@/types'

interface ClanTableProps {
  clans: Clan[]
  loading?: boolean
}

export function ClanTable({ clans, loading }: ClanTableProps) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--t-border)' }}>
              {['Tên họ', 'Code', 'Loại', 'Trạng thái', 'Hết hạn', 'Ngày tạo', ''].map((h) => (
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
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--t-border)' }}>
                {[140, 80, 72, 72, 80, 80, 56].map((w, j) => (
                  <td key={j} className="py-3 pr-4">
                    <div
                      className="h-3.5 rounded animate-pulse"
                      style={{ width: `${w}px`, background: 'var(--t-surface-2)' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (clans.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-14 rounded-lg"
        style={{ background: 'var(--t-surface-2)' }}
      >
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center mb-3"
          style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
        >
          <Home size={17} style={{ color: 'var(--t-accent)' }} />
        </div>
        <p className="text-[13px] font-medium" style={{ color: 'var(--t-text-2)' }}>
          Không có dữ liệu
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--t-text-3)' }}>
          Thử thay đổi bộ lọc hoặc thêm họ mới
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--t-border)' }}>
            {['Tên họ', 'Code', 'Loại', 'Trạng thái', 'Hết hạn', 'Ngày tạo', ''].map((h) => (
              <th
                key={h}
                className="text-left pb-2.5 pr-4 text-[11px] font-semibold uppercase whitespace-nowrap"
                style={{ color: 'var(--t-text-3)', letterSpacing: '0.06em' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clans.map((clan, idx) => {
            const activeLicense = clan.licenses?.[0]
            const isLast = idx === clans.length - 1
            return (
              <tr
                key={clan.id}
                className="group transition-colors hover:bg-[var(--t-surface-2)]"
                style={{
                  borderBottom: isLast ? 'none' : '1px solid var(--t-border)',
                }}
              >
                <td className="py-3 pr-4">
                  <span className="text-[13px] font-medium" style={{ color: 'var(--t-text)' }}>
                    {clan.name}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className="font-mono text-[11px] px-2 py-1 rounded-md"
                    style={{
                      color: 'var(--t-text-3)',
                      background: 'var(--t-surface-2)',
                    }}
                  >
                    {clan.code}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <LicenseBadge type={clan.licenseType} />
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={clan.status} />
                </td>
                <td className="py-3 pr-4 text-[12px] whitespace-nowrap" style={{ color: activeLicense?.expiresAt ? 'var(--t-text-2)' : 'var(--t-text-3)' }}>
                  {activeLicense?.expiresAt
                    ? new Date(activeLicense.expiresAt).toLocaleDateString('vi-VN')
                    : '—'}
                </td>
                <td className="py-3 pr-4 text-[12px] whitespace-nowrap" style={{ color: 'var(--t-text-3)' }}>
                  {new Date(clan.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="py-3">
                  <Link
                    href={`/clans/${clan.id}`}
                    className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-md font-semibold transition-all hover:-translate-y-0.5"
                    style={{
                      background: 'color-mix(in oklch, var(--t-accent) 10%, transparent)',
                      color: 'var(--t-accent)',
                      border: '1px solid color-mix(in oklch, var(--t-accent) 18%, transparent)',
                    }}
                  >
                    Chi tiết <ArrowUpRight size={11} />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
