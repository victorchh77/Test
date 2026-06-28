/**
 * Rate limiter en memoria (ventana deslizante por clave).
 *
 * Sirve para frenar abuso/fuerza bruta sin infraestructura extra. Limitación:
 * el estado es por-instancia; en un despliegue con varias instancias conviene
 * respaldarlo con un store compartido (p.ej. Upstash Redis). Para un panel de
 * una sola instancia (o Vercel con baja concurrencia) es una defensa efectiva.
 */

type Hit = { count: number; reset: number }
const buckets = new Map<string, Hit>()

// Limpieza perezosa para que el Map no crezca indefinidamente.
function sweep(now: number) {
  if (buckets.size < 5000) return
  buckets.forEach((v, k) => { if (v.reset <= now) buckets.delete(k) })
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfter: number // segundos hasta poder reintentar
}

/**
 * @param key   identificador (ej. `login:<ip>:<usuario>`)
 * @param limit cantidad máxima de intentos por ventana
 * @param windowMs duración de la ventana en ms (default 60s)
 */
export function rateLimit(key: string, limit: number, windowMs = 60_000): RateLimitResult {
  const now = Date.now()
  sweep(now)
  const hit = buckets.get(key)

  if (!hit || hit.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (hit.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((hit.reset - now) / 1000) }
  }

  hit.count++
  return { ok: true, remaining: limit - hit.count, retryAfter: 0 }
}
