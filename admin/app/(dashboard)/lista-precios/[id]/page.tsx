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
          <div className="xl:hidden flex flex-col gap-3 p-4">
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

          {/* Vista escritorio: tabla compacta — todas las columnas caben sin scroll horizontal.
              Recién a partir de xl (1280px) garantizamos suficiente ancho de contenido real
              (descontando sidebar fijo + padding) para que la tabla no quede apretada; en
              anchos intermedios (tablet / ventana chica) se usan las mismas tarjetas que en
              mobile, que ya son responsive. */}
          <div className="hidden xl:block">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr>
                  {[
                    ['Vehículo', 'w-[26%]'],
                    ['Estado', 'w-[10%]'],
                    ['Precio lista', 'w-[16%]'],
                    ['Entrega', 'w-[10%]'],
                    ['Financiado', 'w-[22%]'],
                    ['Notas', 'w-[16%]'],
                    ...(admin ? [['', 'w-[36px]']] : []),
                  ].map(([h, w], i) => (
                    <th key={i} className={`table-header-cell !px-3 ${w}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const photoUrl = photoMap[item.vehicle_id]
                  const moneda = item.vehicles?.moneda
                  const financiado = ([
                    ['12', item.precio_financiado_12],
                    ['18', item.precio_financiado_18],
                    ['24', item.precio_financiado_24],
                    ['30', item.precio_financiado_30],
                  ] as [string, number | null][]).filter(([, v]) => v)
                  return (
                    <tr key={item.id} className="table-row-hover align-top">
                      <td className="table-cell !px-3">
                        <div className="flex gap-2.5 items-center">
                          <div className="w-10 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-card-elevated border border-border">
                            {photoUrl ? (
                              <Image
                                src={photoUrl}
                                alt={`${item.vehicles?.marca} ${item.vehicles?.modelo}`}
                                width={40}
                                height={36}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-textmuted text-[8px] font-medium text-center leading-tight">
                                S/foto
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-textprim truncate">
                              {item.vehicles?.marca} {item.vehicles?.modelo}
                            </p>
                            <p className="text-xs text-textsec truncate">
                              {item.vehicles?.anio} · {formatKm(item.vehicles?.km ?? 0)}{item.vehicles?.color ? ` · ${item.vehicles.color}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell !px-3">
                        <Badge color={item.vehicles?.estado === 'Disponible' ? 'success' : 'warning'} dot>
                          {item.vehicles?.estado}
                        </Badge>
                      </td>
                      <td className="table-cell !px-3">
                        <p className="font-bold text-orange tabular">{formatCurrency(item.precio_lista, moneda)}</p>
                        {(item.precio_1 || item.precio_2) && (
                          <p className="text-[11px] text-textsec tabular mt-0.5 leading-snug">
                            {item.precio_1 && <>Cont. {formatCurrency(item.precio_1, moneda)}</>}
                            {item.precio_1 && item.precio_2 && <br />}
                            {item.precio_2 && <>Mín. {formatCurrency(item.precio_2, moneda)}</>}
                          </p>
                        )}
                      </td>
                      <td className="table-cell !px-3 text-textsec tabular">
                        {item.entrega ? formatCurrency(item.entrega, moneda) : '—'}
                      </td>
                      <td className="table-cell !px-3">
                        {financiado.length > 0 ? (
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-textsec tabular">
                            {financiado.map(([label, value]) => (
                              <span key={label} className="truncate">
                                <span className="text-textmuted">{label}:</span> {formatCurrency(value as number, moneda)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-textmuted">—</span>
                        )}
                      </td>
                      <td className="table-cell !px-3 text-textsec text-xs">
                        <span className="block truncate" title={item.notas ?? undefined}>{item.notas ?? '—'}</span>
                      </td>
                      {admin && (
                        <td className="table-cell !px-3">
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
