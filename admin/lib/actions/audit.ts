'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'
import type { AuditLog } from '@/types'

export async function getAuditLog(limit = 200): Promise<AuditLog[]> {
  if (!(await isAdmin())) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error(error); return [] }
  return (data ?? []) as AuditLog[]
}
