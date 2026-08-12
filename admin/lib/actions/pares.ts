'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdminOrSecretary } from '@/lib/auth/roles'
import { paresContractSchema, paresContractUpdateSchema, cuotaInputSchema, paresPaymentSchema } from '@/lib/validations/pares'
import { parseInput } from '@/lib/validations/parse'
import { logAudit } from '@/lib/audit'
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
  moneda:       'Gs' | 'USD'
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

  // Nombre del comprador (solo el primero, si hay más de uno). El segundo
  // grupo opcional absorbe un "el señor"/"la señora" duplicado por error de
  // tipeo en el documento original (pasa en algún contrato real).
  let clientName: string | null = null
  const buyerM = t.match(
    /por la otra parte[,\s]+(?:el se[ñn]or|la se[ñn]ora)\s+(?:el se[ñn]or\s+|la se[ñn]ora\s+)?([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-záéíóúüñ\s]+?)(?:,\s*paraguayo|,\s*paraguaya|,\s*con C\.I)/i,
  )
  if (buyerM) clientName = buyerM[1].trim()

  // Vehículo (admite "Marca: X; Modelo: Y" o "Marca: X, Modelo: Y"). El
  // modelo también se corta en coma (no solo punto y coma): sin este límite,
  // un contrato sin punto y coma en esta cláusula hace que la captura se
  // extienda sin control hasta el primer ";" del documento — que puede estar
  // varias frases más adelante (ej. dentro de la descripción del vehículo
  // recibido en permuta) — produciendo un texto larguísimo que después
  // revienta el límite de longitud del campo al guardar.
  let vehiculo: string | null = null
  const vM = t.match(/Marca:\s*([^;,]+)[;,]\s*Modelo:\s*([^;,]+).*?A[ñn]o:\s*(\d{4})/i)
  if (vM) {
    const marca = vM[1].trim()
    const anio  = vM[3]
    let modelo  = vM[2].trim()
    // Evita duplicar el año si el modelo ya lo trae como sufijo ("TUCSON/2010")
    if (modelo.endsWith(`/${anio}`)) modelo = modelo.slice(0, -(anio.length + 1))
    vehiculo = `${marca} ${modelo} ${anio}`
  }

  // Precio total — moneda detectada del símbolo entre paréntesis (Gs o $)
  let totalPrecio: number | null = null
  let moneda: 'Gs' | 'USD' = 'Gs'
  const tM = t.match(/precio total[^(]+\((Gs|\$)([\d.,]+)\)/i)
  if (tM) {
    moneda = tM[1] === '$' ? 'USD' : 'Gs'
    totalPrecio = parseGuaranies(tM[2])
  }

  // Entrada: monto recibido en efectivo + (si existe) vehículo recibido en
  // permuta como parte de pago, que se detalla en las notas sugeridas.
  let entrada: number | null = null
  const eM = t.match(/recib[eio][^(]+\((?:Gs|\$)([\d.,]+)\)/i)
  if (eM) entrada = parseGuaranies(eM[1])

  // Nota: se corta en el primer ". " (punto + espacio) en vez de en
  // cualquier punto, porque abreviaturas como "N.º" llevan un punto pegado
  // al símbolo siguiente sin espacio y no deben cortar la descripción.
  let permutaVehiculo: string | null = null
  const permutaM = t.match(/por la suma de[\s\S]+?\((?:Gs|\$)([\d.,]+)\)[\s\S]*?parte de pago[\s\S]*?veh[ií]culo de su propiedad,\s*([\s\S]+?)\.\s/i)
  if (permutaM) {
    entrada = (entrada ?? 0) + parseGuaranies(permutaM[1])
    permutaVehiculo = permutaM[2].trim()
  }

  // Saldo — usado solo como respaldo si no se pudo detectar la entrada arriba
  const sM = t.match(/saldo de[^(]+\((?:Gs|\$)([\d.,]+)\)/i)
  const saldo = sM ? parseGuaranies(sM[1]) : null
  if (entrada == null && totalPrecio != null && saldo != null) entrada = totalPrecio - saldo

  // ── Grupos de pagarés ──────────────────────────────────────────────────
  // Cada grupo: "(N) pagarés [de refuerzo] [iguales] de <MONEDA> ... (<monto>)"
  // seguido de sus fechas de vencimiento. Un contrato puede tener varios
  // grupos con montos distintos sin que estén etiquetados "de refuerzo"
  // (ej. cuotas mensuales + un par de pagos más grandes en diciembre).
  // Acepta tanto "cuotas" como "pagarés" (contratos reales usan "pagarés";
  // algún molde alternativo usa "cuotas") y detecta "refuerzo" en cualquier
  // punto del grupo, ya que a veces va pegado a la palabra ("pagaré de
  // refuerzo") y otras después de "iguales" ("pagarés iguales de refuerzo").
  interface Grupo { count: number; monto: number; refuerzo: boolean; start: number; end: number }
  const groups: Grupo[] = []
  const groupRe = /\((\d+)\)\s*(?:cuotas?|pagar[ée]s?)[^(]*?\((?:Gs|\$)([\d.,]+)\)/gi
  let gm: RegExpExecArray | null
  while ((gm = groupRe.exec(t)) !== null) {
    groups.push({
      count: parseInt(gm[1], 10),
      refuerzo: /refuerzo/i.test(gm[0]),
      monto: parseGuaranies(gm[2]),
      start: gm.index,
      end: gm.index + gm[0].length,
    })
  }

  // Los grupos terminan (para efectos de buscar sus fechas) en el siguiente
  // grupo, o en la mención de "suscribiendo/subscritos" que cierra la cláusula.
  const lastEnd = groups.length ? groups[groups.length - 1].end : 0
  const closingIdx = t.slice(lastEnd).search(/suscri|subscri/i)
  const clauseEnd = closingIdx >= 0 ? lastEnd + closingIdx : t.length

  const cuotas: ScannedCuota[] = []
  let cuotaNum = 1, refuerzoNum = 1

  groups.forEach((g, i) => {
    const rangeStart = g.end
    const rangeEnd   = i < groups.length - 1 ? groups[i + 1].start : clauseEnd
    const windowText = t.slice(rangeStart, Math.max(rangeStart, rangeEnd))
    const dates = extractDates(windowText)
    // Un pagaré único sin ninguna fecha y que no dice explícitamente "a
    // convenir" suele ser un pago en especie/servicios (ej. "se abonará con
    // trabajos de herrería") — se usa ese texto como nota en vez del
    // genérico "A convenir" para no perder esa condición particular.
    let fallbackNote: string | null = null
    if (dates.length === 0 && g.count === 1 && !/a\s+convenir/i.test(windowText)) {
      const cleaned = windowText.replace(/^[,;\s]+|[\s-]+$/g, '').trim()
      if (cleaned.split(/\s+/).filter(Boolean).length > 5) fallbackNote = cleaned.slice(0, 300)
    }
    for (let n = 0; n < g.count; n++) {
      const fecha = dates[n] ?? null
      cuotas.push({
        tipo: g.refuerzo ? 'refuerzo' : 'cuota',
        numero: g.refuerzo ? refuerzoNum++ : cuotaNum++,
        monto: g.monto,
        fecha_vencimiento: fecha,
        notas: fecha ? null : (fallbackNote ?? 'A convenir'),
      })
    }
  })

  // Campos legacy (derivados del primer grupo, para compatibilidad)
  const montoCuota = groups[0]?.monto ?? null
  const cuotaCount = groups[0]?.count ?? null
  let diaPago: number | null = null
  const dM = t.match(/(\d{1,2})\/\d{2}\/\d{4}/)
  if (dM) diaPago = parseInt(dM[1])

  // Nota sugerida
  const simbolo = moneda === 'USD' ? '$' : 'Gs'
  const partes: string[] = []
  if (vehiculo)    partes.push(vehiculo)
  if (totalPrecio) partes.push(`Total ${simbolo} ${totalPrecio.toLocaleString('es-PY')}`)
  if (entrada)     partes.push(`Entrada ${simbolo} ${entrada.toLocaleString('es-PY')}`)
  groups.forEach(g => {
    partes.push(`${g.count} ${g.refuerzo ? 'refuerzo(s)' : 'pagarés'} de ${simbolo} ${g.monto.toLocaleString('es-PY')}`)
  })
  if (permutaVehiculo) partes.push(`Vehículo recibido en permuta: ${permutaVehiculo}`)

  return {
    clientName,
    vehiculo,
    totalPrecio,
    entrada,
    moneda,
    cuotas,
    diaPago,
    montoCuota,
    cuotaCount,
    notaSugerida: partes.length ? partes.join(' · ') : null,
  }
}

// ── Escáner de contrato ───────────────────────────────────────────────────

const MAX_CONTRACT_BYTES = 10 * 1024 * 1024 // 10MB

export async function scanParesContract(formData: FormData): Promise<ActionResult<ScannedContract>> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const file = formData.get('file') as File | null
  if (!file) return { error: 'No se recibió archivo' }
  if (file.size > MAX_CONTRACT_BYTES) return { error: 'El archivo supera el tamaño máximo permitido (10MB).' }

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

export async function getParesContract(id: string): Promise<ParesContract | null> {
  const supabase = createClient()
  const { data } = await supabase.from('pagares_contracts').select('*').eq('id', id).single()
  return (data ?? null) as ParesContract | null
}

export async function getParesContractWithCuotas(id: string): Promise<ParesContractWithCuotas | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pagares_contracts')
    .select('*, pagares_cuotas(*)')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return {
    ...data,
    cuotas: ((data.pagares_cuotas ?? []) as ParesCuota[]).sort((a, b) => {
      if (a.tipo !== b.tipo) return a.tipo === 'cuota' ? -1 : 1
      return a.numero - b.numero
    }),
  } as ParesContractWithCuotas
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
  moneda: 'Gs' | 'USD'
  notas: string | null
  cuotas: CreateCuotaInput[]
}): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const parsed = parseInput(paresContractSchema, data)
  if (!parsed.success) return { error: parsed.error }
  data = parsed.data
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

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
      moneda:            data.moneda,
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
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
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
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const parsed = parseInput(cuotaInputSchema, cuota)
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()
  const { error } = await supabase.from('pagares_cuotas').insert({
    contract_id:       contractId,
    tipo:              parsed.data.tipo,
    numero:            parsed.data.numero,
    monto:             parsed.data.monto,
    fecha_vencimiento: parsed.data.fecha_vencimiento || null,
    notas:             parsed.data.notas || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/planilla-pagares')
  return { data: null }
}

export async function updateCuota(
  cuotaId: string,
  cuota: CreateCuotaInput,
): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const parsed = parseInput(cuotaInputSchema, cuota)
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()
  const { error } = await supabase
    .from('pagares_cuotas')
    .update({
      tipo:              parsed.data.tipo,
      numero:            parsed.data.numero,
      monto:             parsed.data.monto,
      fecha_vencimiento: parsed.data.fecha_vencimiento || null,
      notas:             parsed.data.notas || null,
    })
    .eq('id', cuotaId)
  if (error) return { error: error.message }
  revalidatePath('/planilla-pagares')
  return { data: null }
}

export async function deleteCuota(cuotaId: string): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const supabase = createClient()
  const { error } = await supabase.from('pagares_cuotas').delete().eq('id', cuotaId)
  if (error) return { error: error.message }
  await logAudit('pares_cuota.delete', 'pares_cuota', cuotaId)
  revalidatePath('/planilla-pagares')
  return { data: null }
}

export async function toggleParesContract(id: string, activo: boolean): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const supabase = createClient()
  const { error } = await supabase
    .from('pagares_contracts')
    .update({ activo })
    .eq('id', id)
  if (error) return { error: error.message }
  await logAudit(activo ? 'pares_contract.activate' : 'pares_contract.deactivate', 'pares_contract', id)
  revalidatePath('/planilla-pagares')
  return { data: null }
}

export async function updateParesContract(id: string, data: {
  client_name: string
  contract_file_url: string | null
  vehiculo: string | null
  total_precio: number | null
  entrada: number | null
  moneda: 'Gs' | 'USD'
  notas: string | null
}): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const parsed = parseInput(paresContractUpdateSchema, data)
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()
  const { error } = await supabase
    .from('pagares_contracts')
    .update({
      client_name:       parsed.data.client_name.trim(),
      contract_file_url: parsed.data.contract_file_url,
      vehiculo:          parsed.data.vehiculo,
      total_precio:      parsed.data.total_precio,
      entrada:           parsed.data.entrada,
      moneda:            parsed.data.moneda,
      notas:             parsed.data.notas,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  await logAudit('pares_contract.update', 'pares_contract', id)
  revalidatePath('/planilla-pagares')
  return { data: null }
}

export async function deleteParesContract(id: string): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const supabase = createClient()
  const { error } = await supabase.from('pagares_contracts').delete().eq('id', id)
  if (error) return { error: error.message }
  await logAudit('pares_contract.delete', 'pares_contract', id)
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
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
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
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const parsed = parseInput(paresPaymentSchema, { contract_id, anio, mes, pagado, metodo_pago })
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()
  const { error } = await supabase.from('pagares_payments').upsert(
    {
      contract_id: parsed.data.contract_id,
      anio:        parsed.data.anio,
      mes:         parsed.data.mes,
      pagado:      parsed.data.pagado,
      metodo_pago: parsed.data.pagado ? parsed.data.metodo_pago : null,
      pagado_at:   parsed.data.pagado ? new Date().toISOString() : null,
    },
    { onConflict: 'contract_id,anio,mes' },
  )
  if (error) return { error: error.message }
  revalidatePath('/planilla-pagares')
  return { data: null }
}
