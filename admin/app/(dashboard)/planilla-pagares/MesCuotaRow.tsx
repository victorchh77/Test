'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { toggleCuotaPagada } from '@/lib/actions/pares'
import { formatCurrency } from '@/lib/utils/format'
import type { ParesCuota } from '@/types'

interface Props {
  cuota: ParesCuota
  clientName: string
  vehiculo: string | null
  moneda: 'Gs' | 'USD'
}

export function MesCuotaRow({ cuota, clientName, vehiculo, moneda }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [metodo, setMetodo]         = useState(cuota.metodo_pago ?? '')
  const [editing, setEditing]       = useState(false)

  function submit(newPagado: boolean) {
    startTransition(async () => {
      await toggleCuotaPagada(cuota.id, newPagado, newPagado ? (metodo.trim() || null) : null)
      setEditing(false)
      router.refresh()
    })
  }

  const dia = cuota.fecha_vencimiento
    ? parseInt(cuota.fecha_vencimiento.split('-')[2])
    : null

  const tipoBadge = cuota.tipo === 'refuerzo'
    ? 'bg-warning/10 text-warning border-warning/25'
    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'

  return (
    <tr className={`table-row-hover ${cuota.pagado ? 'opacity-60' : ''}`}>
      {/* Cliente */}
      <td className="table-cell">
        <p className="font-semibold text-textprim leading-tight">{clientName}</p>
        {vehiculo && <p className="text-xs text-textsec truncate max-w-[160px]">{vehiculo}</p>}
      </td>

      {/* Tipo */}
      <td className="table-cell">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tipoBadge}`}>
            {cuota.tipo === 'refuerzo' ? 'REFUERZO' : 'CUOTA'}
          </span>
          <span className="text-xs text-textmuted font-mono">#{cuota.numero}</span>
        </div>
      </td>

      {/* Día */}
      <td className="table-cell text-center">
        <span className="font-bold text-textprim tabular-nums">{dia ?? '—'}</span>
      </td>

      {/* Monto */}
      <td className="table-cell">
        <span className="font-bold text-orange tabular-nums text-sm">{formatCurrency(cuota.monto, moneda)}</span>
      </td>

      {/* Estado / pago */}
      <td className="table-cell">
        {cuota.pagado ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-success text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              {cuota.metodo_pago
                ? <span className="text-textsec font-normal">{cuota.metodo_pago}</span>
                : <span>Pagado</span>
              }
            </div>
            <button
              onClick={() => submit(false)}
              disabled={pending}
              className="text-[10px] text-textmuted hover:text-error border border-border hover:border-error/30 px-2 py-0.5 rounded-lg transition-colors"
            >
              {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Desmarcar'}
            </button>
          </div>
        ) : editing ? (
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
            <button onClick={() => setEditing(false)} className="text-xs text-textmuted hover:text-textprim">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-xs text-textsec hover:text-textprim border border-dashed border-border hover:border-orange/40 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Circle className="w-3.5 h-3.5" />
            Marcar pagado
          </button>
        )}
      </td>
    </tr>
  )
}
