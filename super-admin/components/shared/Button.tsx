import { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--t-accent), color-mix(in oklch, var(--t-accent) 72%, var(--t-gold)))',
      color: '#fff',
      border: '1px solid color-mix(in oklch, var(--t-accent) 72%, #000)',
      boxShadow: '0 12px 26px color-mix(in oklch, var(--t-accent) 18%, transparent)',
    },
    secondary: {
      background: 'color-mix(in oklch, var(--t-surface) 62%, var(--t-surface-2))',
      color: 'var(--t-text)',
      border: '1px solid var(--t-border)',
    },
    danger: {
      background: 'color-mix(in oklch, var(--t-error) 88%, #000)',
      color: '#fff',
      border: '1px solid color-mix(in oklch, var(--t-error) 70%, #000)',
    },
    ghost: {
      background: 'color-mix(in oklch, var(--t-surface) 40%, transparent)',
      color: 'var(--t-text-2)',
      border: '1px solid var(--t-border)',
    },
  }

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${sizes[size]} inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md font-semibold transition-all duration-150 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ''}`}
      style={{ ...styles[variant], ...props.style }}
    >
      {loading && <Loader2 size={13} className="animate-spin flex-shrink-0" />}
      {children}
    </button>
  )
}
