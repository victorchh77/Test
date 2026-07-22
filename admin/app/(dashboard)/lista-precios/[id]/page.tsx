import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Car, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { getPriceList, togglePriceListActive, removeFromPriceList } from '@/lib/actions/pricelists'
import { getVehicles } from '@/lib/actions/vehicles'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, formatKm } from '@/lib/utils/format'
import { isAdminOrSecretary } from '@/lib/auth/roles'
import { AddVehicleToPriceListForm } from './AddVehicleToPriceListForm'

export default async function PriceListDetailPage({ params }: { params: { id: string } }) {
  const [list, vehicles, admin] = await Promise.all([
    getPriceList(params.id),
    getVehicles({ estado: 'Disponible' }),
    isAdminOrSecretary(),
  ])

  if (!list) notFound()

  const items = (list as any).price_list_items ?? []

  const photoMap: Record<string, string> = {}
  items.forEach((item: any) => {
    const vPhotos: { url: string; is_main: boolean }[] = item.vehicles?.vehicle_photos ?? []
    const main = vPhotos.find((p) => p.is_main) ?? vPhotos[0] ?? null
    if (main) photoMap[item.vehicle_id] = main.url
  })

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
          <>
          {/* Vista móvil: tarjetas */}
          <div className="md:hidden flex flex-col gap-3 p-4">
            {items.map((item: any) => {
              const photoUrl = photoMap[item.vehicle_id]
              const rows = ([
                ['Contado', item.precio_1],
                ['Contado mín.', item.precio_2],
                ['Entrega', item.entrega],
                ['12 cuotas', item.precio_financiado_12],
                ['18 cuotas', item.precio_financiado_18],
                ['24 cuotas', item.precio_financiado_24],
                ['30 cuotas', item.precio_financiado_30],
              ] as [string, number | null][]).filter(([, v]) => v)
              return (
                <div key={item.id} className="bg-card-elevated/40 border border-border rounded-2xl p-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-card-elevated border border-border">
                      {photoUrl ? (
                        <Image src={photoUrl} alt={`${item.vehicles?.marca} ${item.vehicles?.modelo}`} width={64} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-textmuted text-[9px]">Sin foto</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-textprim leading-tight">{item.vehicles?.marca} {item.vehicles?.modelo}</p>
                      <p className="text-xs text-textsec">{item.vehicles?.anio} · {formatKm(item.vehicles?.km ?? 0)}{item.vehicles?.color ? ` · ${item.vehicles.color}` : ''}</p>
                    </div>
                    <Badge color={item.vehicles?.estado === 'Disponible' ? 'success' : 'warning'} dot>{item.vehicles?.estado}</Badge>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between border-t border-border/60 pt-3">
                    <span className="text-xs text-textsec uppercase tracking-wide">Precio lista</span>
                    <span className="font-bold text-orange tabular text-base">{formatCurrency(item.precio_lista, item.vehicles?.moneda)}</span>
                  </div>

                  {rows.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {rows.map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-textsec text-xs">{label}</span>
                          <span className="text-textprim tabular">{formatCurrency(value as number, item.vehicles?.moneda)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.notas && <p className="text-xs text-textsec mt-3 italic">{item.notas}</p>}

                  {admin && (
                    <form action={async () => { 'use server'; await removeFromPriceList(item.id, params.id) }} className="mt-3 pt-3 border-t border-border/60">
                      <button type="submit" className="flex items-center gap-1.5 text-xs text-textsec hover:text-error transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Quitar de la lista
                      </button>
                    </form>
                  )}
                </div>
              )
            })}
          </div>

          {/* Vista escritorio: tabla */}
          <div className="hidden md:block overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Foto', 'Vehículo', 'Km', 'Color', 'Estado', 'Precio 1', 'Precio 2', 'Precio lista', 'Entrega', '12 cuotas', '18 cuotas', '24 cuotas', '30 cuotas', 'Notas', ...(admin ? [''] : [])].map((h, i) => (
                    <th key={i} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const photoUrl = photoMap[item.vehicle_id]
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
                      <td className="table-cell text-textsec whitespace-nowrap">{item.precio_1 ? formatCurrency(item.precio_1, item.vehicles?.moneda) : '—'}</td>
                      <td className="table-cell text-textsec whitespace-nowrap">{item.precio_2 ? formatCurrency(item.precio_2, item.vehicles?.moneda) : '—'}</td>
                      <td className="table-cell font-bold text-orange whitespace-nowrap">{formatCurrency(item.precio_lista, item.vehicles?.moneda)}</td>
                      <td className="table-cell text-textsec whitespace-nowrap">{item.entrega ? formatCurrency(item.entrega, item.vehicles?.moneda) : '—'}</td>
                      <td className="table-cell text-textsec whitespace-nowrap">{item.precio_financiado_12 ? formatCurrency(item.precio_financiado_12, item.vehicles?.moneda) : '—'}</td>
                      <td className="table-cell text-textsec whitespace-nowrap">{item.precio_financiado_18 ? formatCurrency(item.precio_financiado_18, item.vehicles?.moneda) : '—'}</td>
                      <td className="table-cell text-textsec whitespace-nowrap">{item.precio_financiado_24 ? formatCurrency(item.precio_financiado_24, item.vehicles?.moneda) : '—'}</td>
                      <td className="table-cell text-textsec whitespace-nowrap">{item.precio_financiado_30 ? formatCurrency(item.precio_financiado_30, item.vehicles?.moneda) : '—'}</td>
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
          </>
        )}
      </Card>
    </div>
  )
}
