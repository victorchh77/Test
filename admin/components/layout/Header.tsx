'use client'

import { Menu, LogOut, User, Bell } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { useTransition } from 'react'
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
      h-14 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10
      bg-sidebar/90 backdrop-blur-md
      border-b border-border
    ">
      {/* Bottom orange gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
           style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,140,0,0.3) 30%, rgba(255,140,0,0.5) 50%, rgba(255,140,0,0.3) 70%, transparent 100%)' }} />

      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-textsec hover:text-textprim"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block w-1 h-4 bg-orange/60 rounded-full" />
          <h1 className="font-display text-sm font-semibold text-textprim tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="p-2 rounded-xl text-textsec hover:text-textprim hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white
                          bg-gradient-to-br from-orange to-orange-hover shadow-orange-sm flex-shrink-0">
            {initials}
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

        <div className="w-px h-5 bg-border mx-1" />

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
