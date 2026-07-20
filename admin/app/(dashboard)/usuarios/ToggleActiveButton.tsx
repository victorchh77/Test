'use client'

import { useState, useTransition } from 'react'
import { Ban, CheckCircle2 } from 'lucide-react'
import { toggleUserActive } from '@/lib/actions/admin-users'
import { Button } from '@/components/ui/Button'

interface Props {
  userId: string
  label: string
  activo: boolean
  isSelf: boolean
}

export function ToggleActiveButton({ userId, label, activo, isSelf }: Props) {
  const [current, setCurrent]      = useState(activo)
  const [error, setError]          = useState('')
  const [pending, startTransition] = useTransition()

  if (isSelf) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border bg-success/15 text-success border-success/25">
        Activo
      </span>
    )
  }

  function handleToggle() {
    const next = !current
    const msg = next
      ? `¿Reactivar la cuenta de "${label}"? Va a poder volver a iniciar sesión.`
      : `¿Desactivar la cuenta de "${label}"? No va a poder iniciar sesión hasta que la reactives.`
    if (!confirm(msg)) return
    setError('')
    startTransition(async () => {
      const res = await toggleUserActive(userId, next)
      if (res.error) setError(res.error)
      else setCurrent(next)
    })
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border
          ${current ? 'bg-success/15 text-success border-success/25' : 'bg-textmuted/15 text-textmuted border-textmuted/25'}`}>
          {current ? 'Activo' : 'Inactivo'}
        </span>
        <Button
          variant={current ? 'secondary' : 'primary'}
          size="sm"
          loading={pending}
          onClick={handleToggle}
        >
          {current ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {current ? 'Desactivar' : 'Activar'}
        </Button>
      </div>
      {error && <p className="text-xs text-error max-w-[240px]">{error}</p>}
    </div>
  )
}
