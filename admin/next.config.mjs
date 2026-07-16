import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */

// Orígenes permitidos para invocar Server Actions (anti-CSRF / cross-origin).
// Por defecto Next ya exige que el Origin coincida con el Host; esto agrega
// orígenes de confianza extra (p.ej. el dominio de producción detrás del proxy).
// Configurable con ALLOWED_ORIGINS="midominio.com,www.midominio.com".
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig = {
  poweredByHeader: false, // ocultar "X-Powered-By: Next.js"
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      ...(allowedOrigins.length ? { allowedOrigins } : {}),
    },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Silencia el log del build de Sentry (source maps, etc.) salvo en CI.
  silent: !process.env.CI,

  // No falla el build si faltan las variables de Sentry (org/project/token):
  // así el proyecto sigue armando incluso antes de configurar Sentry en Vercel.
  disableLogger: true,
  widenClientFileUpload: true,

  // Evita que el navegador bloquee el tunnel de Sentry vía ad-blockers.
  tunnelRoute: '/monitoring',
})
