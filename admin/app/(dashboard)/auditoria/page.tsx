import { redirect } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { getAuditLog } from '@/lib/actions/audit'
import { getSessionProfile } from '@/lib/auth/roles'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDatetime } from '@/lib/utils/format'

const ACTION_LABELS: Record<string, string> = {
  'transfer.verify':             'Verificó transferencia',
  'transfer.unverify':           'Desmarcó verificación de transferencia',
  'transfer.update':             'Editó transferencia',
  'transfer.delete':             'Eliminó transferencia',
  'pares_contract.update':       'Editó contrato de pagaré',
  'pares_contract.delete':       'Eliminó contrato de pagaré',
  'pares_contract.activate':     'Activó contrato de pagaré',
  'pares_contract.deactivate':   'Desactivó contrato de pagaré',
  'pares_cuota.delete':          'Eliminó una cuota',
  'user.delete':                 'Eliminó un usuario',
  'user.activate':               'Reactivó un usuario',
  'user.deactivate':             'Desactivó un usuario',
  'vehicle.delete':              'Eliminó un vehículo',
}

function actionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action]
  if (action.startsWith('user.role_change:')) return `Cambió el rol a "${action.split(':')[1]}"`
  return action
}

export default async function AuditoriaPage() {
  const profile = await getSessionProfile()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const entries = await getAuditLog()

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Auditoría</h1>
        <p className="text-sm text-textsec mt-0.5">
          Registro de acciones sensibles: quién hizo qué, cuándo y desde qué IP.
        </p>
      </div>

      <Card padding={false}>
        {entries.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="Sin registros todavía"
            description="Las próximas acciones sensibles (verificar/editar/eliminar) van a aparecer acá."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Fecha', 'Usuario', 'Acción', 'Entidad', 'IP'].map((h, i) => (
                    <th key={i} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="table-row-hover">
                    <td className="table-cell text-textsec text-xs whitespace-nowrap">{formatDatetime(e.created_at)}</td>
                    <td className="table-cell font-medium text-textprim whitespace-nowrap">{e.actor_name ?? '—'}</td>
                    <td className="table-cell text-textprim">{actionLabel(e.action)}</td>
                    <td className="table-cell text-textsec text-xs">
                      <span className="text-textmuted">{e.entity_type}</span>
                      {e.entity_id && <span className="font-mono"> · {e.entity_id.slice(0, 8)}</span>}
                    </td>
                    <td className="table-cell text-textsec text-xs font-mono whitespace-nowrap">{e.ip_address ?? '—'}</td>
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
