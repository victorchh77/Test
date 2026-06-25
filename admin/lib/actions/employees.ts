'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { EmployeeFormData } from '@/lib/validations/employee'
import type { ActionResult, Employee } from '@/types'

export async function getEmployees() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('nombre')
  if (error) { console.error(error); return [] }
  return (data ?? []) as Employee[]
}

export async function getEmployee(id: string) {
  const supabase = createClient()
  const { data } = await supabase.from('employees').select('*').eq('id', id).single()
  return (data ?? null) as Employee | null
}

export async function createEmployee(formData: EmployeeFormData): Promise<ActionResult<Employee>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('employees')
    .insert(formData)
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/empleados')
  return { data: data as Employee }
}

export async function updateEmployee(id: string, formData: EmployeeFormData): Promise<ActionResult<Employee>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('employees')
    .update(formData)
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/empleados')
  revalidatePath(`/empleados/${id}`)
  return { data: data as Employee }
}

export async function deleteEmployee(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/empleados')
  redirect('/empleados')
}

export async function getEmployeeSales(employeeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('sales_with_details')
    .select('*')
    .eq('vendedor_id', employeeId)
    .order('fecha_venta', { ascending: false })
  return data ?? []
}
