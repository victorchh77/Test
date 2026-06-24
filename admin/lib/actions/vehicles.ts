'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { VehicleFormData } from '@/lib/validations/vehicle'
import type { ActionResult, Vehicle } from '@/types'

export async function getVehicles(filters?: { marca?: string; estado?: string; search?: string }) {
  const supabase = createClient()
  let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false })
  if (filters?.marca)  query = query.eq('marca', filters.marca)
  if (filters?.estado) query = query.eq('estado', filters.estado)
  if (filters?.search) query = query.or(`marca.ilike.%${filters.search}%,modelo.ilike.%${filters.search}%`)
  const { data, error } = await query
  if (error) return []
  return data as Vehicle[]
}

export async function getVehicle(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single()
  if (error) return null
  return data as Vehicle
}

export async function createVehicle(formData: VehicleFormData): Promise<ActionResult<Vehicle>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { motivo_precio: _m, ...vehicleData } = formData
  const { data, error } = await supabase
    .from('vehicles')
    .insert({ ...vehicleData, created_by: user?.id })
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/vehiculos')
  return { data: data as Vehicle }
}

export async function updateVehicle(id: string, formData: VehicleFormData): Promise<ActionResult<Vehicle>> {
  const supabase = createClient()
  const { motivo_precio, ...vehicleData } = formData

  // If price changed, manually insert price_history (trigger handles it in DB)
  const { data: current } = await supabase.from('vehicles').select('precio_venta').eq('id', id).single()

  const { data, error } = await supabase
    .from('vehicles')
    .update(vehicleData)
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: error.message }

  // If trigger not available (dev mode), manually insert history
  if (current && current.precio_venta !== vehicleData.precio_venta) {
    await supabase.from('price_history').insert({
      vehicle_id: id,
      precio_anterior: current.precio_venta,
      precio_nuevo: vehicleData.precio_venta,
      motivo: motivo_precio || null,
    })
  }

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

export async function getDashboardStats() {
  const supabase = createClient()
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const [vehiclesRes, salesRes, clientsRes] = await Promise.all([
    supabase.from('vehicles').select('id, estado, precio_compra, precio_venta'),
    supabase.from('sales_with_details').select('*').gte('fecha_venta', firstDayOfMonth),
    supabase.from('clients').select('id', { count: 'exact' }),
  ])

  const vehicles = vehiclesRes.data ?? []
  const sales = salesRes.data ?? []
  const totalClients = clientsRes.count ?? 0

  const enStock = vehicles.filter(v => v.estado !== 'Vendido').length
  const ventasMes = sales.length
  const gananciaMes = sales.reduce((acc, s) => acc + (s.ganancia ?? 0), 0)

  return { enStock, ventasMes, gananciaMes, totalClients, sales }
}
