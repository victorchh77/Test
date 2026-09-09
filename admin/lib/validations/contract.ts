import { z } from 'zod'

const parteSchema = z.object({
  nombre:       z.string().trim().min(3, 'El nombre es requerido'),
  nacionalidad: z.string().trim().min(1, 'Requerido'),
  estadoCivil:  z.string().trim().min(1, 'Requerido'),
  ci:           z.string().trim().min(1, 'La cédula es requerida'),
  domicilio:    z.string().trim().min(1, 'El domicilio es requerido'),
})

const vehiculoSchema = z.object({
  marca:     z.string().trim().min(1, 'Requerido'),
  tipo:      z.string().trim().min(1, 'Requerido'),
  modelo:    z.string().trim().min(1, 'Requerido'),
  color:     z.string().trim().min(1, 'Requerido'),
  anio:      z.coerce.number().int().min(1950).max(2100),
  chasis:    z.string().trim().min(1, 'El número de chasis es requerido'),
  matricula: z.string().trim().nullable().optional().transform(v => v || null),
})

const cuotaSchema = z.object({
  tipo:  z.enum(['cuota', 'refuerzo']),
  monto: z.coerce.number().int().positive('El monto debe ser mayor a 0'),
  fecha: z.string().nullable().optional().transform(v => v || null),
})

export const contractGenerationSchema = z.object({
  ciudad:   z.string().trim().min(1, 'Requerido').default('Encarnación'),
  fecha:    z.string().min(1, 'La fecha es requerida'),
  vendedor: parteSchema,
  comprador: parteSchema,
  vehiculo: vehiculoSchema,
  moneda:   z.enum(['Gs', 'USD']),
  precioTotal: z.coerce.number().int().positive('El precio total debe ser mayor a 0'),
  esPermuta:   z.boolean(),
  permutaDescripcion: z.string().trim().nullable().optional().transform(v => v || null),
  permutaValor:       z.coerce.number().int().nullable().optional().transform(v => v || null),
  entradaEfectivo:    z.coerce.number().int().nullable().optional().transform(v => v || null),
  financiado: z.boolean(),
  cuotas:     z.array(cuotaSchema).default([]),
  registrarEnPlanillaPagares: z.boolean().default(false),
  vehicleId:  z.string().uuid().nullable().optional().transform(v => v || null),
})

export type ContractGenerationInput = z.infer<typeof contractGenerationSchema>

const pagareCuotaSchema = z.object({
  tipo:   z.enum(['cuota', 'refuerzo']),
  numero: z.coerce.number().int().min(1),
  total:  z.coerce.number().int().min(1),
  monto:  z.coerce.number().int().positive('El monto debe ser mayor a 0'),
  // A diferencia de la cuota del contrato, acá la fecha es obligatoria: un
  // pagaré sin fecha de vencimiento no tiene sentido como título valor.
  fecha:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Todas las cuotas necesitan fecha de vencimiento para generar los pagarés'),
})

export const pagareGenerationSchema = z.object({
  acreedor: z.string().trim().min(3, 'El nombre del acreedor es requerido'),
  deudor: z.object({
    nombre:    z.string().trim().min(3, 'El nombre del deudor es requerido'),
    domicilio: z.string().trim().min(1, 'El domicilio es requerido'),
    ci:        z.string().trim().min(1, 'La cédula es requerida'),
  }),
  fechaEmision: z.string().min(1, 'La fecha es requerida'),
  moneda: z.enum(['Gs', 'USD']),
  cuotas: z.array(pagareCuotaSchema).min(1, 'No hay cuotas para generar pagarés'),
})

export type PagareGenerationInput = z.infer<typeof pagareGenerationSchema>
