'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAdminOrSecretary } from '@/lib/auth/roles'
import type { ClientFormData } from '@/lib/validations/client'
import type { ActionResult, Client } from '@/types'

export async function getClients() {
  const supabase = createClient()
  const { data } = await supabase.from('clients').select('*').order('nombre')
  return (data ?? []) as Client[]
}

export async function getClient(id: string) {
  const supabase = createClient()
  const { data } = await supabase.from('clients').select('*').eq('id', id).single()
  return (data ?? null) as Client | null
}

export async function createClient_(formData: ClientFormData): Promise<ActionResult<Client>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .insert(formData)
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/clientes')
  return { data: data as Client }
}

export async function updateClient(id: string, formData: ClientFormData): Promise<ActionResult<Client>> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado: solo administradores pueden modificar clientes.' }
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .update(formData)
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  return { data: data as Client }
}

export async function deleteClient(id: string): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado: solo administradores pueden eliminar clientes.' }
  const supabase = createClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/clientes')
  redirect('/clientes')
}

export async function getClientSales(clientId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('sales_with_details')
    .select('*')
    .eq('client_id', clientId)
    .order('fecha_venta', { ascending: false })
  return data ?? []
}
