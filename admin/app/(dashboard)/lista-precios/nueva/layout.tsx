import { requireAdminOrSecretary } from '@/lib/auth/roles'

export default async function NuevaListaLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOrSecretary()
  return <>{children}</>
}
