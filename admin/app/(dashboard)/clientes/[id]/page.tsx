import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Phone, Mail, MapPin, FileText } from 'lucide-react'
import { getClient, getClientSales } from '@/lib/actions/clients'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { EditClientModal } from './EditClientModal'

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const [client, sales] = await Promise.all([
    getClient(params.id),
    getClientSales(params.id),
  ])

  if (!client) notFound()

  const totalCompras = sales.reduce((a, s) => a + s.precio_final, 0)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clientes">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-textprim">{client.nombre}</h1>
            <p className="text-sm text-textsec">Cliente desde {formatDate(client.created_at)}</p>
          </div>
        </div>
        <EditClientModal client={client} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Datos de contacto" />
          <div className="flex flex-col gap-3">
            {client.documento && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-textsec flex-shrink-0" />
                <span className="text-textsec">CI:</span>
                <span className="text-textprim">{client.documento}</span>
              </div>
            )}
            {client.telefono && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-textsec flex-shrink-0" />
                <a href={`tel:${client.telefono}`} className="text-orange hover:underline">{client.telefono}</a>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-textsec flex-shrink-0" />
                <a href={`mailto:${client.email}`} className="text-orange hover:underline">{client.email}</a>
              </div>
            )}
            {client.ciudad && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-textsec flex-shrink-0" />
                <span className="text-textprim">{client.ciudad}</span>
              </div>
            )}
            {client.notas && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-textsec mb-1">Notas</p>
                <p className="text-sm text-textprim">{client.notas}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-textprim">Historial de compras</h2>
              <p className="text-xs text-textsec">{sales.length} compras · Total {formatCurrency(totalCompras)}</p>
            </div>
          </div>
          {sales.length === 0 ? (
            <p className="text-sm text-textsec text-center py-8">Sin compras registradas</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Vehículo</th>
                  <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Precio</th>
                  <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Ganancia</th>
                  <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id} className="border-b border-border/40 hover:bg-white/[0.02]">
                    <td className="py-2.5 px-1 font-medium text-textprim">
                      {s.marca} {s.modelo} {s.anio}
                    </td>
                    <td className="py-2.5 px-1 text-right text-textprim">{formatCurrency(s.precio_final)}</td>
                    <td className={`py-2.5 px-1 text-right font-medium ${s.ganancia >= 0 ? 'text-success' : 'text-error'}`}>
                      {s.ganancia >= 0 ? '+' : ''}{formatCurrency(s.ganancia)}
                    </td>
                    <td className="py-2.5 px-1 text-right text-textsec text-xs">{formatDate(s.fecha_venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}
