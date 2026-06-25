import { Car, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions/vehicles'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { isAdmin } from '@/lib/auth/roles'
import type { VehicleStatus } from '@/types'

const statusColor: Record<VehicleStatus, 'success' | 'warning' | 'error'> = {
  Disponible: 'success',
  Reservado:  'warning',
  Vendido:    'error',
}

function MiniChart({ sales }: { sales: { fecha_venta: string; precio_final: number }[] }) {
  if (!sales.length) return <p className="text-sm text-textsec text-center py-4">Sin ventas este mes</p>

  // Group by day
  const byDay: Record<string, number> = {}
  sales.forEach(s => {
    const d = s.fecha_venta
    byDay[d] = (byDay[d] || 0) + s.precio_final
  })
  const entries = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))
  const max = Math.max(...entries.map(([, v]) => v))

  return (
    <div className="mt-2">
      <div className="flex items-end gap-1 h-20">
        {entries.map(([day, val]) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full bg-orange/20 hover:bg-orange/50 rounded-sm transition-all duration-200 cursor-default"
              style={{ height: `${(val / max) * 100}%`, minHeight: 4 }}
            />
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-card border border-border px-1.5 py-0.5 rounded
                             opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {formatCurrency(val)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-textsec">{entries[0]?.[0] ? formatDate(entries[0][0]) : ''}</span>
        <span className="text-[10px] text-textsec">{entries[entries.length - 1]?.[0] ? formatDate(entries[entries.length - 1][0]) : ''}</span>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const [{ enStock, ventasMes, gananciaMes, totalClients, sales }, admin] = await Promise.all([
    getDashboardStats(),
    isAdmin(),
  ])
  const lastSales = sales.slice(0, 8)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-textprim">Resumen General</h1>
        <p className="text-sm text-textsec mt-0.5">
          {new Date().toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 gap-4 ${admin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        <StatCard title="Vehículos en stock" value={enStock}       icon={Car}         color="orange" />
        <StatCard title="Ventas del mes"      value={ventasMes}    icon={ShoppingBag}  color="success" />
        {admin && (
          <StatCard title="Ganancia del mes"    value={formatCurrency(gananciaMes)} icon={TrendingUp} color={gananciaMes >= 0 ? 'success' : 'error'} />
        )}
        <StatCard title="Clientes"            value={totalClients} icon={Users}        color="default" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent sales table */}
        <Card className="lg:col-span-3">
          <CardHeader title="Últimas ventas del mes" />
          {lastSales.length === 0 ? (
            <p className="text-sm text-textsec py-8 text-center">Sin ventas este mes</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Vehículo</th>
                    <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Cliente</th>
                    <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Precio</th>
                    {admin && <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Ganancia</th>}
                    <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSales.map((s) => (
                    <tr key={s.id} className="border-b border-border/40 hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-1 text-textprim font-medium">
                        {s.marca} {s.modelo} {s.anio}
                      </td>
                      <td className="py-2.5 px-1 text-textsec">{s.client_nombre}</td>
                      <td className="py-2.5 px-1 text-right text-textprim">{formatCurrency(s.precio_final)}</td>
                      {admin && (
                        <td className={`py-2.5 px-1 text-right font-medium ${s.ganancia >= 0 ? 'text-success' : 'text-error'}`}>
                          {s.ganancia >= 0 ? '+' : ''}{formatCurrency(s.ganancia)}
                        </td>
                      )}
                      <td className="py-2.5 px-1 text-right text-textsec text-xs">{formatDate(s.fecha_venta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Ingresos del mes" />
          <MiniChart sales={sales} />
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-textsec">Total acumulado</p>
            <p className="text-lg font-bold text-textprim mt-0.5">
              {formatCurrency(sales.reduce((a, s) => a + s.precio_final, 0))}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
