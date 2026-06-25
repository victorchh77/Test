import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, TrendingUp } from 'lucide-react'
import { getVehicle, getVehicleExpenses, getVehiclePriceHistory, getVehiclePhotos } from '@/lib/actions/vehicles'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatCurrency, formatKm, formatDate, formatDatetime, calcRentabilidad } from '@/lib/utils/format'
import { EXPENSE_TYPES } from '@/lib/utils/constants'
import { AddExpenseModal } from './AddExpenseModal'
import { DeleteVehicleBtn } from './DeleteVehicleBtn'
import { PhotoSection } from './PhotoSection'
import { isAdmin } from '@/lib/auth/roles'
import type { VehicleStatus } from '@/types'

const statusBadge: Record<VehicleStatus, 'success' | 'warning' | 'error'> = {
  Disponible: 'success',
  Reservado:  'warning',
  Vendido:    'error',
}

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const [vehicle, expenses, priceHistory, photos, admin] = await Promise.all([
    getVehicle(params.id),
    getVehicleExpenses(params.id),
    getVehiclePriceHistory(params.id),
    getVehiclePhotos(params.id),
    isAdmin(),
  ])

  if (!vehicle) notFound()

  const totalGastos = expenses.reduce((a: number, e: any) => a + e.monto, 0)
  const rentabilidad = calcRentabilidad(vehicle.precio_venta, vehicle.precio_compra, totalGastos)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/vehiculos">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-textprim">
              {vehicle.marca} {vehicle.modelo} {vehicle.anio}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={statusBadge[vehicle.estado]}>{vehicle.estado}</Badge>
              <span className="text-xs text-textsec">Ingresado el {formatDate(vehicle.fecha_ingreso)}</span>
            </div>
          </div>
        </div>
        {admin && (
          <div className="flex items-center gap-2">
            <Link href={`/vehiculos/${vehicle.id}/editar`}>
              <Button variant="secondary" size="sm"><Edit className="w-3.5 h-3.5" />Editar</Button>
            </Link>
            <DeleteVehicleBtn vehicleId={vehicle.id} />
          </div>
        )}
      </div>

      {/* Photos */}
      <Card>
        <PhotoSection vehicleId={vehicle.id} photos={photos as any} canEdit={admin} />
      </Card>

      <div className={`grid gap-4 ${admin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Info */}
        <Card className={admin ? 'lg:col-span-2' : ''}>
          <CardHeader title="Información del vehículo" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Marca',         value: vehicle.marca },
              { label: 'Modelo',        value: vehicle.modelo },
              { label: 'Año',           value: vehicle.anio },
              { label: 'Kilometraje',   value: formatKm(vehicle.km) },
              { label: 'Color',         value: vehicle.color || '—' },
              { label: 'Estado',        value: vehicle.estado },
              ...(admin ? [{ label: 'P. Compra', value: formatCurrency(vehicle.precio_compra) }] : []),
              { label: 'P. Venta',      value: formatCurrency(vehicle.precio_venta) },
              ...(admin ? [{ label: 'Total Gastos', value: formatCurrency(totalGastos) }] : []),
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-textsec uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-medium text-textprim">{value}</p>
              </div>
            ))}
          </div>
          {vehicle.descripcion && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-textsec uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm text-textsec">{vehicle.descripcion}</p>
            </div>
          )}
        </Card>

        {/* Rentabilidad — admin only */}
        {admin && (
        <Card>
          <CardHeader title="Rentabilidad estimada" />
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-textsec">Precio de venta</span>
              <span className="text-textprim font-medium">{formatCurrency(vehicle.precio_venta)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-textsec">Precio de compra</span>
              <span className="text-error">−{formatCurrency(vehicle.precio_compra)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-textsec">Total gastos</span>
              <span className="text-error">−{formatCurrency(totalGastos)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-textprim flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Ganancia neta
              </span>
              <span className={`text-lg font-bold ${rentabilidad >= 0 ? 'text-success' : 'text-error'}`}>
                {rentabilidad >= 0 ? '+' : ''}{formatCurrency(rentabilidad)}
              </span>
            </div>
          </div>
        </Card>
        )}
      </div>

      {/* Expenses — admin only (reveals cost/margin) */}
      {admin && (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-textprim">Gastos</h2>
            <p className="text-xs text-textsec">Total: {formatCurrency(totalGastos)}</p>
          </div>
          <AddExpenseModal vehicleId={vehicle.id} />
        </div>
        {expenses.length === 0 ? (
          <p className="text-sm text-textsec text-center py-6">Sin gastos registrados</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Tipo</th>
                <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Descripción</th>
                <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Fecha</th>
                <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e: any) => (
                <tr key={e.id} className="border-b border-border/40 hover:bg-white/[0.02]">
                  <td className="py-2.5 px-1">
                    <Badge color="orange">
                      {EXPENSE_TYPES.find(t => t.value === e.tipo)?.label ?? e.tipo}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-1 text-textsec">{e.descripcion || '—'}</td>
                  <td className="py-2.5 px-1 text-textsec text-xs">{formatDate(e.fecha)}</td>
                  <td className="py-2.5 px-1 text-right font-medium text-textprim">{formatCurrency(e.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      )}

      {/* Price History */}
      {priceHistory.length > 0 && (
        <Card>
          <CardHeader title="Historial de precios" />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Fecha</th>
                <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Anterior</th>
                <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Nuevo</th>
                <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {priceHistory.map((h: any) => (
                <tr key={h.id} className="border-b border-border/40 hover:bg-white/[0.02]">
                  <td className="py-2.5 px-1 text-textsec text-xs">{formatDatetime(h.created_at)}</td>
                  <td className="py-2.5 px-1 text-right text-textsec">{formatCurrency(h.precio_anterior)}</td>
                  <td className={`py-2.5 px-1 text-right font-medium ${h.precio_nuevo > h.precio_anterior ? 'text-success' : 'text-error'}`}>
                    {h.precio_nuevo > h.precio_anterior ? '▲' : '▼'} {formatCurrency(h.precio_nuevo)}
                  </td>
                  <td className="py-2.5 px-1 text-textsec">{h.motivo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
