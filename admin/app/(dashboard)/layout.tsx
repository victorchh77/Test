import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  let userId: string | null = null
  try {
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {
    userId = null
  }
  if (!userId) redirect('/login')

  let profile = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    profile = data
  } catch {
    profile = null
  }

  if (!profile) redirect('/login')

  return (
    <DashboardShell profile={profile}>
      {children}
    </DashboardShell>
  )
}
