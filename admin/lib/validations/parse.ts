import { z } from 'zod'

/**
 * Valida datos de entrada contra un schema Zod en el servidor. Server Actions
 * son invocables directamente (sin pasar por el formulario/UI), así que la
 * validación de react-hook-form en el cliente no alcanza: hay que revalidar
 * acá antes de tocar la base de datos.
 */
export function parseInput<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  return { success: true, data: result.data }
}
