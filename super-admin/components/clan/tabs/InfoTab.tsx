'use client'

import { useState } from 'react'
import { clanApi } from '@/lib/api'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import type { Clan } from '@/types'

interface InfoTabProps {
  clan: Clan
  onUpdate: (clan: Clan) => void
}

export function InfoTab({ clan, onUpdate }: InfoTabProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    contactName: clan.contactName ?? '',
    contactEmail: clan.contactEmail ?? '',
    contactPhone: clan.contactPhone ?? '',
    address: clan.address ?? '',
    notes: clan.notes ?? '',
  })

  async function handleSave() {
    setSaving(true)
    try {
      const result = await clanApi.update(clan.id, form)
      onUpdate(result.clan)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { key: 'contactName', label: 'Người liên hệ' },
    { key: 'contactEmail', label: 'Email' },
    { key: 'contactPhone', label: 'Điện thoại' },
    { key: 'address', label: 'Địa chỉ' },
  ]

  return (
    <Card>
      <div className="flex justify-between mb-6">
        <h2 className="text-base font-semibold" style={{ color: 'var(--t-text)' }}>Thông tin họ</h2>
        {!editing ? (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Chỉnh sửa</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Hủy</Button>
            <Button size="sm" loading={saving} onClick={handleSave}>Lưu</Button>
          </div>
        )}
      </div>

      <dl className="space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium" style={{ color: 'var(--t-text-3)' }}>{f.label}</dt>
            <dd className="col-span-2">
              {editing ? (
                <input
                  type="text"
                  value={(form as Record<string, string>)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
                />
              ) : (
                <span className="text-sm" style={{ color: 'var(--t-text)' }}>
                  {(clan as unknown as Record<string, unknown>)[f.key] as string ?? '—'}
                </span>
              )}
            </dd>
          </div>
        ))}

        {editing && (
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium" style={{ color: 'var(--t-text-3)' }}>Ghi chú</dt>
            <dd className="col-span-2">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-1.5 rounded-lg text-sm resize-none"
                style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
              />
            </dd>
          </div>
        )}
      </dl>
    </Card>
  )
}
