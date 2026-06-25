interface Props {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
}

export function Card({ children, className = '', padding = true, hover = false }: Props) {
  return (
    <div className={`
      bg-card border border-border rounded-2xl shadow-card
      ${hover ? 'hover:border-border-bright hover:-translate-y-px transition-all duration-300' : ''}
      ${padding ? 'p-5' : ''}
      ${className}
    `}>
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
