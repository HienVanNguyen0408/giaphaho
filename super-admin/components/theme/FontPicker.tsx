'use client'

const FONTS = [
  'Be Vietnam Pro',
  'Roboto',
  'Noto Serif',
  'Open Sans',
  'Source Sans Pro',
  'Lato',
]

interface FontPickerProps {
  value: string
  onChange: (value: string) => void
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--t-text-2)' }}>
        Font chữ
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg text-sm"
        style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)', color: 'var(--t-text)' }}
      >
        {FONTS.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  )
}
