'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeSchema, type EmployeeFormData } from '@/lib/validations/employee'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import type { Employee } from '@/types'

const CARGO_OPTIONS = [
  { value: 'vendedor',       label: 'Vendedor' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'gerente',        label: 'Gerente' },
  { value: 'mecanico',       label: 'Mecánico' },
  { value: 'otro',           label: 'Otro' },
]

const ACTIVO_OPTIONS = [
  { value: 'true',  label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
]

interface Props {
  onSubmit: (data: EmployeeFormData) => Promise<void>
  defaultValues?: Partial<Employee>
  isEdit?: boolean
  loading?: boolean
  error?: string
}

export function EmployeeForm({ onSubmit, defaultValues, isEdit, loading, error }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<EmployeeFormData, unknown, EmployeeFormData>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      nombre:              defaultValues?.nombre ?? '',
      documento:           defaultValues?.documento ?? '',
      telefono:            defaultValues?.telefono ?? '',
      email:               defaultValues?.email ?? '',
      cargo:               defaultValues?.cargo ?? 'vendedor',
      salario_base:        defaultValues?.salario_base ?? 0,
      comision_porcentaje: defaultValues?.comision_porcentaje ?? 0,
      fecha_ingreso:       defaultValues?.fecha_ingreso ?? new Date().toISOString().split('T')[0],
      activo:              defaultValues?.activo ?? true,
      notas:               defaultValues?.notas ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Input {...register('nombre')} label="Nombre completo *" error={errors.nombre?.message} className="col-span-2" />
        <Input {...register('documento')} label="Documento (CI)" />
        <Input {...register('telefono')} label="Teléfono" />
        <Input {...register('email')} label="Email" type="email" className="col-span-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          {...register('cargo')}
          label="Cargo *"
          options={CARGO_OPTIONS}
          error={errors.cargo?.message}
        />
        {isEdit && (
          <Select
            {...register('activo', { setValueAs: (v) => v === 'true' || v === true })}
            label="Estado"
            options={ACTIVO_OPTIONS}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input {...register('salario_base')} label="Salario base (Gs.)" type="number" error={errors.salario_base?.message} />
        <Input {...register('comision_porcentaje')} label="Comisión (%)" type="number" step="0.01" error={errors.comision_porcentaje?.message} />
      </div>

      <Input {...register('fecha_ingreso')} label="Fecha de ingreso *" type="date" error={errors.fecha_ingreso?.message} />
      <Textarea {...register('notas')} label="Notas" placeholder="Observaciones adicionales…" />

      {isEdit && (
        <p className="text-xs text-textsec -mt-2">
          Si cambiás el salario base, el aumento queda registrado automáticamente en el historial.
        </p>
      )}

      {error && (
        <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button type="submit" loading={loading}>{isEdit ? 'Guardar cambios' : 'Guardar empleado'}</Button>
      </div>
    </form>
  )
}
