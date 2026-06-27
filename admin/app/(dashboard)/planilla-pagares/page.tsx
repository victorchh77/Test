import Link from 'next/link'
import { Plus, FileText, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react'
import { getParesContracts, getParesPaymentsForMonth, toggleParesContract } from '@/lib/actions/pares'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/utils/format'
import { PagoRow } from './PagoRow'
import { MonthNav } from './MonthNav'
import type { ParesContract, ParesPayment } from '@/types'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default async function PlanillaPagaresPage({
  searchParams,
}: {
  searchParams: { mes?: string; anio?: string; ver?: string }
}) {
  const now  = new Date()
  const mes  = Math.max(1, Math.min(12, parseInt(searchParams.mes  ?? '') || now.getMonth() + 1))
  const anio = parseInt(searchParams.anio ?? '') || now.getFullYear()
  const verTodos = searchParams.ver === 'todos'

  const [contracts, payments] = await Promise.all([
    getParesContracts(),
    getParesPaymentsForMonth(anio, mes),
  ])

  const activeContracts = verTodos ? contracts : contracts.filter(c => c.activo)
  const paymentMap = new Map<string, ParesPayment>(payments.map(p => [p.contract_id, p]))

  const pagados    = activeContracts.filter(c => paymentMap.get(c.id)?.pagado).length
  const pendientes = activeContracts.filter(c => !paymentMap.get(c.id)?.pagado).length
  const totalMes   = activeContracts.reduce((s, c) => s + c.monto_mensual, 0)
  const cobradoMes = activeContracts
    .filter(c => paymentMap.get(c.id)?.pagado)
    .reduce((s, c) => s + c.monto_mensual, 0)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Planilla de Pagarés</h1>
          <p className="text-sm text-textsec mt-0.5">{contracts.filter(c => c.activo).length} contratos activos</p>
        </div>
        <Link href="/planilla-pagares/nueva">
          <Button><Plus className="w-4 h-4" />Agregar pagaré</Button>
        </Link>
      </div>

      {/* Month nav */}
      <div className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
        <MonthNav anio={anio} mes={mes} />
        <Link
          href={`/planilla-pagares?mes=${mes}&anio=${anio}&ver=${verTodos ? 'activos' : 'todos'}`}
          className="text-xs text-textsec hover:text-textprim border border-border hover:border-border-bright px-3 py-1.5 rounded-lg transition-colors"
        >
          {verTodos ? 'Ver solo activos' : 'Ver todos'}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total a cobrar" value={formatCurrency(totalMes)}   icon={DollarSign}  color="orange"  />
        <StatCard title="Cobrado"        value={formatCurrency(cobradoMes)} icon={TrendingUp}  color="success" />
        <StatCard title="Pagaron"        value={pagados}                    icon={CheckCircle} color="success" />
        <StatCard title="Pendientes"     value={pendientes}                 icon={Clock}       color="default" />
      </div>

      {/* Contract table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange/10 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-orange" />
          </div>
          <h2 className="font-display text-sm font-semibold text-textprim">
            {MESES[mes - 1]} {anio}
          </h2>
        </div>

        {activeContracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Sin contratos"
            description="No hay pagarés registrados. Agregá el primero."
            action={{ label: 'Agregar pagaré', href: '/planilla-pagares/nueva' }}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Cliente', 'Día de pago', 'Monto mensual', 'Estado', 'Pago del mes', 'Contrato', ''].map((h, i) => (
                    <th key={i} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeContracts
                  .sort((a, b) => a.dia_pago - b.dia_pago)
                  .map((c: ParesContract) => {
                    const payment = paymentMap.get(c.id) ?? null
                    const pagado  = payment?.pagado ?? false
                    return (
                      <tr key={c.id} className={`table-row-hover ${!c.activo ? 'opacity-50' : ''}`}>
                        <td className="table-cell">
                          <p className="font-semibold text-textprim">{c.client_name}</p>
                          {c.notas && <p className="text-xs text-textsec truncate max-w-[160px]">{c.notas}</p>}
                        </td>
                        <td className="table-cell text-textsec text-center">
                          <span className="font-bold text-textprim">{c.dia_pago}</span>
                          <span className="text-xs text-textsec"> de cada mes</span>
                        </td>
                        <td className="table-cell font-bold text-orange">{formatCurrency(c.monto_mensual)}</td>
                        <td className="table-cell">
                          <Badge color={c.activo ? 'success' : 'default'} dot>
                            {c.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="table-cell">
                          <PagoRow contractId={c.id} anio={anio} mes={mes} payment={payment} />
                        </td>
                        <td className="table-cell">
                          {c.contract_file_url ? (
                            <a
                              href={c.contract_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange hover:underline"
                            >
                              Ver PDF
                            </a>
                          ) : (
                            <span className="text-textmuted text-xs">—</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <form action={async () => {
                            'use server'
                            await toggleParesContract(c.id, !c.activo)
                          }}>
                            <button type="submit"
                              className="text-[10px] text-textmuted hover:text-textsec border border-border hover:border-border-bright px-2 py-0.5 rounded-lg transition-colors">
                              {c.activo ? 'Desactivar' : 'Activar'}
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
