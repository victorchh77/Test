'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { VehicleFormData } from '@/lib/validations/vehicle'
import type { ActionResult, Vehicle, SaleWithDetails } from '@/types'

export async function getVehicles(filters?: { marca?: string; estado?: string; search?: string }) {
  const supabase = createClient()
  let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false })
  if (filters?.marca)  query = query.eq('marca', filters.marca)
  if (filters?.estado) query = query.eq('estado', filters.estado)
  if (filters?.search) query = query.or(`marca.ilike.%${filters.search}%,modelo.ilike.%${filters.search}%`)
  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return (data ?? []) as Vehicle[]
}

export async function getVehicle(id: string) {
  const supabase = createClient()
  const { data } = await supabase.from('vehicles').select('*').eq('id', id).single()
  return (data ?? null) as Vehicle | null
}

export async function createVehicle(formData: VehicleFormData): Promise<ActionResult<Vehicle>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('vehicles')
    .insert({ ...formData, created_by: user?.id })
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/vehiculos')
  return { data: data as Vehicle }
}

export async function updateVehicle(id: string, formData: VehicleFormData): Promise<ActionResult<Vehicle>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vehicles')
    .update(formData)
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/vehiculos')
  revalidatePath(`/vehiculos/${id}`)
  return { data: data as Vehicle }
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from('vehicles').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/vehiculos')
  redirect('/vehiculos')
}

export async function getVehicleExpenses(vehicleId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('fecha', { ascending: false })
  return data ?? []
}

export async function getVehiclePriceHistory(vehicleId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('price_history')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getVehiclePhotos(vehicleId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('vehicle_photos')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('is_main', { ascending: false })
  return data ?? []
}

export async function getDashboardStats() {
  const supabase = createClient()
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const [vehiclesRes, salesRes, clientsRes] = await Promise.all([
    supabase.from('vehicles').select('estado'),
    supabase.from('sales_with_details').select('*').gte('fecha_venta', firstDay).order('fecha_venta', { ascending: false }),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
  ])

  const vehicles = vehiclesRes.data ?? []
  const sales = (salesRes.data ?? []) as SaleWithDetails[]
  const totalClients = clientsRes.count ?? 0
  const enStock = vehicles.filter((v: any) => v.estado !== 'Vendido').length
  const ventasMes = sales.length
  const gananciaMes = sales.reduce((a: number, s: SaleWithDetails) => a + (s.ganancia ?? 0), 0)

  return { enStock, ventasMes, gananciaMes, totalClients, sales }
}
