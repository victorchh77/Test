'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createPriceList } from '@/lib/actions/pricelists'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'

export default function NuevaListaPreciosPage() {
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) { setError('El título es requerido'); return }
    setLoading(true)
    setError('')
    const result = await createPriceList(titulo, descripcion)
    setLoading(false)
    if (result.error) setError(result.error)
    else router.push(`/lista-precios/${result.data?.id}`)
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/lista-precios">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-textprim">Nueva lista de precios</h1>
          <p className="text-sm text-textsec">Los vendedores podrán ver los precios publicados</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Título *"
            placeholder="Ej: Lista de Precios Diciembre 2025"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />
          <Textarea
            label="Descripción (opcional)"
            placeholder="Ej: Precios para ventas al contado. Válido hasta el 31/12."
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={3}
          />

          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Link href="/lista-precios"><Button variant="secondary">Cancelar</Button></Link>
            <Button type="submit" loading={loading}>Crear lista</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
