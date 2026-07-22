import { z } from 'zod'

export const transferSchema = z.object({
  monto:           z.coerce.number().int().min(1, 'El monto debe ser mayor a 0'),
  moneda:          z.enum(['Gs', 'USD']).default('Gs'),
  remitente:       z.string().max(120).nullable().optional(),
  comprobante_url: z.string().max(500).nullable().optional(),
  notas:           z.string().max(1000).nullable().optional(),
})

export type TransferFormData = z.infer<typeof transferSchema>
