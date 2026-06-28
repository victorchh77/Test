'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, FileImage, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createTransfer } from '@/lib/actions/transfers'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'

export default function NuevaTransferenciaPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [monto, setMonto]           = useState('')
  const [remitente, setRemitente]   = useState('')
  const [notas, setNotas]           = useState('')
  const [file, setFile]             = useState<File | null>(null)
  const [preview, setPreview]       = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  function handleFile(f: File | null) {
    setFile(f)
    if (!f) { setPreview(null); return }
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const montoNum = parseInt(monto, 10)
    if (!montoNum || montoNum <= 0) { setError('Ingresá un monto válido'); return }

    setSubmitting(true)
    let comprobante_url: string | null = null

    if (file) {
      setUploading(true)
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error: upErr } = await supabase.storage
        .from('transfer-receipts')
        .upload(path, file, { upsert: false })
      setUploading(false)
      if (upErr) { setError('Error al subir el comprobante: ' + upErr.message); setSubmitting(false); return }
      // Bucket privado: guardamos el path interno, no una URL pública.
      // La URL firmada se genera al mostrar (ver transferencias/page.tsx).
      comprobante_url = data.path
    }

    const res = await createTransfer({ monto: montoNum, remitente: remitente.trim() || null, comprobante_url, notas: notas.trim() || null })
    setSubmitting(false)
    if (res.error) { setError(res.error); return }
    router.push('/transferencias')
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/transferencias">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-textprim tracking-tight">Nueva transferencia</h1>
          <p className="text-sm text-textsec mt-0.5">Registrá el comprobante y monto</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Datos de la transferencia" subtitle="Adjuntá el comprobante y completá el monto" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Monto (Gs.)"
            type="number"
            min="1"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            placeholder="1.500.000"
          />

          <Input
            label="¿Quién realizó la transferencia?"
            value={remitente}
            onChange={e => setRemitente(e.target.value)}
            placeholder="Nombre del remitente"
          />

          {/* File upload */}
          <div>
            <p className="section-label mb-2">Comprobante (imagen o PDF)</p>
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
                onChange={e => handleFile(e.target.files?.[0] ?? null)}
              />
              {preview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleFile(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-error rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileImage className="w-8 h-8 text-orange" />
                  <p className="text-sm text-textprim font-medium truncate max-w-[240px]">{file.name}</p>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleFile(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="text-xs text-error hover:underline"
                  >
                    Quitar archivo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Upload className="w-8 h-8 text-textmuted" />
                  <p className="text-sm text-textsec">Hacé clic para adjuntar</p>
                  <p className="text-xs text-textmuted">JPG, PNG, PDF — opcional</p>
                </div>
              )}
            </div>
          </div>

          <Textarea
            label="Notas (opcional)"
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Referencia, banco, descripción..."
            rows={3}
          />

          {error && (
            <div className="text-sm text-error bg-error/8 border border-error/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Link href="/transferencias">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" loading={submitting}>
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Registrar transferencia
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
