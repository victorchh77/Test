'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Loader2, CalendarX } from 'lucide-react'
import { toggleCuotaPagada } from '@/lib/actions/pares'
import { formatCurrency } from '@/lib/utils/format'
import type { ParesCuota } from '@/types'

interface Props {
  cuota: ParesCuota
  moneda: 'Gs' | 'USD'
}

function formatFecha(iso: string | null): string {
  if (!iso) return 'A convenir'
  const [y, m, d] = iso.split('-').map(Number)
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d} ${meses[m - 1]} ${y}`
}

function isVencida(iso: string | null): boolean {
  if (!iso) return false
  return new Date(iso + 'T00:00:00') < new Date(new Date().toDateString())
}

export function CuotaRow({ cuota, moneda }: Props) {
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

  const vencida = !cuota.pagado && isVencida(cuota.fecha_vencimiento)
  const tipoBadge = cuota.tipo === 'refuerzo'
    ? 'bg-warning/10 text-warning border-warning/25'
    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'

  return (
    <div className={`flex items-center gap-3 py-2.5 px-4 rounded-xl transition-colors ${cuota.pagado ? 'opacity-60' : 'hover:bg-white/[0.02]'}`}>
      {/* Tipo + número */}
      <div className="flex items-center gap-2 w-32 flex-shrink-0">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tipoBadge}`}>
          {cuota.tipo === 'refuerzo' ? 'REFUERZO' : 'CUOTA'}
        </span>
        <span className="text-xs text-textmuted font-mono">#{cuota.numero}</span>
      </div>

      {/* Fecha */}
      <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
        {vencida && <CalendarX className="w-3 h-3 text-error flex-shrink-0" />}
        <span className={`text-xs ${vencida ? 'text-error font-semibold' : cuota.fecha_vencimiento ? 'text-textsec' : 'text-textmuted italic'}`}>
          {formatFecha(cuota.fecha_vencimiento)}
        </span>
      </div>

      {/* Monto */}
      <span className="text-sm font-bold text-orange tabular-nums w-32 flex-shrink-0">
        {formatCurrency(cuota.monto, moneda)}
      </span>

      {/* Notas */}
      {cuota.notas && (
        <span className="text-xs text-textmuted truncate flex-1 min-w-0">{cuota.notas}</span>
      )}
      {!cuota.notas && <span className="flex-1" />}

      {/* Estado / acción */}
      <div className="flex-shrink-0">
        {cuota.pagado ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-success text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              {cuota.metodo_pago ? (
                <span className="text-textsec font-normal">{cuota.metodo_pago}</span>
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
        ) : editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={metodo}
              onChange={e => setMetodo(e.target.value)}
              placeholder="Método de pago..."
              className="text-xs bg-card-elevated border border-border-bright rounded-lg px-2.5 py-1.5 text-textprim placeholder:text-textmuted focus:outline-none focus:border-orange/60 w-32"
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
      </div>
    </div>
  )
}
