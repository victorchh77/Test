'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ClientFormData } from '@/lib/validations/client'
import type { ActionResult, Client } from '@/types'

export async function getClients() {
  const supabase = createSupabaseClient()
  const { data } = await supabase.from('clients').select('*').order('nombre')
  return (data ?? []) as Client[]
}

export async function getClient(id: string) {
  const supabase = createSupabaseClient()
  const { data } = await supabase.from('clients').select('*').eq('id', id).single()
  return data as Client | null
}

export async function createClient_(formData: ClientFormData): Promise<ActionResult<Client>> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.from('clients').insert(formData).select().single()
  if (error) return { error: error.message }
  revalidatePath('/clientes')
  return { data: data as Client }
}

export async function updateClient(id: string, formData: ClientFormData): Promise<ActionResult<Client>> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.from('clients').update(formData).eq('id', id).select().single()
  if (error) return { error: error.message }
  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  return { data: data as Client }
}

export async function deleteClient(id: string): Promise<ActionResult> {
  const supabase = createSupabaseClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/clientes')
  redirect('/clientes')
}

export async function getClientSales(clientId: string) {
  const supabase = createSupabaseClient()
  const { data } = await supabase
    .from('sales_with_details')
    .select('*')
    .eq('client_id', clientId)
    .order('fecha_venta', { ascending: false })
  return data ?? []
}
