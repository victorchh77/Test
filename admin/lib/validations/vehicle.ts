import { z } from 'zod'

export const vehicleSchema = z.object({
  marca:         z.string().min(1, 'La marca es requerida'),
  modelo:        z.string().min(1, 'El modelo es requerido'),
  anio:          z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  km:            z.coerce.number().int().min(0),
  km_publico:     z.string().optional(),
  ocultar_km:     z.boolean().optional(),
  color:          z.string().optional(),
  numero_chassis: z.string().optional(),
  precio_compra: z.coerce.number().int().min(1, 'El precio de compra es requerido'),
  precio_venta:  z.coerce.number().int().min(1, 'El precio de venta es requerido'),
  estado:        z.enum(['Disponible', 'Reservado', 'Vendido']),
  oculto:        z.boolean().optional(),
  descripcion:   z.string().optional(),
  fecha_ingreso: z.string().min(1, 'La fecha de ingreso es requerida'),
  motivo_precio: z.string().optional(),
})

export type VehicleFormData = z.infer<typeof vehicleSchema>
