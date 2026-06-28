'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
  // Query profiles + join email via the auth schema using service-level access
  const { data, error } = await supabase.rpc('get_all_profiles_with_email')
  if (error) {
    console.error('get_all_profiles_with_email error:', error)
    return []
  }
  return (data ?? []) as UserWithEmail[]
}

export async function createUser(data: {
  username: string
  password: string
  full_name: string
  role: Role
}): Promise<ActionResult<{ id: string }>> {
  if (!(await isAdmin())) return { error: 'No autorizado' }
  const { username, password, full_name, role } = data
  if (!username.trim() || !password) return { error: 'Usuario y contraseña son requeridos' }
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }

  const adminClient = createAdminClient()
  const email = `${username.toLowerCase().trim().replace(/\s+/g, '_')}@vhgroup.internal`

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name.trim() || username.trim(), role },
  })
  if (authError) return { error: authError.message }

  // Crear/actualizar el perfil explícitamente (upsert): no depende de que el
  // trigger handle_new_user lo haya creado, así la creación de usuarios desde
  // el panel siempre deja un perfil correcto.
  await adminClient
    .from('profiles')
    .upsert(
      {
        id: authData.user.id,
        full_name: full_name.trim() || username.trim(),
        username: username.trim(),
        role,
      },
      { onConflict: 'id' },
    )

  revalidatePath('/usuarios')
  return { data: { id: authData.user.id } }
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
