'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdminOrSecretary } from '@/lib/auth/roles'
import type { ActionResult } from '@/types'

const NO_AUTH = { error: 'No autorizado: solo administradores y secretaría pueden modificar la lista de precios.' }

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
    .select('*, price_list_items(*, vehicles(marca, modelo, anio, km, color, estado, vehicle_photos(url, is_main)))')
    .eq('id', id)
    .single()
  return data
}

export async function createPriceList(titulo: string, descripcion?: string): Promise<ActionResult<{ id: string }>> {
  if (!(await isAdminOrSecretary())) return NO_AUTH
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

export async function addVehicleToPriceList(
  priceListId: string,
  vehicleId: string,
  prices: {
    precio_1?: number | null
    precio_2?: number | null
    precio_lista: number
    precio_financiado_12?: number | null
    precio_financiado_18?: number | null
    precio_financiado_24?: number | null
    precio_financiado_30?: number | null
    entrega?: number | null
  },
  notas?: string,
): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return NO_AUTH
  const supabase = createClient()
  const { error } = await supabase.from('price_list_items').insert({
    price_list_id: priceListId,
    vehicle_id: vehicleId,
    precio_1: prices.precio_1 ?? null,
    precio_2: prices.precio_2 ?? null,
    precio_lista: prices.precio_lista,
    precio_financiado_12: prices.precio_financiado_12 ?? null,
    precio_financiado_18: prices.precio_financiado_18 ?? null,
    precio_financiado_24: prices.precio_financiado_24 ?? null,
    precio_financiado_30: prices.precio_financiado_30 ?? null,
    entrega: prices.entrega ?? null,
    notas: notas ?? null,
  })
  if (error) return { error: error.message }
  revalidatePath(`/lista-precios/${priceListId}`)
  return {}
}

export async function removeFromPriceList(itemId: string, priceListId: string): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return NO_AUTH
  const supabase = createClient()
  const { error } = await supabase.from('price_list_items').delete().eq('id', itemId)
  if (error) return { error: error.message }
  revalidatePath(`/lista-precios/${priceListId}`)
  return {}
}

export async function togglePriceListActive(id: string, activa: boolean): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return NO_AUTH
  const supabase = createClient()
  const { error } = await supabase.from('price_lists').update({ activa }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/lista-precios')
  return {}
}

export async function deletePriceList(id: string): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return NO_AUTH
  const supabase = createClient()
  const { error } = await supabase.from('price_lists').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/lista-precios')
  return {}
}
