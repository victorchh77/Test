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
      color:         defaultValues?.color ?? '',
      precio_compra: defaultValues?.precio_compra ?? 0,
      precio_venta:  defaultValues?.precio_venta ?? 0,
      estado:        defaultValues?.estado ?? 'Disponible',
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
