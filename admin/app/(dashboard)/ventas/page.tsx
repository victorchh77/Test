import Link from 'next/link'
import { Plus, TrendingUp } from 'lucide-react'
import { getSales } from '@/lib/actions/sales'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
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
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-sm text-textsec">{sales.length} venta{sales.length !== 1 ? 's' : ''}</span>
            <span className="text-textmuted">·</span>
            <span className="text-sm text-textsec">Ingresos: <span className="text-textprim font-medium">{formatCurrency(totalIngresos)}</span></span>
            {admin && (
              <>
                <span className="text-textmuted">·</span>
                <span className="text-sm text-textsec">
                  Ganancia:{' '}
                  <span className={`font-semibold ${totalGanancias >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatCurrency(totalGanancias)}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
        <Link href="/ventas/nueva">
          <Button><Plus className="w-4 h-4" />Registrar venta</Button>
        </Link>
      </div>

      <SalesFiltersClient current={searchParams} />

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
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={admin ? 7 : 5} className="py-16 text-center text-textsec">
                    Sin ventas en el período seleccionado
                  </td>
                </tr>
              ) : sales.map(s => (
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
    </div>
  )
}
