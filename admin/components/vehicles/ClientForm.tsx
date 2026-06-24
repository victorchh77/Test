'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormData } from '@/lib/validations/client'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Client } from '@/types'

interface Props {
  onSubmit: (data: ClientFormData) => Promise<void>
  defaultValues?: Partial<Client>
  isEdit?: boolean
  loading?: boolean
  error?: string
}

export function ClientForm({ onSubmit, defaultValues, isEdit, loading, error }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData, unknown, ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      nombre:    defaultValues?.nombre ?? '',
      documento: defaultValues?.documento ?? '',
      telefono:  defaultValues?.telefono ?? '',
      email:     defaultValues?.email ?? '',
      ciudad:    defaultValues?.ciudad ?? '',
      notas:     defaultValues?.notas ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input {...register('nombre')}    label="Nombre completo *" placeholder="Juan Pérez" error={errors.nombre?.message} />
      <div className="grid grid-cols-2 gap-4">
        <Input {...register('documento')} label="CI / Documento"  placeholder="1.234.567" />
        <Input {...register('telefono')}  label="Teléfono"         placeholder="0985 000 000" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input {...register('email')}   label="Email"   placeholder="cliente@email.com" error={errors.email?.message} />
        <Input {...register('ciudad')}  label="Ciudad"  placeholder="Encarnación" />
      </div>
      <Textarea {...register('notas')} label="Notas" placeholder="Observaciones del cliente…" />

      {error && (
        <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button type="submit" loading={loading}>
          {isEdit ? 'Guardar cambios' : 'Crear cliente'}
        </Button>
      </div>
    </form>
  )
}
