'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteUser } from '@/lib/actions/admin-users'
import { Button } from '@/components/ui/Button'

interface Props {
  userId: string
  label: string
  isSelf: boolean
}

export function DeleteUserButton({ userId, label, isSelf }: Props) {
  const [error, setError]          = useState('')
  const [pending, startTransition] = useTransition()

  if (isSelf) return <span className="text-xs text-textmuted">—</span>

  function handleDelete() {
    if (!confirm(`¿Eliminar la cuenta de "${label}"? Esta acción no se puede deshacer.`)) return
    setError('')
    startTransition(async () => {
      const res = await deleteUser(userId)
      if (res.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <Button variant="danger" size="sm" loading={pending} onClick={handleDelete}>
        <Trash2 className="w-3.5 h-3.5" />
        Eliminar
      </Button>
      {error && <p className="text-xs text-error max-w-[220px]">{error}</p>}
    </div>
  )
}
