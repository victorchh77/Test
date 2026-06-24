import { type LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: string; positive?: boolean }
  color?: 'orange' | 'success' | 'error' | 'default'
}

const iconColors = {
  orange:  'bg-orange/15 text-orange',
  success: 'bg-success/15 text-success',
  error:   'bg-error/15 text-error',
  default: 'bg-white/5 text-textsec',
}

export function StatCard({ title, value, icon: Icon, trend, color = 'default' }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:border-orange/30 transition-colors duration-200">
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-textsec font-medium uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-textprim truncate">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-success' : 'text-error'}`}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}
