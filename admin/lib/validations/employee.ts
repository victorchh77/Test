import { z } from 'zod'

export const employeeSchema = z.object({
  nombre:              z.string().min(2, 'El nombre es requerido'),
  documento:           z.string().optional(),
  telefono:            z.string().optional(),
  email:               z.string().email('Email inválido').optional().or(z.literal('')),
  cargo:               z.string().min(1, 'El cargo es requerido'),
  salario_base:        z.coerce.number().int().min(0).default(0),
  comision_porcentaje: z.coerce.number().min(0).max(100).default(0),
  fecha_ingreso:       z.string().min(1, 'La fecha de ingreso es requerida'),
  activo:              z.boolean().default(true),
  notas:               z.string().optional(),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>
