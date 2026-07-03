'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ParesContract, ParesCuota, ParesContractWithCuotas, ParesPayment, ActionResult } from '@/types'

// ── Tipos del escáner ─────────────────────────────────────────────────────

export interface ScannedCuota {
  tipo: 'cuota' | 'refuerzo'
  numero: number
  monto: number
  fecha_vencimiento: string | null  // YYYY-MM-DD o null ("a convenir")
  notas: string | null
}

export interface ScannedContract {
  clientName:   string | null
  vehiculo:     string | null
  totalPrecio:  number | null
  entrada:      number | null
  cuotas:       ScannedCuota[]
  // Campos legacy para retro-compatibilidad con el formulario de vista previa
  diaPago:      number | null
  montoCuota:   number | null
  cuotaCount:   number | null
  notaSugerida: string | null
}

// ── Helpers de parseo ─────────────────────────────────────────────────────

function parseGuaranies(s: string): number {
  return parseInt(s.replace(/[.,\s]/g, ''), 10)
}

/** DD/MM/YYYY → YYYY-MM-DD */
function parseDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('/').map(Number)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Expande "25/09/2026 al 25/11/2027" en todas las fechas mensuales del mismo día. */
function expandMonthlyRange(startIso: string, endIso: string): string[] {
  const [sy, sm, sd] = startIso.split('-').map(Number)
  const [ey, em]     = endIso.split('-').map(Number)
  const dates: string[] = []
  let y = sy, m = sm
  while (y < ey || (y === ey && m <= em)) {
    const maxDay = new Date(y, m, 0).getDate()
    const day    = Math.min(sd, maxDay)
    dates.push(`${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return dates
}

/**
 * Extrae todas las fechas individuales + rangos "DD/MM/YYYY al DD/MM/YYYY"
 * de un bloque de texto.  Los extremos de los rangos no se duplican.
 */
function extractDates(text: string): string[] {
  const dates: string[] = []
  const rangeBounds = new Set<string>()

  const rangeRe = /(\d{1,2}\/\d{2}\/\d{4})\s+al\s+(\d{1,2}\/\d{2}\/\d{4})/g
  let m: RegExpExecArray | null
  while ((m = rangeRe.exec(text)) !== null) {
    rangeBounds.add(m[1])
    rangeBounds.add(m[2])
    expandMonthlyRange(parseDate(m[1]), parseDate(m[2])).forEach(d => dates.push(d))
  }

  const singleRe = /(\d{1,2}\/\d{2}\/\d{4})/g
  while ((m = singleRe.exec(text)) !== null) {
    if (!rangeBounds.has(m[1])) dates.push(parseDate(m[1]))
  }

  return Array.from(new Set(dates)).sort()
}

function parseContractText(text: string): ScannedContract {
  const t = text.replace(/\s+/g, ' ').trim()

  // Nombre del comprador
  let clientName: string | null = null
  const buyerM = t.match(
    /por la otra parte[,\s]+(?:el se[ñn]or|la se[ñn]ora)\s+([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-záéíóúüñ\s]+?)(?:,\s*paraguayo|,\s*paraguaya|,\s*con C\.I)/i,
  )
  if (buyerM) clientName = buyerM[1].trim()

  // Vehículo
  let vehiculo: string | null = null
  const vM = t.match(/Marca:\s*([^;]+);\s*Modelo:\s*([^;]+).*?A[ñn]o:\s*(\d{4})/i)
  if (vM) vehiculo = `${vM[1].trim()} ${vM[2].trim()} ${vM[3]}`

  // Precio total
  let totalPrecio: number | null = null
  const tM = t.match(/precio total[^(]+\(Gs([\d.,]+)\)/i)
  if (tM) totalPrecio = parseGuaranies(tM[1])

  // Entrada
  let entrada: number | null = null
  const eM = t.match(/recib[eio][^(]+\(Gs([\d.,]+)\)/i)
  if (eM) entrada = parseGuaranies(eM[1])

  // Cuota monto y cantidad (campos legacy)
  let montoCuota: number | null = null
  let cuotaCount: number | null = null
  const caM = t.match(/cuotas?\s+iguales[^(]+\(Gs([\d.,]+)\)/i)
  if (caM) montoCuota = parseGuaranies(caM[1])
  const ccM = t.match(/\((\d+)\)\s+cuotas?\s+iguales/i)
  if (ccM) cuotaCount = parseInt(ccM[1])

  // Día de pago legacy (primer día hallado en fechas DD/MM/YYYY)
  let diaPago: number | null = null
  const dM = t.match(/(\d{1,2})\/\d{2}\/\d{4}/)
  if (dM) diaPago = parseInt(dM[1])

  // ── Separar sección cuotas / refuerzos ──
  // Busca la primera aparición de "refuerzo" para dividir el texto
  const refuerzoIdx = t.toLowerCase().indexOf('refuerzo')
  const cuotaBlock   = refuerzoIdx > 0 ? t.slice(0, refuerzoIdx) : t
  const refuerzoBlock = refuerzoIdx > 0 ? t.slice(refuerzoIdx) : ''

  // ── Cuotas regulares ──
  const cuotas: ScannedCuota[] = []
  const cuotaDates = extractDates(cuotaBlock)

  if (montoCuota && cuotaDates.length > 0) {
    cuotaDates.forEach((fecha, i) => {
      cuotas.push({ tipo: 'cuota', numero: i + 1, monto: montoCuota!, fecha_vencimiento: fecha, notas: null })
    })
    // Completar con cuotas "a convenir" si el contrato dice más cuotas que fechas encontradas
    if (cuotaCount && cuotaCount > cuotaDates.length) {
      for (let i = cuotaDates.length + 1; i <= cuotaCount; i++) {
        cuotas.push({ tipo: 'cuota', numero: i, monto: montoCuota!, fecha_vencimiento: null, notas: 'A convenir' })
      }
    }
  } else if (montoCuota && cuotaCount) {
    for (let i = 1; i <= cuotaCount; i++) {
      cuotas.push({ tipo: 'cuota', numero: i, monto: montoCuota, fecha_vencimiento: null, notas: null })
    }
  }

  // ── Refuerzos ──
  if (refuerzoBlock) {
    const WORD_NUM: Record<string, number> = {
      un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
      seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
    }

    const refAmtRe = /\(Gs([\d.,]+)\)/g
    let rm: RegExpExecArray | null
    let refNum = 1

    while ((rm = refAmtRe.exec(refuerzoBlock)) !== null) {
      const monto = parseGuaranies(rm[1])
      if (!monto || monto <= 0) continue
      if (totalPrecio && monto === totalPrecio) continue
      if (entrada && monto === entrada) continue

      // Look back up to 160 chars for an explicit count like "(2) pagarés" or "DOS (2)"
      const before = refuerzoBlock.slice(Math.max(0, rm.index - 160), rm.index)
      let count = 1
      const numParenM = before.match(/\((\d+)\)\s*pagar[eé]s?/i)
      const wordNumM  = before.match(
        /\b(un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+\((\d+)\)/i,
      )
      if (wordNumM) count = parseInt(wordNumM[2]) || WORD_NUM[wordNumM[1].toLowerCase()] || 1
      else if (numParenM) count = parseInt(numParenM[1]) || 1

      // Collect up to `count` dates from the text following this amount
      const after = refuerzoBlock.slice(rm.index + rm[0].length, rm.index + rm[0].length + 400)
      const afterDates: string[] = []
      const dateRe2 = /(\d{1,2}\/\d{2}\/\d{4})/g
      let dm: RegExpExecArray | null
      while ((dm = dateRe2.exec(after)) !== null) {
        afterDates.push(parseDate(dm[1]))
        if (afterDates.length >= count) break
      }

      for (let i = 0; i < count; i++) {
        const fecha = afterDates[i] ?? null
        cuotas.push({
          tipo: 'refuerzo',
          numero: refNum++,
          monto,
          fecha_vencimiento: fecha,
          notas: !fecha ? 'A convenir' : null,
        })
      }
    }
  }

  // Nota sugerida
  const partes: string[] = []
  if (vehiculo)    partes.push(vehiculo)
  if (totalPrecio) partes.push(`Total Gs ${totalPrecio.toLocaleString('es-PY')}`)
  if (entrada)     partes.push(`Entrada Gs ${entrada.toLocaleString('es-PY')}`)
  if (cuotaCount && montoCuota)
    partes.push(`${cuotaCount} cuotas de Gs ${montoCuota.toLocaleString('es-PY')}`)

  return {
    clientName,
    vehiculo,
    totalPrecio,
    entrada,
    cuotas,
    diaPago,
    montoCuota,
    cuotaCount,
    notaSugerida: partes.length ? partes.join(' · ') : null,
  }
}

// ── Escáner de contrato ───────────────────────────────────────────────────

export async function scanParesContract(formData: FormData): Promise<ActionResult<ScannedContract>> {
  const file = formData.get('file') as File | null
  if (!file) return { error: 'No se recibió archivo' }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'docx' && ext !== 'doc') {
    return { error: 'Solo se admiten archivos .docx para el escaneo automático' }
  }

  try {
    const mammoth = await import('mammoth')
    const buffer  = Buffer.from(await file.arrayBuffer())
    const { value: text } = await mammoth.extractRawText({ buffer })
    if (!text.trim()) return { error: 'No se pudo extraer texto del documento' }
    return { data: parseContractText(text) }
  } catch (err) {
    console.error('scanParesContract:', err)
    return { error: 'Error al leer el archivo. Verificá que sea un .docx válido.' }
  }
}

// ── Lecturas ──────────────────────────────────────────────────────────────

export async function getParesContracts(): Promise<ParesContract[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pagares_contracts')
    .select('*')
    .order('client_name', { ascending: true })
  if (error) { console.error(error); return [] }
  return (data ?? []) as ParesContract[]
}

export async function getParesContractsWithCuotas(): Promise<ParesContractWithCuotas[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pagares_contracts')
    .select('*, pagares_cuotas(*)')
    .order('client_name', { ascending: true })
  if (error) { console.error(error); return [] }

  return (data ?? []).map((row) => ({
    ...row,
    cuotas: ((row.pagares_cuotas ?? []) as ParesCuota[]).sort((a, b) => {
      // Cuotas regulares primero, luego refuerzos; dentro de cada tipo por número
      if (a.tipo !== b.tipo) return a.tipo === 'cuota' ? -1 : 1
      return a.numero - b.numero
    }),
  })) as ParesContractWithCuotas[]
}

export async function getContratoSignedUrls(paths: string[]): Promise<Record<string, string>> {
  const clean = paths.filter((p) => p && !p.startsWith('http'))
  if (!clean.length) return {}
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('pagares-contracts')
    .createSignedUrls(clean, 60 * 60)
  if (error || !data) return {}
  const map: Record<string, string> = {}
  data.forEach((d) => { if (d.path && d.signedUrl) map[d.path] = d.signedUrl })
  return map
}

// ── Escrituras ────────────────────────────────────────────────────────────

export interface CreateCuotaInput {
  tipo: 'cuota' | 'refuerzo'
  numero: number
  monto: number
  fecha_vencimiento: string | null  // YYYY-MM-DD o null
  notas: string | null
}

export async function createParesContractWithCuotas(data: {
  client_name: string
  contract_file_url: string | null
  vehiculo: string | null
  numero_chassis: string | null
  total_precio: number | null
  entrada: number | null
  notas: string | null
  cuotas: CreateCuotaInput[]
}): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  if (!data.client_name.trim()) return { error: 'El nombre del cliente es requerido' }
  if (!data.cuotas.length) return { error: 'Debés agregar al menos una cuota' }

  // Auto find-or-create client in clients table
  let clientId: string | null = null
  const clientNameTrimmed = data.client_name.trim()
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .ilike('nombre', clientNameTrimmed)
    .maybeSingle()
  if (existingClient) {
    clientId = existingClient.id
  } else {
    const { data: newClient } = await supabase
      .from('clients')
      .insert({ nombre: clientNameTrimmed })
      .select('id')
      .single()
    if (newClient) clientId = newClient.id
  }

  // Look up vehicle by chassis number
  let vehicleId: string | null = null
  const chassisTrimmed = (data.numero_chassis ?? '').trim()
  if (chassisTrimmed) {
    const { data: foundVehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('numero_chassis', chassisTrimmed)
      .maybeSingle()
    if (foundVehicle) vehicleId = foundVehicle.id
  }

  // Derivar dia_pago y monto_mensual desde las cuotas (compatibilidad con schema existente)
  const firstCuota = data.cuotas.find(c => c.tipo === 'cuota') ?? data.cuotas[0]
  const diaPago = firstCuota.fecha_vencimiento
    ? parseInt(firstCuota.fecha_vencimiento.split('-')[2])
    : 1
  const montoMensual = firstCuota.monto

  const { data: contract, error: contractErr } = await supabase
    .from('pagares_contracts')
    .insert({
      client_name:       clientNameTrimmed,
      contract_file_url: data.contract_file_url,
      vehiculo:          data.vehiculo,
      total_precio:      data.total_precio,
      entrada:           data.entrada,
      notas:             data.notas,
      dia_pago:          diaPago,
      monto_mensual:     montoMensual,
      client_id:         clientId,
      vehicle_id:        vehicleId,
      created_by:        user.id,
    })
    .select('id')
    .single()

  if (contractErr || !contract) return { error: contractErr?.message ?? 'Error al crear contrato' }

  const cuotaRows = data.cuotas.map(c => ({
    contract_id:       contract.id,
    tipo:              c.tipo,
    numero:            c.numero,
    monto:             c.monto,
    fecha_vencimiento: c.fecha_vencimiento || null,
    notas:             c.notas || null,
  }))

  const { error: cuotasErr } = await supabase.from('pagares_cuotas').insert(cuotaRows)
  if (cuotasErr) return { error: cuotasErr.message }

  revalidatePath('/planilla-pagares')
  revalidatePath('/clientes')
  return { data: null }
}

export async function toggleCuotaPagada(
  cuotaId: string,
  pagado: boolean,
  metodoPago: string | null,
): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase
    .from('pagares_cuotas')
    .update({
      pagado,
      pagado_at:   pagado ? new Date().toISOString() : null,
      metodo_pago: pagado ? metodoPago : null,
    })
    .eq('id', cuotaId)
  if (error) return { error: error.message }
  revalidatePath('/planilla-pagares')
  return { data: null }
}

export async function addCuotaToContract(
  contractId: string,
  cuota: CreateCuotaInput,
): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from('pagares_cuotas').insert({
    contract_id:       contractId,
    tipo:              cuota.tipo,
    numero:            cuota.numero,
    monto:             cuota.monto,
    fecha_vencimiento: cuota.fecha_vencimiento || null,
    notas:             cuota.notas || null,
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

// ── Legacy (mantener compatibilidad) ─────────────────────────────────────

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
    client_name:       data.client_name.trim(),
    dia_pago:          data.dia_pago,
    monto_mensual:     data.monto_mensual,
    contract_file_url: data.contract_file_url,
    notas:             data.notas,
    created_by:        user.id,
  })
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
      pagado_at:   pagado ? new Date().toISOString() : null,
    },
    { onConflict: 'contract_id,anio,mes' },
  )
  if (error) return { error: error.message }
  revalidatePath('/planilla-pagares')
  return { data: null }
}
