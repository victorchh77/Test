import Link from 'next/link'
import { getAllExpenses } from '@/lib/actions/expenses'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { EXPENSE_TYPES } from '@/lib/utils/constants'
import { Receipt } from 'lucide-react'

export default async function GastosPage() {
  const expenses = await getAllExpenses() as Array<{
    id: string; vehicle_id: string; tipo: string; descripcion: string | null;
    monto: number; fecha: string; vehicles: { marca: string; modelo: string; anio: number } | null
  }>

  const total = expenses.reduce((a, e) => a + e.monto, 0)

  const byType = EXPENSE_TYPES.map(t => ({
    ...t,
    total: expenses.filter(e => e.tipo === t.value).reduce((a, e) => a + e.monto, 0),
    count: expenses.filter(e => e.tipo === t.value).length,
  }))

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Gastos</h1>
          <p className="text-sm text-textsec mt-0.5">
            {expenses.length} gasto{expenses.length !== 1 ? 's' : ''} ·{' '}
            Total: <span className="text-error font-medium">{formatCurrency(total)}</span>
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {byType.map(t => (
          <div key={t.value} className="
            bg-card border border-border rounded-2xl p-4
            hover:border-border-bright transition-all duration-200
          ">
            <p className="section-label mb-2">{t.label}</p>
            <p className="font-display text-base font-bold text-error">{formatCurrency(t.total)}</p>
            <p className="text-xs text-textmuted mt-1">{t.count} registro{t.count !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-error" />
          </div>
          <h2 className="font-display text-sm font-semibold text-textprim">Todos los gastos</h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Vehículo', 'Tipo', 'Descripción', 'Fecha', 'Monto', 'Detalle'].map(h => (
                  <th key={h} className="table-header-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-textsec">Sin gastos registrados</td>
                </tr>
              ) : expenses.map(e => (
                <tr key={e.id} className="table-row-hover">
                  <td className="table-cell">
                    {e.vehicles
                      ? <span className="font-semibold text-textprim">{e.vehicles.marca} {e.vehicles.modelo} {e.vehicles.anio}</span>
                      : <span className="text-textsec">—</span>
                    }
                  </td>
                  <td className="table-cell">
                    <Badge color="orange">{EXPENSE_TYPES.find(t => t.value === e.tipo)?.label ?? e.tipo}</Badge>
                  </td>
                  <td className="table-cell text-textsec">{e.descripcion || '—'}</td>
                  <td className="table-cell text-textsec text-xs whitespace-nowrap">{formatDate(e.fecha)}</td>
                  <td className="table-cell font-bold text-error">{formatCurrency(e.monto)}</td>
                  <td className="table-cell">
                    <Link href={`/vehiculos/${e.vehicle_id}`}>
                      <Button variant="ghost" size="sm">Ver auto</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
