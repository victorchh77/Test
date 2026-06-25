'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { employeeSchema, type EmployeeFormData } from '@/lib/validations/employee'
import { createEmployee } from '@/lib/actions/employees'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'

const CARGO_OPTIONS = [
  { value: 'vendedor',       label: 'Vendedor' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'gerente',        label: 'Gerente' },
  { value: 'mecanico',       label: 'Mecánico' },
  { value: 'otro',           label: 'Otro' },
]

export default function NuevoEmpleadoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<EmployeeFormData, unknown, EmployeeFormData>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      activo: true,
      salario_base: 0,
      comision_porcentaje: 0,
      fecha_ingreso: new Date().toISOString().split('T')[0],
    },
  })

  async function onSubmit(data: EmployeeFormData) {
    setLoading(true)
    setError('')
    const result = await createEmployee(data)
    setLoading(false)
    if (result.error) setError(result.error)
    else router.push('/empleados')
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/empleados">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-textprim">Nuevo empleado</h1>
          <p className="text-sm text-textsec">Completá los datos del empleado</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Input {...register('nombre')} label="Nombre completo *" error={errors.nombre?.message} className="col-span-2" />
            <Input {...register('documento')} label="Documento (CI)" />
            <Input {...register('telefono')} label="Teléfono" />
            <Input {...register('email')} label="Email" type="email" className="col-span-2" />
          </div>

          <Select
            {...register('cargo')}
            label="Cargo *"
            options={CARGO_OPTIONS}
            placeholder="Seleccioná un cargo"
            error={errors.cargo?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input {...register('salario_base')} label="Salario base (Gs.)" type="number" />
            <Input {...register('comision_porcentaje')} label="Comisión (%)" type="number" step="0.01" />
          </div>

          <Input {...register('fecha_ingreso')} label="Fecha de ingreso *" type="date" error={errors.fecha_ingreso?.message} />
          <Textarea {...register('notas')} label="Notas" placeholder="Observaciones adicionales…" />

          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Link href="/empleados"><Button variant="secondary">Cancelar</Button></Link>
            <Button type="submit" loading={loading}>Guardar empleado</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
