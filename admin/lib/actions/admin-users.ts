'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/auth/roles'
import type { ActionResult, Role } from '@/types'

export interface UserWithEmail {
  id: string
  full_name: string
  username: string | null
  role: Role
  email: string
  created_at: string
}

export async function getUsersWithEmail(): Promise<UserWithEmail[]> {
  if (!(await isAdmin())) return []
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_profiles_with_email')
  if (error) { console.error(error); return [] }
  return (data ?? []) as UserWithEmail[]
}

export async function updateUserRole(userId: string, role: Role): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado' }
  const supabase = createClient()
  const { error } = await supabase.rpc('admin_update_user_role', {
    target_user_id: userId,
    new_role: role,
  })
  if (error) return { error: error.message }
  revalidatePath('/usuarios')
  return { data: null }
}
