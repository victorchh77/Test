'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, TrendingUp, TrendingDown, UserPlus, Users, UserX } from 'lucide-react'
import { saleSchema, type SaleFormData } from '@/lib/validations/sale'
import { createSale } from '@/lib/actions/sales'
import { getVehicles, getVehicleExpenses } from '@/lib/actions/vehicles'
import { getClients, createClient_ } from '@/lib/actions/clients'
import { getEmployees } from '@/lib/actions/employees'
import { getProfile } from '@/lib/actions/auth'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatCurrency, calcRentabilidad } from '@/lib/utils/format'
import type { Vehicle, Client, Employee } from '@/types'

type ClientMode = 'existing' | 'new' | 'none'

export default function NuevaVentaPage() {
  const router = useRouter()
  const [vehicles, setVehicles]   = useState<Vehicle[]>([])
  const [clients, setClients]     = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [totalGastos, setTotalGastos]         = useState(0)
  const [admin, setAdmin]                     = useState(false)
  const [myEmployeeId, setMyEmployeeId]       = useState<string>('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')

  // Client mode
  const [clientMode, setClientMode]         = useState<ClientMode>('existing')
  const [newClientNombre, setNewClientNombre]   = useState('')
  const [newClientTelefono, setNewClientTelefono] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SaleFormData, unknown, SaleFormData>({
    resolver: zodResolver(saleSchema) as any,
    defaultValues: {
      fecha_venta: new Date().toISOString().split('T')[0],
    },
  })

  const watchedVehicleId   = watch('vehicle_id')
  const watchedPrecioFinal = watch('precio_final')
  const watchedEsPermuta   = watch('es_permuta')

  useEffect(() => {
    Promise.all([
      getVehicles({ estado: 'Disponible' }),
      getClients(),
      getEmployees(),
      getProfile(),
    ]).then(([v, c, e, p]) => {
      setVehicles(v)
      setClients(c)
      const active = (e as Employee[]).filter(emp => emp.activo)
      setEmployees(active)
      const isAdminUser = (p as any)?.role === 'admin'
      setAdmin(isAdminUser)
      // If vendedor: auto-find and lock their employee record
      if (!isAdminUser && p) {
        const mine = active.find(emp => emp.profile_id === (p as any).id)
        if (mine) {
          setMyEmployeeId(mine.id)
          setValue('vendedor_id', mine.id)
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!watchedVehicleId) { setSelectedVehicle(null); return }
    const v = vehicles.find(x => x.id === watchedVehicleId)
    setSelectedVehicle(v ?? null)
    if (v) {
      setValue('precio_final', v.precio_venta)
      getVehicleExpenses(v.id).then(exp => {
        setTotalGastos(exp.reduce((a: number, e: any) => a + e.monto, 0))
      })
    }
  }, [watchedVehicleId, vehicles, setValue])

  const rentabilidad = selectedVehicle
    ? calcRentabilidad(watchedPrecioFinal || 0, selectedVehicle.precio_compra, totalGastos)
    : null
  const gananciaPos = rentabilidad !== null && rentabilidad >= 0

  async function onSubmit(data: SaleFormData) {
    setLoading(true)
    setError('')

    // Resolve client_id depending on mode
    let clientId: string | undefined = data.client_id
    if (clientMode === 'new') {
      if (!newClientNombre.trim()) {
        setError('El nombre del cliente es requerido')
        setLoading(false)
        return
      }
      const res = await createClient_({ nombre: newClientNombre.trim(), telefono: newClientTelefono.trim() || undefined })
      if (res.error) { setError(res.error); setLoading(false); return }
      clientId = res.data?.id
    } else if (clientMode === 'none') {
      clientId = undefined
    }

    const result = await createSale({ ...data, client_id: clientId })
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
          <h1 className="font-display text-xl font-bold text-textprim tracking-tight">Registrar venta</h1>
          <p className="text-sm text-textsec">Completá los datos de la venta</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* Vehicle */}
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

          {/* Precio de lista (referencia) + precio final editable */}
          {selectedVehicle && (
            <div className="flex items-center justify-between bg-[#0B1220] border border-border rounded-xl px-4 py-3">
              <span className="text-xs text-textsec">Precio de lista</span>
              <span className="font-medium text-textsec text-sm">
                {formatCurrency(selectedVehicle.precio_venta)}
              </span>
            </div>
          )}

          <Input
            {...register('precio_final')}
            label="Precio final de venta *"
            type="number"
            hint="Se autocompleta con el precio de lista — editalo si la venta se cerró por otro monto."
            error={errors.precio_final?.message}
          />

          {/* Admin-only profitability panel */}
          {selectedVehicle && admin && (
            <div className={`rounded-xl p-4 border flex items-start gap-3 ${
              gananciaPos ? 'bg-success/5 border-success/30' : 'bg-error/5 border-error/30'
            }`}>
              {gananciaPos
                ? <TrendingUp  className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                : <TrendingDown className="w-5 h-5 text-error   flex-shrink-0 mt-0.5" />
              }
              <div className="text-sm flex-1">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="section-label mb-0.5">P. Compra</p>
                    <p className="font-medium text-textprim">{formatCurrency(selectedVehicle.precio_compra)}</p>
                  </div>
                  <div>
                    <p className="section-label mb-0.5">Gastos</p>
                    <p className="font-medium text-textprim">{formatCurrency(totalGastos)}</p>
                  </div>
                </div>
                <div className="border-t border-current/20 pt-2 flex justify-between items-center">
                  <span className="text-textsec">Ganancia estimada</span>
                  <span className={`text-lg font-bold ${gananciaPos ? 'text-success' : 'text-error'}`}>
                    {rentabilidad !== null
                      ? `${rentabilidad >= 0 ? '+' : ''}${formatCurrency(rentabilidad)}`
                      : '—'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Client section ── */}
          <div className="flex flex-col gap-3">
            <p className="section-label">Cliente</p>

            {/* Mode tabs */}
            <div className="flex gap-2">
              {([
                { mode: 'existing' as ClientMode, icon: Users,    label: 'Registrado' },
                { mode: 'new'      as ClientMode, icon: UserPlus, label: 'Crear nuevo' },
                { mode: 'none'     as ClientMode, icon: UserX,    label: 'Sin cliente' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setClientMode(mode)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                    border transition-all duration-150
                    ${clientMode === mode
                      ? 'bg-orange/15 text-orange border-orange/30'
                      : 'bg-card-elevated text-textsec border-border hover:border-border-bright hover:text-textprim'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {clientMode === 'existing' && (
              <Select
                {...register('client_id')}
                options={clients.map(c => ({ value: c.id, label: c.nombre + (c.telefono ? ` — ${c.telefono}` : '') }))}
                placeholder="Seleccioná un cliente"
                error={errors.client_id?.message}
              />
            )}

            {clientMode === 'new' && (
              <div className="flex flex-col gap-3 bg-[#0B1220] border border-border rounded-xl p-4">
                <Input
                  label="Nombre *"
                  value={newClientNombre}
                  onChange={e => setNewClientNombre(e.target.value)}
                  placeholder="Juan Pérez"
                />
                <Input
                  label="Teléfono"
                  value={newClientTelefono}
                  onChange={e => setNewClientTelefono(e.target.value)}
                  placeholder="0985 000 000"
                />
                <p className="text-xs text-textsec">El cliente se creará al registrar la venta.</p>
              </div>
            )}

            {clientMode === 'none' && (
              <p className="text-xs text-textsec bg-[#0B1220] border border-border rounded-xl px-4 py-3">
                La venta se registrará sin cliente asociado.
              </p>
            )}
          </div>

          {/* Vendor section */}
          <div className="flex flex-col gap-1.5">
            {admin ? (
              <Select
                {...register('vendedor_id')}
                label="Vendedor"
                options={employees.map(e => ({ value: e.id, label: `${e.nombre} — ${e.cargo}` }))}
                placeholder="Sin vendedor asignado"
              />
            ) : (
              <>
                <p className="section-label">Vendedor</p>
                <div className="bg-[#0B1220] border border-border rounded-xl px-4 py-3">
                  <p className="text-sm text-textprim font-medium">
                    {myEmployeeId
                      ? employees.find(e => e.id === myEmployeeId)?.nombre ?? 'Tú'
                      : 'Sin asignar'}
                  </p>
                  <p className="text-xs text-textsec mt-0.5">Asignado automáticamente</p>
                </div>
              </>
            )}
          </div>

          <Input
            {...register('fecha_venta')}
            label="Fecha de venta *"
            type="date"
            error={errors.fecha_venta?.message}
          />

          {/* Forma de venta */}
          <div className="flex flex-col gap-3">
            <p className="section-label">Forma de venta</p>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 flex-1 cursor-pointer rounded-xl border border-border bg-card-elevated/40 px-4 py-3
                                hover:border-border-bright transition-colors">
                <input type="checkbox" {...register('financiado')} className="w-4 h-4 rounded accent-orange cursor-pointer" />
                <span className="text-sm font-medium text-textprim">Financiado</span>
              </label>
              <label className="flex items-center gap-2 flex-1 cursor-pointer rounded-xl border border-border bg-card-elevated/40 px-4 py-3
                                hover:border-border-bright transition-colors">
                <input type="checkbox" {...register('es_permuta')} className="w-4 h-4 rounded accent-orange cursor-pointer" />
                <span className="text-sm font-medium text-textprim">Permuta (recibimos un vehículo)</span>
              </label>
            </div>

            {watchedEsPermuta && (
              <Input
                {...register('permuta_detalle')}
                label="Vehículo recibido en permuta *"
                placeholder="Ej: Toyota Corolla 2015, chapa ABC123"
                error={errors.permuta_detalle?.message}
              />
            )}
          </div>

          <Textarea
            {...register('notas')}
            label="Notas"
            placeholder="Condiciones de pago, financiamiento, observaciones…"
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-error bg-error/8 border border-error/20 rounded-xl px-4 py-3">
              <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
              {error}
            </div>
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
