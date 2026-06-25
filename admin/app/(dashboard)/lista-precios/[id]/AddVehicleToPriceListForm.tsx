'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { addVehicleToPriceList } from '@/lib/actions/pricelists'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/format'
import type { Vehicle } from '@/types'

interface Props { priceListId: string; vehicles: Vehicle[] }

export function AddVehicleToPriceListForm({ priceListId, vehicles }: Props) {
  const [vehicleId, setVehicleId] = useState('')
  const [precio, setPrecio] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selected = vehicles.find(v => v.id === vehicleId)

  async function handleAdd() {
    if (!vehicleId || !precio) { setError('Seleccioná un vehículo e ingresá el precio'); return }
    setLoading(true)
    setError('')
    const result = await addVehicleToPriceList(priceListId, vehicleId, parseInt(precio), notas || undefined)
    setLoading(false)
    if (result.error) setError(result.error)
    else { setVehicleId(''); setPrecio(''); setNotas('') }
  }

  return (
    <Card>
      <h3 className="font-semibold text-textprim mb-4">Agregar vehículo a la lista</h3>
      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <Select
          label="Vehículo disponible"
          value={vehicleId}
          onChange={e => {
            setVehicleId(e.target.value)
            const v = vehicles.find(x => x.id === e.target.value)
            if (v) setPrecio(String(v.precio_venta))
          }}
          options={vehicles.map(v => ({
            value: v.id,
            label: `${v.marca} ${v.modelo} ${v.anio}`,
          }))}
          placeholder="Seleccioná..."
        />
        <Input
          label={`Precio lista (Gs.)${selected ? ` · Venta: ${formatCurrency(selected.precio_venta)}` : ''}`}
          type="number"
          value={precio}
          onChange={e => setPrecio(e.target.value)}
          placeholder="0"
        />
        <Input
          label="Notas (opcional)"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Condición, etc."
        />
      </div>
      {error && (
        <p className="text-sm text-error mt-2">{error}</p>
      )}
      <div className="mt-3 flex justify-end">
        <Button onClick={handleAdd} loading={loading} size="sm">
          <Plus className="w-3.5 h-3.5" />Agregar
        </Button>
      </div>
    </Card>
  )
}
