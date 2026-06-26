'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { updateUserRole } from '@/lib/actions/admin-users'
import type { Role } from '@/types'

const ROLES: { value: Role; label: string }[] = [
  { value: 'admin',      label: 'Administrador' },
  { value: 'secretaria', label: 'Secretaría'    },
  { value: 'vendedor',   label: 'Vendedor'      },
]

export function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, { label: string; cls: string; dot: string }> = {
    admin:      { label: 'Administrador', cls: 'bg-orange/15 text-orange border-orange/25',             dot: 'bg-orange'     },
    secretaria: { label: 'Secretaría',    cls: 'bg-purple-500/15 text-purple-400 border-purple-500/25', dot: 'bg-purple-400' },
    vendedor:   { label: 'Vendedor',      cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25',       dot: 'bg-blue-400'   },
  }
  const { label, cls, dot } = map[role] ?? map.vendedor
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

interface Props {
  userId: string
  currentRole: Role
  isSelf: boolean
}

export function RoleSelect({ userId, currentRole, isSelf }: Props) {
  const [role, setRole]            = useState<Role>(currentRole)
  const [error, setError]          = useState('')
  const [saved, setSaved]          = useState(false)
  const [pending, startTransition] = useTransition()

  if (isSelf) {
    return (
      <div className="flex items-center gap-1.5">
        <RoleBadge role={role} />
        <span className="text-xs text-textmuted">(tú)</span>
      </div>
    )
  }

  function handleChange(newRole: Role) {
    if (newRole === role) return
    const prev = role
    setRole(newRole)
    setError('')
    setSaved(false)
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res.error) {
        setRole(prev)
        setError(res.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={role}
            onChange={e => handleChange(e.target.value as Role)}
            disabled={pending}
            className="appearance-none bg-card-elevated border border-border hover:border-border-bright text-textprim text-xs rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-orange/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            {pending
              ? <Loader2 className="w-3 h-3 animate-spin text-textsec" />
              : <svg className="w-3 h-3 text-textsec" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            }
          </div>
        </div>
        {saved && <span className="text-xs text-success">Guardado ✓</span>}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
