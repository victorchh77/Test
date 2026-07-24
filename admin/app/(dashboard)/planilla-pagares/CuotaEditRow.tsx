'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { updateCuota, deleteCuota } from '@/lib/actions/pares'
import type { ParesCuota } from '@/types'

interface Props {
  cuota: ParesCuota
  moneda: 'Gs' | 'USD'
}

export function CuotaEditRow({ cuota, moneda }: Props) {
  const router = useRouter()
  const [monto, setMonto] = useState(String(cuota.monto))
  const [fecha, setFecha] = useState(cuota.fecha_vencimiento ?? '')
  const [notas, setNotas] = useState(cuota.notas ?? '')
  const [saving, startSaving] = useTransition()
  const [deleting, startDeleting] = useTransition()
  const [error, setError] = useState('')

  const dirty = monto !== String(cuota.monto) || fecha !== (cuota.fecha_vencimiento ?? '') || notas !== (cuota.notas ?? '')

  function handleSave() {
    const montoNum = parseInt(monto, 10)
    if (!montoNum || montoNum <= 0) { setError('Monto inválido'); return }
    setError('')
    startSaving(async () => {
      const res = await updateCuota(cuota.id, {
        tipo: cuota.tipo,
        numero: cuota.numero,
        monto: montoNum,
        fecha_vencimiento: fecha || null,
        notas: notas.trim() || null,
      })
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar esta ${cuota.tipo === 'refuerzo' ? 'refuerzo' : 'cuota'} #${cuota.numero}? Esta acción no se puede deshacer.`)) return
    setError('')
    startDeleting(async () => {
      const res = await deleteCuota(cuota.id)
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  const tipoBadge = cuota.tipo === 'refuerzo'
    ? 'bg-warning/10 text-warning border-warning/25'
    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'

  return (
    <div className="flex flex-col gap-1.5 py-2.5 px-4 rounded-xl hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${tipoBadge}`}>
          {cuota.tipo === 'refuerzo' ? 'REFUERZO' : 'CUOTA'}
        </span>
        <span className="text-xs text-textmuted font-mono flex-shrink-0">#{cuota.numero}</span>
        {cuota.pagado && (
          <span className="text-[10px] font-semibold text-success bg-success/10 border border-success/25 px-1.5 py-0.5 rounded flex-shrink-0">
            Pagada
          </span>
        )}

        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="text-xs bg-card-elevated border border-border rounded-lg px-2.5 py-1.5 text-textprim focus:outline-none focus:border-orange/60 w-[150px] flex-shrink-0"
        />

        <div className="relative flex-shrink-0 w-[150px]">
          <input
            type="number"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            min="1"
            className="text-xs bg-card-elevated border border-border rounded-lg pl-2.5 pr-10 py-1.5 text-textprim placeholder:text-textmuted focus:outline-none focus:border-orange/60 w-full tabular-nums"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-textmuted pointer-events-none">{moneda}</span>
        </div>

        <input
          type="text"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Notas..."
          className="text-xs bg-card-elevated border border-border rounded-lg px-2.5 py-1.5 text-textprim placeholder:text-textmuted focus:outline-none focus:border-orange/60 flex-1 min-w-[120px]"
        />

        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-1 text-xs text-success border border-success/30 hover:bg-success/10 px-2.5 py-1.5 rounded-lg transition-colors font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-textmuted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40 flex-shrink-0"
          title="Eliminar cuota"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
