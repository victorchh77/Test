import { Car, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions/vehicles'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StaggerContainer, StaggerItem } from '@/components/ui/Motion'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { isAdmin } from '@/lib/auth/roles'
import type { VehicleStatus } from '@/types'

const statusColor: Record<VehicleStatus, 'success' | 'warning' | 'error'> = {
  Disponible: 'success',
  Reservado:  'warning',
  Vendido:    'error',
}

function MiniChart({ sales }: { sales: { fecha_venta: string; precio_final: number }[] }) {
  if (!sales.length) {
    return (
      <p className="text-sm text-textsec text-center py-8 italic">
        Sin ventas este mes
      </p>
    )
  }

  const byDay: Record<string, number> = {}
  sales.forEach(s => { byDay[s.fecha_venta] = (byDay[s.fecha_venta] || 0) + s.precio_final })
  const entries = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))
  const max = Math.max(...entries.map(([, v]) => v))

  return (
    <div className="mt-1">
      <div className="flex items-end gap-1.5 h-24">
        {entries.map(([day, val], i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t-sm transition-all duration-300 cursor-default
                         group-hover:brightness-125"
              style={{
                height: `${Math.max((val / max) * 100, 6)}%`,
                background: `linear-gradient(to top, rgba(255,140,0,0.25), rgba(255,140,0,${0.4 + (i % 2) * 0.1}))`,
                borderTop: '1.5px solid rgba(255,140,0,0.5)',
              }}
            />
            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] bg-card-elevated border border-border
                             px-1.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-card">
              {formatCurrency(val)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-textmuted">
          {entries[0]?.[0] ? formatDate(entries[0][0]) : ''}
        </span>
        <span className="text-[10px] text-textmuted">
          {entries[entries.length - 1]?.[0] ? formatDate(entries[entries.length - 1][0]) : ''}
        </span>
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
  const totalIngresos = sales.reduce((a, s) => a + s.precio_final, 0)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">
            Resumen General
          </h1>
          <p className="text-sm text-textsec mt-1 capitalize">
            {new Date().toLocaleDateString('es-PY', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        {/* Month badge */}
        <div className="hidden sm:flex items-center gap-2 bg-orange/10 border border-orange/20
                        rounded-xl px-3 py-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
          <span className="text-xs text-orange font-semibold">
            {new Date().toLocaleDateString('es-PY', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <StaggerContainer className={`grid grid-cols-2 gap-4 ${admin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        <StaggerItem>
          <StatCard title="Vehículos en stock" value={enStock} icon={Car} color="orange" />
        </StaggerItem>
        <StaggerItem>
          <StatCard title="Ventas del mes" value={ventasMes} icon={ShoppingBag} color="success" />
        </StaggerItem>
        {admin && (
          <StaggerItem>
            <StatCard
              title="Ganancia del mes"
              value={formatCurrency(gananciaMes)}
              icon={TrendingUp}
              color={gananciaMes >= 0 ? 'success' : 'error'}
            />
          </StaggerItem>
        )}
        <StaggerItem>
          <StatCard title="Clientes totales" value={totalClients} icon={Users} color="default" />
        </StaggerItem>
      </StaggerContainer>

      {/* Content row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent sales */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Últimas ventas"
            subtitle={`${lastSales.length} ventas este mes`}
          />
          {lastSales.length === 0 ? (
            <p className="text-sm text-textsec py-10 text-center">Sin ventas este mes</p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin -mx-5 px-5">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr>
                    <th className="table-header-cell">Vehículo</th>
                    <th className="table-header-cell">Cliente</th>
                    <th className="table-header-cell text-right">Precio</th>
                    {admin && <th className="table-header-cell text-right">Ganancia</th>}
                    <th className="table-header-cell text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSales.map((s) => (
                    <tr key={s.id} className="table-row-hover">
                      <td className="table-cell font-semibold text-textprim">
                        {s.marca} {s.modelo} {s.anio}
                      </td>
                      <td className="table-cell text-textsec">{s.client_nombre}</td>
                      <td className="table-cell text-right font-medium text-textprim">
                        {formatCurrency(s.precio_final)}
                      </td>
                      {admin && (
                        <td className={`table-cell text-right font-semibold ${s.ganancia >= 0 ? 'text-success' : 'text-error'}`}>
                          {s.ganancia >= 0 ? '+' : ''}{formatCurrency(s.ganancia)}
                        </td>
                      )}
                      <td className="table-cell text-right text-textsec text-xs whitespace-nowrap">
                        {formatDate(s.fecha_venta)}
                      </td>
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
          <div className="mt-5 pt-4 border-t border-border">
            <p className="section-label mb-1">Total acumulado</p>
            <p className="font-display text-2xl font-bold text-orange">
              {formatCurrency(totalIngresos)}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
