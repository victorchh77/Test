'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSign } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { registerPayment } from '@/lib/actions/employees'
import { paymentSchema, type PaymentFormData } from '@/lib/validations/payment'

const TIPO_OPTIONS = [
  { value: 'salario',      label: 'Salario' },
  { value: 'comision',     label: 'Comisión' },
  { value: 'aguinaldo',    label: 'Aguinaldo' },
  { value: 'adelanto',     label: 'Adelanto' },
  { value: 'bonificacion', label: 'Bonificación' },
  { value: 'otro',         label: 'Otro' },
]

export function RegisterPaymentModal({ employeeId, salarioBase }: { employeeId: string; salarioBase: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentFormData, unknown, PaymentFormData>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      monto: salarioBase || 0,
      tipo: 'salario',
      fecha: new Date().toISOString().split('T')[0],
    },
  })

  async function onSubmit(data: PaymentFormData) {
    setLoading(true)
    setError('')
    const result = await registerPayment(employeeId, data)
    setLoading(false)
    if (result.error) setError(result.error)
    else { setOpen(false); reset(); router.refresh() }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <DollarSign className="w-3.5 h-3.5" />Registrar pago
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Registrar pago" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input {...register('monto')} label="Monto (Gs.) *" type="number" error={errors.monto?.message} />
            <Select {...register('tipo')} label="Tipo *" options={TIPO_OPTIONS} error={errors.tipo?.message} />
          </div>
          <Input {...register('fecha')} label="Fecha *" type="date" error={errors.fecha?.message} />
          <Textarea {...register('notas')} label="Notas" placeholder="Ej: Pago de diciembre, quincena, etc." />
          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={loading}>Registrar</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
