import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textprim">Vehículos</h1>
          <p className="text-sm text-textsec mt-0.5">{vehicles.length} vehículos encontrados</p>
        </div>
        {admin && (
          <Link href="/vehiculos/nuevo">
            <Button><Plus className="w-4 h-4" />Nuevo vehículo</Button>
          </Link>
        )}
      </div>

      <VehicleFiltersClient current={searchParams} />

      <Card padding={false}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Vehículo', 'Año', 'Km', 'P. Compra', 'P. Venta', 'Estado', 'Ingreso', 'Acciones'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-textsec uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-textsec">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-30" />
                      <p>No se encontraron vehículos</p>
                    </div>
                  </td>
                </tr>
              ) : vehicles.map(v => (
                <tr key={v.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-textprim">{v.marca} {v.modelo}</p>
                    {v.color && <p className="text-xs text-textsec">{v.color}</p>}
                  </td>
                  <td className="py-3 px-4 text-textsec">{v.anio}</td>
                  <td className="py-3 px-4 text-textsec">{formatKm(v.km)}</td>
                  <td className="py-3 px-4 text-textsec">{formatCurrency(v.precio_compra)}</td>
                  <td className="py-3 px-4 font-medium text-textprim">{formatCurrency(v.precio_venta)}</td>
                  <td className="py-3 px-4">
                    <Badge color={statusBadge[v.estado]}>{v.estado}</Badge>
                  </td>
                  <td className="py-3 px-4 text-textsec text-xs">{formatDate(v.fecha_ingreso)}</td>
                  <td className="py-3 px-4">
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
