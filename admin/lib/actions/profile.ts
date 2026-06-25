'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'

export async function updateProfile(data: {
  full_name: string
  username: string
}): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const username = data.username.trim().toLowerCase() || null

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: data.full_name.trim(), username })
    .eq('id', user.id)

  if (error) {
    if (error.message.includes('profiles_username_unique')) {
      return { error: 'Ese nombre de usuario ya está en uso' }
    }
    return { error: error.message }
  }

  revalidatePath('/settings')
  return {}
}

export async function changePassword(newPassword: string): Promise<ActionResult> {
  if (newPassword.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return {}
}
