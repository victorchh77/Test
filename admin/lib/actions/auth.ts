'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && !url.includes('placeholder') && !key.includes('placeholder')
}

function clientIp() {
  const h = headers()
  const fwd = h.get('x-forwarded-for')
  return (fwd?.split(',')[0] ?? h.get('x-real-ip') ?? 'unknown').trim()
}

export async function login(usernameOrEmail: string, password: string) {
  if (!isConfigured()) {
    return { error: 'El servidor no está conectado a la base de datos. Falta configurar Supabase en Vercel.' }
  }

  // Anti fuerza bruta: máx. 8 intentos por minuto por IP + usuario.
  const ip = clientIp()
  const limited = rateLimit(`login:${ip}:${usernameOrEmail.trim().toLowerCase()}`, 8, 60_000)
  if (!limited.ok) {
    return { error: `Demasiados intentos. Esperá ${limited.retryAfter}s e intentá de nuevo.` }
  }

  try {
    const supabase = createClient()
    let email = usernameOrEmail.trim()

    // If input has no '@', treat it as a username and look up the email.
    // Preferimos el cliente service-role para resolver usuario->email del lado
    // servidor: así se puede revocar el acceso anónimo a get_email_by_username
    // (cierra la enumeración de usuarios). Con fallback al cliente normal.
    if (!email.includes('@')) {
      const lookup = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase
      const { data: foundEmail, error: rpcErr } = await lookup.rpc('get_email_by_username', {
        p_username: email,
      })
      if (rpcErr || !foundEmail) {
        return { error: 'Usuario o contraseña incorrectos' }
      }
      email = foundEmail as string
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    // Mensaje genérico: no revelar si el usuario existe ni el detalle del error.
    if (error) return { error: 'Usuario o contraseña incorrectos' }
    return { error: null }
  } catch {
    return { error: 'No se pudo conectar con el servidor de autenticación.' }
  }
}

export async function logout() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch {
    // ignore — still redirect to login
  }
  redirect('/login')
}

export async function getProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}
