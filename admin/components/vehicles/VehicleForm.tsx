'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vehicleSchema, type VehicleFormData } from '@/lib/validations/vehicle'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { MARCAS, COLORS_VEHICULO, VEHICLE_STATES } from '@/lib/utils/constants'
import type { Vehicle } from '@/types'

interface Props {
  onSubmit: (data: VehicleFormData) => Promise<void>
  defaultValues?: Partial<Vehicle>
  isEdit?: boolean
  loading?: boolean
  error?: string
}

export function VehicleForm({ onSubmit, defaultValues, isEdit, loading, error }: Props) {
  const form = useForm<VehicleFormData, unknown, VehicleFormData>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: {
      marca:         defaultValues?.marca ?? '',
      modelo:        defaultValues?.modelo ?? '',
      anio:          defaultValues?.anio ?? new Date().getFullYear(),
      km:            defaultValues?.km ?? 0,
      km_publico:     defaultValues?.km_publico ?? '',
      ocultar_km:     defaultValues?.ocultar_km ?? false,
      color:          defaultValues?.color ?? '',
      numero_chassis: defaultValues?.numero_chassis ?? '',
      precio_compra:  defaultValues?.precio_compra ?? 0,
      precio_venta:  defaultValues?.precio_venta ?? 0,
      estado:        defaultValues?.estado ?? 'Disponible',
      oculto:        defaultValues?.oculto ?? false,
      descripcion:   defaultValues?.descripcion ?? '',
      fecha_ingreso: defaultValues?.fecha_ingreso ?? new Date().toISOString().split('T')[0],
    },
  })

  const { register, handleSubmit, formState: { errors } } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Select
          {...register('marca')}
          label="Marca *"
          options={MARCAS.map(m => ({ value: m, label: m }))}
          placeholder="Seleccioná una marca"
          error={errors.marca?.message}
        />
        <Input
          {...register('modelo')}
          label="Modelo *"
          placeholder="Ej: Corolla"
          error={errors.modelo?.message}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          {...register('anio')}
          label="Año *"
          type="number"
          placeholder="2024"
          error={errors.anio?.message}
        />
        <Input
          {...register('km')}
          label="Kilometraje"
          type="number"
          placeholder="0"
          error={errors.km?.message}
        />
        <Select
          {...register('color')}
          label="Color"
          options={COLORS_VEHICULO.map(c => ({ value: c, label: c }))}
          placeholder="Color"
        />
      </div>

      <Input
        {...register('km_publico')}
        label="Kilometraje a mostrar en el catálogo web (opcional)"
        placeholder="Ej: Recién importado · Consultar · A confirmar · Manual · Diésel"
        hint="Si lo dejás vacío, el catálogo muestra el km real. Si lo completás, se muestra este texto en su lugar — podés poner cualquier otro dato (transmisión, combustible, etc.), no tiene que ser sobre kilometraje."
      />

      <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-border bg-card-elevated/40 px-4 py-3
                        hover:border-border-bright transition-colors">
        <input
          type="checkbox"
          {...register('ocultar_km')}
          className="mt-0.5 w-4 h-4 rounded accent-orange cursor-pointer"
        />
        <span className="text-sm">
          <span className="font-medium text-textprim">No mostrar este dato en el catálogo web</span>
          <span className="block text-xs text-textsec mt-0.5">
            Oculta por completo el recuadro de kilometraje en la tarjeta y el detalle (ni el km real ni el texto de arriba). Tiene prioridad sobre el campo anterior.
          </span>
        </span>
      </label>

      <Input
        {...register('numero_chassis')}
        label="Número de chasis (opcional)"
        placeholder="Ej: 9BWZZZ377VT004251"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('precio_compra')}
          label="Precio de compra (Gs.) *"
          type="number"
          placeholder="50000000"
          error={errors.precio_compra?.message}
        />
        <Input
          {...register('precio_venta')}
          label="Precio de venta (Gs.) *"
          type="number"
          placeholder="70000000"
          error={errors.precio_venta?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          {...register('estado')}
          label="Estado"
          options={VEHICLE_STATES.map(s => ({ value: s.value, label: s.label }))}
          error={errors.estado?.message}
        />
        <Input
          {...register('fecha_ingreso')}
          label="Fecha de ingreso"
          type="date"
          error={errors.fecha_ingreso?.message}
        />
      </div>

      {isEdit && (
        <Input
          {...register('motivo_precio')}
          label="Motivo de cambio de precio (opcional)"
          placeholder="Ej: Actualización de mercado"
        />
      )}

      {/* Visibilidad en el catálogo web (landing) */}
      <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-border bg-card-elevated/40 px-4 py-3
                        hover:border-border-bright transition-colors">
        <input
          type="checkbox"
          {...register('oculto')}
          className="mt-0.5 w-4 h-4 rounded accent-orange cursor-pointer"
        />
        <span className="text-sm">
          <span className="font-medium text-textprim">Ocultar del catálogo web</span>
          <span className="block text-xs text-textsec mt-0.5">
            No aparecerá en la landing page. Útil para vehículos que no están realmente a la venta.
            (Los vehículos Reservados o Vendidos se ocultan solos del catálogo.)
          </span>
        </span>
      </label>

      <Textarea
        {...register('descripcion')}
        label="Descripción / Observaciones"
        placeholder="Estado general del vehículo, accesorios, etc."
      />

      {error && (
        <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button type="submit" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear vehículo'}
        </Button>
      </div>
    </form>
  )
}
