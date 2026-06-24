import { z } from 'zod'

export const clientSchema = z.object({
  nombre:    z.string().min(1, 'El nombre es requerido'),
  documento: z.string().optional(),
  telefono:  z.string().optional(),
  email:     z.string().email('Email inválido').optional().or(z.literal('')),
  ciudad:    z.string().optional(),
  notas:     z.string().optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>
