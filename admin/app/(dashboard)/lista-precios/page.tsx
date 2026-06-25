import Link from 'next/link'
import { Plus, ListOrdered, CheckCircle, XCircle } from 'lucide-react'
import { getPriceLists } from '@/lib/actions/pricelists'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils/format'
import { isAdmin } from '@/lib/auth/roles'

export default async function ListaPreciosPage() {
  const [lists, admin] = await Promise.all([getPriceLists(), isAdmin()])
  const activas = lists.filter((l: any) => l.activa).length

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textprim">Lista de Precios</h1>
          <p className="text-sm text-textsec">{activas} activas · {lists.length} total</p>
        </div>
        {admin && (
          <Link href="/lista-precios/nueva">
            <Button><Plus className="w-4 h-4" />Nueva lista</Button>
          </Link>
        )}
      </div>

      {lists.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <ListOrdered className="w-12 h-12 text-textsec/30 mx-auto mb-3" />
            <p className="text-sm text-textsec">No hay listas de precios creadas</p>
            <p className="text-xs text-textsec/60 mt-1">Las listas de precios permiten compartir precios de venta con los vendedores</p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {lists.map((list: any) => (
            <Link key={list.id} href={`/lista-precios/${list.id}`}>
              <Card className="hover:border-orange/40 transition-all duration-200 cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ListOrdered className="w-5 h-5 text-orange" />
                  </div>
                  <Badge color={list.activa ? 'success' : 'error'}>
                    {list.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>

                <h3 className="font-semibold text-textprim group-hover:text-orange transition-colors mb-1">
                  {list.titulo}
                </h3>
                {list.descripcion && (
                  <p className="text-xs text-textsec line-clamp-2 mb-3">{list.descripcion}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-textsec">
                    {list.activa
                      ? <CheckCircle className="w-3.5 h-3.5 text-success" />
                      : <XCircle className="w-3.5 h-3.5 text-error" />
                    }
                    <span>{list.activa ? 'Visible para vendedores' : 'Oculta'}</span>
                  </div>
                  <span className="text-xs text-textsec">{formatDate(list.created_at)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
