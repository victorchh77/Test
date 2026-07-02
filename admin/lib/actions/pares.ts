'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ParesContract, ParesPayment, ActionResult } from '@/types'

// ── Tipos del escáner ─────────────────────────────────────────────────────
export interface ScannedContract {
  clientName:  string | null
  diaPago:     number | null
  montoCuota:  number | null
  cuotaCount:  number | null
  vehiculo:    string | null
  totalPrecio: number | null
  entrada:     number | null
  notaSugerida: string | null
}

function parseGuaranies(s: string): number {
  return parseInt(s.replace(/[.,\s]/g, ''), 10)
}

function parseContractText(text: string): ScannedContract {
  const t = text.replace(/\s+/g, ' ').trim()

  // Nombre del primer comprador — "por la otra parte, el señor/la señora NOMBRE,"
  let clientName: string | null = null
  const buyerM = t.match(/por la otra parte[,\s]+(?:el se[ñn]or|la se[ñn]ora)\s+([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-záéíóúüñ\s]+?)(?:,\s*paraguayo|,\s*paraguaya|,\s*con C\.I)/i)
  if (buyerM) clientName = buyerM[1].trim()

  // Número de cuotas — "(17) cuotas iguales"
  let cuotaCount: number | null = null
  const ccM = t.match(/\((\d+)\)\s+cuotas?\s+iguales/i)
  if (ccM) cuotaCount = parseInt(ccM[1], 10)

  // Monto de cuota — "cuotas iguales ... (GsX)"  o  "de GUARANIES ... (GsX.XXX.XXX)"
  let montoCuota: number | null = null
  const caM = t.match(/cuotas?\s+iguales[^(]+\(Gs([\d.,]+)\)/i)
  if (caM) montoCuota = parseGuaranies(caM[1])

  // Día de pago — primer día en fechas "DD/MM/AAAA"
  let diaPago: number | null = null
  const dM = t.match(/(\d{1,2})\/\d{2}\/\d{4}/)
  if (dM) diaPago = parseInt(dM[1], 10)

  // Vehículo — "Marca: X; Modelo: Y; ... Año: ZZZZ"
  let vehiculo: string | null = null
  const vM = t.match(/Marca:\s*([^;]+);\s*Modelo:\s*([^;]+).*?A[ñn]o:\s*(\d{4})/i)
  if (vM) vehiculo = `${vM[1].trim()} ${vM[2].trim()} ${vM[3]}`

  // Precio total — "precio total ... (GsX)"
  let totalPrecio: number | null = null
  const tM = t.match(/precio total[^(]+\(Gs([\d.,]+)\)/i)
  if (tM) totalPrecio = parseGuaranies(tM[1])

  // Entrada — "recibir ... (GsX)"
  let entrada: number | null = null
  const eM = t.match(/recib[eio][^(]+\(Gs([\d.,]+)\)/i)
  if (eM) entrada = parseGuaranies(eM[1])

  // Nota sugerida
  const partes: string[] = []
  if (vehiculo)    partes.push(vehiculo)
  if (totalPrecio) partes.push(`Total Gs ${totalPrecio.toLocaleString('es-PY')}`)
  if (entrada)     partes.push(`Entrada Gs ${entrada.toLocaleString('es-PY')}`)
  if (cuotaCount && montoCuota)
    partes.push(`${cuotaCount} cuotas de Gs ${montoCuota.toLocaleString('es-PY')}`)

  return {
    clientName,
    diaPago,
    montoCuota,
    cuotaCount,
    vehiculo,
    totalPrecio,
    entrada,
    notaSugerida: partes.length ? partes.join(' · ') : null,
  }
}

export async function scanParesContract(formData: FormData): Promise<ActionResult<ScannedContract>> {
  const file = formData.get('file') as File | null
  if (!file) return { error: 'No se recibió archivo' }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'docx' && ext !== 'doc') {
    return { error: 'Solo se admiten archivos .docx para el escaneo automático' }
  }

  try {
    const mammoth = await import('mammoth')
    const buffer = Buffer.from(await file.arrayBuffer())
    const { value: text } = await mammoth.extractRawText({ buffer })
    if (!text.trim()) return { error: 'No se pudo extraer texto del documento' }
    return { data: parseContractText(text) }
  } catch (err) {
    console.error('scanParesContract:', err)
    return { error: 'Error al leer el archivo. Verificá que sea un .docx válido.' }
  }
}

export async function getParesContracts(): Promise<ParesContract[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pagares_contracts')
    .select('*')
    .order('client_name', { ascending: true })
  if (error) { console.error(error); return [] }
  return (data ?? []) as ParesContract[]
}

/**
 * URLs firmadas (temporales) para los contratos guardados como path en el
 * bucket privado `pagares-contracts`. Solo admin/secretaria pasan el RLS.
 * Devuelve un mapa path -> signedUrl. Valores legacy http se ignoran.
 */
export async function getContratoSignedUrls(paths: string[]): Promise<Record<string, string>> {
  const clean = paths.filter((p) => p && !p.startsWith('http'))
  if (!clean.length) return {}
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('pagares-contracts')
    .createSignedUrls(clean, 60 * 60) // 1 hora
  if (error || !data) return {}
  const map: Record<string, string> = {}
  data.forEach((d) => { if (d.path && d.signedUrl) map[d.path] = d.signedUrl })
  return map
}

export async function createParesContract(data: {
  client_name: string
  dia_pago: number
  monto_mensual: number
  contract_file_url: string | null
  notas: string | null
}): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  if (!data.client_name.trim()) return { error: 'El nombre del cliente es requerido' }
  if (data.dia_pago < 1 || data.dia_pago > 31) return { error: 'Día de pago inválido (1–31)' }
  if (!data.monto_mensual || data.monto_mensual <= 0) return { error: 'El monto debe ser mayor a 0' }

  const { error } = await supabase.from('pagares_contracts').insert({
    client_name: data.client_name.trim(),
    dia_pago: data.dia_pago,
    monto_mensual: data.monto_mensual,
    contract_file_url: data.contract_file_url,
    notas: data.notas,
    created_by: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath('/planilla-pagares')
  return { data: null }
}

export async function toggleParesContract(id: string, activo: boolean): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase
    .from('pagares_contracts')
    .update({ activo })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/planilla-pagares')
  return { data: null }
}

export async function getParesPaymentsForMonth(anio: number, mes: number): Promise<ParesPayment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pagares_payments')
    .select('*')
    .eq('anio', anio)
    .eq('mes', mes)
  if (error) { console.error(error); return [] }
  return (data ?? []) as ParesPayment[]
}

export async function upsertParesPayment(
  contract_id: string,
  anio: number,
  mes: number,
  pagado: boolean,
  metodo_pago: string | null,
): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from('pagares_payments').upsert(
    {
      contract_id,
      anio,
      mes,
      pagado,
      metodo_pago: pagado ? metodo_pago : null,
      pagado_at: pagado ? new Date().toISOString() : null,
    },
    { onConflict: 'contract_id,anio,mes' },
  )
  if (error) return { error: error.message }
  revalidatePath('/planilla-pagares')
  return { data: null }
}
