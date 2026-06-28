'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ParesContract, ParesPayment, ActionResult } from '@/types'

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
