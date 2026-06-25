import { requireAdmin } from '@/lib/auth/roles'

export default async function GastosLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}
