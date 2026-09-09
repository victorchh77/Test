import Link from 'next/link'
import Image from 'next/image'
import { Plus, Car, CheckCircle, Clock, Tag } from 'lucide-react'
import { getVehiclesWithMainPhoto } from '@/lib/actions/vehicles'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { VehicleFiltersClient } from './VehicleFiltersClient'
import { formatCurrency, formatKm, formatDate } from '@/lib/utils/format'
import { isAdmin } from '@/lib/auth/roles'
import type { VehicleStatus, VehicleFilters } from '@/types'

const statusBadge: Record<VehicleStatus, 'success' | 'warning' | 'error'> = {
  Disponible: 'success',
  Reservado:  'warning',
  Vendido:    'error',
}

export default async function VehiculosPage({ searchParams }: { searchParams: VehicleFilters }) {
  const [vehicles, admin] = await Promise.all([getVehiclesWithMainPhoto(searchParams), isAdmin()])

  const disponibles = vehicles.filter(v => v.estado === 'Disponible').length
  const reservados  = vehicles.filter(v => v.estado === 'Reservado').length
  const vendidos    = vehicles.filter(v => v.estado === 'Vendido').length

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Vehículos</h1>
          <p className="text-sm text-textsec mt-0.5">
            {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} en inventario
          </p>
        </div>
        {admin && (
          <Link href="/vehiculos/nuevo">
            <Button><Plus className="w-4 h-4" />Nuevo vehículo</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total" value={vehicles.length} icon={Car} color="default" />
        <StatCard title="Disponibles" value={disponibles} icon={CheckCircle} color="success" />
        <StatCard title="Reservados" value={reservados} icon={Clock} color="orange" />
        <StatCard title="Vendidos" value={vendidos} icon={Tag} color="error" />
      </div>

      <VehicleFiltersClient current={searchParams} />

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Sin vehículos"
          description="No se encontraron vehículos con los filtros aplicados."
          action={admin ? { label: 'Nuevo vehículo', href: '/vehiculos/nuevo' } : undefined}
        />
      ) : (
        <>
        {/* Vista móvil: tarjetas */}
        <div className="md:hidden flex flex-col gap-3">
          {vehicles.map(v => {
            const photoUrl = v.mainPhotoUrl
            return (
              <div key={v.id} className="bg-card border border-border rounded-2xl p-3 shadow-card">
                <div className="flex gap-3">
                  <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-card-elevated border border-border">
                    {photoUrl ? (
                      <Image src={photoUrl} alt={`${v.marca} ${v.modelo}`} width={80} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-textmuted text-[9px]">Sin foto</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-textprim leading-tight">{v.marca} {v.modelo}</p>
                      <Badge color={statusBadge[v.estado]} dot>{v.estado}</Badge>
                    </div>
                    <p className="text-xs text-textsec mt-0.5">
                      {[String(v.anio), formatKm(v.km), v.color, v.combustible, v.cambio].filter(Boolean).join(' · ')}
                    </p>
                    <p className="font-bold text-orange mt-1 tabular">{formatCurrency(v.precio_venta, v.moneda)}</p>
                    {admin && <p className="text-[11px] text-textsec tabular">Compra: {formatCurrency(v.precio_compra, v.moneda)}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
                  <Link href={`/vehiculos/${v.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">Ver detalle</Button>
                  </Link>
                  {admin && (
                    <Link href={`/vehiculos/${v.id}/editar`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">Editar</Button>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Vista escritorio: tabla */}
        <Card padding={false} className="hidden md:block">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Foto', 'Vehículo', 'Año', 'Km', 'P. Compra', 'P. Venta', 'Estado', 'F. Compra', 'Ingreso', 'Acciones'].map(h => (
                    <th key={h} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => {
                  const photoUrl = v.mainPhotoUrl
                  return (
                    <tr key={v.id} className="table-row-hover group">
                      <td className="table-cell w-16">
                        <div className="w-14 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-card-elevated border border-border">
                          {photoUrl ? (
                            <Image
                              src={photoUrl}
                              alt={`${v.marca} ${v.modelo}`}
                              width={56}
                              height={44}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-textmuted text-[9px] font-medium text-center leading-tight px-1">
                              Sin foto
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="table-cell">
                        <p className="font-semibold text-textprim">{v.marca} {v.modelo}</p>
                        {(v.color || v.combustible || v.cambio) && (
                          <p className="text-xs text-textsec">
                            {[v.color, v.combustible, v.cambio].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </td>
                      <td className="table-cell text-textsec">{v.anio}</td>
                      <td className="table-cell text-textsec">{formatKm(v.km)}</td>
                      <td className="table-cell text-textsec">{formatCurrency(v.precio_compra, v.moneda)}</td>
                      <td className="table-cell font-semibold text-textprim">{formatCurrency(v.precio_venta, v.moneda)}</td>
                      <td className="table-cell">
                        <Badge color={statusBadge[v.estado]} dot>{v.estado}</Badge>
                      </td>
                      <td className="table-cell text-textsec text-xs whitespace-nowrap">{v.fecha_compra ? formatDate(v.fecha_compra) : '—'}</td>
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
        </>
      )}
    </div>
  )
}
