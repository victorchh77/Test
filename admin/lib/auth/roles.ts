import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'

/**
 * Returns the current user's profile (with role), or null.
 * Safe against missing Supabase config / network errors.
 */
export async function getSessionProfile(): Promise<Profile | null> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    return (data ?? null) as Profile | null
  } catch {
    return null
  }
}

export async function getRole(): Promise<'admin' | 'vendedor' | 'secretaria' | null> {
  const profile = await getSessionProfile()
  return (profile?.role as 'admin' | 'vendedor' | 'secretaria') ?? null
}

export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === 'admin'
}

export async function isSecretary(): Promise<boolean> {
  return (await getRole()) === 'secretaria'
}

export async function isAdminOrSecretary(): Promise<boolean> {
  const role = await getRole()
  return role === 'admin' || role === 'secretaria'
}

/**
 * Use in admin-only page/layout server components.
 * Redirects vendedores to the dashboard and anonymous users to login.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getSessionProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/dashboard')
  return profile
}

/**
 * Use in page/layout server components that both admin and secretaria can access.
 * Redirects vendedores to dashboard and anonymous users to login.
 */
export async function requireAdminOrSecretary(): Promise<Profile> {
  const profile = await getSessionProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'admin' && profile.role !== 'secretaria') redirect('/dashboard')
  return profile
}
