import { z } from 'zod'

export const saleSchema = z.object({
  vehicle_id:   z.string().uuid('Seleccioná un vehículo'),
  client_id:    z.string().uuid('Seleccioná un cliente'),
  precio_final: z.coerce.number().int().min(1, 'El precio final es requerido'),
  fecha_venta:  z.string().min(1, 'La fecha de venta es requerida'),
  comision:     z.coerce.number().int().min(0).default(0),
  notas:        z.string().optional(),
})

export type SaleFormData = z.infer<typeof saleSchema>
