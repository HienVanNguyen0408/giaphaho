'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { clanApi } from '@/lib/api'
import { ClanForm } from '@/components/clan/ClanForm'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import type { CreateClanInput } from '@/types'

export default function NewClanPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<Partial<CreateClanInput>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ clanId: string; licenseKey: string } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleSubmit() {
    if (!formData.name || !formData.code || !formData.licenseType) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await clanApi.create(formData as CreateClanInput)
      setResult({ clanId: response.clan.id, licenseKey: response.licenseKey })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo họ thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  function copyKey() {
    if (result) {
      navigator.clipboard.writeText(result.licenseKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <div className="text-center space-y-4">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-md"
              style={{
                background: 'color-mix(in oklch, var(--t-success) 12%, transparent)',
                color: 'var(--t-success)',
                border: '1px solid color-mix(in oklch, var(--t-success) 24%, transparent)',
              }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--t-text)' }}>Tạo họ thành công!</h2>
            <p className="text-sm" style={{ color: 'var(--t-text-3)' }}>
              License key đã được tạo. Hãy sao chép và giao cho họ.
            </p>

            <div
              className="p-4 rounded-lg font-mono text-sm break-all"
              style={{ background: 'var(--t-surface-2)', color: 'var(--t-text)', border: '1px solid var(--t-border)' }}
            >
              {result.licenseKey}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={copyKey} variant="secondary">
                {copied ? '✓ Đã sao chép' : 'Sao chép key'}
              </Button>
              <Button onClick={() => router.push(`/clans/${result.clanId}`)}>
                Xem chi tiết
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-panel rounded-lg overflow-hidden p-5">
        <h1 className="relative z-10 text-2xl font-bold" style={{ color: 'var(--t-text)' }}>Thêm họ mới</h1>
        <p className="relative z-10 mt-1 text-sm" style={{ color: 'var(--t-text-3)' }}>
          Bước {step} / 2
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className="flex-1 h-2 rounded-sm"
            style={{
              background: s <= step ? 'var(--t-accent)' : 'var(--t-border)',
            }}
          />
        ))}
      </div>

      <Card>
        <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--t-text)' }}>
          {step === 1 ? 'Thông tin cơ bản' : 'Thông tin liên hệ'}
        </h2>

        <ClanForm data={formData} onChange={setFormData} step={step} />

        {error && (
          <div
            className="mt-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'var(--t-error-bg)', color: 'var(--t-error)' }}
          >
            {error}
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step === 2 ? (
            <Button variant="ghost" onClick={() => setStep(1)}>← Quay lại</Button>
          ) : (
            <div />
          )}
          {step === 1 ? (
            <Button onClick={() => setStep(2)}>Tiếp theo →</Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting}>
              Tạo họ
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
