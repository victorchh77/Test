'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/auth/roles'
import type { ActionResult } from '@/types'

const NO_AUTH = { error: 'No autorizado: solo administradores pueden modificar las fotos.' }

const ALLOWED_EXT  = new Set(['jpg', 'jpeg', 'png', 'webp'])
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function uploadVehiclePhoto(vehicleId: string, formData: FormData): Promise<ActionResult<{ url: string }>> {
  if (!(await isAdmin())) return NO_AUTH
  const supabase = createClient()
  const file = formData.get('file') as File
  if (!file) return { error: 'No se seleccionó archivo' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXT.has(ext))  return { error: 'Solo se admiten imágenes JPG, PNG o WebP.' }
  if (!ALLOWED_MIME.has(file.type)) return { error: 'Tipo de archivo no permitido.' }

  const path = `${vehicleId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('vehicle-photos')
    .upload(path, file, { upsert: false, contentType: file.type })
  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage.from('vehicle-photos').getPublicUrl(path)

  const isMain = formData.get('is_main') === 'true'
  if (isMain) {
    await supabase.from('vehicle_photos').update({ is_main: false }).eq('vehicle_id', vehicleId)
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { error: dbError } = await supabase.from('vehicle_photos').insert({
    vehicle_id: vehicleId,
    url: urlData.publicUrl,
    storage_path: path,
    is_main: isMain,
    created_by: user?.id,
  })
  if (dbError) return { error: dbError.message }

  revalidatePath(`/vehiculos/${vehicleId}`)
  return { data: { url: urlData.publicUrl } }
}

export async function setMainPhoto(photoId: string, vehicleId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return NO_AUTH
  const supabase = createClient()
  await supabase.from('vehicle_photos').update({ is_main: false }).eq('vehicle_id', vehicleId)
  const { error } = await supabase.from('vehicle_photos').update({ is_main: true }).eq('id', photoId)
  if (error) return { error: error.message }
  revalidatePath(`/vehiculos/${vehicleId}`)
  return {}
}

export async function deleteVehiclePhoto(photoId: string, vehicleId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return NO_AUTH
  const supabase = createClient()

  // Resolve the storage path server-side: prevents the client from supplying
  // an arbitrary path that could delete photos belonging to other vehicles.
  const { data: photo } = await supabase
    .from('vehicle_photos')
    .select('storage_path')
    .eq('id', photoId)
    .eq('vehicle_id', vehicleId)
    .single()

  if (!photo) return { error: 'Foto no encontrada' }

  if (photo.storage_path) {
    await supabase.storage.from('vehicle-photos').remove([photo.storage_path])
  }

  const { error } = await supabase.from('vehicle_photos').delete().eq('id', photoId)
  if (error) return { error: error.message }
  revalidatePath(`/vehiculos/${vehicleId}`)
  return {}
}
