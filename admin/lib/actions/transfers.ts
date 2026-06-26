'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/auth/roles'
import type { Transfer, ActionResult } from '@/types'

export async function getTransfers(): Promise<(Transfer & { creator_name: string | null })[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transfers')
    .select('*, profiles!created_by(full_name)')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return (data ?? []).map((t: any) => ({
    ...t,
    creator_name: t.profiles?.full_name ?? null,
  }))
}

export async function createTransfer(data: {
  monto: number
  comprobante_url: string | null
  notas: string | null
}): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  if (!data.monto || data.monto <= 0) return { error: 'El monto debe ser mayor a 0' }

  const { error } = await supabase.from('transfers').insert({
    monto: data.monto,
    comprobante_url: data.comprobante_url,
    notas: data.notas,
    created_by: user.id,
  })
  if (error) return { error: error.message }
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
  revalidatePath('/transferencias')
  return { data: null }
}
