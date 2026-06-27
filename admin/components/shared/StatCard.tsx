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
    accent: 'border-t-2 border-t-orange/70',
    icon:   'bg-orange/15 text-orange',
    glow:   'hover:shadow-[0_0_40px_rgba(255,140,0,0.13)]',
    radial: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,140,0,0.07), transparent)',
  },
  success: {
    accent: 'border-t-2 border-t-success/70',
    icon:   'bg-success/15 text-success',
    glow:   'hover:shadow-[0_0_40px_rgba(0,201,132,0.1)]',
    radial: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(0,201,132,0.06), transparent)',
  },
  error: {
    accent: 'border-t-2 border-t-error/70',
    icon:   'bg-error/15 text-error',
    glow:   'hover:shadow-[0_0_40px_rgba(255,77,106,0.1)]',
    radial: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,77,106,0.06), transparent)',
  },
  default: {
    accent: 'border-t-2 border-t-border-bright',
    icon:   'bg-white/5 text-textsec',
    glow:   'hover:shadow-[0_0_40px_rgba(255,255,255,0.04)]',
    radial: 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,255,255,0.03), transparent)',
  },
}

export function StatCard({ title, value, icon: Icon, trend, color = 'default' }: Props) {
  const s = styles[color]
  return (
    <div className={`
      relative overflow-hidden rounded-2xl cursor-default group
      bg-card border border-border shadow-card
      transition-all duration-300 hover:-translate-y-0.5 hover:border-border-bright
      ${s.accent} ${s.glow}
    `}>
      {/* Background radial */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: s.radial }} />

      {/* Top-left shine */}
      <div
        className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.03), transparent 60%)' }}
      />

      <div className="relative flex items-start gap-4 p-5">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${s.icon}
                         transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="section-label mb-1.5">{title}</p>
          <p className="stat-value truncate">{value}</p>
          {trend && (
            <p className={`text-xs mt-1.5 font-medium ${trend.positive ? 'text-success' : 'text-error'}`}>
              {trend.value}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
