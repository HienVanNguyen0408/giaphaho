'use client'

import { useState } from 'react'
import type { CreateClanInput, LicenseType } from '@/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface ClanFormProps {
  data: Partial<CreateClanInput>
  onChange: (data: Partial<CreateClanInput>) => void
  step: 1 | 2
}

export function ClanForm({ data, onChange, step }: ClanFormProps) {
  function handleNameChange(name: string) {
    const code = slugify(name)
    onChange({ ...data, name, code, subdomain: `${code}.giaphaho.vn` })
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--t-text-2)' }}>
            Tên họ *
          </label>
          <input
            type="text"
            value={data.name ?? ''}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
            placeholder="Họ Nguyễn Bát Tràng"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--t-text-2)' }}>
            Code / Slug *
          </label>
          <input
            type="text"
            value={data.code ?? ''}
            onChange={(e) => onChange({ ...data, code: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-mono"
            style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
            placeholder="ho-nguyen-bat-trang"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--t-text-2)' }}>
            Loại license *
          </label>
          <select
            value={data.licenseType ?? ''}
            onChange={(e) => onChange({ ...data, licenseType: e.target.value as LicenseType })}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
          >
            <option value="">Chọn loại...</option>
            <option value="PERMANENT">PERMANENT — Vĩnh viễn (tự host)</option>
            <option value="SUBSCRIPTION">SUBSCRIPTION — Thuê bao (platform host)</option>
          </select>
        </div>

        {data.licenseType === 'SUBSCRIPTION' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--t-text-2)' }}>
                Subdomain
              </label>
              <input
                type="text"
                value={data.subdomain ?? ''}
                onChange={(e) => onChange({ ...data, subdomain: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-mono"
                style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
                placeholder="ho-nguyen.giaphaho.vn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--t-text-2)' }}>
                Ngày hết hạn
              </label>
              <input
                type="date"
                value={data.expiresAt ? data.expiresAt.split('T')[0] : ''}
                onChange={(e) => onChange({ ...data, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="w-full px-4 py-2.5 rounded-lg text-sm"
                style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
              />
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {[
        { key: 'contactName', label: 'Người liên hệ', placeholder: 'Nguyễn Văn A' },
        { key: 'contactEmail', label: 'Email liên hệ', placeholder: 'contact@example.com' },
        { key: 'contactPhone', label: 'Số điện thoại', placeholder: '0901234567' },
        { key: 'address', label: 'Địa chỉ', placeholder: 'Hà Nội, Việt Nam' },
      ].map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--t-text-2)' }}>
            {field.label}
          </label>
          <input
            type="text"
            value={(data as Record<string, string>)[field.key] ?? ''}
            onChange={(e) => onChange({ ...data, [field.key]: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
            placeholder={field.placeholder}
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--t-text-2)' }}>
          Ghi chú
        </label>
        <textarea
          value={data.notes ?? ''}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg text-sm resize-none"
          style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
          placeholder="Ghi chú thêm..."
        />
      </div>
    </div>
  )
}
