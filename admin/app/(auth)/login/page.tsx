'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { login } from '@/lib/actions/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [serverErr, setServerErr] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(schema) as any,
  })

  async function onSubmit(data: FormData) {
    setServerErr('')
    const result = await login(data.email, data.password)
    if (result.error) {
      setServerErr('Email o contraseña incorrectos')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-card border border-border rounded-2xl mb-4 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="VH Group" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-textprim">VH Group S.R.L.</h1>
          <p className="text-sm text-textsec mt-1">Panel de Gestión · Encarnación</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <h2 className="text-base font-semibold text-textprim mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              {...register('email')}
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              error={errors.email?.message}
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
                className="absolute right-3 top-8 text-textsec hover:text-textprim transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {serverErr && (
              <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">
                {serverErr}
              </p>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full justify-center mt-2">
              Ingresar al panel
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-textsec mt-6">
          © 2025 VH Group S.R.L. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
