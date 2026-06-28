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
      ...(allowedOrigins.length ? { allowedOrigins } : {}),
    },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
