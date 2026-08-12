import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/**
 * Registra una acción sensible (verificar/eliminar/editar) con quién la hizo
 * y desde qué IP. Nunca debe romper la acción que la llama: cualquier fallo
 * acá se traga y se loguea a consola, no se propaga.
 */
export async function logAudit(
  action: string,
  entityType: string,
  entityId: string | null,
): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const h = headers()
    // Vercel antepone la IP real del cliente a x-forwarded-for; en dev local
    // puede no venir ninguno de los dos headers.
    const forwardedFor = h.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (h.get('x-real-ip') ?? null)

    await supabase.from('audit_log').insert({
      actor_id: user.id,
      actor_name: profile?.full_name ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ip,
    })
  } catch (err) {
    console.error('logAudit failed:', err)
  }
}
