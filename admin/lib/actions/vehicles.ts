'use server'

import { createClient } from '@/lib/supabase/server'
import { createPublicClient, isPublicSupabaseConfigured } from '@/lib/supabase/public'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/roles'
import type { VehicleFormData } from '@/lib/validations/vehicle'
import type { ActionResult, Vehicle, SaleWithDetails, VehicleStatus } from '@/types'

export interface FeaturedVehicle {
  id: string
  marca: string
  modelo: string
  anio: number
  km: number
  km_publico: string | null
  color: string | null
  precio_venta: number
  estado: VehicleStatus
  fotoUrl: string | null
}

/**
 * Stock para la landing PÚBLICA. Lee de las vistas `vehiculos_publicos` /
 * `vehiculo_fotos_publicas` (rol anon) — ver supabase/migration_landing_public.sql.
 * Devuelve [] de forma segura si Supabase no está configurado o la migración
 * aún no se aplicó, para que la landing pueda mostrar un fallback.
 */
export async function getFeaturedVehicles(limit = 6): Promise<FeaturedVehicle[]> {
  if (!isPublicSupabaseConfigured()) return []
  const supabase = createPublicClient()

  const { data: vehicles, error } = await supabase
    .from('vehiculos_publicos')
    .select('id, marca, modelo, anio, km, km_publico, color, precio_venta, estado')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !vehicles?.length) return []

  const ids = vehicles.map((v) => v.id as string)
  const { data: photos } = await supabase
    .from('vehiculo_fotos_publicas')
    .select('vehicle_id, url, is_main')
    .in('vehicle_id', ids)

  const photoMap: Record<string, string> = {}
  ;(photos ?? []).forEach((p: { vehicle_id: string; url: string; is_main: boolean }) => {
    if (!photoMap[p.vehicle_id] || p.is_main) photoMap[p.vehicle_id] = p.url
  })

  return vehicles.map((v) => ({
    id: v.id as string,
    marca: v.marca as string,
    modelo: v.modelo as string,
    anio: v.anio as number,
    km: v.km as number,
    km_publico: (v.km_publico as string | null) ?? null,
    color: (v.color as string | null) ?? null,
    precio_venta: v.precio_venta as number,
    estado: v.estado as VehicleStatus,
    fotoUrl: photoMap[v.id as string] ?? null,
  }))
}

export async function getVehicles(filters?: { marca?: string; estado?: string; search?: string }) {
  const supabase = createClient()
  let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false })
  if (filters?.marca)  query = query.eq('marca', filters.marca)
  if (filters?.estado) query = query.eq('estado', filters.estado)
  if (filters?.search) {
    // Sanitizar: el término se interpola en un filtro PostgREST `or`, así que
    // removemos los caracteres con significado especial (, ( ) * : % \) y
    // limitamos la longitud para evitar inyección de filtros.
    const term = filters.search.replace(/[%,()*:\\]/g, ' ').trim().slice(0, 60)
    if (term) query = query.or(`marca.ilike.%${term}%,modelo.ilike.%${term}%`)
  }
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
  if (!(await isAdmin())) return { error: 'No autorizado: solo administradores pueden agregar vehículos.' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { motivo_precio: _omit, ...vehicleData } = formData
  const payload = { ...vehicleData, km_publico: (vehicleData.km_publico ?? '').trim() || null }
  const { data, error } = await supabase
    .from('vehicles')
    .insert({ ...payload, created_by: user?.id })
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/vehiculos')
  return { data: data as Vehicle }
}

export async function updateVehicle(id: string, formData: VehicleFormData): Promise<ActionResult<Vehicle>> {
  if (!(await isAdmin())) return { error: 'No autorizado: solo administradores pueden modificar vehículos.' }
  const supabase = createClient()
  const { motivo_precio, ...vehicleData } = formData
  const payload = { ...vehicleData, km_publico: (vehicleData.km_publico ?? '').trim() || null }

  // Capture old price to record history with the reason.
  const { data: old } = await supabase
    .from('vehicles')
    .select('precio_venta')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('vehicles')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) return { error: error.message }

  // Record price change (manually, so we can store the motivo).
  if (old && old.precio_venta !== vehicleData.precio_venta) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('price_history').insert({
      vehicle_id: id,
      precio_anterior: old.precio_venta,
      precio_nuevo: vehicleData.precio_venta,
      motivo: motivo_precio || null,
      changed_by: user?.id,
    })
  }

  revalidatePath('/vehiculos')
  revalidatePath(`/vehiculos/${id}`)
  return { data: data as Vehicle }
}

export async function toggleVehicleVisibility(id: string, oculto: boolean): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado: solo administradores pueden cambiar la visibilidad.' }
  const supabase = createClient()
  const { error } = await supabase.from('vehicles').update({ oculto }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/vehiculos')
  revalidatePath(`/vehiculos/${id}`)
  return {}
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado: solo administradores pueden eliminar vehículos.' }
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

export async function getMainPhotosForVehicles(vehicleIds: string[]): Promise<Record<string, string>> {
  if (!vehicleIds.length) return {}
  const supabase = createClient()
  const { data } = await supabase
    .from('vehicle_photos')
    .select('vehicle_id, url, is_main')
    .in('vehicle_id', vehicleIds)
  if (!data) return {}
  const map: Record<string, string> = {}
  // Prefer is_main; fall back to first photo encountered
  data.forEach((p: { vehicle_id: string; url: string; is_main: boolean }) => {
    if (!map[p.vehicle_id] || p.is_main) map[p.vehicle_id] = p.url
  })
  return map
}

export async function getVehiclesWithMainPhoto(filters?: { marca?: string; estado?: string; search?: string }) {
  const supabase = createClient()
  let query = supabase
    .from('vehicles')
    .select('*, vehicle_photos(url, is_main)')
    .order('created_at', { ascending: false })
  if (filters?.marca)  query = query.eq('marca', filters.marca)
  if (filters?.estado) query = query.eq('estado', filters.estado)
  if (filters?.search) {
    const term = filters.search.replace(/[%,()*:\\]/g, ' ').trim().slice(0, 60)
    if (term) query = query.or(`marca.ilike.%${term}%,modelo.ilike.%${term}%`)
  }
  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return (data ?? []).map((v: any) => {
    const photos: { url: string; is_main: boolean }[] = v.vehicle_photos ?? []
    const main = photos.find((p) => p.is_main) ?? photos[0] ?? null
    const { vehicle_photos: _photos, ...rest } = v
    return { ...rest, mainPhotoUrl: main?.url ?? null } as Vehicle & { mainPhotoUrl: string | null }
  })
}

export async function getDashboardStats() {
  const supabase = createClient()
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const [vehiclesRes, salesRes, clientsRes] = await Promise.all([
    supabase.from('vehicles').select('estado'),
    supabase.from('sales_with_details')
      .select('id, fecha_venta, precio_final, ganancia, marca, modelo, anio, client_nombre')
      .gte('fecha_venta', firstDay)
      .order('fecha_venta', { ascending: false }),
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
