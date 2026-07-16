'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAdminOrSecretary } from '@/lib/auth/roles'
import { employeeSchema, type EmployeeFormData } from '@/lib/validations/employee'
import { paymentSchema } from '@/lib/validations/payment'
import { parseInput } from '@/lib/validations/parse'
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
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado.' }
  const parsed = parseInput(employeeSchema, formData)
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()
  const { data, error } = await supabase
    .from('employees')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/empleados')
  return { data: data as Employee }
}

export async function updateEmployee(id: string, formData: EmployeeFormData): Promise<ActionResult<Employee>> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado.' }
  const parsed = parseInput(employeeSchema, formData)
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()

  // Capture old salary to record raises/changes in history.
  const { data: old } = await supabase
    .from('employees')
    .select('salario_base')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('employees')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: error.message }

  if (old && Number(old.salario_base) !== Number(parsed.data.salario_base)) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('employee_salary_history').insert({
      employee_id: id,
      salario_anterior: old.salario_base,
      salario_nuevo: parsed.data.salario_base,
      changed_by: user?.id,
    })
  }

  revalidatePath('/empleados')
  revalidatePath(`/empleados/${id}`)
  return { data: data as Employee }
}

export async function getEmployeePayments(employeeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('employee_payments')
    .select('*')
    .eq('employee_id', employeeId)
    .order('fecha', { ascending: false })
  return data ?? []
}

export async function getEmployeeSalaryHistory(employeeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('employee_salary_history')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function registerPayment(
  employeeId: string,
  payment: { monto: number; tipo: string; fecha: string; notas?: string }
): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado.' }
  const parsed = parseInput(paymentSchema, payment)
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('employee_payments').insert({
    employee_id: employeeId,
    monto: parsed.data.monto,
    tipo: parsed.data.tipo,
    fecha: parsed.data.fecha,
    notas: parsed.data.notas ?? null,
    created_by: user?.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/empleados/${employeeId}`)
  return {}
}

export async function deletePayment(paymentId: string, employeeId: string): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado.' }
  const supabase = createClient()
  const { error } = await supabase.from('employee_payments').delete().eq('id', paymentId)
  if (error) return { error: error.message }
  revalidatePath(`/empleados/${employeeId}`)
  return {}
}

export async function deleteEmployee(id: string): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado.' }
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
