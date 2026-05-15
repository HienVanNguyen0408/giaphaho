interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', style, padding = 'md' }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }
  return (
    <div
      className={`page-panel overflow-hidden rounded-lg ${paddings[padding]} ${className}`}
      style={{
        ...style,
      }}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}
