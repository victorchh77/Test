'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteTransfer } from '@/lib/actions/transfers'

export function DeleteTransferButton({ id }: { id: string }) {
  const [error, setError]          = useState('')
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Eliminar esta transferencia? Esta acción no se puede deshacer.')) return
    setError('')
    startTransition(async () => {
      const res = await deleteTransfer(id)
      if (res.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="p-1.5 hover:bg-error/10 hover:text-error rounded-lg transition-colors text-textsec disabled:opacity-50"
        title="Eliminar transferencia"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      {error && <p className="text-xs text-error max-w-[160px]">{error}</p>}
    </div>
  )
}
