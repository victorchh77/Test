import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  // Porcentaje de transacciones (rendimiento) capturadas. Bajo porque es un
  // panel interno, no necesitamos tracing detallado de cada request.
  tracesSampleRate: 0.1,

  // Session Replay: solo graba sesiones donde ocurrió un error, para poder
  // ver qué hacía el usuario sin grabar todo el tráfico normal.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})
