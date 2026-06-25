import { z } from 'zod'

export const paymentSchema = z.object({
  monto: z.coerce.number().int().min(1, 'El monto es requerido'),
  tipo:  z.enum(['salario', 'comision', 'aguinaldo', 'adelanto', 'bonificacion', 'otro']),
  fecha: z.string().min(1, 'La fecha es requerida'),
  notas: z.string().optional(),
})

export type PaymentFormData = z.infer<typeof paymentSchema>
