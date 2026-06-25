import Link from 'next/link'
import { Plus, Phone, Mail, UserCheck, UserX, UserCog } from 'lucide-react'
import { getEmployees } from '@/lib/actions/employees'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils/format'

const CARGO_COLORS: Record<string, 'orange' | 'success' | 'default'> = {
  vendedor:       'orange',
  administrativo: 'success',
  gerente:        'default',
}

export default async function EmpleadosPage() {
  const employees = await getEmployees()
  const activos = employees.filter(e => e.activo).length

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Empleados</h1>
          <p className="text-sm text-textsec mt-0.5">
            <span className="text-success font-medium">{activos} activos</span>
            {' · '}
            {employees.length} total
          </p>
        </div>
        <Link href="/empleados/nuevo">
          <Button><Plus className="w-4 h-4" />Nuevo empleado</Button>
        </Link>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Sin empleados"
          description="Agregá el primer empleado al equipo."
          action={{ label: 'Nuevo empleado', href: '/empleados/nuevo' }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {employees.map(emp => (
            <Link key={emp.id} href={`/empleados/${emp.id}`}>
              <div className="
                bg-card border border-border rounded-2xl p-5 shadow-card
                hover:border-orange/40 hover:-translate-y-0.5 hover:shadow-orange-sm
                transition-all duration-300 cursor-pointer group
              ">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
                    font-display transition-all duration-300
                    ${emp.activo
                      ? 'bg-gradient-to-br from-orange/25 to-orange/10 text-orange border border-orange/20'
                      : 'bg-white/5 text-textsec border border-border'
                    }
                    group-hover:scale-105
                  `}>
                    {emp.nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="font-display font-semibold text-textprim text-sm truncate group-hover:text-orange transition-colors duration-200">
                        {emp.nombre}
                      </p>
                      {emp.activo
                        ? <UserCheck className="w-3.5 h-3.5 text-success flex-shrink-0" />
                        : <UserX className="w-3.5 h-3.5 text-error flex-shrink-0" />
                      }
                    </div>
                    <Badge color={CARGO_COLORS[emp.cargo] ?? 'default'} dot>
                      {emp.cargo}
                    </Badge>
                  </div>
                </div>

                {/* Contact info */}
                {(emp.telefono || emp.email) && (
                  <div className="flex flex-col gap-1.5 mb-4 pb-4 border-b border-border/60">
                    {emp.telefono && (
                      <div className="flex items-center gap-2 text-xs text-textsec">
                        <Phone className="w-3 h-3 text-textmuted flex-shrink-0" />
                        {emp.telefono}
                      </div>
                    )}
                    {emp.email && (
                      <div className="flex items-center gap-2 text-xs text-textsec">
                        <Mail className="w-3 h-3 text-textmuted flex-shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Financial info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="section-label mb-1">Salario base</p>
                    <p className="text-sm font-bold text-textprim">{formatCurrency(emp.salario_base)}</p>
                  </div>
                  <div>
                    <p className="section-label mb-1">Comisión</p>
                    <p className="text-sm font-bold text-orange">{emp.comision_porcentaje}%</p>
                  </div>
                </div>

                <p className="text-[10px] text-textmuted mt-3">Desde {formatDate(emp.fecha_ingreso)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
