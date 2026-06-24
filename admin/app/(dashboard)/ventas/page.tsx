import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getSales } from '@/lib/actions/sales'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { SalesFiltersClient } from './SalesFiltersClient'

export default async function VentasPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string }
}) {
  const sales = await getSales(searchParams.from, searchParams.to)

  const totalIngresos  = sales.reduce((a, s) => a + s.precio_final, 0)
  const totalGanancias = sales.reduce((a, s) => a + (s.ganancia ?? 0), 0)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textprim">Ventas</h1>
          <p className="text-sm text-textsec">
            {sales.length} ventas · Ingresos: {formatCurrency(totalIngresos)} ·
            Ganancia: <span className={totalGanancias >= 0 ? 'text-success' : 'text-error'}>{formatCurrency(totalGanancias)}</span>
          </p>
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
              <tr className="border-b border-border">
                {['Vehículo', 'Cliente', 'Vendedor', 'P. Compra', 'P. Venta', 'Ganancia', 'Fecha'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-textsec uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-textsec">Sin ventas en el período</td>
                </tr>
              ) : sales.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-textprim">{s.marca} {s.modelo}</p>
                    <p className="text-xs text-textsec">{s.anio}</p>
                  </td>
                  <td className="py-3 px-4 text-textsec">{s.client_nombre}</td>
                  <td className="py-3 px-4 text-textsec text-xs">{s.vendedor_nombre ?? '—'}</td>
                  <td className="py-3 px-4 text-textsec">{formatCurrency(s.precio_compra)}</td>
                  <td className="py-3 px-4 font-medium text-textprim">{formatCurrency(s.precio_final)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold text-sm ${(s.ganancia ?? 0) >= 0 ? 'text-success' : 'text-error'}`}>
                      {(s.ganancia ?? 0) >= 0 ? '+' : ''}{formatCurrency(s.ganancia ?? 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-textsec text-xs">{formatDate(s.fecha_venta)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
