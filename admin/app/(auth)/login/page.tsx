'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { login } from '@/lib/actions/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff, Car, Shield, TrendingUp } from 'lucide-react'

const schema = z.object({
  username: z.string().min(1, 'Ingresá tu usuario o email'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

const features = [
  { icon: Car,        label: 'Gestión de inventario vehicular' },
  { icon: TrendingUp, label: 'Análisis de ventas en tiempo real' },
  { icon: Shield,     label: 'Acceso seguro por roles' },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [serverErr, setServerErr] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(schema) as any,
  })

  async function onSubmit(data: FormData) {
    setServerErr('')
    const result = await login(data.username, data.password)
    if (result.error) {
      const msg = /invalid login credentials/i.test(result.error)
        ? 'Usuario o contraseña incorrectos'
        : result.error
      setServerErr(msg)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-bg flex overflow-hidden">
      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-sidebar" />
        <div className="absolute inset-0 bg-dots opacity-60" />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(255,140,0,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-bg to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent" />
        <div className="absolute top-0 right-0 bottom-0 w-px"
             style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,140,0,0.4), transparent)' }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-3xl bg-orange/25 blur-2xl animate-glow-pulse" />
            <div className="relative w-28 h-28 bg-[#0B1220] border-2 border-orange/40 rounded-3xl
                            flex items-center justify-center shadow-orange-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="VH Group" className="w-20 h-20 object-contain" />
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold text-textprim tracking-tight">VH Group</h1>
          <p className="text-orange font-semibold text-sm tracking-[0.2em] uppercase mt-1">S.R.L.</p>
          <p className="text-textsec text-sm mt-3 leading-relaxed">
            Sistema de gestión avanzada para<br />concesionaria vehicular
          </p>

          <div className="mt-10 flex flex-col gap-3 w-full">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/[0.03] border border-border
                                          rounded-xl px-4 py-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-orange/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-orange" />
                </div>
                <span className="text-sm text-textprim font-medium">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-textmuted mt-10">Encarnación, Paraguay — © 2025</p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-dots opacity-40 lg:hidden" />
        <div className="absolute inset-0 pointer-events-none lg:hidden"
             style={{ background: 'radial-gradient(ellipse 100% 60% at 50% 20%, rgba(255,140,0,0.08) 0%, transparent 60%)' }} />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-2xl bg-orange/20 blur-xl" />
              <div className="relative w-20 h-20 bg-card border border-orange/30 rounded-2xl
                              flex items-center justify-center mx-auto shadow-orange">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="VH Group" className="w-14 h-14 object-contain" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-textprim mt-4 tracking-tight">VH Group S.R.L.</h1>
            <p className="text-sm text-textsec mt-1">Panel de Gestión · Encarnación</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
                 style={{ background: 'linear-gradient(135deg, rgba(255,140,0,0.2), transparent 50%)', borderRadius: '1rem' }} />

            <div className="relative bg-card border border-border-bright rounded-2xl shadow-card-lg overflow-hidden">
              <div className="h-0.5 w-full"
                   style={{ background: 'linear-gradient(90deg, transparent, #FF8C00, transparent)' }} />

              <div className="px-8 py-8">
                <div className="mb-7">
                  <h2 className="font-display text-xl font-bold text-textprim tracking-tight">Iniciar sesión</h2>
                  <p className="text-sm text-textsec mt-1">Accedé al panel de gestión</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <Input
                    {...register('username')}
                    label="Usuario o email"
                    type="text"
                    placeholder="tu.usuario"
                    autoComplete="username"
                    error={errors.username?.message}
                  />

                  <div className="relative">
                    <Input
                      {...register('password')}
                      label="Contraseña"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      error={errors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3.5 top-[34px] text-textsec hover:text-textprim transition-colors"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {serverErr && (
                    <div className="flex items-center gap-2 text-sm text-error bg-error/8 border border-error/20 rounded-xl px-4 py-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
                      {serverErr}
                    </div>
                  )}

                  <Button type="submit" loading={isSubmitting} className="w-full justify-center mt-1 py-3 text-sm font-bold tracking-wide">
                    Ingresar al panel
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-textmuted mt-6">
            © 2025 VH Group S.R.L. · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
