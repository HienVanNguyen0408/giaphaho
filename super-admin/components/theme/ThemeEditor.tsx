'use client'

import { useState } from 'react'
import { themeApi } from '@/lib/api'
import { ColorPicker } from './ColorPicker'
import { FontPicker } from './FontPicker'
import { Button } from '../shared/Button'
import type { Theme } from '@/types'

const DEFAULT_THEME: Partial<Theme> = {
  primaryColor: '#8B0000',
  accentColor: '#6B0000',
  fontFamily: 'Be Vietnam Pro',
  customCss: '',
}

interface ThemeEditorProps {
  clanId: string
  initialTheme: Partial<Theme>
  onUpdate: (theme: Partial<Theme>) => void
}

export function ThemeEditor({ clanId, initialTheme, onUpdate }: ThemeEditorProps) {
  const [theme, setTheme] = useState<Partial<Theme>>(initialTheme)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(patch: Partial<Theme>) {
    const next = { ...theme, ...patch }
    setTheme(next)
    onUpdate(next)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await themeApi.update(clanId, theme)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setTheme(DEFAULT_THEME)
    onUpdate(DEFAULT_THEME)
  }

  return (
    <div className="space-y-6">
      <ColorPicker
        label="Màu chủ đạo (Primary)"
        value={theme.primaryColor ?? '#8B0000'}
        onChange={(v) => update({ primaryColor: v })}
      />

      <ColorPicker
        label="Màu phụ (Accent)"
        value={theme.accentColor ?? '#6B0000'}
        onChange={(v) => update({ accentColor: v })}
      />

      <FontPicker
        value={theme.fontFamily ?? 'Be Vietnam Pro'}
        onChange={(v) => update({ fontFamily: v })}
      />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--t-text-2)' }}>
          Custom CSS
        </label>
        <textarea
          value={theme.customCss ?? ''}
          onChange={(e) => update({ customCss: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 rounded-lg text-sm font-mono resize-none"
          style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
          placeholder=":root { --custom-var: value; }"
        />
      </div>

      <div className="flex gap-3">
        <Button loading={saving} onClick={handleSave}>
          {saved ? '✓ Đã lưu' : 'Lưu theme'}
        </Button>
        <Button variant="ghost" onClick={handleReset}>Reset mặc định</Button>
      </div>
    </div>
  )
}
