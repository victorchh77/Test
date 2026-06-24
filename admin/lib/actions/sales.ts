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
  const { data } = await query
  return data ?? []
}

export async function createSale(formData: SaleFormData): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error: saleError } = await supabase.from('sales').insert({
    ...formData,
    vendedor_id: user?.id,
  })
  if (saleError) return { error: saleError.message }

  // Mark vehicle as sold
  const { error: vErr } = await supabase
    .from('vehicles')
    .update({ estado: 'Vendido' })
    .eq('id', formData.vehicle_id)
  if (vErr) return { error: vErr.message }

  revalidatePath('/ventas')
  revalidatePath('/vehiculos')
  revalidatePath('/dashboard')
  return {}
}
