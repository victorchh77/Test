interface Props {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
  glow?: boolean
  shimmer?: boolean
  animated?: boolean
}

export function Card({
  children,
  className = '',
  padding = true,
  hover = false,
  glow = false,
  shimmer = false,
  animated = false,
}: Props) {
  return (
    <div className={`
      relative overflow-hidden
      bg-card border border-border rounded-2xl shadow-card
      ${hover ? 'hover:border-border-bright transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]' : ''}
      ${glow ? 'hover:shadow-[0_0_40px_rgba(255,140,0,0.12)] hover:border-orange/25' : ''}
      ${shimmer ? 'group' : ''}
      ${animated ? 'gradient-border-animated' : ''}
      ${padding ? 'p-5' : ''}
      ${className}
    `}>
      {/* Inner top shine */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
      />

      {/* Shimmer sweep on hover */}
      {shimmer && (
        <div className="
          absolute inset-0 -translate-x-full group-hover:translate-x-full
          bg-gradient-to-r from-transparent via-white/[0.035] to-transparent
          transition-transform duration-[700ms] ease-in-out pointer-events-none z-10
        " />
      )}

      {children}
    </div>
  )
}

export function CardHeader({
  title,
  action,
  subtitle,
}: {
  title: string
  action?: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="font-display text-base font-semibold text-textprim tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-textsec mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  )
}
