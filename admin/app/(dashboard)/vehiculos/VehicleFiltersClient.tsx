'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MARCAS } from '@/lib/utils/constants'
import type { VehicleFilters } from '@/types'
import { X } from 'lucide-react'

export function VehicleFiltersClient({ current }: { current: VehicleFilters }) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key: string, value: string) {
    const params = new URLSearchParams(current as Record<string, string>)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  function clear() { router.push(pathname) }

  const hasFilters = Object.values(current).some(Boolean)

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-36">
        <Select
          label="Marca"
          value={current.marca ?? ''}
          onChange={e => update('marca', e.target.value)}
          options={MARCAS.map(m => ({ value: m, label: m }))}
          placeholder="Todas las marcas"
        />
      </div>
      <div className="flex-1 min-w-36">
        <Select
          label="Estado"
          value={current.estado ?? ''}
          onChange={e => update('estado', e.target.value)}
          options={[
            { value: 'Disponible', label: 'Disponible' },
            { value: 'Reservado',  label: 'Reservado' },
            { value: 'Vendido',    label: 'Vendido' },
          ]}
          placeholder="Todos los estados"
        />
      </div>
      <div className="flex-1 min-w-48">
        <Input
          label="Buscar"
          value={current.search ?? ''}
          onChange={e => update('search', e.target.value)}
          placeholder="Marca o modelo…"
        />
      </div>
      {hasFilters && (
        <Button variant="secondary" size="sm" onClick={clear}>
          <X className="w-3.5 h-3.5" /> Limpiar
        </Button>
      )}
    </div>
  )
}
