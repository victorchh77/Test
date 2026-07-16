import { z } from 'zod'

export const priceListItemSchema = z.object({
  precio_1:              z.coerce.number().int().min(0).nullable().optional(),
  precio_2:              z.coerce.number().int().min(0).nullable().optional(),
  precio_lista:          z.coerce.number().int().min(1, 'El precio de lista es requerido'),
  precio_financiado_12:  z.coerce.number().int().min(0).nullable().optional(),
  precio_financiado_18:  z.coerce.number().int().min(0).nullable().optional(),
  precio_financiado_24:  z.coerce.number().int().min(0).nullable().optional(),
  precio_financiado_30:  z.coerce.number().int().min(0).nullable().optional(),
  entrega:               z.coerce.number().int().min(0).nullable().optional(),
})
