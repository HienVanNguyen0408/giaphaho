'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { licenseApi } from '@/lib/api'
import { Button } from '@/components/shared/Button'

interface GenerateModalProps {
  clanId: string
  onClose: () => void
  onSuccess: () => void
}

export function GenerateModal({ clanId, onClose, onSuccess }: GenerateModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      await licenseApi.generate(clanId)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo license thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'color-mix(in oklch, var(--t-ink) 58%, transparent)', backdropFilter: 'blur(10px)' }}>
      <div className="page-panel w-full max-w-md rounded-lg overflow-hidden p-6">
        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--t-text)' }}>Tạo license key mới</h2>
        <p className="flex items-start gap-2 text-sm mb-6" style={{ color: 'var(--t-text-3)' }}>
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--t-warning)' }} />
          <span>Tạo key mới sẽ không vô hiệu hóa key cũ tự động. Bạn cần thu hồi key cũ thủ công nếu muốn.</span>
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--t-error-bg)', color: 'var(--t-error)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button loading={loading} onClick={handleGenerate}>Tạo key mới</Button>
        </div>
      </div>
    </div>
  )
}
