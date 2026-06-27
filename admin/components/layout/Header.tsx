'use client'

import { Menu, LogOut, Bell } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Profile } from '@/types'

interface Props {
  profile: Profile | null
  onMenuClick: () => void
  title: string
}

export function Header({ profile, onMenuClick, title }: Props) {
  const [pending, startTransition] = useTransition()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <header className="
      relative h-14 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10
      bg-sidebar/85 backdrop-blur-xl
      border-b border-border/80
    ">
      {/* Bottom gradient line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,140,0,0.35) 25%, rgba(255,140,0,0.6) 50%, rgba(255,140,0,0.35) 75%, transparent 100%)' }}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-textsec hover:text-textprim"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {/* Orange accent bar */}
          <div className="hidden sm:block w-[3px] h-5 bg-orange rounded-full shadow-orange-sm" />

          {/* Animated title on route change */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-display text-sm font-semibold text-textprim tracking-tight"
            >
              {title}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="p-2 rounded-xl text-textsec hover:text-textprim hover:bg-white/5 transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border/80 mx-1" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          {/* Avatar with breathing glow ring */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-orange/30 blur-md ring-glow-breath pointer-events-none" />
            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white
                            bg-gradient-to-br from-orange to-orange-hover shadow-orange-sm">
              {initials}
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-textprim leading-none">
              {profile?.full_name ?? 'Usuario'}
            </p>
            <p className="text-[10px] text-textsec capitalize mt-0.5">
              {profile?.role ?? ''}
            </p>
          </div>
        </div>

        <div className="w-px h-5 bg-border/80 mx-1" />

        <button
          onClick={() => startTransition(() => logout())}
          disabled={pending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-medium
                     text-textsec hover:text-error hover:bg-error/10 border border-transparent
                     hover:border-error/20 transition-all duration-200 disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
