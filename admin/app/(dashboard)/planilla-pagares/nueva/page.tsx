'use client'

import { useState, useRef, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Upload, FileText, X, ScanLine, CheckCircle2,
  Car, User, DollarSign, Plus, Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createParesContractWithCuotas, scanParesContract } from '@/lib/actions/pares'
import type { ScannedContract } from '@/lib/actions/pares'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/format'

// ── Cuota editable local ──────────────────────────────────────────────────

interface EditCuota {
  _key: string
  tipo: 'cuota' | 'refuerzo'
  monto: string       // texto para el input
  fecha: string       // YYYY-MM-DD o ''
  notas: string
}

function makeCuota(tipo: 'cuota' | 'refuerzo', monto = '', fecha = '', notas = ''): EditCuota {
  return { _key: Math.random().toString(36).slice(2), tipo, monto, fecha, notas }
}

function fromScanned(cuotas: ScannedContract['cuotas']): EditCuota[] {
  return cuotas.map(c => makeCuota(c.tipo, String(c.monto), c.fecha_vencimiento ?? '', c.notas ?? ''))
}

// ── Componente principal ──────────────────────────────────────────────────

export default function NuevoPagarePage() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [clientName, setClientName] = useState('')
  const [notas, setNotas]           = useState('')
  const [file, setFile]             = useState<File | null>(null)

  const [scanning, setScanning]     = useState(false)
  const [scanned, setScanned]       = useState<ScannedContract | null>(null)
  const [scanError, setScanError]   = useState('')

  const [cuotas, setCuotas]         = useState<EditCuota[]>([])
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  // ── File + scan ──

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setScanned(null)
    setScanError('')

    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext !== 'docx' && ext !== 'doc') return

    setScanning(true)
    const fd = new FormData()
    fd.append('file', f)
    const result = await scanParesContract(fd)
    setScanning(false)

    if (result.error) { setScanError(result.error); return }

    const d = result.data!
    setScanned(d)
    if (d.clientName  && !clientName) setClientName(d.clientName)
    if (d.notaSugerida && !notas)     setNotas(d.notaSugerida)
    if (d.cuotas.length > 0) setCuotas(fromScanned(d.cuotas))
  }

  function clearFile() {
    setFile(null); setScanned(null); setScanError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Cuota editor ──

  function updateCuota(key: string, field: keyof Omit<EditCuota, '_key' | 'tipo'>, value: string) {
    setCuotas(prev => prev.map(c => c._key === key ? { ...c, [field]: value } : c))
  }

  function removeCuota(key: string) {
    setCuotas(prev => prev.filter(c => c._key !== key))
  }

  function addCuota(tipo: 'cuota' | 'refuerzo') {
    setCuotas(prev => [...prev, makeCuota(tipo)])
  }

  // ── Submit ──

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!clientName.trim()) { setError('El nombre del cliente es requerido'); return }
    if (cuotas.length === 0) { setError('Agregá al menos una cuota'); return }

    // Validar cuotas
    for (let i = 0; i < cuotas.length; i++) {
      const c = cuotas[i]
      const monto = parseInt(c.monto, 10)
      if (!monto || monto <= 0) {
        setError(`Cuota ${i + 1}: el monto debe ser mayor a 0`)
        return
      }
    }

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

    // Construir cuotas con números automáticos por tipo
    let cuotaNum = 1, refuerzoNum = 1
    const cuotaRows = cuotas.map(c => ({
      tipo:              c.tipo,
      numero:            c.tipo === 'cuota' ? cuotaNum++ : refuerzoNum++,
      monto:             parseInt(c.monto, 10),
      fecha_vencimiento: c.fecha || null,
      notas:             c.notas.trim() || null,
    }))

    const res = await createParesContractWithCuotas({
      client_name:       clientName,
      contract_file_url,
      vehiculo:          scanned?.vehiculo ?? null,
      total_precio:      scanned?.totalPrecio ?? null,
      entrada:           scanned?.entrada ?? null,
      notas:             notas.trim() || null,
      cuotas:            cuotaRows,
    })
    setSubmitting(false)
    if (res.error) { setError(res.error); return }
    router.push('/planilla-pagares')
  }

  const cuotasRegulares  = cuotas.filter(c => c.tipo === 'cuota')
  const cuotasRefuerzos  = cuotas.filter(c => c.tipo === 'refuerzo')
  const montoTotal       = cuotas.reduce((s, c) => s + (parseInt(c.monto, 10) || 0), 0)

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/planilla-pagares">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-textprim tracking-tight">Nuevo pagaré</h1>
          <p className="text-sm text-textsec mt-0.5">Registrá el contrato con sus cuotas</p>
        </div>
      </div>

      {/* ── Contrato ── */}
      <Card>
        <CardHeader title="Contrato / documento" subtitle="Subí el .docx y los datos se cargan solos" />

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
              <p className="text-xs text-textsec">Extrayendo cuotas y datos de pago</p>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-orange" />
              <p className="text-sm text-textprim font-medium truncate max-w-[240px]">{file.name}</p>
              <button type="button" onClick={e => { e.stopPropagation(); clearFile() }}
                className="text-xs text-error hover:underline inline-flex items-center gap-1">
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
              <p className="text-sm font-semibold text-success">
                Datos detectados · {scanned.cuotas.length} cuota{scanned.cuotas.length !== 1 ? 's' : ''} extraída{scanned.cuotas.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {scanned.clientName && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <User className="w-3 h-3 text-textsec" />
                  <span className="text-textsec">Cliente:</span>
                  <span className="text-textprim font-medium truncate">{scanned.clientName}</span>
                </div>
              )}
              {scanned.vehiculo && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <Car className="w-3 h-3 text-textsec" />
                  <span className="text-textsec">Vehículo:</span>
                  <span className="text-textprim font-medium">{scanned.vehiculo}</span>
                </div>
              )}
              {scanned.totalPrecio && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-textsec" />
                  <span className="text-textsec">Total:</span>
                  <span className="text-textprim font-medium">{formatCurrency(scanned.totalPrecio)}</span>
                </div>
              )}
              {scanned.entrada && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-textsec" />
                  <span className="text-textsec">Entrada:</span>
                  <span className="text-textprim font-medium">{formatCurrency(scanned.entrada)}</span>
                </div>
              )}
            </div>
            <p className="mt-3 text-[10px] text-textmuted">
              Revisá las cuotas abajo y ajustá si hace falta antes de guardar.
            </p>
          </div>
        )}
      </Card>

      {/* ── Datos del cliente ── */}
      <Card>
        <CardHeader title="Datos del cliente" />
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre del cliente"
            value={clientName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setClientName(e.target.value)}
            placeholder="Juan Pérez"
          />
          <Textarea
            label="Notas (opcional)"
            value={notas}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotas(e.target.value)}
            placeholder="Vehículo, condiciones especiales, observaciones..."
            rows={2}
          />
        </div>
      </Card>

      {/* ── Editor de cuotas ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-textprim">Cuotas y pagarés</h3>
            <p className="text-xs text-textsec mt-0.5">
              {cuotas.length === 0
                ? 'Agregar cuotas manualmente o escaneando un .docx'
                : `${cuotasRegulares.length} cuota${cuotasRegulares.length !== 1 ? 's' : ''} · ${cuotasRefuerzos.length} refuerzo${cuotasRefuerzos.length !== 1 ? 's' : ''} · Total: ${formatCurrency(montoTotal)}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addCuota('cuota')}
              className="inline-flex items-center gap-1.5 text-xs text-textsec hover:text-textprim border border-dashed border-border hover:border-orange/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Cuota
            </button>
            <button
              type="button"
              onClick={() => addCuota('refuerzo')}
              className="inline-flex items-center gap-1.5 text-xs text-warning/70 hover:text-warning border border-dashed border-warning/20 hover:border-warning/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Refuerzo
            </button>
          </div>
        </div>

        {cuotas.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl py-8 text-center">
            <p className="text-sm text-textsec">Sin cuotas agregadas</p>
            <p className="text-xs text-textmuted mt-1">Subí un .docx o usá los botones de arriba</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Header */}
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_32px] gap-2 text-[10px] font-semibold text-textmuted uppercase tracking-wider px-1">
              <span>Tipo</span>
              <span>Vencimiento</span>
              <span>Monto (Gs)</span>
              <span>Notas</span>
              <span />
            </div>

            {cuotas.map((c) => (
              <div key={c._key} className="grid grid-cols-[80px_1fr_1fr_1fr_32px] gap-2 items-center">
                {/* Tipo */}
                <span className={`text-[10px] font-bold px-2 py-1 rounded border text-center ${
                  c.tipo === 'refuerzo'
                    ? 'bg-warning/10 text-warning border-warning/25'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {c.tipo === 'refuerzo' ? 'REFUERZO' : 'CUOTA'}
                </span>

                {/* Fecha */}
                <input
                  type="date"
                  value={c.fecha}
                  onChange={e => updateCuota(c._key, 'fecha', e.target.value)}
                  className="text-xs bg-card-elevated border border-border rounded-lg px-2.5 py-1.5 text-textprim focus:outline-none focus:border-orange/60 w-full"
                />

                {/* Monto */}
                <input
                  type="number"
                  value={c.monto}
                  onChange={e => updateCuota(c._key, 'monto', e.target.value)}
                  placeholder="2500000"
                  min="1"
                  className="text-xs bg-card-elevated border border-border rounded-lg px-2.5 py-1.5 text-textprim placeholder:text-textmuted focus:outline-none focus:border-orange/60 w-full tabular-nums"
                />

                {/* Notas */}
                <input
                  type="text"
                  value={c.notas}
                  onChange={e => updateCuota(c._key, 'notas', e.target.value)}
                  placeholder="A convenir..."
                  className="text-xs bg-card-elevated border border-border rounded-lg px-2.5 py-1.5 text-textprim placeholder:text-textmuted focus:outline-none focus:border-orange/60 w-full"
                />

                {/* Quitar */}
                <button
                  type="button"
                  onClick={() => removeCuota(c._key)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-textmuted hover:text-error hover:bg-error/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Envío ── */}
      <Card>
        {error && (
          <div className="mb-4 text-sm text-error bg-error/8 border border-error/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-end gap-3">
            <Link href="/planilla-pagares">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" loading={submitting}>
              {uploading ? 'Subiendo archivo…' : 'Guardar pagaré'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
