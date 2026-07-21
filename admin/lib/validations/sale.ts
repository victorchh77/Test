import { z } from 'zod'

export const saleSchema = z.object({
  vehicle_id:      z.string().uuid('Seleccioná un vehículo'),
  client_id:       z.string().uuid().optional().or(z.literal('')),
  vendedor_id:     z.string().uuid().optional().or(z.literal('')),
  precio_final:    z.coerce.number().int().min(1, 'El precio es requerido'),
  fecha_venta:     z.string().min(1, 'La fecha de venta es requerida'),
  financiado:      z.boolean().optional(),
  es_permuta:      z.boolean().optional(),
  permuta_detalle: z.string().optional(),
  notas:           z.string().optional(),
}).refine(
  (d) => !d.es_permuta || (d.permuta_detalle?.trim().length ?? 0) > 0,
  { message: 'Indicá qué vehículo se recibió en la permuta', path: ['permuta_detalle'] },
)

export type SaleFormData = z.infer<typeof saleSchema>
