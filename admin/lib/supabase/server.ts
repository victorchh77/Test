import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Keep the session alive for ~30 days so users don't get logged out
// when they close the tab/browser.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                maxAge: options?.maxAge ?? COOKIE_MAX_AGE,
              })
            )
          } catch {}
        },
      },
    }
  )
}
