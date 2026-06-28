import { requireAdminOrSecretary } from '@/lib/auth/roles'

export default async function EmpleadosLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOrSecretary()
  return <>{children}</>
}
