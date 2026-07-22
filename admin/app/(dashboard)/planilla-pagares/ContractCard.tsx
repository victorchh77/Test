'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronUp, FileText, Car, ToggleLeft, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toggleParesContract, deleteParesContract } from '@/lib/actions/pares'
import { formatCurrency } from '@/lib/utils/format'
import { Badge } from '@/components/ui/Badge'
import { CuotaRow } from './CuotaRow'
import type { ParesContractWithCuotas } from '@/types'

interface Props {
  contract: ParesContractWithCuotas
  contratoUrl: string | null
  defaultExpanded?: boolean
}

export function ContractCard({ contract, contratoUrl, defaultExpanded = false }: Props) {
  const router = useRouter()
  const [expanded, setExpanded]       = useState(defaultExpanded)
  const [toggling, startToggle]       = useTransition()
  const [deleting, startDelete]       = useTransition()
  const [deleteError, setDeleteError] = useState('')

  function handleToggleActive() {
    startToggle(async () => {
      await toggleParesContract(contract.id, !contract.activo)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar el contrato de "${contract.client_name}"? Se eliminarán también todas sus cuotas. Esta acción no se puede deshacer.`)) return
    setDeleteError('')
    startDelete(async () => {
      const res = await deleteParesContract(contract.id)
      if (res.error) setDeleteError(res.error)
      else router.refresh()
    })
  }

  const { cuotas } = contract
  const total     = cuotas.length
  const pagadas   = cuotas.filter(c => c.pagado).length
  const pendientes = total - pagadas
  const pct       = total > 0 ? Math.round((pagadas / total) * 100) : 0

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const in30  = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const vencidas  = cuotas.filter(c => !c.pagado && c.fecha_vencimiento && c.fecha_vencimiento < today).length
  const proximas  = cuotas.filter(c => !c.pagado && c.fecha_vencimiento && c.fecha_vencimiento >= today && c.fecha_vencimiento <= in30).length
  const montoPendiente = cuotas.filter(c => !c.pagado).reduce((s, c) => s + c.monto, 0)

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden transition-colors ${contract.activo ? 'border-border' : 'border-border/40 opacity-60'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        {/* Avatar inicial */}
        <div className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-orange">
            {contract.client_name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-textprim truncate">{contract.client_name}</p>
            {!contract.activo && <Badge color="default">Inactivo</Badge>}
            {vencidas > 0 && (
              <span className="text-[10px] font-bold text-error bg-error/10 border border-error/20 px-1.5 py-0.5 rounded">
                {vencidas} vencida{vencidas > 1 ? 's' : ''}
              </span>
            )}
            {proximas > 0 && vencidas === 0 && (
              <span className="text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded">
                {proximas} próxima{proximas > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {contract.vehiculo && (
            <div className="flex items-center gap-1 mt-0.5">
              <Car className="w-3 h-3 text-textmuted" />
              <p className="text-xs text-textsec truncate">{contract.vehiculo}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 flex-shrink-0">
          {/* Progress bar */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <p className="text-xs text-textsec">
              <span className="font-bold text-textprim">{pagadas}</span>/{total} pagadas
            </p>
            <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Monto pendiente */}
          {montoPendiente > 0 && (
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-textsec">Pendiente</p>
              <p className="text-sm font-bold text-orange tabular-nums">{formatCurrency(montoPendiente, contract.moneda)}</p>
            </div>
          )}

          {/* Expand icon */}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-textsec flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-textsec flex-shrink-0" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Contract meta */}
          <div className="flex items-center gap-4 px-5 py-3 bg-white/[0.01] border-b border-border flex-wrap text-xs text-textsec gap-y-1">
            {contract.total_precio && (
              <span>Total contrato: <strong className="text-textprim">{formatCurrency(contract.total_precio, contract.moneda)}</strong></span>
            )}
            {contract.entrada && (
              <span>Entrada: <strong className="text-textprim">{formatCurrency(contract.entrada, contract.moneda)}</strong></span>
            )}
            {contratoUrl && (
              <a href={contratoUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-orange hover:underline ml-auto">
                <FileText className="w-3 h-3" /> Ver contrato
              </a>
            )}
            {contract.notas && (
              <span className="text-textmuted italic col-span-full">{contract.notas}</span>
            )}
          </div>

          {/* Cuotas list */}
          {cuotas.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-textsec">
              <p>Este contrato aún no tiene cuotas registradas.</p>
              <p className="text-xs text-textmuted mt-1">Usá el formulario de nuevo pagaré para agregarlas.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {/* Header de columnas */}
              <div className="flex items-center gap-3 px-4 py-2 text-[10px] font-semibold text-textmuted uppercase tracking-wider">
                <span className="w-32 flex-shrink-0">Tipo</span>
                <span className="w-28 flex-shrink-0">Vencimiento</span>
                <span className="w-32 flex-shrink-0">Monto</span>
                <span className="flex-1" />
                <span className="flex-shrink-0">Estado</span>
              </div>
              {cuotas.map(cuota => (
                <CuotaRow key={cuota.id} cuota={cuota} moneda={contract.moneda} />
              ))}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-white/[0.01] flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleToggleActive}
                disabled={toggling}
                className="inline-flex items-center gap-1.5 text-xs text-textmuted hover:text-textsec border border-border hover:border-border-bright px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {toggling
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <ToggleLeft className="w-3.5 h-3.5" />
                }
                {contract.activo ? 'Desactivar contrato' : 'Activar contrato'}
              </button>
              <Link
                href={`/planilla-pagares/${contract.id}/editar`}
                className="inline-flex items-center gap-1.5 text-xs text-textsec hover:text-orange border border-border hover:border-orange/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar contrato
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 text-xs text-textmuted hover:text-error border border-border hover:border-error/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />
                }
                Eliminar contrato
              </button>
            </div>
            {deleteError && <p className="text-xs text-error">{deleteError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
