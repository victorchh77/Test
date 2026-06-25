import { z } from 'zod'

export const priceListSchema = z.object({
  titulo:      z.string().min(2, 'El título es requerido'),
  descripcion: z.string().optional(),
})

export type PriceListFormData = z.infer<typeof priceListSchema>
