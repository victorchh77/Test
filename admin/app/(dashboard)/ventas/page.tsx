import Link from 'next/link'
import { Plus, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react'
import { getSales } from '@/lib/actions/sales'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { isAdmin } from '@/lib/auth/roles'
import { SalesFiltersClient } from './SalesFiltersClient'

export default async function VentasPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string }
}) {
  const [sales, admin] = await Promise.all([
    getSales(searchParams.from, searchParams.to),
    isAdmin(),
  ])

  const totalIngresos  = sales.reduce((a, s) => a + s.precio_final, 0)
  const totalGanancias = sales.reduce((a, s) => a + (s.ganancia ?? 0), 0)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Ventas</h1>
          <p className="text-sm text-textsec mt-0.5">Historial de vehículos vendidos</p>
        </div>
        <Link href="/ventas/nueva">
          <Button><Plus className="w-4 h-4" />Registrar venta</Button>
        </Link>
      </div>

      <div className={`grid gap-4 ${admin ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <StatCard title="Ventas" value={sales.length} icon={ShoppingBag} color="orange" />
        <StatCard title="Ingresos" value={formatCurrency(totalIngresos)} icon={TrendingUp} color="success" />
        {admin && (
          <StatCard
            title="Ganancia"
            value={formatCurrency(totalGanancias)}
            icon={DollarSign}
            color={totalGanancias >= 0 ? 'success' : 'error'}
          />
        )}
      </div>

      <SalesFiltersClient current={searchParams} />

      {sales.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Sin ventas"
          description="No hay ventas registradas en el período seleccionado."
          action={{ label: 'Registrar venta', href: '/ventas/nueva' }}
        />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Vehículo', 'Cliente', 'Vendedor', ...(admin ? ['P. Compra'] : []), 'P. Venta', ...(admin ? ['Ganancia'] : []), 'Fecha'].map(h => (
                    <th key={h} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id} className="table-row-hover">
                    <td className="table-cell">
                      <p className="font-semibold text-textprim">{s.marca} {s.modelo}</p>
                      <p className="text-xs text-textsec">{s.anio}</p>
                    </td>
                    <td className="table-cell text-textsec">{s.client_nombre}</td>
                    <td className="table-cell text-textsec text-xs">{s.vendedor_nombre ?? '—'}</td>
                    {admin && <td className="table-cell text-textsec">{formatCurrency(s.precio_compra)}</td>}
                    <td className="table-cell font-semibold text-textprim">{formatCurrency(s.precio_final)}</td>
                    {admin && (
                      <td className="table-cell">
                        <span className={`font-bold ${(s.ganancia ?? 0) >= 0 ? 'text-success' : 'text-error'}`}>
                          {(s.ganancia ?? 0) >= 0 ? '+' : ''}{formatCurrency(s.ganancia ?? 0)}
                        </span>
                      </td>
                    )}
                    <td className="table-cell text-textsec text-xs whitespace-nowrap">
                      {formatDate(s.fecha_venta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
