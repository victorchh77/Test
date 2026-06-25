import Link from 'next/link'
import { Plus, ListOrdered, CheckCircle, XCircle } from 'lucide-react'
import { getPriceLists } from '@/lib/actions/pricelists'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils/format'
import { isAdmin } from '@/lib/auth/roles'

export default async function ListaPreciosPage() {
  const [lists, admin] = await Promise.all([getPriceLists(), isAdmin()])
  const activas = lists.filter((l: any) => l.activa).length

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Lista de Precios</h1>
          <p className="text-sm text-textsec mt-0.5">
            <span className="text-success font-medium">{activas} activas</span>
            {' · '}{lists.length} total
          </p>
        </div>
        {admin && (
          <Link href="/lista-precios/nueva">
            <Button><Plus className="w-4 h-4" />Nueva lista</Button>
          </Link>
        )}
      </div>

      {lists.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title="Sin listas de precios"
          description="Las listas de precios permiten compartir precios de venta con los vendedores."
          action={admin ? { label: 'Nueva lista', href: '/lista-precios/nueva' } : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {lists.map((list: any) => (
            <Link key={list.id} href={`/lista-precios/${list.id}`}>
              <div className="
                bg-card border border-border rounded-2xl p-5 shadow-card
                hover:border-orange/40 hover:-translate-y-0.5 hover:shadow-orange-sm
                transition-all duration-300 cursor-pointer group
              ">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange/10 border border-orange/20 rounded-xl
                                  flex items-center justify-center flex-shrink-0
                                  group-hover:bg-orange/15 transition-colors">
                    <ListOrdered className="w-5 h-5 text-orange" />
                  </div>
                  <Badge color={list.activa ? 'success' : 'default'} dot>
                    {list.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>

                <h3 className="font-display font-semibold text-textprim group-hover:text-orange transition-colors duration-200 mb-1 leading-tight">
                  {list.titulo}
                </h3>
                {list.descripcion && (
                  <p className="text-xs text-textsec line-clamp-2 mb-3 leading-relaxed">{list.descripcion}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-xs text-textsec">
                    {list.activa
                      ? <CheckCircle className="w-3.5 h-3.5 text-success" />
                      : <XCircle className="w-3.5 h-3.5 text-textmuted" />
                    }
                    <span>{list.activa ? 'Visible para vendedores' : 'Oculta'}</span>
                  </div>
                  <span className="text-xs text-textmuted">{formatDate(list.created_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
