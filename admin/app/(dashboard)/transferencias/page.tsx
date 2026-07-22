import Link from 'next/link'
import { Plus, CheckCircle, Clock, ArrowDownCircle, ExternalLink, Pencil } from 'lucide-react'
import { getTransfers, verifyTransfer, unverifyTransfer, getComprobanteSignedUrls } from '@/lib/actions/transfers'
import { isAdmin, isAdminOrSecretary } from '@/lib/auth/roles'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { DeleteTransferButton } from './DeleteTransferButton'
import type { Transfer } from '@/types'

function monthKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const label = d.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function groupByMonth(transfers: Transfer[]): { key: string; label: string; items: Transfer[] }[] {
  const groups = new Map<string, { label: string; items: Transfer[] }>()
  for (const t of transfers) {
    const key = monthKey(t.created_at)
    if (!groups.has(key)) groups.set(key, { label: monthLabel(t.created_at), items: [] })
    groups.get(key)!.items.push(t)
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, g]) => ({ key, ...g }))
}

export default async function TransferenciasPage() {
  const [transfers, admin, canEdit] = await Promise.all([getTransfers(), isAdmin(), isAdminOrSecretary()])
  const signedUrls = await getComprobanteSignedUrls(
    transfers.map((t) => t.comprobante_url).filter((u): u is string => !!u)
  )
  const comprobanteHref = (u: string | null) =>
    !u ? null : u.startsWith('http') ? u : (signedUrls[u] ?? null)

  const total        = transfers.reduce((s, t) => s + t.monto, 0)
  const pendientes   = transfers.filter(t => !t.verified).length
  const verificadas  = transfers.filter(t => t.verified).length
  const monthGroups  = groupByMonth(transfers)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Transferencias</h1>
          <p className="text-sm text-textsec mt-0.5">Registro de comprobantes de pago</p>
        </div>
        <Link href="/transferencias/nueva">
          <Button><Plus className="w-4 h-4" />Nueva transferencia</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total registrado" value={formatCurrency(total)} icon={ArrowDownCircle} color="orange" />
        <StatCard title="Pendientes"       value={pendientes}            icon={Clock}           color="default" />
        <StatCard title="Verificadas"      value={verificadas}           icon={CheckCircle}     color="success" />
      </div>

      {/* List — agrupado por mes de carga */}
      {transfers.length === 0 ? (
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display text-sm font-semibold text-textprim">Historial</h2>
          </div>
          <EmptyState
            icon={ArrowDownCircle}
            title="Sin transferencias"
            description="No hay transferencias registradas todavía."
            action={{ label: 'Nueva transferencia', href: '/transferencias/nueva' }}
          />
        </Card>
      ) : (
        monthGroups.map(group => (
          <Card key={group.key} padding={false}>
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-textprim capitalize">{group.label}</h2>
              <span className="text-xs text-textsec">
                {group.items.length} transferencia{group.items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {['Fecha', 'Realizó', 'Monto', 'Notas', 'Comprobante', 'Estado', ...(admin ? ['Verificación'] : []), ...(canEdit ? ['Acciones'] : [])].map((h, i) => (
                      <th key={i} className="table-header-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.items.map(t => (
                    <tr key={t.id} className="table-row-hover">
                      <td className="table-cell text-textsec text-xs whitespace-nowrap">{formatDate(t.created_at)}</td>
                      <td className="table-cell">
                        <span className="text-xs text-textprim font-medium">{t.remitente ?? '—'}</span>
                      </td>
                      <td className="table-cell font-bold text-orange whitespace-nowrap">{formatCurrency(t.monto, t.moneda)}</td>
                      <td className="table-cell text-textsec text-xs max-w-[200px] truncate">{t.notas || '—'}</td>
                      <td className="table-cell">
                        {comprobanteHref(t.comprobante_url) ? (
                          <a
                            href={comprobanteHref(t.comprobante_url)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-orange hover:underline"
                          >
                            Ver <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-textmuted text-xs">Sin comprobante</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {t.verified
                          ? <Badge color="success" dot>Verificada</Badge>
                          : <Badge color="warning" dot>Pendiente</Badge>
                        }
                      </td>
                      {admin && (
                        <td className="table-cell">
                          {t.verified ? (
                            <form action={async () => {
                              'use server'
                              await unverifyTransfer(t.id)
                            }}>
                              <button type="submit"
                                className="text-xs text-textsec hover:text-warning border border-border hover:border-warning/40 px-2.5 py-1 rounded-lg transition-colors">
                                Desmarcar
                              </button>
                            </form>
                          ) : (
                            <form action={async () => {
                              'use server'
                              await verifyTransfer(t.id)
                            }}>
                              <button type="submit"
                                className="inline-flex items-center gap-1 text-xs text-success border border-success/30 hover:bg-success/10 px-2.5 py-1 rounded-lg transition-colors font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Verificar
                              </button>
                            </form>
                          )}
                        </td>
                      )}
                      {canEdit && (
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/transferencias/${t.id}/editar`}
                              className="p-1.5 hover:bg-orange/10 hover:text-orange rounded-lg transition-colors text-textsec"
                              title="Editar transferencia"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                            <DeleteTransferButton id={t.id} />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
