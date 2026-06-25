import Link from 'next/link'
import { Plus, Phone, Mail, UserCheck, UserX } from 'lucide-react'
import { getEmployees } from '@/lib/actions/employees'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
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
          <h1 className="text-xl font-bold text-textprim">Empleados</h1>
          <p className="text-sm text-textsec">{activos} activos · {employees.length} total</p>
        </div>
        <Link href="/empleados/nuevo">
          <Button><Plus className="w-4 h-4" />Nuevo empleado</Button>
        </Link>
      </div>

      {employees.length === 0 ? (
        <Card>
          <p className="text-sm text-textsec text-center py-12">No hay empleados registrados</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {employees.map(emp => (
            <Link key={emp.id} href={`/empleados/${emp.id}`}>
              <Card className="hover:border-orange/40 transition-all duration-200 cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                    ${emp.activo ? 'bg-orange/20 text-orange' : 'bg-white/5 text-textsec'}`}>
                    {emp.nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-textprim text-sm truncate group-hover:text-orange transition-colors">
                        {emp.nombre}
                      </p>
                      {emp.activo
                        ? <UserCheck className="w-3.5 h-3.5 text-success flex-shrink-0" />
                        : <UserX className="w-3.5 h-3.5 text-error flex-shrink-0" />
                      }
                    </div>
                    <Badge color={CARGO_COLORS[emp.cargo] ?? 'default'}>
                      {emp.cargo}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1.5">
                  {emp.telefono && (
                    <div className="flex items-center gap-2 text-xs text-textsec">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{emp.telefono}</span>
                    </div>
                  )}
                  {emp.email && (
                    <div className="flex items-center gap-2 text-xs text-textsec">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-textsec uppercase tracking-wide">Salario base</p>
                    <p className="text-sm font-semibold text-textprim">{formatCurrency(emp.salario_base)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-textsec uppercase tracking-wide">Comisión</p>
                    <p className="text-sm font-semibold text-orange">{emp.comision_porcentaje}%</p>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-[10px] text-textsec">Desde {formatDate(emp.fecha_ingreso)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
