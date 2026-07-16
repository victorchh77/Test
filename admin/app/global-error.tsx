'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body className="antialiased" style={{ background: '#080C11', color: '#fff' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Algo salió mal</h1>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>
            El error fue reportado automáticamente. Podés intentar de nuevo.
          </p>
          <button
            onClick={reset}
            style={{ background: '#FF8C00', color: '#fff', padding: '8px 20px', borderRadius: 8, fontWeight: 600 }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
