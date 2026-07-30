import Link from 'next/link'
import {
  Plus, FileText, AlertCircle, Clock, DollarSign,
  CheckCircle, TrendingUp, LayoutList,
} from 'lucide-react'
import { getParesContractsWithCuotas, getContratoSignedUrls } from '@/lib/actions/pares'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/utils/format'
import { ContractCard } from './ContractCard'
import { MesCuotaRow } from './MesCuotaRow'
import { MonthNav } from './MonthNav'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
               'Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default async function PlanillaPagaresPage({
  searchParams,
}: {
  searchParams: { mes?: string; anio?: string; ver?: string }
}) {
  const now  = new Date()
  const mes  = Math.max(1, Math.min(12, parseInt(searchParams.mes  ?? '') || now.getMonth() + 1))
  const anio = parseInt(searchParams.anio ?? '') || now.getFullYear()
  const ver  = searchParams.ver ?? 'mes'   // 'mes' | 'contratos'

  const contracts = await getParesContractsWithCuotas()
  const activeContracts = contracts.filter(c => c.activo)

  // ── Cuotas del mes seleccionado (solo contratos activos) ──────────────
  const mesStr = `${anio}-${String(mes).padStart(2, '0')}`
  const cuotasDelMes = activeContracts.flatMap(c =>
    c.cuotas
      .filter(q => q.fecha_vencimiento?.startsWith(mesStr))
      .map(q => ({ cuota: q, contract: c }))
  ).sort((a, b) => {
    const da = a.cuota.fecha_vencimiento ?? '9999-99-99'
    const db = b.cuota.fecha_vencimiento ?? '9999-99-99'
    return da < db ? -1 : da > db ? 1 : 0
  })

  // Cuotas "a convenir" de contratos activos (sin fecha)
  const cuotasAConvenir = activeContracts.flatMap(c =>
    c.cuotas
      .filter(q => !q.fecha_vencimiento && !q.pagado)
      .map(q => ({ cuota: q, contract: c }))
  )

  // Signed URLs
  const filePaths = contracts
    .map(c => c.contract_file_url)
    .filter((u): u is string => !!u && !u.startsWith('http'))
  const signedUrls = await getContratoSignedUrls(filePaths)
  const contratoHref = (u: string | null) =>
    !u ? null : u.startsWith('http') ? u : (signedUrls[u] ?? null)

  // ── Stats del mes ──────────────────────────────────────────────────────
  const totalMes    = cuotasDelMes.reduce((s, r) => s + r.cuota.monto, 0)
  const cobradoMes  = cuotasDelMes.filter(r => r.cuota.pagado).reduce((s, r) => s + r.cuota.monto, 0)
  const pagadasMes  = cuotasDelMes.filter(r => r.cuota.pagado).length
  const pendientesMes = cuotasDelMes.filter(r => !r.cuota.pagado).length

  // Métricas globales (para el view de contratos)
  const allCuotas      = contracts.flatMap(c => c.cuotas)
  const today          = now.toISOString().split('T')[0]
  const vencidasTotal  = allCuotas.filter(c => !c.pagado && c.fecha_vencimiento && c.fecha_vencimiento < today).length

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">
            Planilla de Pagarés
          </h1>
          <p className="text-sm text-textsec mt-0.5">
            {activeContracts.length} contrato{activeContracts.length !== 1 ? 's' : ''} activo{activeContracts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/planilla-pagares/nueva">
          <Button><Plus className="w-4 h-4" />Agregar pagaré</Button>
        </Link>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
        <Link
          href={`/planilla-pagares?ver=mes&mes=${mes}&anio=${anio}`}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            ver === 'mes'
              ? 'bg-orange text-white shadow-sm'
              : 'text-textsec hover:text-textprim'
          }`}
        >
          <LayoutList className="w-3.5 h-3.5" />
          Lista del mes
        </Link>
        <Link
          href="/planilla-pagares?ver=contratos"
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            ver === 'contratos'
              ? 'bg-orange text-white shadow-sm'
              : 'text-textsec hover:text-textprim'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Todos los contratos
        </Link>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          VIEW: Lista del mes
          ════════════════════════════════════════════════════════════════ */}
      {ver === 'mes' && (
        <>
          {/* Month nav */}
          <div className="bg-card border border-border rounded-2xl px-5 py-3">
            <MonthNav anio={anio} mes={mes} />
          </div>

          {/* Stats del mes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Total del mes"  value={formatCurrency(totalMes)}   icon={DollarSign} color="orange"  />
            <StatCard title="Cobrado"        value={formatCurrency(cobradoMes)} icon={TrendingUp} color="success" />
            <StatCard title="Pagaron"        value={pagadasMes}                 icon={CheckCircle} color="success" />
            <StatCard title="Pendientes"     value={pendientesMes}              icon={Clock}       color="default" />
          </div>

          {/* Alerta vencidas globales */}
          {vencidasTotal > 0 && (
            <div className="flex items-center gap-3 bg-error/8 border border-error/20 rounded-2xl px-5 py-3">
              <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
              <p className="text-sm text-error">
                <strong>{vencidasTotal}</strong> cuota{vencidasTotal > 1 ? 's' : ''} de meses anteriores sin cobrar.{' '}
                <Link href="/planilla-pagares?ver=contratos" className="underline hover:no-underline">
                  Ver contratos
                </Link>
              </p>
            </div>
          )}

          {/* Tabla del mes */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange/10 flex items-center justify-center">
                <LayoutList className="w-3.5 h-3.5 text-orange" />
              </div>
              <h2 className="font-display text-sm font-semibold text-textprim">
                {MESES[mes - 1]} {anio}
              </h2>
              <span className="text-xs text-textsec ml-auto">
                {cuotasDelMes.length} cuota{cuotasDelMes.length !== 1 ? 's' : ''}
              </span>
            </div>

            {cuotasDelMes.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Sin cuotas este mes"
                description="No hay cuotas con vencimiento en este mes."
              />
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {['Cliente', 'Tipo', 'Día', 'Monto', 'Estado / Pago', 'Notas'].map((h, i) => (
                        <th key={i} className="table-header-cell">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cuotasDelMes.map(({ cuota, contract }) => (
                      <MesCuotaRow
                        key={cuota.id}
                        cuota={cuota}
                        clientName={contract.client_name}
                        vehiculo={contract.vehiculo ?? null}
                        moneda={contract.moneda}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Cuotas "a convenir" */}
          {cuotasAConvenir.length > 0 && (
            <Card padding={false}>
              <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-textmuted/10 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-textmuted" />
                </div>
                <h2 className="font-display text-sm font-semibold text-textprim">A convenir</h2>
                <span className="text-xs text-textsec ml-auto">{cuotasAConvenir.length} pendiente{cuotasAConvenir.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {['Cliente', 'Tipo', 'Día', 'Monto', 'Estado / Pago', 'Notas'].map((h, i) => (
                        <th key={i} className="table-header-cell">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cuotasAConvenir.map(({ cuota, contract }) => (
                      <MesCuotaRow
                        key={cuota.id}
                        cuota={cuota}
                        clientName={contract.client_name}
                        vehiculo={contract.vehiculo ?? null}
                        moneda={contract.moneda}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VIEW: Todos los contratos (acordeón)
          ════════════════════════════════════════════════════════════════ */}
      {ver === 'contratos' && (
        <>
          {/* Stats globales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Cobrado total"
              value={formatCurrency(allCuotas.filter(c => c.pagado).reduce((s, c) => s + c.monto, 0))}
              icon={TrendingUp} color="success"
            />
            <StatCard
              title="Pendiente total"
              value={formatCurrency(allCuotas.filter(c => !c.pagado).reduce((s, c) => s + c.monto, 0))}
              icon={DollarSign} color="orange"
            />
            <StatCard
              title="Contratos activos"
              value={activeContracts.length}
              icon={FileText} color="default"
            />
            <StatCard
              title="Cuotas vencidas"
              value={vencidasTotal}
              icon={AlertCircle}
              color={vencidasTotal > 0 ? 'error' : 'default'}
            />
          </div>

          {contracts.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl">
              <EmptyState
                icon={FileText}
                title="Sin contratos"
                description="No hay pagarés registrados. Agregá el primero."
                action={{ label: 'Agregar pagaré', href: '/planilla-pagares/nueva' }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {contracts.map(contract => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  contratoUrl={contratoHref(contract.contract_file_url)}
                  defaultExpanded={contracts.length === 1}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
