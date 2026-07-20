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
  activo: boolean
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
  return ((data ?? []) as any[]).map((u) => ({
    id: u.id,
    full_name: u.full_name,
    username: u.username,
    role: u.role,
    email: u.email,
    created_at: u.created_at,
    activo: !u.banned_until || new Date(u.banned_until) <= new Date(),
  }))
}

/** Bloquea acciones destructivas que dejarían al sistema sin ningún admin. */
async function isOnlyAdmin(supabase: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  const { data: target } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (target?.role !== 'admin') return false
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
  return (count ?? 0) <= 1
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
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres' }

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

export async function deleteUser(userId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado' }
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) return { error: 'No podés eliminar tu propia cuenta.' }

  if (await isOnlyAdmin(supabase, userId)) {
    return { error: 'No se puede eliminar: es el único administrador del sistema.' }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('foreign key') || msg.includes('violat') || msg.includes('constraint')) {
      return {
        error: 'No se puede eliminar: este usuario tiene actividad registrada en el sistema ' +
          '(ventas, vehículos, gastos, transferencias, etc.). Cambiale el rol si querés quitarle ' +
          'el acceso sin perder ese historial.',
      }
    }
    return { error: error.message }
  }

  revalidatePath('/usuarios')
  return { data: null }
}

/**
 * Desactiva o reactiva una cuenta usando el baneo nativo de Supabase Auth
 * (banned_until) en vez de borrar nada: bloquea el login sin tocar el
 * historial que referencia a este usuario (ventas, vehículos, etc.).
 */
export async function toggleUserActive(userId: string, activo: boolean): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado' }
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) return { error: 'No podés desactivar tu propia cuenta.' }

  if (!activo && (await isOnlyAdmin(supabase, userId))) {
    return { error: 'No se puede desactivar: es el único administrador del sistema.' }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    // 'none' reactiva; ~100 años equivale a desactivado indefinidamente.
    ban_duration: activo ? 'none' : '876000h',
  })
  if (error) return { error: error.message }

  revalidatePath('/usuarios')
  return { data: null }
}
