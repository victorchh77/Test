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
    accent: 'border-t-2 border-t-orange',
    icon:   'bg-orange/15 text-orange shadow-[0_0_18px_rgba(255,140,0,0.3)]',
    radial: 'radial-gradient(ellipse 90% 70% at 0% 0%, rgba(255,140,0,0.10), transparent)',
    value:  'text-orange',
  },
  success: {
    accent: 'border-t-2 border-t-success',
    icon:   'bg-success/15 text-success shadow-[0_0_18px_rgba(0,201,132,0.25)]',
    radial: 'radial-gradient(ellipse 90% 70% at 0% 0%, rgba(0,201,132,0.09), transparent)',
    value:  'text-success',
  },
  error: {
    accent: 'border-t-2 border-t-error',
    icon:   'bg-error/15 text-error shadow-[0_0_18px_rgba(255,77,106,0.25)]',
    radial: 'radial-gradient(ellipse 90% 70% at 0% 0%, rgba(255,77,106,0.09), transparent)',
    value:  'text-textprim',
  },
  default: {
    accent: 'border-t-2 border-t-border-bright',
    icon:   'bg-white/5 text-textsec',
    radial: 'radial-gradient(ellipse 90% 70% at 0% 0%, rgba(255,255,255,0.04), transparent)',
    value:  'text-textprim',
  },
}

export function StatCard({ title, value, icon: Icon, trend, color = 'default' }: Props) {
  const s = styles[color]
  return (
    <TiltCard>
      <div className={`
        relative overflow-hidden rounded-2xl cursor-default
        bg-card border border-border shadow-card-lg
        ${s.accent}
      `}>
        {/* Background radial */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: s.radial }} />

        <div className="relative flex items-start gap-4 p-5" style={{ transform: 'translateZ(40px)' }}>
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${s.icon}`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="section-label mb-1.5">{title}</p>
            <p className={`stat-value truncate ${s.value}`}>
              <AnimatedNumber value={value} />
            </p>
            {trend && (
              <p className={`text-xs mt-1.5 font-medium ${trend.positive ? 'text-success' : 'text-error'}`}>
                {trend.value}
              </p>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  )
}
