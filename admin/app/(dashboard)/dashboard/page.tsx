import { Car, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions/vehicles'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/Motion'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { isAdmin } from '@/lib/auth/roles'
import type { VehicleStatus } from '@/types'

const statusColor: Record<VehicleStatus, 'success' | 'warning' | 'error'> = {
  Disponible: 'success',
  Reservado:  'warning',
  Vendido:    'error',
}

function AreaChart({ sales }: { sales: { fecha_venta: string; precio_final: number }[] }) {
  if (!sales.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <TrendingUp className="w-8 h-8 text-textsec/30" />
        <p className="text-sm text-textsec italic">Sin ventas este mes</p>
      </div>
    )
  }

  const byDay: Record<string, number> = {}
  sales.forEach(s => { byDay[s.fecha_venta] = (byDay[s.fecha_venta] || 0) + s.precio_final })
  const entries = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))
  const max = Math.max(...entries.map(([, v]) => v))
  const W = 100
  const H = 80
  const pad = 2

  const points = entries.map(([, v], i) => {
    const x = pad + (i / Math.max(entries.length - 1, 1)) * (W - pad * 2)
    const y = H - pad - ((v / max) * (H - pad * 2 - 12))
    return { x, y, v }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`

  return (
    <div className="mt-1 select-none">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FF8C00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.01" />
          </linearGradient>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#FF8C00"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineGlow)"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} className="group">
            <circle cx={p.x} cy={p.y} r="5" fill="transparent" />
            <circle
              cx={p.x} cy={p.y} r="2.5"
              fill="#FF8C00"
              stroke="rgba(255,140,0,0.5)"
              strokeWidth="4"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </g>
        ))}
      </svg>

      {/* Date labels */}
      <div className="flex justify-between mt-1">
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
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <FadeIn>
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
          <div className="hidden sm:flex items-center gap-2 bg-orange/10 border border-orange/25
                          rounded-xl px-3 py-1.5 flex-shrink-0 shadow-orange-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            <span className="text-xs text-orange font-semibold">
              {new Date().toLocaleDateString('es-PY', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </FadeIn>

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
      <FadeIn delay={0.15} className="grid lg:grid-cols-5 gap-4">
        {/* Recent sales */}
        <Card className="lg:col-span-3" shimmer>
          <CardHeader
            title="Últimas ventas"
            subtitle={`${lastSales.length} transacciones este mes`}
          />
          {lastSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <ShoppingBag className="w-8 h-8 text-textsec/30" />
              <p className="text-sm text-textsec">Sin ventas este mes</p>
            </div>
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
                    <tr key={s.id} className="table-row-hover group">
                      <td className="table-cell font-semibold text-textprim">
                        <span className="group-hover:text-orange transition-colors duration-150">
                          {s.marca} {s.modelo} {s.anio}
                        </span>
                      </td>
                      <td className="table-cell text-textsec">{s.client_nombre}</td>
                      <td className="table-cell text-right font-semibold text-textprim tabular">
                        {formatCurrency(s.precio_final, s.moneda)}
                      </td>
                      {admin && (
                        <td className={`table-cell text-right font-bold tabular ${s.ganancia >= 0 ? 'text-success' : 'text-error'}`}>
                          {s.ganancia >= 0 ? '+' : ''}{formatCurrency(s.ganancia, s.moneda)}
                        </td>
                      )}
                      <td className="table-cell text-right text-textsec text-xs whitespace-nowrap tabular">
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
        <Card className="lg:col-span-2" glow shimmer>
          <CardHeader title="Ingresos del mes" />
          <AreaChart sales={sales} />
          <div className="mt-5 pt-4 border-t border-border/60">
            <p className="section-label mb-1.5">Total acumulado</p>
            <p className="font-display text-2xl font-bold text-orange glow-text-orange tabular">
              {formatCurrency(totalIngresos)}
            </p>
          </div>
        </Card>
      </FadeIn>
    </div>
  )
}
