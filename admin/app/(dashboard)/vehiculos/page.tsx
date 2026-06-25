import Link from 'next/link'
import { Plus, Car, Search } from 'lucide-react'
import { getVehicles } from '@/lib/actions/vehicles'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { VehicleFiltersClient } from './VehicleFiltersClient'
import { formatCurrency, formatKm, formatDate } from '@/lib/utils/format'
import { isAdmin } from '@/lib/auth/roles'
import type { VehicleStatus, VehicleFilters } from '@/types'

const statusBadge: Record<VehicleStatus, 'success' | 'warning' | 'error'> = {
  Disponible: 'success',
  Reservado:  'warning',
  Vendido:    'error',
}

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: VehicleFilters
}) {
  const [vehicles, admin] = await Promise.all([getVehicles(searchParams), isAdmin()])

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Vehículos</h1>
          <p className="text-sm text-textsec mt-0.5">
            {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} encontrado{vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>
        {admin && (
          <Link href="/vehiculos/nuevo">
            <Button>
              <Plus className="w-4 h-4" />
              Nuevo vehículo
            </Button>
          </Link>
        )}
      </div>

      <VehicleFiltersClient current={searchParams} />

      <Card padding={false}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Vehículo', 'Año', 'Km', 'P. Compra', 'P. Venta', 'Estado', 'Ingreso', 'Acciones'].map(h => (
                  <th key={h} className="table-header-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-card-elevated border border-border rounded-2xl
                                      flex items-center justify-center">
                        <Search className="w-6 h-6 text-textmuted" />
                      </div>
                      <p className="text-textsec font-medium">No se encontraron vehículos</p>
                    </div>
                  </td>
                </tr>
              ) : vehicles.map(v => (
                <tr key={v.id} className="table-row-hover group">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange/10 border border-orange/20
                                      flex items-center justify-center flex-shrink-0
                                      group-hover:bg-orange/15 transition-colors">
                        <Car className="w-4 h-4 text-orange" />
                      </div>
                      <div>
                        <p className="font-semibold text-textprim">{v.marca} {v.modelo}</p>
                        {v.color && <p className="text-xs text-textsec">{v.color}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-textsec">{v.anio}</td>
                  <td className="table-cell text-textsec">{formatKm(v.km)}</td>
                  <td className="table-cell text-textsec">{formatCurrency(v.precio_compra)}</td>
                  <td className="table-cell font-semibold text-textprim">{formatCurrency(v.precio_venta)}</td>
                  <td className="table-cell">
                    <Badge color={statusBadge[v.estado]} dot>{v.estado}</Badge>
                  </td>
                  <td className="table-cell text-textsec text-xs whitespace-nowrap">{formatDate(v.fecha_ingreso)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Link href={`/vehiculos/${v.id}`}>
                        <Button variant="secondary" size="sm">Ver</Button>
                      </Link>
                      {admin && (
                        <Link href={`/vehiculos/${v.id}/editar`}>
                          <Button variant="ghost" size="sm">Editar</Button>
                        </Link>
                      )}
                    </div>
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
