import Link from 'next/link'
import { Plus, CheckCircle, Clock, ArrowDownCircle, ExternalLink } from 'lucide-react'
import { getTransfers, verifyTransfer, unverifyTransfer } from '@/lib/actions/transfers'
import { isAdmin } from '@/lib/auth/roles'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'

export default async function TransferenciasPage() {
  const [transfers, admin] = await Promise.all([getTransfers(), isAdmin()])

  const total        = transfers.reduce((s, t) => s + t.monto, 0)
  const pendientes   = transfers.filter(t => !t.verified).length
  const verificadas  = transfers.filter(t => t.verified).length

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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total registrado', value: formatCurrency(total), icon: ArrowDownCircle, color: 'text-orange' },
          { label: 'Pendientes',       value: String(pendientes),    icon: Clock,           color: 'text-warning' },
          { label: 'Verificadas',      value: String(verificadas),   icon: CheckCircle,     color: 'text-success' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 ${color}`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs text-textsec">{label}</p>
              <p className="font-display font-bold text-textprim text-lg leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display text-sm font-semibold text-textprim">Historial</h2>
        </div>

        {transfers.length === 0 ? (
          <div className="text-center py-16">
            <ArrowDownCircle className="w-10 h-10 text-textmuted mx-auto mb-3" />
            <p className="text-sm text-textsec">Sin transferencias registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Fecha', 'Monto', 'Notas', 'Comprobante', 'Estado', ...(admin ? ['Acción'] : [])].map((h, i) => (
                    <th key={i} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id} className="table-row-hover">
                    <td className="table-cell text-textsec text-xs whitespace-nowrap">{formatDate(t.created_at)}</td>
                    <td className="table-cell font-bold text-orange">{formatCurrency(t.monto)}</td>
                    <td className="table-cell text-textsec text-xs max-w-[200px] truncate">{t.notas || '—'}</td>
                    <td className="table-cell">
                      {t.comprobante_url ? (
                        <a
                          href={t.comprobante_url}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
