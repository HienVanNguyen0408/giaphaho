'use client'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--t-text-2)' }}>
        {label}
      </label>
      <div className="flex gap-2 items-center rounded-lg p-2" style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-md cursor-pointer border-0 p-0"
          style={{ background: 'none' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
          }}
          className="flex-1 px-3 py-2 rounded-md text-sm font-mono uppercase"
          style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
          maxLength={7}
          placeholder="#8B0000"
        />
        <div
          className="w-10 h-10 rounded-md border"
          style={{ background: value, borderColor: 'var(--t-border)' }}
        />
      </div>
    </div>
  )
}
