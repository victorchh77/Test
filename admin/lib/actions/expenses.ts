'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/auth/roles'
import { expenseSchema, type ExpenseFormData } from '@/lib/validations/expense'
import { parseInput } from '@/lib/validations/parse'
import type { ActionResult } from '@/types'

export async function getAllExpenses() {
  const supabase = createClient()
  const { data } = await supabase
    .from('expenses')
    .select('*, vehicles(marca, modelo, anio)')
    .order('fecha', { ascending: false })
  return data ?? []
}

export async function createExpense(formData: ExpenseFormData): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado: solo administradores pueden registrar gastos.' }
  const parsed = parseInput(expenseSchema, formData)
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('expenses').insert({ ...parsed.data, created_by: user?.id })
  if (error) return { error: error.message }
  revalidatePath('/gastos')
  revalidatePath(`/vehiculos/${parsed.data.vehicle_id}`)
  return {}
}

export async function deleteExpense(id: string, vehicleId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado: solo administradores pueden eliminar gastos.' }
  const supabase = createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/gastos')
  revalidatePath(`/vehiculos/${vehicleId}`)
  return {}
}
