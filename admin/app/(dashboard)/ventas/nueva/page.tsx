'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { saleSchema, type SaleFormData } from '@/lib/validations/sale'
import { createSale } from '@/lib/actions/sales'
import { getVehicles } from '@/lib/actions/vehicles'
import { getClients } from '@/lib/actions/clients'
import { getVehicleExpenses } from '@/lib/actions/vehicles'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency, calcRentabilidad } from '@/lib/utils/format'
import type { Vehicle, Client } from '@/types'

export default function NuevaVentaPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [clients, setClients]   = useState<Client[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [totalGastos, setTotalGastos] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SaleFormData, unknown, SaleFormData>({
    resolver: zodResolver(saleSchema) as any,
    defaultValues: {
      fecha_venta: new Date().toISOString().split('T')[0],
      comision: 0,
    },
  })

  const watchedVehicleId   = watch('vehicle_id')
  const watchedPrecioFinal = watch('precio_final')

  useEffect(() => {
    Promise.all([
      getVehicles({ estado: 'Disponible' }),
      getClients(),
    ]).then(([v, c]) => { setVehicles(v); setClients(c) })
  }, [])

  useEffect(() => {
    if (!watchedVehicleId) { setSelectedVehicle(null); return }
    const v = vehicles.find(x => x.id === watchedVehicleId)
    setSelectedVehicle(v ?? null)
    if (v) {
      setValue('precio_final', v.precio_venta)
      getVehicleExpenses(v.id).then(exp => {
        setTotalGastos(exp.reduce((a, e) => a + e.monto, 0))
      })
    }
  }, [watchedVehicleId, vehicles, setValue])

  const rentabilidad = selectedVehicle
    ? calcRentabilidad(watchedPrecioFinal || 0, selectedVehicle.precio_compra, totalGastos)
    : null

  async function onSubmit(data: SaleFormData) {
    setLoading(true)
    setError('')
    const result = await createSale(data)
    setLoading(false)
    if (result.error) setError(result.error)
    else router.push('/ventas')
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/ventas">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-textprim">Registrar venta</h1>
          <p className="text-sm text-textsec">Completá los datos de la venta</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Select
            {...register('vehicle_id')}
            label="Vehículo *"
            options={vehicles.map(v => ({
              value: v.id,
              label: `${v.marca} ${v.modelo} ${v.anio} — ${formatCurrency(v.precio_venta)}`,
            }))}
            placeholder="Seleccioná un vehículo disponible"
            error={errors.vehicle_id?.message}
          />

          {selectedVehicle && (
            <div className={`rounded-xl p-4 border flex items-center gap-3 ${
              rentabilidad !== null && rentabilidad >= 0
                ? 'bg-success/5 border-success/30'
                : 'bg-error/5 border-error/30'
            }`}>
              <TrendingUp className={`w-5 h-5 flex-shrink-0 ${rentabilidad !== null && rentabilidad >= 0 ? 'text-success' : 'text-error'}`} />
              <div className="text-sm">
                <p className="text-textsec">
                  Compra: <span className="text-textprim">{formatCurrency(selectedVehicle.precio_compra)}</span>
                  {' '}· Gastos: <span className="text-textprim">{formatCurrency(totalGastos)}</span>
                </p>
                <p className="font-semibold mt-0.5">
                  Ganancia estimada:{' '}
                  <span className={rentabilidad !== null && rentabilidad >= 0 ? 'text-success' : 'text-error'}>
                    {rentabilidad !== null ? (rentabilidad >= 0 ? '+' : '') + formatCurrency(rentabilidad) : '—'}
                  </span>
                </p>
              </div>
            </div>
          )}

          <Select
            {...register('client_id')}
            label="Cliente *"
            options={clients.map(c => ({ value: c.id, label: c.nombre + (c.telefono ? ` (${c.telefono})` : '') }))}
            placeholder="Seleccioná un cliente"
            error={errors.client_id?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('precio_final')}
              label="Precio final (Gs.) *"
              type="number"
              error={errors.precio_final?.message}
            />
            <Input
              {...register('comision')}
              label="Comisión vendedor (Gs.)"
              type="number"
              defaultValue="0"
            />
          </div>

          <Input {...register('fecha_venta')} label="Fecha de venta *" type="date" error={errors.fecha_venta?.message} />
          <Textarea {...register('notas')} label="Notas" placeholder="Condiciones de pago, observaciones…" />

          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Link href="/ventas">
              <Button variant="secondary">Cancelar</Button>
            </Link>
            <Button type="submit" loading={loading}>Registrar venta</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
