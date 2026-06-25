'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { upsertParesPayment } from '@/lib/actions/pares'
import type { ParesPayment } from '@/types'

interface Props {
  contractId: string
  anio: number
  mes: number
  payment: ParesPayment | null
}

export function PagoRow({ contractId, anio, mes, payment }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [metodo, setMetodo]         = useState(payment?.metodo_pago ?? '')
  const [editing, setEditing]       = useState(false)

  const pagado = payment?.pagado ?? false

  function submit(newPagado: boolean) {
    startTransition(async () => {
      await upsertParesPayment(contractId, anio, mes, newPagado, newPagado ? (metodo.trim() || null) : null)
      setEditing(false)
      router.refresh()
    })
  }

  if (pagado) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-success text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          {payment?.metodo_pago ? (
            <span className="text-textsec font-normal">{payment.metodo_pago}</span>
          ) : (
            <span>Pagado</span>
          )}
        </div>
        <button
          onClick={() => submit(false)}
          disabled={pending}
          className="text-[10px] text-textmuted hover:text-error border border-border hover:border-error/30 px-2 py-0.5 rounded-lg transition-colors"
        >
          {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Desmarcar'}
        </button>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={metodo}
          onChange={e => setMetodo(e.target.value)}
          placeholder="Método de pago..."
          className="text-xs bg-card-elevated border border-border-bright rounded-lg px-2.5 py-1.5 text-textprim placeholder:text-textmuted focus:outline-none focus:border-orange/60 w-36"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && submit(true)}
        />
        <button
          onClick={() => submit(true)}
          disabled={pending}
          className="inline-flex items-center gap-1 text-xs text-success border border-success/30 hover:bg-success/10 px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
        >
          {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Confirmar
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs text-textmuted hover:text-textprim"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1.5 text-xs text-textsec hover:text-textprim border border-dashed border-border hover:border-orange/40 px-2.5 py-1.5 rounded-lg transition-colors"
    >
      <Circle className="w-3.5 h-3.5" />
      Marcar pagado
    </button>
  )
}
