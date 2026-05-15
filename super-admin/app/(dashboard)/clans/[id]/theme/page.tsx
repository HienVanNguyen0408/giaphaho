'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { clanApi, themeApi } from '@/lib/api'
import { ThemeEditor } from '@/components/theme/ThemeEditor'
import { PreviewPanel } from '@/components/theme/PreviewPanel'
import { Card } from '@/components/shared/Card'
import { Spinner } from '@/components/shared/Spinner'
import type { Clan, Theme } from '@/types'

export default function ThemePage() {
  const { id } = useParams<{ id: string }>()
  const [clan, setClan] = useState<Clan | null>(null)
  const [theme, setTheme] = useState<Partial<Theme>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      clanApi.getById(id),
      themeApi.get(id).catch(() => ({ theme: {} })),
    ]).then(([clanRes, themeRes]) => {
      setClan(clanRes.clan)
      setTheme(themeRes.theme)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!clan) return notFound()
  if (clan.licenseType === 'PERMANENT') {
    return (
      <div className="text-center py-20" style={{ color: 'var(--t-text-3)' }}>
        Theme chỉ khả dụng cho họ SUBSCRIPTION
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="page-panel rounded-lg overflow-hidden p-5">
        <h1 className="relative z-10 text-2xl font-bold" style={{ color: 'var(--t-text)' }}>
          Theme Editor — {clan.name}
        </h1>
        <p className="relative z-10 mt-1 text-sm" style={{ color: 'var(--t-text-3)' }}>
          Tinh chỉnh nhận diện cho website subscription
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--t-text)' }}>Cài đặt</h2>
          <ThemeEditor clanId={id} initialTheme={theme} onUpdate={setTheme} />
        </Card>

        <Card>
          <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--t-text)' }}>Preview</h2>
          <PreviewPanel theme={theme} />
        </Card>
      </div>
    </div>
  )
}
