'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { Search, Loader2, Check } from 'lucide-react'
import { updateVehiclePrecioVenta } from '@/lib/actions/vehicles'
import { Badge } from '@/components/ui/Badge'
import type { Vehicle, VehicleStatus } from '@/types'

type VehicleRow = Vehicle & { mainPhotoUrl?: string | null }

const statusBadge: Record<VehicleStatus, 'success' | 'warning' | 'error'> = {
  Disponible: 'success',
  Reservado:  'warning',
  Vendido:    'error',
}

function PriceCell({ vehicle }: { vehicle: VehicleRow }) {
  const [value, setValue] = useState(String(vehicle.precio_venta))
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  function save() {
    setErrorMsg('')
    const n = parseInt(value, 10)
    if (!n || n === vehicle.precio_venta) {
      setValue(String(vehicle.precio_venta))
      return
    }
    startTransition(async () => {
      const res = await updateVehiclePrecioVenta(vehicle.id, n)
      if (res.error) {
        setErrorMsg(res.error)
        setValue(String(vehicle.precio_venta))
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-full sm:w-36 bg-card-elevated border border-border rounded-lg px-2.5 py-1.5 text-sm text-textprim tabular-nums focus:outline-none focus:border-orange/60"
        />
        {pending && <Loader2 className="w-3.5 h-3.5 animate-spin text-textmuted flex-shrink-0" />}
        {!pending && saved && <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />}
      </div>
      {errorMsg && <p className="text-[11px] text-error">{errorMsg}</p>}
    </div>
  )
}

export function PreciosEditor({ vehicles }: { vehicles: VehicleRow[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return vehicles
    return vehicles.filter(v =>
      `${v.marca} ${v.modelo} ${v.anio} ${v.color ?? ''}`.toLowerCase().includes(term),
    )
  }, [vehicles, search])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-textmuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar marca, modelo, color..."
          className="input-base pl-9"
        />
      </div>

      <p className="text-xs text-textsec">
        {filtered.length} vehículo{filtered.length !== 1 ? 's' : ''} · el precio se guarda solo al salir del campo
      </p>

      {/* Vista móvil: tarjetas */}
      <div className="md:hidden flex flex-col gap-2">
        {filtered.map(v => (
          <div key={v.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-14 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-card-elevated border border-border">
              {v.mainPhotoUrl ? (
                <Image src={v.mainPhotoUrl} alt="" width={56} height={44} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-textmuted text-[8px]">Sin foto</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-textprim truncate">{v.marca} {v.modelo} {v.anio}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge color={statusBadge[v.estado]} dot>{v.estado}</Badge>
                <span className="text-[11px] text-textsec">{v.color || '—'} · {v.moneda}</span>
              </div>
            </div>
            <PriceCell vehicle={v} />
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-textsec text-center py-8">Sin resultados.</p>}
      </div>

      {/* Vista escritorio: tabla */}
      <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Vehículo', 'Color', 'Estado', 'Moneda', 'Precio de venta'].map(h => (
                  <th key={h} className="table-header-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="table-row-hover">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-card-elevated border border-border">
                        {v.mainPhotoUrl ? (
                          <Image src={v.mainPhotoUrl} alt="" width={48} height={36} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-textmuted text-[7px]">Sin foto</div>
                        )}
                      </div>
                      <span className="font-semibold text-textprim">{v.marca} {v.modelo} {v.anio}</span>
                    </div>
                  </td>
                  <td className="table-cell text-textsec">{v.color || '—'}</td>
                  <td className="table-cell"><Badge color={statusBadge[v.estado]} dot>{v.estado}</Badge></td>
                  <td className="table-cell text-textsec">{v.moneda}</td>
                  <td className="table-cell"><PriceCell vehicle={v} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-sm text-textsec text-center py-8">Sin resultados.</p>}
      </div>
    </div>
  )
}
