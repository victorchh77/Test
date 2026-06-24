'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { expenseSchema, type ExpenseFormData } from '@/lib/validations/expense'
import { createExpense } from '@/lib/actions/expenses'
import { EXPENSE_TYPES } from '@/lib/utils/constants'
import { useRouter } from 'next/navigation'

export function AddExpenseModal({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false)
  const [serverErr, setServerErr] = useState('')
  const router = useRouter()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExpenseFormData, unknown, ExpenseFormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      vehicle_id: vehicleId,
      tipo: 'mecanica',
      fecha: new Date().toISOString().split('T')[0],
      monto: 0,
    },
  })

  async function onSubmit(data: ExpenseFormData) {
    setServerErr('')
    const result = await createExpense(data)
    if (result.error) {
      setServerErr(result.error)
    } else {
      reset()
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5" /> Agregar gasto
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Agregar gasto" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input type="hidden" {...register('vehicle_id')} />

          <Select
            {...register('tipo')}
            label="Tipo de gasto *"
            options={EXPENSE_TYPES.map(t => ({ value: t.value, label: t.label }))}
            error={errors.tipo?.message}
          />
          <Input
            {...register('monto')}
            label="Monto (Gs.) *"
            type="number"
            placeholder="500000"
            error={errors.monto?.message}
          />
          <Input
            {...register('fecha')}
            label="Fecha *"
            type="date"
            error={errors.fecha?.message}
          />
          <Textarea
            {...register('descripcion')}
            label="Descripción"
            placeholder="Detalle del gasto…"
          />

          {serverErr && (
            <p className="text-xs text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">
              {serverErr}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Guardar gasto</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
