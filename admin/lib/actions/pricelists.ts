'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'

export async function getPriceLists() {
  const supabase = createClient()
  const { data } = await supabase
    .from('price_lists')
    .select('*, price_list_items(count)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getPriceList(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('price_lists')
    .select('*, price_list_items(*, vehicles(marca, modelo, anio, km, color, estado))')
    .eq('id', id)
    .single()
  return data
}

export async function createPriceList(titulo: string, descripcion?: string): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('price_lists')
    .insert({ titulo, descripcion: descripcion ?? null, created_by: user?.id })
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/lista-precios')
  return { data: { id: data.id } }
}

export async function addVehicleToPriceList(priceListId: string, vehicleId: string, precioLista: number, notas?: string): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from('price_list_items').insert({
    price_list_id: priceListId,
    vehicle_id: vehicleId,
    precio_lista: precioLista,
    notas: notas ?? null,
  })
  if (error) return { error: error.message }
  revalidatePath(`/lista-precios/${priceListId}`)
  return {}
}

export async function removeFromPriceList(itemId: string, priceListId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from('price_list_items').delete().eq('id', itemId)
  if (error) return { error: error.message }
  revalidatePath(`/lista-precios/${priceListId}`)
  return {}
}

export async function togglePriceListActive(id: string, activa: boolean): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from('price_lists').update({ activa }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/lista-precios')
  return {}
}

export async function deletePriceList(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from('price_lists').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/lista-precios')
  return {}
}
