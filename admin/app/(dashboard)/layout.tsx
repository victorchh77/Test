import { DashboardShell } from '@/components/layout/DashboardShell'
import type { Profile } from '@/types'

const MOCK_PROFILE: Profile = {
  id: 'demo-id',
  full_name: 'Admin VH Group',
  role: 'admin',
  created_at: new Date().toISOString(),
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell profile={MOCK_PROFILE}>
      {children}
    </DashboardShell>
  )
}
