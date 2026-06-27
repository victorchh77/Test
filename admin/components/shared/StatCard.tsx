'use client'

import { motion } from 'framer-motion'
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
    accent:  'border-t-2 border-t-orange/70',
    icon:    'bg-orange/15 text-orange',
    glow:    '0 0 40px rgba(255,140,0,0.13)',
    radial:  'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,140,0,0.07), transparent)',
    ring:    'rgba(255,140,0,0.35)',
  },
  success: {
    accent:  'border-t-2 border-t-success/70',
    icon:    'bg-success/15 text-success',
    glow:    '0 0 40px rgba(0,201,132,0.1)',
    radial:  'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(0,201,132,0.06), transparent)',
    ring:    'rgba(0,201,132,0.3)',
  },
  error: {
    accent:  'border-t-2 border-t-error/70',
    icon:    'bg-error/15 text-error',
    glow:    '0 0 40px rgba(255,77,106,0.1)',
    radial:  'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,77,106,0.06), transparent)',
    ring:    'rgba(255,77,106,0.3)',
  },
  default: {
    accent:  'border-t-2 border-t-border-bright',
    icon:    'bg-white/5 text-textsec',
    glow:    '0 0 40px rgba(255,255,255,0.04)',
    radial:  'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,255,255,0.03), transparent)',
    ring:    'rgba(255,255,255,0.1)',
  },
}

export function StatCard({ title, value, icon: Icon, trend, color = 'default' }: Props) {
  const s = styles[color]
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: s.glow }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`
        relative overflow-hidden rounded-2xl cursor-default
        bg-card border border-border shadow-card
        ${s.accent}
      `}
    >
      {/* Subtle background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: s.radial }}
      />

      {/* Inner top-left shine */}
      <div
        className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.03), transparent 60%)' }}
      />

      <div className="relative flex items-start gap-4 p-5">
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${s.icon}`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

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
    </motion.div>
  )
}
