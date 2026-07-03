import Link from 'next/link'
import { Plus, FileText, AlertCircle, Clock, DollarSign, CheckCircle } from 'lucide-react'
import { getParesContractsWithCuotas, getContratoSignedUrls } from '@/lib/actions/pares'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/utils/format'
import { ContractCard } from './ContractCard'

export default async function PlanillaPagaresPage({
  searchParams,
}: {
  searchParams: { ver?: string }
}) {
  const contracts = await getParesContractsWithCuotas()

  const today = new Date().toISOString().split('T')[0]
  const in30  = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Signed URLs para contratos con archivos
  const filePaths = contracts
    .map(c => c.contract_file_url)
    .filter((u): u is string => !!u && !u.startsWith('http'))
  const signedUrls = await getContratoSignedUrls(filePaths)
  const contratoHref = (u: string | null) =>
    !u ? null : u.startsWith('http') ? u : (signedUrls[u] ?? null)

  // Métricas globales de cuotas
  const allCuotas = contracts.flatMap(c => c.cuotas)
  const vencidasCount  = allCuotas.filter(c => !c.pagado && c.fecha_vencimiento && c.fecha_vencimiento < today).length
  const proximasCount  = allCuotas.filter(c => !c.pagado && c.fecha_vencimiento && c.fecha_vencimiento >= today && c.fecha_vencimiento <= in30).length
  const pendienteTotal = allCuotas.filter(c => !c.pagado).reduce((s, c) => s + c.monto, 0)
  const cobradoTotal   = allCuotas.filter(c => c.pagado).reduce((s, c) => s + c.monto, 0)

  const verTodos = searchParams.ver === 'todos'
  const visibleContracts = verTodos
    ? contracts
    : contracts.filter(c => c.activo)

  const activeCount = contracts.filter(c => c.activo).length

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Planilla de Pagarés</h1>
          <p className="text-sm text-textsec mt-0.5">{activeCount} contrato{activeCount !== 1 ? 's' : ''} activo{activeCount !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/planilla-pagares/nueva">
          <Button><Plus className="w-4 h-4" />Agregar pagaré</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total cobrado"   value={formatCurrency(cobradoTotal)}   icon={CheckCircle}   color="success" />
        <StatCard title="Monto pendiente" value={formatCurrency(pendienteTotal)} icon={DollarSign}    color="orange"  />
        <StatCard title="Próximas 30 días" value={proximasCount}                 icon={Clock}         color="default" />
        <StatCard title="Cuotas vencidas" value={vencidasCount}                  icon={AlertCircle}   color={vencidasCount > 0 ? 'error' : 'default'} />
      </div>

      {/* Filtro */}
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-3">
        <p className="text-sm text-textsec">
          Mostrando <strong className="text-textprim">{visibleContracts.length}</strong> contrato{visibleContracts.length !== 1 ? 's' : ''}
          {!verTodos && ` · solo activos`}
        </p>
        <Link
          href={`/planilla-pagares?ver=${verTodos ? 'activos' : 'todos'}`}
          className="text-xs text-textsec hover:text-textprim border border-border hover:border-border-bright px-3 py-1.5 rounded-lg transition-colors"
        >
          {verTodos ? 'Ocultar inactivos' : 'Ver todos'}
        </Link>
      </div>

      {/* Alerta de vencidas */}
      {vencidasCount > 0 && (
        <div className="flex items-center gap-3 bg-error/8 border border-error/20 rounded-2xl px-5 py-3">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-sm text-error">
            <strong>{vencidasCount}</strong> cuota{vencidasCount > 1 ? 's' : ''} vencida{vencidasCount > 1 ? 's' : ''} sin cobrar.
            Revisá los contratos marcados en rojo.
          </p>
        </div>
      )}

      {/* Contracts list */}
      {visibleContracts.length === 0 ? (
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
          {visibleContracts.map(contract => (
            <ContractCard
              key={contract.id}
              contract={contract}
              contratoUrl={contratoHref(contract.contract_file_url)}
              defaultExpanded={visibleContracts.length === 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
