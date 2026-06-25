import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Calendar, DollarSign, TrendingUp, ShoppingBag, Edit, ArrowUpRight } from 'lucide-react'
import {
  getEmployee, getEmployeeSales, getEmployeePayments, getEmployeeSalaryHistory,
} from '@/lib/actions/employees'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatCurrency, formatDate, formatDatetime } from '@/lib/utils/format'
import { RegisterPaymentModal } from './RegisterPaymentModal'

const TIPO_LABEL: Record<string, string> = {
  salario: 'Salario', comision: 'Comisión', aguinaldo: 'Aguinaldo',
  adelanto: 'Adelanto', bonificacion: 'Bonificación', otro: 'Otro',
}

export default async function EmpleadoDetailPage({ params }: { params: { id: string } }) {
  const [employee, sales, payments, salaryHistory] = await Promise.all([
    getEmployee(params.id),
    getEmployeeSales(params.id),
    getEmployeePayments(params.id),
    getEmployeeSalaryHistory(params.id),
  ])

  if (!employee) notFound()

  const totalVentas     = sales.reduce((a: number, s: any) => a + s.precio_final, 0)
  const totalComisiones = sales.reduce((a: number, s: any) => a + (s.comision ?? 0), 0)
  const totalPagado     = payments.reduce((a: number, p: any) => a + p.monto, 0)

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/empleados">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base
              ${employee.activo ? 'bg-orange/20 text-orange' : 'bg-white/5 text-textsec'}`}>
              {employee.nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-textprim">{employee.nombre}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge color={employee.activo ? 'success' : 'error'}>
                  {employee.activo ? 'Activo' : 'Inactivo'}
                </Badge>
                <Badge color="orange">{employee.cargo}</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RegisterPaymentModal employeeId={employee.id} salarioBase={employee.salario_base} />
          <Link href={`/empleados/${employee.id}/editar`}>
            <Button variant="secondary" size="sm"><Edit className="w-3.5 h-3.5" />Editar</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <ShoppingBag className="w-5 h-5 text-orange mx-auto mb-1" />
          <p className="text-2xl font-bold text-textprim">{sales.length}</p>
          <p className="text-xs text-textsec mt-0.5">Ventas totales</p>
        </Card>
        <Card className="text-center">
          <DollarSign className="w-5 h-5 text-textprim mx-auto mb-1" />
          <p className="text-lg font-bold text-textprim">{formatCurrency(totalVentas)}</p>
          <p className="text-xs text-textsec mt-0.5">Total facturado</p>
        </Card>
        <Card className="text-center">
          <DollarSign className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-lg font-bold text-warning">{formatCurrency(totalComisiones)}</p>
          <p className="text-xs text-textsec mt-0.5">Comisiones generadas</p>
        </Card>
        <Card className="text-center">
          <DollarSign className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-lg font-bold text-success">{formatCurrency(totalPagado)}</p>
          <p className="text-xs text-textsec mt-0.5">Total pagado</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Información personal" />
          <div className="flex flex-col gap-3">
            {employee.documento && (
              <div>
                <p className="text-[10px] text-textsec uppercase tracking-wide mb-0.5">Documento</p>
                <p className="text-sm text-textprim">{employee.documento}</p>
              </div>
            )}
            {employee.telefono && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-3.5 h-3.5 text-textsec flex-shrink-0" />
                <span className="text-textprim">{employee.telefono}</span>
              </div>
            )}
            {employee.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-3.5 h-3.5 text-textsec flex-shrink-0" />
                <span className="text-textprim">{employee.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-3.5 h-3.5 text-textsec flex-shrink-0" />
              <span className="text-textsec">Ingresó el {formatDate(employee.fecha_ingreso)}</span>
            </div>
            {employee.notas && (
              <div className="mt-1 pt-3 border-t border-border">
                <p className="text-xs text-textsec">{employee.notas}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Compensación" />
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] text-textsec uppercase tracking-wide mb-1">Salario base mensual</p>
              <p className="text-xl font-bold text-textprim">{formatCurrency(employee.salario_base)}</p>
            </div>
            <div>
              <p className="text-[10px] text-textsec uppercase tracking-wide mb-1">Comisión por venta</p>
              <p className="text-xl font-bold text-orange">{employee.comision_porcentaje}%</p>
            </div>
          </div>
        </Card>

        {/* Salary history */}
        <Card>
          <CardHeader title="Historial de sueldo" />
          {salaryHistory.length === 0 ? (
            <p className="text-sm text-textsec text-center py-6">Sin cambios de sueldo registrados</p>
          ) : (
            <div className="flex flex-col gap-3">
              {salaryHistory.map((h: any) => {
                const subio = h.salario_nuevo > h.salario_anterior
                return (
                  <div key={h.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-textsec text-xs">{formatDate(h.created_at)}</p>
                      <p className="text-textprim">
                        {formatCurrency(h.salario_anterior)} → {formatCurrency(h.salario_nuevo)}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${subio ? 'text-success' : 'text-error'}`}>
                      <ArrowUpRight className={`w-3.5 h-3.5 ${subio ? '' : 'rotate-90'}`} />
                      {subio ? '+' : ''}{formatCurrency(h.salario_nuevo - h.salario_anterior)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Payments */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-textprim">Pagos realizados</h2>
            <p className="text-xs text-textsec">{payments.length} pagos · Total {formatCurrency(totalPagado)}</p>
          </div>
          <RegisterPaymentModal employeeId={employee.id} salarioBase={employee.salario_base} />
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-textsec text-center py-8">Sin pagos registrados todavía</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Fecha</th>
                <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Tipo</th>
                <th className="text-left py-2 px-1 text-xs text-textsec font-medium">Notas</th>
                <th className="text-right py-2 px-1 text-xs text-textsec font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} className="border-b border-border/40 hover:bg-white/[0.02]">
                  <td className="py-2.5 px-1 text-textsec text-xs">{formatDate(p.fecha)}</td>
                  <td className="py-2.5 px-1"><Badge color="orange">{TIPO_LABEL[p.tipo] ?? p.tipo}</Badge></td>
                  <td className="py-2.5 px-1 text-textsec">{p.notas || '—'}</td>
                  <td className="py-2.5 px-1 text-right font-medium text-textprim">{formatCurrency(p.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Sales */}
      <Card>
        <CardHeader title="Ventas realizadas" />
        {sales.length === 0 ? (
          <p className="text-sm text-textsec text-center py-6">Sin ventas registradas</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sales.slice(0, 10).map((s: any) => (
              <div key={s.id} className="flex justify-between items-start text-sm border-b border-border/40 pb-2 last:border-0">
                <div>
                  <p className="text-textprim font-medium">{s.marca} {s.modelo}</p>
                  <p className="text-xs text-textsec">{formatDate(s.fecha_venta)} · {s.client_nombre}</p>
                </div>
                <p className="text-textprim">{formatCurrency(s.precio_final)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
