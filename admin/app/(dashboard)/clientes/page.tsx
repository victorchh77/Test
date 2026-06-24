import Link from 'next/link'
import { Plus, Phone, Mail, MapPin } from 'lucide-react'
import { getClients } from '@/lib/actions/clients'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils/format'

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textprim">Clientes</h1>
          <p className="text-sm text-textsec">{clients.length} clientes registrados</p>
        </div>
        <Link href="/clientes/nuevo">
          <Button><Plus className="w-4 h-4" />Nuevo cliente</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length === 0 ? (
          <div className="col-span-full py-16 text-center text-textsec">
            <p>No hay clientes registrados</p>
          </div>
        ) : clients.map(c => (
          <Link key={c.id} href={`/clientes/${c.id}`}>
            <div className="bg-card border border-border rounded-xl p-4 hover:border-orange/40 transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 bg-orange/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-orange font-bold text-sm">
                    {c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-textsec">{formatDate(c.created_at)}</span>
              </div>
              <h3 className="font-semibold text-textprim group-hover:text-orange transition-colors">{c.nombre}</h3>
              {c.documento && (
                <p className="text-xs text-textsec mt-0.5">CI: {c.documento}</p>
              )}
              <div className="flex flex-col gap-1 mt-3">
                {c.telefono && (
                  <div className="flex items-center gap-1.5 text-xs text-textsec">
                    <Phone className="w-3 h-3" />{c.telefono}
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-1.5 text-xs text-textsec">
                    <Mail className="w-3 h-3" />{c.email}
                  </div>
                )}
                {c.ciudad && (
                  <div className="flex items-center gap-1.5 text-xs text-textsec">
                    <MapPin className="w-3 h-3" />{c.ciudad}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
