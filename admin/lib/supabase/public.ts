import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase para contenido PÚBLICO (landing page).
 *
 * A diferencia de `createClient()` (server.ts), no usa cookies ni sesión: corre
 * siempre como rol `anon`. Esto permite que la landing se renderice de forma
 * cacheable (ISR) y sin depender de un usuario logueado.
 *
 * Solo debe leer datos expuestos explícitamente a `anon` vía las vistas
 * `vehiculos_publicos` / `vehiculo_fotos_publicas` (ver
 * supabase/migration_landing_public.sql). Nunca lee las tablas base, así no
 * expone columnas internas como `precio_compra`.
 */
export function isPublicSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && !url.includes('placeholder') && !key.includes('placeholder')
}

export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
