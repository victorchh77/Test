'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ClientForm } from '@/components/vehicles/ClientForm'
import { createClient_ } from '@/lib/actions/clients'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ClientFormData } from '@/lib/validations/client'

export default function NuevoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(data: ClientFormData) {
    setLoading(true)
    setError('')
    const result = await createClient_(data)
    setLoading(false)
    if (result.error) setError(result.error)
    else router.push(`/clientes/${result.data?.id}`)
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/clientes">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-textprim">Nuevo cliente</h1>
          <p className="text-sm text-textsec">Completá los datos del cliente</p>
        </div>
      </div>
      <Card>
        <ClientForm onSubmit={handleSubmit} loading={loading} error={error} />
      </Card>
    </div>
  )
}
