'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { createUser } from '@/lib/actions/admin-users'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Role } from '@/types'

export function CreateUserForm() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('vendedor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleCreate() {
    if (!username.trim() || !password) { setError('Usuario y contraseña son requeridos'); return }
    setLoading(true); setError(''); setSuccess(false)
    const result = await createUser({ username: username.trim(), password, full_name: fullName.trim(), role })
    setLoading(false)
    if (result.error) { setError(result.error) }
    else { setSuccess(true); setFullName(''); setUsername(''); setPassword(''); setRole('vendedor') }
  }

  return (
    <Card>
      <h3 className="font-semibold text-textprim mb-4">Crear nuevo usuario</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          label="Nombre completo (opcional)"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Ej: Juan Pérez"
        />
        <Input
          label="Nombre de usuario *"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="juanperez"
        />
        <Input
          label="Contraseña *"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
        <Select
          label="Rol"
          value={role}
          onChange={e => setRole(e.target.value as Role)}
          options={[
            { value: 'vendedor', label: 'Vendedor' },
            { value: 'secretaria', label: 'Secretaria' },
            { value: 'admin', label: 'Administrador' },
          ]}
        />
      </div>
      {error && <p className="text-sm text-error mt-2">{error}</p>}
      {success && <p className="text-sm text-success mt-2">¡Usuario creado correctamente!</p>}
      <div className="mt-3 flex justify-end">
        <Button onClick={handleCreate} loading={loading} size="sm">
          <UserPlus className="w-3.5 h-3.5" /> Crear usuario
        </Button>
      </div>
    </Card>
  )
}
