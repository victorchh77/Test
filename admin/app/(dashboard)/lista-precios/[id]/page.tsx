import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Car, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { getPriceList, togglePriceListActive, removeFromPriceList } from '@/lib/actions/pricelists'
import { getVehicles } from '@/lib/actions/vehicles'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, formatKm } from '@/lib/utils/format'
import { AddVehicleToPriceListForm } from './AddVehicleToPriceListForm'

export default async function PriceListDetailPage({ params }: { params: { id: string } }) {
  const [list, vehicles] = await Promise.all([
    getPriceList(params.id),
    getVehicles({ estado: 'Disponible' }),
  ])

  if (!list) notFound()

  const items = (list as any).price_list_items ?? []

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/lista-precios">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-textprim">{(list as any).titulo}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={(list as any).activa ? 'success' : 'error'}>
                {(list as any).activa ? 'Activa' : 'Inactiva'}
              </Badge>
              <span className="text-xs text-textsec">{items.length} vehículos · Creada el {formatDate((list as any).created_at)}</span>
            </div>
          </div>
        </div>
        <form action={async () => {
          'use server'
          await togglePriceListActive(params.id, !(list as any).activa)
        }}>
          <Button variant="secondary" size="sm" type="submit">
            {(list as any).activa ? <><XCircle className="w-3.5 h-3.5" />Desactivar</> : <><CheckCircle className="w-3.5 h-3.5" />Activar</>}
          </Button>
        </form>
      </div>

      {(list as any).descripcion && (
        <Card>
          <p className="text-sm text-textsec">{(list as any).descripcion}</p>
        </Card>
      )}

      <AddVehicleToPriceListForm priceListId={params.id} vehicles={vehicles} />

      <Card padding={false}>
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-textprim">Vehículos en esta lista</h2>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-10 h-10 text-textsec/30 mx-auto mb-2" />
            <p className="text-sm text-textsec">Sin vehículos agregados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Vehículo', 'Km', 'Color', 'Estado', 'Precio lista', 'Notas', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-textsec uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-textprim">{item.vehicles?.marca} {item.vehicles?.modelo}</p>
                    <p className="text-xs text-textsec">{item.vehicles?.anio}</p>
                  </td>
                  <td className="py-3 px-4 text-textsec">{formatKm(item.vehicles?.km ?? 0)}</td>
                  <td className="py-3 px-4 text-textsec">{item.vehicles?.color ?? '—'}</td>
                  <td className="py-3 px-4">
                    <Badge color={item.vehicles?.estado === 'Disponible' ? 'success' : 'warning'}>
                      {item.vehicles?.estado}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-semibold text-orange">{formatCurrency(item.precio_lista)}</td>
                  <td className="py-3 px-4 text-textsec text-xs">{item.notas ?? '—'}</td>
                  <td className="py-3 px-4">
                    <form action={async () => {
                      'use server'
                      await removeFromPriceList(item.id, params.id)
                    }}>
                      <button type="submit" className="p-1.5 hover:bg-error/10 hover:text-error rounded-lg transition-colors text-textsec">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
