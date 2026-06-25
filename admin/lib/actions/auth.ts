'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && !url.includes('placeholder') && !key.includes('placeholder')
}

export async function login(email: string, password: string) {
  if (!isConfigured()) {
    return { error: 'El servidor no está conectado a la base de datos. Falta configurar Supabase en Vercel.' }
  }
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
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
