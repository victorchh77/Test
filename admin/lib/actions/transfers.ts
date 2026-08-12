'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin, isAdminOrSecretary } from '@/lib/auth/roles'
import { transferSchema } from '@/lib/validations/transfer'
import { parseInput } from '@/lib/validations/parse'
import { logAudit } from '@/lib/audit'
import type { Transfer, ActionResult } from '@/types'

export async function getTransfers(): Promise<Transfer[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return (data ?? []) as Transfer[]
}

export async function getTransfer(id: string): Promise<Transfer | null> {
  const supabase = createClient()
  const { data } = await supabase.from('transfers').select('*').eq('id', id).single()
  return (data ?? null) as Transfer | null
}

/**
 * Genera URLs firmadas (temporales) para los comprobantes guardados como path
 * en el bucket privado `transfer-receipts`. Solo admin/secretaria pasan el RLS.
 * Devuelve un mapa path -> signedUrl. Valores legacy que ya son URL (http) se
 * ignoran (se usan tal cual en la vista).
 */
export async function getComprobanteSignedUrls(paths: string[]): Promise<Record<string, string>> {
  const clean = paths.filter((p) => p && !p.startsWith('http'))
  if (!clean.length) return {}
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('transfer-receipts')
    .createSignedUrls(clean, 60 * 60) // 1 hora
  if (error || !data) return {}
  const map: Record<string, string> = {}
  data.forEach((d) => { if (d.path && d.signedUrl) map[d.path] = d.signedUrl })
  return map
}

export async function createTransfer(data: {
  monto: number
  moneda: 'Gs' | 'USD'
  remitente: string | null
  comprobante_url: string | null
  notas: string | null
}): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const parsed = parseInput(transferSchema, data)
  if (!parsed.success) return { error: parsed.error }

  const { error } = await supabase.from('transfers').insert({
    monto: parsed.data.monto,
    moneda: parsed.data.moneda,
    remitente: parsed.data.remitente ?? null,
    comprobante_url: parsed.data.comprobante_url ?? null,
    notas: parsed.data.notas ?? null,
    created_by: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath('/transferencias')
  return { data: null }
}

export async function updateTransfer(id: string, data: {
  monto: number
  moneda: 'Gs' | 'USD'
  remitente: string | null
  comprobante_url: string | null
  notas: string | null
}): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado para editar transferencias.' }
  const parsed = parseInput(transferSchema, data)
  if (!parsed.success) return { error: parsed.error }
  const supabase = createClient()
  const { error } = await supabase
    .from('transfers')
    .update({
      monto: parsed.data.monto,
      moneda: parsed.data.moneda,
      remitente: parsed.data.remitente ?? null,
      comprobante_url: parsed.data.comprobante_url ?? null,
      notas: parsed.data.notas ?? null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  await logAudit('transfer.update', 'transfer', id)
  revalidatePath('/transferencias')
  return { data: null }
}

export async function deleteTransfer(id: string): Promise<ActionResult> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado para eliminar transferencias.' }
  const supabase = createClient()
  const { error } = await supabase.from('transfers').delete().eq('id', id)
  if (error) return { error: error.message }
  await logAudit('transfer.delete', 'transfer', id)
  revalidatePath('/transferencias')
  return { data: null }
}

export async function verifyTransfer(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'Solo el administrador puede verificar transferencias' }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('transfers')
    .update({ verified: true, verified_by: user?.id, verified_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  await logAudit('transfer.verify', 'transfer', id)
  revalidatePath('/transferencias')
  return { data: null }
}

export async function unverifyTransfer(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'Solo el administrador puede modificar la verificación' }
  const supabase = createClient()
  const { error } = await supabase
    .from('transfers')
    .update({ verified: false, verified_by: null, verified_at: null })
    .eq('id', id)
  if (error) return { error: error.message }
  await logAudit('transfer.unverify', 'transfer', id)
  revalidatePath('/transferencias')
  return { data: null }
}
