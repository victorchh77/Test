'use client'

import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
  glow?: boolean
}

export function Card({ children, className = '', padding = true, hover = false, glow = false }: Props) {
  return (
    <div className={`
      relative overflow-hidden
      bg-card border border-border rounded-2xl shadow-card
      ${hover ? 'hover:border-border-bright transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : ''}
      ${glow ? 'hover:shadow-[0_0_32px_rgba(255,140,0,0.1)] hover:border-orange/20' : ''}
      ${padding ? 'p-5' : ''}
      ${className}
    `}>
      {/* Inner top shine */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }}
      />
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
