import Link from 'next/link'
import { Plus, Phone, Mail, MapPin, Users } from 'lucide-react'
import { getClients } from '@/lib/actions/clients'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils/format'

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Clientes</h1>
          <p className="text-sm text-textsec mt-0.5">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/clientes/nuevo">
          <Button><Plus className="w-4 h-4" />Nuevo cliente</Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin clientes"
          description="Registrá el primer cliente para empezar a gestionar ventas."
          action={{ label: 'Nuevo cliente', href: '/clientes/nuevo' }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => (
            <Link key={c.id} href={`/clientes/${c.id}`}>
              <div className="
                bg-card border border-border rounded-2xl p-4 shadow-card
                hover:border-orange/40 hover:-translate-y-0.5 hover:shadow-orange-sm
                transition-all duration-300 cursor-pointer group
              ">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                  bg-gradient-to-br from-orange/20 to-orange/5 border border-orange/20
                                  group-hover:from-orange/30 transition-all duration-300">
                    <span className="text-orange font-bold text-sm font-display">
                      {c.nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-textmuted mt-1">{formatDate(c.created_at)}</span>
                </div>
                <h3 className="font-display font-semibold text-textprim group-hover:text-orange transition-colors duration-200 leading-tight">
                  {c.nombre}
                </h3>
                {c.documento && (
                  <p className="text-xs text-textsec mt-0.5">CI: {c.documento}</p>
                )}
                <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-border/50">
                  {c.telefono && (
                    <div className="flex items-center gap-1.5 text-xs text-textsec">
                      <Phone className="w-3 h-3 text-textmuted flex-shrink-0" />
                      {c.telefono}
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-1.5 text-xs text-textsec">
                      <Mail className="w-3 h-3 text-textmuted flex-shrink-0" />
                      {c.email}
                    </div>
                  )}
                  {c.ciudad && (
                    <div className="flex items-center gap-1.5 text-xs text-textsec">
                      <MapPin className="w-3 h-3 text-textmuted flex-shrink-0" />
                      {c.ciudad}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
