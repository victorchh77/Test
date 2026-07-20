import { redirect } from 'next/navigation'
import { Users, Mail, AtSign, Calendar, ShieldCheck, UserRound, FileText } from 'lucide-react'
import { getUsersWithEmail } from '@/lib/actions/admin-users'
import { getSessionProfile } from '@/lib/auth/roles'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils/format'
import { RoleSelect, RoleBadge } from './RoleSelect'
import { CreateUserForm } from './CreateUserForm'
import { DeleteUserButton } from './DeleteUserButton'
import { ToggleActiveButton } from './ToggleActiveButton'
import type { Role } from '@/types'

export default async function UsuariosPage() {
  const profile = await getSessionProfile()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const users = await getUsersWithEmail()

  const counts = {
    admin:      users.filter(u => u.role === 'admin').length,
    secretaria: users.filter(u => u.role === 'secretaria').length,
    vendedor:   users.filter(u => u.role === 'vendedor').length,
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Usuarios</h1>
        <p className="text-sm text-textsec mt-0.5">{users.length} cuenta{users.length !== 1 ? 's' : ''} registrada{users.length !== 1 ? 's' : ''}</p>
      </div>

      <CreateUserForm />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Administradores" value={counts.admin}      icon={ShieldCheck} color="orange"  />
        <StatCard title="Secretarías"     value={counts.secretaria} icon={FileText}    color="default" />
        <StatCard title="Vendedores"      value={counts.vendedor}   icon={UserRound}   color="success" />
      </div>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange/10 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-orange" />
          </div>
          <h2 className="font-display text-sm font-semibold text-textprim">Cuentas del sistema</h2>
        </div>

        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin usuarios"
            description="No hay cuentas registradas en el sistema."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Usuario', 'Email', 'Username', 'Rol actual', 'Cambiar rol', 'Estado', 'Registrado', 'Eliminar'].map((h, i) => (
                    <th key={i} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const initials = u.full_name
                    ? u.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                    : u.email[0].toUpperCase()
                  const isSelf = u.id === profile.id

                  return (
                    <tr key={u.id} className={`table-row-hover ${isSelf ? 'bg-orange/[0.03]' : ''}`}>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                            font-display font-bold text-sm
                            ${u.role === 'admin'      ? 'bg-orange/20 text-orange'
                            : u.role === 'secretaria' ? 'bg-purple-500/20 text-purple-400'
                            :                           'bg-blue-500/20 text-blue-400'}
                          `}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-textprim leading-tight">
                              {u.full_name || <span className="text-textmuted italic">Sin nombre</span>}
                            </p>
                            {isSelf && <p className="text-[10px] text-orange">Tu cuenta</p>}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5 text-textsec text-xs">
                          <Mail className="w-3 h-3 flex-shrink-0 text-textmuted" />
                          {u.email}
                        </div>
                      </td>
                      <td className="table-cell">
                        {u.username ? (
                          <div className="flex items-center gap-1 text-textsec text-xs">
                            <AtSign className="w-3 h-3 text-textmuted" />
                            {u.username}
                          </div>
                        ) : (
                          <span className="text-textmuted text-xs">—</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <RoleBadge role={u.role as Role} />
                      </td>
                      <td className="table-cell">
                        <RoleSelect userId={u.id} currentRole={u.role as Role} isSelf={isSelf} />
                      </td>
                      <td className="table-cell">
                        <ToggleActiveButton
                          userId={u.id}
                          label={u.full_name || u.email}
                          activo={u.activo}
                          isSelf={isSelf}
                        />
                      </td>
                      <td className="table-cell text-textsec text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-textmuted" />
                          {formatDate(u.created_at)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <DeleteUserButton userId={u.id} label={u.full_name || u.email} isSelf={isSelf} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-xs text-textmuted text-center">
        Los cambios de rol se aplican de inmediato. El usuario verá el nuevo acceso en su próxima sesión.
      </p>
    </div>
  )
}
