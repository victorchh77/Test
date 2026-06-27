import { type LucideIcon } from 'lucide-react'
import { TiltCard } from '@/components/ui/TiltCard'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: string; positive?: boolean }
  color?: 'orange' | 'success' | 'error' | 'default'
}

const styles = {
  orange: {
    accent:  'border-t-2 border-t-orange shadow-[0_-2px_16px_rgba(255,140,0,0.25)]',
    icon:    'bg-orange/15 text-orange shadow-[0_0_22px_rgba(255,140,0,0.4)]',
    radial:  'radial-gradient(ellipse 110% 80% at 0% 0%, rgba(255,140,0,0.14), transparent)',
    corner:  'rgba(255,140,0,0.07)',
    value:   'text-orange glow-text-orange',
  },
  success: {
    accent:  'border-t-2 border-t-success shadow-[0_-2px_16px_rgba(0,201,132,0.2)]',
    icon:    'bg-success/15 text-success shadow-[0_0_22px_rgba(0,201,132,0.35)]',
    radial:  'radial-gradient(ellipse 110% 80% at 0% 0%, rgba(0,201,132,0.12), transparent)',
    corner:  'rgba(0,201,132,0.07)',
    value:   'text-success',
  },
  error: {
    accent:  'border-t-2 border-t-error shadow-[0_-2px_16px_rgba(255,77,106,0.2)]',
    icon:    'bg-error/15 text-error shadow-[0_0_22px_rgba(255,77,106,0.35)]',
    radial:  'radial-gradient(ellipse 110% 80% at 0% 0%, rgba(255,77,106,0.12), transparent)',
    corner:  'rgba(255,77,106,0.07)',
    value:   'text-textprim',
  },
  default: {
    accent:  'border-t-2 border-t-border-bright',
    icon:    'bg-white/5 text-textsec shadow-[0_0_12px_rgba(255,255,255,0.05)]',
    radial:  'radial-gradient(ellipse 110% 80% at 0% 0%, rgba(255,255,255,0.04), transparent)',
    corner:  'rgba(255,255,255,0.03)',
    value:   'text-textprim',
  },
}

export function StatCard({ title, value, icon: Icon, trend, color = 'default' }: Props) {
  const s = styles[color]
  return (
    <TiltCard max={8}>
      <div className={`
        relative overflow-hidden rounded-2xl cursor-default
        bg-card border border-border shadow-card-lg
        ${s.accent}
      `}>
        {/* Background radial gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: s.radial }} />

        {/* Corner spotlight */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none blur-2xl"
          style={{ background: s.corner }}
        />

        {/* Inner shine line */}
        <div
          className="absolute top-[2px] left-4 right-4 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }}
        />

        <div className="relative flex items-start gap-4 p-5" style={{ transform: 'translateZ(30px)' }}>
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${s.icon} transition-shadow duration-300`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="section-label mb-2">{title}</p>
            <p className={`stat-value truncate ${s.value}`}>
              <AnimatedNumber value={value} />
            </p>
            {trend && (
              <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${trend.positive ? 'text-success' : 'text-error'}`}>
                <span>{trend.positive ? '↑' : '↓'}</span>
                {trend.value}
              </p>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  )
}
