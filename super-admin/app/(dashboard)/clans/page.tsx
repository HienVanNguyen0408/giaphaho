'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import { clanApi } from '@/lib/api'
import { ClanTable } from '@/components/clan/ClanTable'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import type { Clan } from '@/types'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Tạm dừng', value: 'SUSPENDED' },
  { label: 'Hết hạn', value: 'EXPIRED' },
]

export default function ClansPage() {
  const [clans, setClans] = useState<Clan[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [search, setSearch] = useState('')

  const fetchClans = useCallback(async () => {
    setLoading(true)
    try {
      const result = await clanApi.list({
        status: activeTab || undefined,
        licenseType: licenseType || undefined,
        search: search || undefined,
        page,
      })
      setClans(result.clans)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      setClans([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, licenseType, search, page])

  useEffect(() => {
    fetchClans()
  }, [fetchClans])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="page-panel rounded-lg overflow-hidden p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="relative z-10 text-2xl font-bold"
            style={{ color: 'var(--t-text)' }}
          >
            Danh sách họ
          </h1>
          <p className="relative z-10 text-sm mt-0.5" style={{ color: 'var(--t-text-3)' }}>
            {loading ? '—' : `${total} họ tổng cộng`}
          </p>
        </div>
        <Link href="/clans/new" className="relative z-10">
          <Button size="sm">
            <Plus size={13} />
            Thêm họ mới
          </Button>
        </Link>
      </div>

      <Card padding="none">
        {/* Filters bar */}
        <div
          className="flex flex-wrap items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--t-border)' }}
        >
          {/* Status tabs */}
          <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: 'var(--t-surface-2)' }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setPage(1) }}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150"
                style={{
                  background: activeTab === tab.value ? 'var(--t-surface)' : 'transparent',
                  color: activeTab === tab.value ? 'var(--t-text)' : 'var(--t-text-3)',
                  border: activeTab === tab.value ? '1px solid var(--t-border)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5" style={{ background: 'var(--t-border)' }} />

          {/* Filters row */}
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            {/* License type */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={13} style={{ color: 'var(--t-text-3)' }} />
              <select
                value={licenseType}
                onChange={(e) => { setLicenseType(e.target.value); setPage(1) }}
                className="text-[12px] rounded-lg px-2.5 py-1.5 outline-none"
                style={{
                  background: 'var(--t-surface-2)',
                  border: '1px solid var(--t-border)',
                  color: 'var(--t-text)',
                  cursor: 'pointer',
                }}
              >
                <option value="">Tất cả loại</option>
                <option value="PERMANENT">Vĩnh viễn</option>
                <option value="SUBSCRIPTION">Thuê bao</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-40 rounded-lg px-2.5 py-1.5" style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
              <Search size={13} style={{ color: 'var(--t-text-3)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Tìm tên hoặc code..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="bg-transparent text-[12px] outline-none flex-1 min-w-0"
                style={{ color: 'var(--t-text)' }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-4 pt-3">
          <ClanTable clans={clans} loading={loading} />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 mt-2"
            style={{ borderTop: '1px solid var(--t-border)' }}
          >
            <p className="text-[12px]" style={{ color: 'var(--t-text-3)' }}>
              Trang {page} / {totalPages} · {total} kết quả
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
