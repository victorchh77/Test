'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  subtitle?: string
}

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, size = 'md', subtitle }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className={`relative w-full ${sizes[size]} animate-scale-in`}>
        {/* Glow behind modal */}
        <div className="absolute -inset-px rounded-2xl pointer-events-none"
             style={{ background: 'linear-gradient(135deg, rgba(255,140,0,0.15), transparent 60%)', borderRadius: 'inherit' }} />

        <div className="relative bg-card border border-border-bright rounded-2xl shadow-card-lg overflow-hidden">
          {/* Top accent line */}
          <div className="h-px w-full"
               style={{ background: 'linear-gradient(90deg, transparent, rgba(255,140,0,0.6), transparent)' }} />

          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="font-display text-base font-semibold text-textprim tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-textsec mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1.5 rounded-xl hover:bg-white/5 transition-colors text-textsec hover:text-textprim flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
