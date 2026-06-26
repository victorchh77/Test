'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/auth/roles'
import type { Transfer, ActionResult } from '@/types'

export async function getTransfers(): Promise<(Transfer & { creator_name: string | null })[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  const transfers = (data ?? []) as Transfer[]

  // Fetch creator names separately
  const creatorIds = Array.from(new Set(transfers.map(t => t.created_by).filter(Boolean)))
  let nameMap: Record<string, string> = {}
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', creatorIds)
    ;(profiles ?? []).forEach((p: any) => { nameMap[p.id] = p.full_name })
  }

  return transfers.map(t => ({
    ...t,
    creator_name: nameMap[t.created_by] ?? null,
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
