import { z } from 'zod'

export const expenseSchema = z.object({
  vehicle_id:  z.string().uuid('Seleccioná un vehículo'),
  tipo:        z.enum(['mecanica', 'limpieza', 'pintura', 'documentacion', 'otros']),
  descripcion: z.string().optional(),
  monto:       z.coerce.number().int().min(1, 'El monto es requerido'),
  fecha:       z.string().min(1, 'La fecha es requerida'),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>
