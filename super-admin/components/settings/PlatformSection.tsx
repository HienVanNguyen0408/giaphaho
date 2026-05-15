'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'

const inputStyle: React.CSSProperties = {
  background: 'var(--t-surface-2)',
  border: '1px solid var(--t-border)',
  color: 'var(--t-text)',
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
}

export function PlatformSection() {
  const [config, setConfig] = useState({
    platformName: 'Gia Phả Hồ',
    baseDomain: 'giaphaho.vn',
    maxDownloads: 3,
    warnDays: 30,
  })
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const fields = [
    { key: 'platformName', label: 'Tên nền tảng', type: 'text' },
    { key: 'baseDomain', label: 'Base domain', type: 'text' },
    { key: 'maxDownloads', label: 'Max downloads (PERMANENT)', type: 'number' },
    { key: 'warnDays', label: 'Cảnh báo trước (ngày)', type: 'number' },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold" style={{ color: 'var(--t-text)' }}>
          Cài đặt nền tảng
        </h2>
        {saved && (
          <span
            className="flex items-center gap-1.5 text-[11px] font-medium"
            style={{ color: 'var(--t-success)' }}
          >
            <Check size={12} />
            Đã lưu
          </span>
        )}
      </div>

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-4">
            <label
              className="text-[11px] font-medium w-40 flex-shrink-0 uppercase"
              style={{ color: 'var(--t-text-3)', letterSpacing: '0.06em' }}
            >
              {f.label}
            </label>
            <input
              type={f.type}
              value={(config as Record<string, unknown>)[f.key] as string | number}
              onChange={(e) =>
                setConfig({
                  ...config,
                  [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={handleSave} size="sm">
          Lưu cài đặt
        </Button>
      </div>
    </Card>
  )
}
