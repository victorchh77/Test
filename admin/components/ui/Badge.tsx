type Color = 'success' | 'error' | 'warning' | 'orange' | 'default'

interface Props {
  children: React.ReactNode
  color?: Color
  className?: string
}

const colors: Record<Color, string> = {
  success: 'bg-success/15 text-success border-success/30',
  error:   'bg-error/15 text-error border-error/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  orange:  'bg-orange/15 text-orange border-orange/30',
  default: 'bg-white/5 text-textsec border-border',
}

export function Badge({ children, color = 'default', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
