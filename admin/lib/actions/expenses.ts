'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ExpenseFormData } from '@/lib/validations/expense'
import type { ActionResult } from '@/types'

export async function createExpense(formData: ExpenseFormData): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('expenses').insert({
    ...formData,
    created_by: user?.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/vehiculos/${formData.vehicle_id}`)
  revalidatePath('/gastos')
  return {}
}

export async function deleteExpense(id: string, vehicleId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/vehiculos/${vehicleId}`)
  revalidatePath('/gastos')
  return {}
}

export async function getAllExpenses() {
  const supabase = createClient()
  const { data } = await supabase
    .from('expenses')
    .select('*, vehicles(marca, modelo, anio)')
    .order('fecha', { ascending: false })
  return data ?? []
}
