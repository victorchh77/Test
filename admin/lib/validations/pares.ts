import { z } from 'zod'

export const cuotaInputSchema = z.object({
  tipo:              z.enum(['cuota', 'refuerzo']),
  numero:            z.coerce.number().int().min(1),
  monto:             z.coerce.number().int().min(1, 'El monto de la cuota debe ser mayor a 0'),
  fecha_vencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida').nullable(),
  notas:             z.string().max(300).nullable(),
})

export const paresContractSchema = z.object({
  client_name:       z.string().min(1, 'El nombre del cliente es requerido').max(150),
  contract_file_url: z.string().max(500).nullable(),
  vehiculo:          z.string().max(200).nullable(),
  numero_chassis:    z.string().max(50).nullable(),
  total_precio:      z.coerce.number().int().min(0).nullable(),
  entrada:           z.coerce.number().int().min(0).nullable(),
  moneda:            z.enum(['Gs', 'USD']).default('Gs'),
  notas:             z.string().max(1000).nullable(),
  cuotas:            z.array(cuotaInputSchema).min(1, 'Debés agregar al menos una cuota'),
})

export const paresContractUpdateSchema = z.object({
  client_name:       z.string().min(1, 'El nombre del cliente es requerido').max(150),
  contract_file_url: z.string().max(500).nullable(),
  vehiculo:          z.string().max(200).nullable(),
  total_precio:      z.coerce.number().int().min(0).nullable(),
  entrada:           z.coerce.number().int().min(0).nullable(),
  moneda:            z.enum(['Gs', 'USD']).default('Gs'),
  notas:             z.string().max(1000).nullable(),
})

export const paresPaymentSchema = z.object({
  contract_id:  z.string().uuid('Contrato inválido'),
  anio:         z.coerce.number().int().min(2000).max(2100),
  mes:          z.coerce.number().int().min(1).max(12),
  pagado:       z.boolean(),
  metodo_pago:  z.string().max(60).nullable(),
})
