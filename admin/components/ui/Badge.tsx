type Color = 'success' | 'error' | 'warning' | 'orange' | 'default' | 'blue'

interface Props {
  children: React.ReactNode
  color?: Color
  className?: string
  dot?: boolean
}

const colors: Record<Color, string> = {
  success: 'bg-success/12 text-success border-success/25',
  error:   'bg-error/12 text-error border-error/25',
  warning: 'bg-warning/12 text-warning border-warning/25',
  orange:  'bg-orange/12 text-orange border-orange/25',
  blue:    'bg-blue-400/12 text-blue-400 border-blue-400/25',
  default: 'bg-white/5 text-textsec border-border',
}

const dots: Record<Color, string> = {
  success: 'bg-success',
  error:   'bg-error',
  warning: 'bg-warning',
  orange:  'bg-orange',
  blue:    'bg-blue-400',
  default: 'bg-textsec',
}

export function Badge({ children, color = 'default', className = '', dot = false }: Props) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
      text-xs font-semibold border tracking-wide
      ${colors[color]} ${className}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[color]}`} />}
      {children}
    </span>
  )
}
