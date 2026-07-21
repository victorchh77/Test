'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdminOrSecretary } from '@/lib/auth/roles'
import { saleSchema, type SaleFormData } from '@/lib/validations/sale'
import { parseInput } from '@/lib/validations/parse'
import type { ActionResult } from '@/types'

export async function getSales(fromDate?: string, toDate?: string) {
  const supabase = createClient()
  let query = supabase
    .from('sales_with_details')
    .select('*')
    .order('fecha_venta', { ascending: false })
  if (fromDate) query = query.gte('fecha_venta', fromDate)
  if (toDate)   query = query.lte('fecha_venta', toDate)
  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function createSale(formData: SaleFormData): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado: solo administradores y secretaría pueden registrar ventas.' }
  const parsed = parseInput(saleSchema, formData)
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()

  const { error } = await supabase.from('sales').insert({
    vehicle_id:      parsed.data.vehicle_id,
    client_id:       parsed.data.client_id || null,
    precio_final:    parsed.data.precio_final,
    fecha_venta:     parsed.data.fecha_venta,
    comision:        0,
    vendedor_id:     parsed.data.vendedor_id || null,
    financiado:      parsed.data.financiado ?? false,
    es_permuta:      parsed.data.es_permuta ?? false,
    permuta_detalle: parsed.data.es_permuta ? (parsed.data.permuta_detalle?.trim() || null) : null,
    notas:           parsed.data.notas ?? null,
  })
  if (error) return { error: error.message }

  await supabase
    .from('vehicles')
    .update({ estado: 'Vendido' })
    .eq('id', parsed.data.vehicle_id)

  revalidatePath('/ventas')
  revalidatePath('/vehiculos')
  revalidatePath('/dashboard')
  return {}
}
