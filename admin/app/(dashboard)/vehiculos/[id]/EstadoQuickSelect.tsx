'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { updateVehicleEstado } from '@/lib/actions/vehicles'
import type { VehicleStatus } from '@/types'

const OPTIONS: { value: VehicleStatus; label: string }[] = [
  { value: 'Disponible', label: 'Disponible' },
  { value: 'Reservado',  label: 'Reservado' },
  { value: 'Vendido',    label: 'Vendido' },
]

export function EstadoQuickSelect({ vehicleId, estado }: { vehicleId: string; estado: VehicleStatus }) {
  const router = useRouter()
  const [value, setValue] = useState(estado)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleChange(next: VehicleStatus) {
    if (next === value) return
    const prev = value
    setValue(next)
    setError(null)
    startTransition(async () => {
      const res = await updateVehicleEstado(vehicleId, next)
      if (res.error) {
        setValue(prev)
        setError(res.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative inline-flex items-center">
        <select
          value={value}
          disabled={pending}
          onChange={e => handleChange(e.target.value as VehicleStatus)}
          className="input-base appearance-none cursor-pointer py-1.5 pr-7 text-xs font-medium disabled:opacity-60"
        >
          {OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {pending && <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2 text-textsec pointer-events-none" />}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
