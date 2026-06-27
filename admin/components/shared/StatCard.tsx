import { type LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: string; positive?: boolean }
  color?: 'orange' | 'success' | 'error' | 'default'
}

const styles = {
  orange: {
    accent: 'accent-line-orange',
    icon:   'bg-orange/15 text-orange shadow-orange-sm',
    glow:   'hover:shadow-[0_0_32px_rgba(255,140,0,0.12)]',
    radial: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,140,0,0.05), transparent)',
  },
  success: {
    accent: 'accent-line-success',
    icon:   'bg-success/15 text-success',
    glow:   'hover:shadow-[0_0_32px_rgba(0,201,132,0.1)]',
    radial: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(0,201,132,0.04), transparent)',
  },
  error: {
    accent: 'accent-line-error',
    icon:   'bg-error/15 text-error',
    glow:   'hover:shadow-[0_0_32px_rgba(255,77,106,0.1)]',
    radial: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,77,106,0.04), transparent)',
  },
  default: {
    accent: 'accent-line-default',
    icon:   'bg-white/5 text-textsec',
    glow:   '',
    radial: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,255,255,0.02), transparent)',
  },
}

export function StatCard({ title, value, icon: Icon, trend, color = 'default' }: Props) {
  const s = styles[color]
  return (
    <div className={`
      relative bg-card border border-border rounded-2xl p-5 overflow-hidden
      flex items-start gap-4 group cursor-default
      transition-all duration-300 hover:border-border-bright hover:-translate-y-0.5
      shadow-card ${s.accent} ${s.glow}
    `}>
      {/* Subtle background radial */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           style={{ background: s.radial }} />

      {/* Icon */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${s.icon}
                       transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 relative">
        <p className="section-label mb-1.5">{title}</p>
        <p className="stat-value truncate animate-slide-up">{value}</p>
        {trend && (
          <p className={`text-xs mt-1.5 font-medium ${trend.positive ? 'text-success' : 'text-error'}`}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}
