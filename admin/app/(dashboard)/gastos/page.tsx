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
  }))

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textprim">Gastos</h1>
          <p className="text-sm text-textsec">{expenses.length} gastos · Total: {formatCurrency(total)}</p>
        </div>
      </div>

      {/* Summary by type */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {byType.map(t => (
          <div key={t.value} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-textsec mb-1">{t.label}</p>
            <p className="text-sm font-bold text-textprim">{formatCurrency(t.total)}</p>
          </div>
        ))}
      </div>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Receipt className="w-4 h-4 text-textsec" />
          <h2 className="text-sm font-semibold text-textprim">Todos los gastos</h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Vehículo', 'Tipo', 'Descripción', 'Fecha', 'Monto', 'Detalle'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-medium text-textsec uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-textsec">Sin gastos registrados</td>
                </tr>
              ) : expenses.map(e => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    {e.vehicles
                      ? <span className="font-medium text-textprim">{e.vehicles.marca} {e.vehicles.modelo} {e.vehicles.anio}</span>
                      : <span className="text-textsec">—</span>
                    }
                  </td>
                  <td className="py-3 px-4">
                    <Badge color="orange">{EXPENSE_TYPES.find(t => t.value === e.tipo)?.label ?? e.tipo}</Badge>
                  </td>
                  <td className="py-3 px-4 text-textsec">{e.descripcion || '—'}</td>
                  <td className="py-3 px-4 text-textsec text-xs">{formatDate(e.fecha)}</td>
                  <td className="py-3 px-4 font-semibold text-error">{formatCurrency(e.monto)}</td>
                  <td className="py-3 px-4">
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
