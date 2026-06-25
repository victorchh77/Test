'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Save, Check, AtSign, KeyRound } from 'lucide-react'
import { getProfile } from '@/lib/actions/auth'
import { updateProfile, changePassword } from '@/lib/actions/profile'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import type { Profile } from '@/types'

function SuccessMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-success bg-success/8 border border-success/20 rounded-xl px-4 py-3">
      <Check className="w-4 h-4 flex-shrink-0" />
      {msg}
    </div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-error bg-error/8 border border-error/20 rounded-xl px-4 py-3">
      <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
      {msg}
    </div>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  // Profile form
  const [fullName, setFullName]   = useState('')
  const [username, setUsername]   = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg]         = useState<{ ok?: string; err?: string }>({})

  // Password form
  const [newPass, setNewPass]       = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg]         = useState<{ ok?: string; err?: string }>({})

  useEffect(() => {
    getProfile().then(p => {
      if (p) {
        setProfile(p as Profile)
        setFullName((p as any).full_name ?? '')
        setUsername((p as any).username ?? '')
      }
    })
  }, [])

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setProfileMsg({ err: 'El nombre es requerido' }); return }
    setProfileLoading(true)
    setProfileMsg({})
    const res = await updateProfile({ full_name: fullName, username })
    setProfileLoading(false)
    if (res.error) setProfileMsg({ err: res.error })
    else setProfileMsg({ ok: 'Perfil actualizado correctamente' })
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPass !== confirmPass) { setPassMsg({ err: 'Las contraseñas no coinciden' }); return }
    if (newPass.length < 6) { setPassMsg({ err: 'Mínimo 6 caracteres' }); return }
    setPassLoading(true)
    setPassMsg({})
    const res = await changePassword(newPass)
    setPassLoading(false)
    if (res.error) setPassMsg({ err: res.error })
    else {
      setPassMsg({ ok: 'Contraseña actualizada correctamente' })
      setNewPass('')
      setConfirmPass('')
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Configuración</h1>
        <p className="text-sm text-textsec mt-0.5">Gestioná tu perfil y seguridad</p>
      </div>

      {/* Avatar + role banner */}
      <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-orange/20 blur-md" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange/30 to-orange/10
                          border border-orange/30 flex items-center justify-center
                          font-display font-bold text-xl text-orange">
            {initials}
          </div>
        </div>
        <div>
          <p className="font-display font-bold text-textprim text-lg leading-tight">
            {profile?.full_name || 'Sin nombre'}
          </p>
          {profile?.username && (
            <p className="text-sm text-textsec mt-0.5">@{profile.username}</p>
          )}
          <span className={`
            inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5
            uppercase tracking-widest border
            ${profile?.role === 'admin'
              ? 'bg-orange/15 text-orange border-orange/25'
              : profile?.role === 'secretaria'
              ? 'bg-purple-500/15 text-purple-400 border-purple-500/25'
              : 'bg-blue-500/15 text-blue-400 border-blue-500/25'
            }
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              profile?.role === 'admin' ? 'bg-orange'
              : profile?.role === 'secretaria' ? 'bg-purple-400'
              : 'bg-blue-400'
            }`} />
            {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'secretaria' ? 'Secretaría' : 'Vendedor'}
          </span>
        </div>
      </div>

      {/* Profile section */}
      <Card>
        <CardHeader
          title="Información del perfil"
          subtitle="Tu nombre y usuario de acceso"
        />
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre completo"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Juan Pérez"
          />
          <div>
            <Input
              label="Nombre de usuario"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
              placeholder="juan.perez"
              hint="Solo letras minúsculas, números, puntos, guiones. Usalo para iniciar sesión sin email."
            />
          </div>

          {profileMsg.ok  && <SuccessMsg msg={profileMsg.ok} />}
          {profileMsg.err && <ErrorMsg  msg={profileMsg.err} />}

          <div className="flex justify-end pt-2 border-t border-border">
            <Button type="submit" loading={profileLoading}>
              <Save className="w-4 h-4" />
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>

      {/* Password section */}
      <Card>
        <CardHeader
          title="Cambiar contraseña"
          subtitle="Mínimo 6 caracteres"
        />
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <Input
            label="Nueva contraseña"
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            placeholder="••••••••"
          />

          {passMsg.ok  && <SuccessMsg msg={passMsg.ok} />}
          {passMsg.err && <ErrorMsg  msg={passMsg.err} />}

          <div className="flex justify-end pt-2 border-t border-border">
            <Button type="submit" loading={passLoading}>
              <KeyRound className="w-4 h-4" />
              Cambiar contraseña
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
