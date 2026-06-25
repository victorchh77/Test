import { z } from 'zod'

export const saleSchema = z.object({
  vehicle_id:   z.string().uuid('Seleccioná un vehículo'),
  client_id:    z.string().uuid().optional().or(z.literal('')),
  vendedor_id:  z.string().uuid().optional().or(z.literal('')),
  precio_final: z.coerce.number().int().min(1, 'El precio es requerido'),
  fecha_venta:  z.string().min(1, 'La fecha de venta es requerida'),
  notas:        z.string().optional(),
})

export type SaleFormData = z.infer<typeof saleSchema>
