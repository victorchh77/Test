'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createParesContract } from '@/lib/actions/pares'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'

export default function NuevoPagarePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [clientName, setClientName]   = useState('')
  const [diaPago, setDiaPago]         = useState('')
  const [monto, setMonto]             = useState('')
  const [notas, setNotas]             = useState('')
  const [file, setFile]               = useState<File | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!clientName.trim()) { setError('El nombre del cliente es requerido'); return }
    const dia = parseInt(diaPago, 10)
    if (!dia || dia < 1 || dia > 31) { setError('Ingresá un día de pago válido (1–31)'); return }
    const montoNum = parseInt(monto, 10)
    if (!montoNum || montoNum <= 0) { setError('Ingresá un monto válido'); return }

    setSubmitting(true)
    let contract_file_url: string | null = null

    if (file) {
      setUploading(true)
      const supabase = createClient()
      const ext  = file.name.split('.').pop()
      const path = `${clientName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${ext}`
      const { data, error: upErr } = await supabase.storage
        .from('pagares-contracts')
        .upload(path, file, { upsert: false })
      setUploading(false)
      if (upErr) { setError('Error al subir el archivo: ' + upErr.message); setSubmitting(false); return }
      const { data: { publicUrl } } = supabase.storage.from('pagares-contracts').getPublicUrl(data.path)
      contract_file_url = publicUrl
    }

    const res = await createParesContract({
      client_name: clientName,
      dia_pago: dia,
      monto_mensual: montoNum,
      contract_file_url,
      notas: notas.trim() || null,
    })
    setSubmitting(false)
    if (res.error) { setError(res.error); return }
    router.push('/planilla-pagares')
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/planilla-pagares">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-textprim tracking-tight">Nuevo pagaré</h1>
          <p className="text-sm text-textsec mt-0.5">Registrá el contrato del cliente</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Datos del pagaré" subtitle="Completá la información del contrato mensual" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre del cliente"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Juan Pérez"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Día de pago (1–31)"
              type="number"
              min="1"
              max="31"
              value={diaPago}
              onChange={e => setDiaPago(e.target.value)}
              placeholder="15"
            />
            <Input
              label="Monto mensual (Gs.)"
              type="number"
              min="1"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="500.000"
            />
          </div>

          {/* Contract file */}
          <div>
            <p className="section-label mb-2">Contrato / documento (opcional)</p>
            <div
              onClick={() => fileRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
                ${file ? 'border-orange/40 bg-orange/5' : 'border-border hover:border-orange/30 hover:bg-white/[0.02]'}
              `}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-orange" />
                  <p className="text-sm text-textprim font-medium truncate max-w-[240px]">{file.name}</p>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="text-xs text-error hover:underline inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Quitar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Upload className="w-8 h-8 text-textmuted" />
                  <p className="text-sm text-textsec">Adjuntá el contrato firmado</p>
                  <p className="text-xs text-textmuted">PDF, JPG, PNG</p>
                </div>
              )}
            </div>
          </div>

          <Textarea
            label="Notas (opcional)"
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Condiciones especiales, observaciones..."
            rows={3}
          />

          {error && (
            <div className="text-sm text-error bg-error/8 border border-error/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Link href="/planilla-pagares">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" loading={submitting}>
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar pagaré
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
