'use client'

import { useState } from 'react'
import { licenseApi } from '@/lib/api'
import { Button } from '@/components/shared/Button'

interface RenewModalProps {
  clanId: string
  licenseId: string
  currentExpiry?: string
  onClose: () => void
  onSuccess: () => void
}

export function RenewModal({ clanId, licenseId, currentExpiry, onClose, onSuccess }: RenewModalProps) {
  const [months, setMonths] = useState(12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const newExpiry = currentExpiry
    ? (() => {
        const d = new Date(currentExpiry)
        d.setMonth(d.getMonth() + months)
        return d
      })()
    : null

  async function handleRenew() {
    setLoading(true)
    setError('')
    try {
      await licenseApi.renew(clanId, licenseId, months)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gia hạn thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'color-mix(in oklch, var(--t-ink) 58%, transparent)', backdropFilter: 'blur(10px)' }}>
      <div className="page-panel w-full max-w-md rounded-lg overflow-hidden p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--t-text)' }}>Gia hạn license</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--t-text-2)' }}>
            Gia hạn thêm
          </label>
          <div className="flex gap-2">
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: months === m ? 'var(--t-accent)' : 'var(--t-surface-2)',
                  color: months === m ? '#fff' : 'var(--t-text)',
                  border: `1px solid ${months === m ? 'var(--t-accent)' : 'var(--t-border)'}`,
                  cursor: 'pointer',
                }}
              >
                {m} tháng
              </button>
            ))}
          </div>

          {newExpiry && (
            <p className="mt-3 text-sm" style={{ color: 'var(--t-text-3)' }}>
              Ngày hết hạn mới: <strong style={{ color: 'var(--t-text)' }}>{newExpiry.toLocaleDateString('vi-VN')}</strong>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--t-error-bg)', color: 'var(--t-error)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button loading={loading} onClick={handleRenew}>Gia hạn {months} tháng</Button>
        </div>
      </div>
    </div>
  )
}
