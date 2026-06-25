'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SaleFormData } from '@/lib/validations/sale'
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
  const supabase = createClient()

  const { error } = await supabase.from('sales').insert({
    vehicle_id:   formData.vehicle_id,
    client_id:    formData.client_id || null,
    precio_final: formData.precio_final,
    fecha_venta:  formData.fecha_venta,
    comision:     0,
    vendedor_id:  formData.vendedor_id || null,
    notas:        formData.notas ?? null,
  })
  if (error) return { error: error.message }

  await supabase
    .from('vehicles')
    .update({ estado: 'Vendido' })
    .eq('id', formData.vehicle_id)

  revalidatePath('/ventas')
  revalidatePath('/vehiculos')
  revalidatePath('/dashboard')
  return {}
}
