interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  dot?: boolean
}

export function Badge({ children, variant = 'neutral', dot = false }: BadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    success: {
      background: 'color-mix(in oklch, var(--t-success) 12%, transparent)',
      color: 'var(--t-success)',
      border: '1px solid color-mix(in oklch, var(--t-success) 22%, transparent)',
    },
    warning: {
      background: 'color-mix(in oklch, var(--t-warning) 12%, transparent)',
      color: 'var(--t-warning)',
      border: '1px solid color-mix(in oklch, var(--t-warning) 22%, transparent)',
    },
    error: {
      background: 'color-mix(in oklch, var(--t-error) 12%, transparent)',
      color: 'var(--t-error)',
      border: '1px solid color-mix(in oklch, var(--t-error) 22%, transparent)',
    },
    info: {
      background: 'color-mix(in oklch, var(--t-info) 12%, transparent)',
      color: 'var(--t-info)',
      border: '1px solid color-mix(in oklch, var(--t-info) 22%, transparent)',
    },
    neutral: {
      background: 'color-mix(in oklch, var(--t-surface-2) 70%, var(--t-surface))',
      color: 'var(--t-text-2)',
      border: '1px solid var(--t-border)',
    },
  }

  const dotColors: Record<string, string> = {
    success: 'var(--t-success)',
    warning: 'var(--t-warning)',
    error: 'var(--t-error)',
    info: 'var(--t-info)',
    neutral: 'var(--t-text-3)',
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold"
      style={styles[variant]}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: dotColors[variant] }}
        />
      )}
      {children}
    </span>
  )
}
