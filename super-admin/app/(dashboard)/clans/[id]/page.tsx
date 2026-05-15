'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Palette } from 'lucide-react'
import { clanApi } from '@/lib/api'
import { StatusBadge, LicenseBadge } from '@/components/clan/StatusBadge'
import { Button } from '@/components/shared/Button'
import { InfoTab } from '@/components/clan/tabs/InfoTab'
import { LicenseTab } from '@/components/clan/tabs/LicenseTab'
import { ActivityTab } from '@/components/clan/tabs/ActivityTab'
import { Spinner } from '@/components/shared/Spinner'
import type { Clan } from '@/types'

type Tab = 'info' | 'license' | 'theme' | 'activity'

export default function ClanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [clan, setClan] = useState<Clan | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    clanApi.getById(id).then((r) => setClan(r.clan)).finally(() => setLoading(false))
  }, [id])

  async function toggleStatus() {
    if (!clan) return
    setActionLoading(true)
    try {
      const newStatus = clan.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      const result = await clanApi.updateStatus(id, newStatus)
      setClan(result.clan)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  if (!clan) {
    return <div className="text-center py-20" style={{ color: 'var(--t-text-3)' }}>Không tìm thấy họ</div>
  }

  const tabs: { id: Tab; label: string; hidden?: boolean }[] = [
    { id: 'info', label: 'Thông tin' },
    { id: 'license', label: 'License' },
    { id: 'theme', label: 'Theme', hidden: clan.licenseType === 'PERMANENT' },
    { id: 'activity', label: 'Lịch sử' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-panel rounded-lg overflow-hidden p-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="relative z-10 flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--t-text)' }}>{clan.name}</h1>
            <LicenseBadge type={clan.licenseType} />
            <StatusBadge status={clan.status} />
          </div>
          <p className="relative z-10 font-mono text-sm" style={{ color: 'var(--t-text-3)' }}>{clan.code}</p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2">
          {clan.licenseType === 'SUBSCRIPTION' && (
            <Button variant="secondary" onClick={() => router.push(`/clans/${clan.id}/theme`)}>
              <Palette size={14} />
              Theme
            </Button>
          )}
          <Button
            variant={clan.status === 'ACTIVE' ? 'danger' : 'primary'}
            loading={actionLoading}
            onClick={toggleStatus}
          >
            {clan.status === 'ACTIVE' ? 'Tạm dừng' : 'Kích hoạt'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg p-1 w-fit" style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
        {tabs.filter((t) => !t.hidden).map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.id === 'theme' ? router.push(`/clans/${clan.id}/theme`) : setActiveTab(tab.id)}
            className="px-4 py-2.5 text-sm font-semibold rounded-md transition-colors"
            style={{
              border: 'none',
              background: activeTab === tab.id ? 'var(--t-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--t-accent)' : 'var(--t-text-3)',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'info' && <InfoTab clan={clan} onUpdate={setClan} />}
      {activeTab === 'license' && <LicenseTab clan={clan} onUpdate={setClan} />}
      {activeTab === 'activity' && <ActivityTab clan={clan} />}
    </div>
  )
}
