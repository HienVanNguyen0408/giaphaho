'use client'

import { useState } from 'react'
import { licenseApi } from '@/lib/api'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { GenerateModal } from '@/components/license/GenerateModal'
import { RenewModal } from '@/components/license/RenewModal'
import type { Clan, License } from '@/types'

interface LicenseTabProps {
  clan: Clan
  onUpdate: (clan: Clan) => void
}

export function LicenseTab({ clan, onUpdate }: LicenseTabProps) {
  const [showGenerate, setShowGenerate] = useState(false)
  const [showRenew, setShowRenew] = useState(false)
  const [revoking, setRevoking] = useState(false)

  const activeLicense = clan.licenses?.find((l) => !l.isRevoked)

  function maskKey(key: string) {
    return `****-****-****-${key.slice(-4)}`
  }

  async function handleRevoke() {
    if (!activeLicense) return
    setRevoking(true)
    try {
      await licenseApi.revoke(clan.id, activeLicense.id)
      const updated = await import('@/lib/api').then((m) => m.clanApi.getById(clan.id))
      onUpdate(updated.clan)
    } finally {
      setRevoking(false)
    }
  }

  return (
    <div className="space-y-4">
      {activeLicense ? (
        <Card>
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: 'var(--t-text)' }}>License hiện tại</h2>
            <Badge variant={activeLicense.isRevoked ? 'error' : 'success'}>
              {activeLicense.isRevoked ? 'Đã thu hồi' : 'Đang hoạt động'}
            </Badge>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt style={{ color: 'var(--t-text-3)' }}>License key</dt>
              <dd className="font-mono" style={{ color: 'var(--t-text)' }}>{maskKey(activeLicense.key)}</dd>
            </div>
            <div className="flex justify-between">
              <dt style={{ color: 'var(--t-text-3)' }}>Loại</dt>
              <dd style={{ color: 'var(--t-text)' }}>{activeLicense.type}</dd>
            </div>
            {activeLicense.expiresAt && (
              <div className="flex justify-between">
                <dt style={{ color: 'var(--t-text-3)' }}>Hết hạn</dt>
                <dd style={{ color: 'var(--t-text)' }}>{new Date(activeLicense.expiresAt).toLocaleDateString('vi-VN')}</dd>
              </div>
            )}
            {clan.licenseType === 'PERMANENT' && (
              <div className="flex justify-between">
                <dt style={{ color: 'var(--t-text-3)' }}>Lượt tải</dt>
                <dd style={{ color: 'var(--t-text)' }}>{activeLicense.downloadCount} / {activeLicense.maxDownloads}</dd>
              </div>
            )}
          </dl>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(activeLicense.key)}
            >
              Sao chép key
            </Button>
            <Button variant="danger" size="sm" loading={revoking} onClick={handleRevoke}>
              Thu hồi
            </Button>
            {clan.licenseType === 'SUBSCRIPTION' && (
              <Button variant="secondary" size="sm" onClick={() => setShowRenew(true)}>
                Gia hạn
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setShowGenerate(true)}>
              Tạo key mới
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-center py-4" style={{ color: 'var(--t-text-3)' }}>
            Không có license đang hoạt động
          </p>
          <div className="flex justify-center mt-2">
            <Button onClick={() => setShowGenerate(true)}>Tạo license mới</Button>
          </div>
        </Card>
      )}

      {/* License history */}
      {clan.licenses && clan.licenses.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--t-text)' }}>Lịch sử license</h3>
          <div className="space-y-2">
            {clan.licenses.map((l) => (
              <div key={l.id} className="flex justify-between items-center text-xs py-2" style={{ borderBottom: '1px solid var(--t-border)' }}>
                <span className="font-mono" style={{ color: 'var(--t-text-3)' }}>{maskKey(l.key)}</span>
                <Badge variant={l.isRevoked ? 'error' : 'success'}>
                  {l.isRevoked ? 'Thu hồi' : 'Active'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showGenerate && (
        <GenerateModal
          clanId={clan.id}
          onClose={() => setShowGenerate(false)}
          onSuccess={async () => {
            const updated = await import('@/lib/api').then((m) => m.clanApi.getById(clan.id))
            onUpdate(updated.clan)
            setShowGenerate(false)
          }}
        />
      )}

      {showRenew && activeLicense && (
        <RenewModal
          clanId={clan.id}
          licenseId={activeLicense.id}
          currentExpiry={activeLicense.expiresAt}
          onClose={() => setShowRenew(false)}
          onSuccess={async () => {
            const updated = await import('@/lib/api').then((m) => m.clanApi.getById(clan.id))
            onUpdate(updated.clan)
            setShowRenew(false)
          }}
        />
      )}
    </div>
  )
}
