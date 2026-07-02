'use client'

import { useState, useRef, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, X, Loader2, ScanLine, CheckCircle2, Car, User, Calendar, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createParesContract, scanParesContract } from '@/lib/actions/pares'
import type { ScannedContract } from '@/lib/actions/pares'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/format'

export default function NuevoPagarePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [clientName, setClientName] = useState('')
  const [diaPago, setDiaPago]       = useState('')
  const [monto, setMonto]           = useState('')
  const [notas, setNotas]           = useState('')
  const [file, setFile]             = useState<File | null>(null)

  const [scanning, setScanning]     = useState(false)
  const [scanned, setScanned]       = useState<ScannedContract | null>(null)
  const [scanError, setScanError]   = useState('')

  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setScanned(null)
    setScanError('')

    if (!f) return

    // Auto-escaneo solo para .docx
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext !== 'docx' && ext !== 'doc') return

    setScanning(true)
    const fd = new FormData()
    fd.append('file', f)
    const result = await scanParesContract(fd)
    setScanning(false)

    if (result.error) {
      setScanError(result.error)
      return
    }

    const d = result.data!
    setScanned(d)

    // Auto-relleno de campos (sin pisar lo que el usuario ya escribió)
    if (d.clientName  && !clientName) setClientName(d.clientName)
    if (d.diaPago     && !diaPago)    setDiaPago(String(d.diaPago))
    if (d.montoCuota  && !monto)      setMonto(String(d.montoCuota))
    if (d.notaSugerida && !notas)     setNotas(d.notaSugerida)
  }

  function clearFile() {
    setFile(null)
    setScanned(null)
    setScanError('')
    if (fileRef.current) fileRef.current.value = ''
  }

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
      contract_file_url = data.path
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

      {/* ── Uploader de contrato ── */}
      <Card>
        <CardHeader
          title="Contrato / documento"
          subtitle="Subí el .docx y los datos se cargan solos"
        />

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
            accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileChange}
          />

          {scanning ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <ScanLine className="w-8 h-8 text-orange animate-pulse" />
              <p className="text-sm text-orange font-medium">Escaneando contrato…</p>
              <p className="text-xs text-textsec">Extrayendo datos de pago</p>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-orange" />
              <p className="text-sm text-textprim font-medium truncate max-w-[240px]">{file.name}</p>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); clearFile() }}
                className="text-xs text-error hover:underline inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Quitar
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <Upload className="w-8 h-8 text-textmuted" />
              <p className="text-sm text-textsec">Adjuntá el contrato firmado</p>
              <p className="text-xs text-textmuted">PDF, JPG, PNG · <span className="text-orange">DOCX = escaneo automático</span></p>
            </div>
          )}
        </div>

        {/* Error de escaneo */}
        {scanError && (
          <p className="mt-2 text-xs text-warning bg-warning/10 border border-warning/25 rounded-lg px-3 py-2">
            {scanError}
          </p>
        )}

        {/* Preview de datos detectados */}
        {scanned && (
          <div className="mt-4 rounded-xl border border-success/25 bg-success/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <p className="text-sm font-semibold text-success">Datos detectados del contrato</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {scanned.clientName && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <User className="w-3 h-3 text-textsec flex-shrink-0" />
                  <span className="text-textsec">Cliente:</span>
                  <span className="text-textprim font-medium truncate">{scanned.clientName}</span>
                </div>
              )}
              {scanned.vehiculo && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <Car className="w-3 h-3 text-textsec flex-shrink-0" />
                  <span className="text-textsec">Vehículo:</span>
                  <span className="text-textprim font-medium">{scanned.vehiculo}</span>
                </div>
              )}
              {scanned.totalPrecio && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-textsec flex-shrink-0" />
                  <span className="text-textsec">Total:</span>
                  <span className="text-textprim font-medium">{formatCurrency(scanned.totalPrecio)}</span>
                </div>
              )}
              {scanned.entrada && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-textsec flex-shrink-0" />
                  <span className="text-textsec">Entrada:</span>
                  <span className="text-textprim font-medium">{formatCurrency(scanned.entrada)}</span>
                </div>
              )}
              {scanned.cuotaCount && scanned.montoCuota && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <Calendar className="w-3 h-3 text-textsec flex-shrink-0" />
                  <span className="text-textsec">Cuotas:</span>
                  <span className="text-orange font-semibold">
                    {scanned.cuotaCount} × {formatCurrency(scanned.montoCuota)}
                  </span>
                  {scanned.diaPago && (
                    <span className="text-textsec ml-1">· día {scanned.diaPago}</span>
                  )}
                </div>
              )}
            </div>
            <p className="mt-3 text-[10px] text-textmuted">
              Revisá los campos abajo y ajustá si hace falta antes de guardar.
            </p>
          </div>
        )}
      </Card>

      {/* ── Datos del pagaré ── */}
      <Card>
        <CardHeader title="Datos del pagaré" subtitle="Completá o corregí la información extraída" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre del cliente"
            value={clientName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setClientName(e.target.value)}
            placeholder="Juan Pérez"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Día de pago (1–31)"
              type="number"
              min="1"
              max="31"
              value={diaPago}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDiaPago(e.target.value)}
              placeholder="25"
            />
            <Input
              label="Monto mensual (Gs.)"
              type="number"
              min="1"
              value={monto}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMonto(e.target.value)}
              placeholder="2500000"
            />
          </div>

          <Textarea
            label="Notas (opcional)"
            value={notas}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotas(e.target.value)}
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
