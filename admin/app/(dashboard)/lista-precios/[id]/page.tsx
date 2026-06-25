import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Car, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { getPriceList, togglePriceListActive, removeFromPriceList } from '@/lib/actions/pricelists'
import { getVehicles, getMainPhotosForVehicles } from '@/lib/actions/vehicles'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, formatKm } from '@/lib/utils/format'
import { isAdmin } from '@/lib/auth/roles'
import { AddVehicleToPriceListForm } from './AddVehicleToPriceListForm'

export default async function PriceListDetailPage({ params }: { params: { id: string } }) {
  const [list, vehicles, admin] = await Promise.all([
    getPriceList(params.id),
    getVehicles({ estado: 'Disponible' }),
    isAdmin(),
  ])

  if (!list) notFound()

  const items = (list as any).price_list_items ?? []
  const vehicleIds = items.map((i: any) => i.vehicle_id).filter(Boolean)
  const photos = await getMainPhotosForVehicles(vehicleIds)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/lista-precios">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-textprim tracking-tight">
              {(list as any).titulo}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={(list as any).activa ? 'success' : 'default'} dot>
                {(list as any).activa ? 'Activa' : 'Inactiva'}
              </Badge>
              <span className="text-xs text-textsec">
                {items.length} vehículo{items.length !== 1 ? 's' : ''} · Creada el {formatDate((list as any).created_at)}
              </span>
            </div>
          </div>
        </div>
        {admin && (
          <form action={async () => {
            'use server'
            await togglePriceListActive(params.id, !(list as any).activa)
          }}>
            <Button variant="secondary" size="sm" type="submit">
              {(list as any).activa
                ? <><XCircle className="w-3.5 h-3.5" />Desactivar</>
                : <><CheckCircle className="w-3.5 h-3.5" />Activar</>
              }
            </Button>
          </form>
        )}
      </div>

      {(list as any).descripcion && (
        <Card>
          <p className="text-sm text-textsec leading-relaxed">{(list as any).descripcion}</p>
        </Card>
      )}

      {admin && <AddVehicleToPriceListForm priceListId={params.id} vehicles={vehicles} />}

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange/10 flex items-center justify-center">
            <Car className="w-3.5 h-3.5 text-orange" />
          </div>
          <h2 className="font-display text-sm font-semibold text-textprim">
            Vehículos en esta lista
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-14">
            <Car className="w-10 h-10 text-textmuted mx-auto mb-3" />
            <p className="text-sm text-textsec">Sin vehículos agregados</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Foto', 'Vehículo', 'Km', 'Color', 'Estado', 'Precio lista', 'Notas', ...(admin ? [''] : [])].map((h, i) => (
                    <th key={i} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const photoUrl = photos[item.vehicle_id]
                  return (
                    <tr key={item.id} className="table-row-hover">
                      {/* Photo thumbnail */}
                      <td className="table-cell w-14">
                        <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-card-elevated border border-border">
                          {photoUrl ? (
                            <Image
                              src={photoUrl}
                              alt={`${item.vehicles?.marca} ${item.vehicles?.modelo}`}
                              width={48}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-textmuted text-[9px] font-medium">
                              Sin foto
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="table-cell">
                        <p className="font-semibold text-textprim">
                          {item.vehicles?.marca} {item.vehicles?.modelo}
                        </p>
                        <p className="text-xs text-textsec">{item.vehicles?.anio}</p>
                      </td>
                      <td className="table-cell text-textsec">{formatKm(item.vehicles?.km ?? 0)}</td>
                      <td className="table-cell text-textsec">{item.vehicles?.color ?? '—'}</td>
                      <td className="table-cell">
                        <Badge color={item.vehicles?.estado === 'Disponible' ? 'success' : 'warning'} dot>
                          {item.vehicles?.estado}
                        </Badge>
                      </td>
                      <td className="table-cell font-bold text-orange">{formatCurrency(item.precio_lista)}</td>
                      <td className="table-cell text-textsec text-xs">{item.notas ?? '—'}</td>
                      {admin && (
                        <td className="table-cell">
                          <form action={async () => {
                            'use server'
                            await removeFromPriceList(item.id, params.id)
                          }}>
                            <button
                              type="submit"
                              className="p-1.5 hover:bg-error/10 hover:text-error rounded-lg transition-colors text-textsec"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
