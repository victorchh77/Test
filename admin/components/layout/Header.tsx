'use client'

import { Menu, LogOut, User } from 'lucide-react'
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

  return (
    <header className="h-14 bg-sidebar border-b border-border flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu className="w-4 h-4 text-textsec" />
        </button>
        <h1 className="text-sm font-semibold text-textprim">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-orange/20 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-orange" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-textprim leading-none">
              {profile?.full_name ?? 'Usuario'}
            </p>
            <p className="text-[10px] text-textsec capitalize">
              {profile?.role ?? ''}
            </p>
          </div>
        </div>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={() => startTransition(() => logout())}
          disabled={pending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-textsec hover:text-error hover:bg-error/10
                     rounded-lg transition-all duration-150 disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
