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

function numOrNull(val: string): number | null {
  const n = parseInt(val)
  return isNaN(n) || val.trim() === '' ? null : n
}

export function AddVehicleToPriceListForm({ priceListId, vehicles }: Props) {
  const [vehicleId, setVehicleId] = useState('')
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [pLista, setPLista] = useState('')
  const [f12, setF12] = useState('')
  const [f18, setF18] = useState('')
  const [f24, setF24] = useState('')
  const [f30, setF30] = useState('')
  const [entrega, setEntrega] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selected = vehicles.find(v => v.id === vehicleId)

  async function handleAdd() {
    if (!vehicleId || !pLista) { setError('Seleccioná un vehículo e ingresá el Precio lista'); return }
    setLoading(true); setError('')
    const result = await addVehicleToPriceList(
      priceListId,
      vehicleId,
      {
        precio_1: numOrNull(p1),
        precio_2: numOrNull(p2),
        precio_lista: parseInt(pLista),
        precio_financiado_12: numOrNull(f12),
        precio_financiado_18: numOrNull(f18),
        precio_financiado_24: numOrNull(f24),
        precio_financiado_30: numOrNull(f30),
        entrega: numOrNull(entrega),
      },
      notas || undefined,
    )
    setLoading(false)
    if (result.error) setError(result.error)
    else {
      setVehicleId(''); setP1(''); setP2(''); setPLista('')
      setF12(''); setF18(''); setF24(''); setF30(''); setEntrega(''); setNotas('')
    }
  }

  return (
    <Card>
      <h3 className="font-semibold text-textprim mb-4">Agregar vehículo a la lista</h3>

      {/* Vehicle selector */}
      <div className="mb-4">
        <Select
          label="Vehículo disponible *"
          value={vehicleId}
          onChange={e => {
            setVehicleId(e.target.value)
            const v = vehicles.find(x => x.id === e.target.value)
            if (v) setPLista(String(v.precio_venta))
          }}
          options={vehicles.map(v => ({
            value: v.id,
            label: `${v.marca} ${v.modelo} ${v.anio}`,
          }))}
          placeholder="Seleccioná..."
        />
        {selected && (
          <p className="text-xs text-textsec mt-1">
            Precio de venta: <span className="text-orange font-semibold">{formatCurrency(selected.precio_venta)}</span>
          </p>
        )}
      </div>

      {/* List prices: 1, 2, lista */}
      <p className="text-xs font-semibold text-textsec uppercase tracking-wider mb-2">Precios de lista</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Input label="Precio 1 (Gs.)"     type="number" value={p1}     onChange={e => setP1(e.target.value)}     placeholder="0" />
        <Input label="Precio 2 (Gs.)"     type="number" value={p2}     onChange={e => setP2(e.target.value)}     placeholder="0" />
        <Input label="Precio lista (Gs.) *" type="number" value={pLista} onChange={e => setPLista(e.target.value)} placeholder="0" />
      </div>

      {/* Financed prices (total cost) + Entrega */}
      <p className="text-xs font-semibold text-textsec uppercase tracking-wider mb-2">Financiado (costo total)</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
        <Input label="Entrega (Gs.)"        type="number" value={entrega} onChange={e => setEntrega(e.target.value)} placeholder="0" />
        <Input label="12 cuotas (Gs. total)" type="number" value={f12}    onChange={e => setF12(e.target.value)}    placeholder="0" />
        <Input label="18 cuotas (Gs. total)" type="number" value={f18}    onChange={e => setF18(e.target.value)}    placeholder="0" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Input label="24 cuotas (Gs. total)" type="number" value={f24}    onChange={e => setF24(e.target.value)}    placeholder="0" />
        <Input label="30 cuotas (Gs. total)" type="number" value={f30}    onChange={e => setF30(e.target.value)}    placeholder="0" />
      </div>

      <Input label="Notas (opcional)" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Condición, etc." />

      {error && <p className="text-sm text-error mt-2">{error}</p>}
      <div className="mt-3 flex justify-end">
        <Button onClick={handleAdd} loading={loading} size="sm">
          <Plus className="w-3.5 h-3.5" /> Agregar
        </Button>
      </div>
    </Card>
  )
}
