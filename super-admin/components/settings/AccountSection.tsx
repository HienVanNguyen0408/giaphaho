'use client'

import { useState } from 'react'
import { Pencil, X, Check } from 'lucide-react'
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

export function AccountSection() {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: 'Super Admin', email: 'admin@giaphaho.vn' })
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })

  const fields = [
    { key: 'name', label: 'Họ tên', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
  ]

  const pwFields = [
    { key: 'current', label: 'Mật khẩu hiện tại', placeholder: '••••••••' },
    { key: 'next', label: 'Mật khẩu mới', placeholder: '••••••••' },
    { key: 'confirm', label: 'Xác nhận', placeholder: '••••••••' },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold" style={{ color: 'var(--t-text)' }}>
          Tài khoản
        </h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg transition-colors"
            style={{
              background: 'var(--t-surface-2)',
              color: 'var(--t-text-2)',
              border: '1px solid var(--t-border)',
              cursor: 'pointer',
            }}
          >
            <Pencil size={11} />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-lg transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--t-text-3)',
                border: '1px solid var(--t-border)',
                cursor: 'pointer',
              }}
            >
              <X size={11} />
              Hủy
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-lg transition-colors"
              style={{
                background: 'var(--t-accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Check size={11} />
              Lưu
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center gap-4">
            <label
              className="text-[11px] font-medium w-28 flex-shrink-0 uppercase"
              style={{ color: 'var(--t-text-3)', letterSpacing: '0.06em' }}
            >
              {field.label}
            </label>
            {editing ? (
              <input
                type={field.type}
                value={(form as Record<string, string>)[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                style={inputStyle}
              />
            ) : (
              <span className="text-[13px]" style={{ color: 'var(--t-text)' }}>
                {(form as Record<string, string>)[field.key]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Password section */}
      <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--t-border)' }}>
        <h3 className="text-[12px] font-semibold mb-3 uppercase" style={{ color: 'var(--t-text-3)', letterSpacing: '0.06em' }}>
          Đổi mật khẩu
        </h3>
        <div className="space-y-2.5">
          {pwFields.map((f) => (
            <div key={f.key} className="flex items-center gap-4">
              <label
                className="text-[11px] font-medium w-28 flex-shrink-0"
                style={{ color: 'var(--t-text-3)' }}
              >
                {f.label}
              </label>
              <input
                type="password"
                value={(passwordForm as Record<string, string>)[f.key]}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, [f.key]: e.target.value })
                }
                style={inputStyle}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-3">
          <Button size="sm">Đổi mật khẩu</Button>
        </div>
      </div>
    </Card>
  )
}
