import { requireAdmin } from '@/lib/auth/roles'

export default async function NuevaListaLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}
