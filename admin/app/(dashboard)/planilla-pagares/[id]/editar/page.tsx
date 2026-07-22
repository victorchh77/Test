'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getParesContract, updateParesContract } from '@/lib/actions/pares'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { ParesContract } from '@/types'

export default function EditarPagarePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [contract, setContract]     = useState<ParesContract | null>(null)
  const [clientName, setClientName] = useState('')
  const [vehiculo, setVehiculo]     = useState('')
  const [totalPrecio, setTotalPrecio] = useState('')
  const [entrada, setEntrada]       = useState('')
  const [moneda, setMoneda]         = useState<'Gs' | 'USD'>('Gs')
  const [notas, setNotas]           = useState('')
  const [contractFileUrl, setContractFileUrl] = useState<string | null>(null)
  const [file, setFile]             = useState<File | null>(null)
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    getParesContract(id).then(c => {
      if (!c) return
      setContract(c)
      setClientName(c.client_name)
      setVehiculo(c.vehiculo ?? '')
      setTotalPrecio(c.total_precio != null ? String(c.total_precio) : '')
      setEntrada(c.entrada != null ? String(c.entrada) : '')
      setMoneda(c.moneda)
      setNotas(c.notas ?? '')
      setContractFileUrl(c.contract_file_url)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!clientName.trim()) { setError('El nombre del cliente es requerido'); return }

    setSubmitting(true)
    let contract_file_url = contractFileUrl

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

    const res = await updateParesContract(id, {
      client_name: clientName,
      contract_file_url,
      vehiculo: vehiculo.trim() || null,
      total_precio: totalPrecio.trim() ? parseInt(totalPrecio, 10) : null,
      entrada: entrada.trim() ? parseInt(entrada, 10) : null,
      moneda,
      notas: notas.trim() || null,
    })
    setSubmitting(false)
    if (res.error) { setError(res.error); return }
    router.push('/planilla-pagares?ver=contratos')
  }

  if (!contract) return <PageLoader />

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/planilla-pagares?ver=contratos">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-textprim tracking-tight">Editar pagaré</h1>
          <p className="text-sm text-textsec mt-0.5">{contract.client_name}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Datos del contrato" subtitle="Las cuotas se administran desde la tarjeta del contrato" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre del cliente"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Juan Pérez"
          />
          <Input
            label="Vehículo (opcional)"
            value={vehiculo}
            onChange={e => setVehiculo(e.target.value)}
            placeholder="Toyota Corolla 2018"
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <Input
                label="Total contrato"
                type="number"
                value={totalPrecio}
                onChange={e => setTotalPrecio(e.target.value)}
                placeholder="0"
              />
              <Input
                label="Entrada"
                type="number"
                value={entrada}
                onChange={e => setEntrada(e.target.value)}
                placeholder="0"
              />
            </div>
            <Select
              label="Moneda"
              value={moneda}
              onChange={e => setMoneda(e.target.value as 'Gs' | 'USD')}
              options={[{ value: 'Gs', label: 'Gs.' }, { value: 'USD', label: 'USD' }]}
            />
          </div>

          {/* File upload */}
          <div>
            <p className="section-label mb-2">Contrato / documento</p>
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
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-orange" />
                  <p className="text-sm text-textprim font-medium truncate max-w-[240px]">{file.name}</p>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="text-xs text-error hover:underline inline-flex items-center gap-1">
                    <X className="w-3 h-3" /> Quitar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Upload className="w-8 h-8 text-textmuted" />
                  <p className="text-sm text-textsec">
                    {contractFileUrl ? 'Hacé clic para reemplazar el contrato actual' : 'Adjuntá el contrato firmado'}
                  </p>
                  <p className="text-xs text-textmuted">PDF, JPG, PNG, DOCX — opcional</p>
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
            <Link href="/planilla-pagares?ver=contratos">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" loading={submitting}>
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
