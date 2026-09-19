import { isAdmin, requireAdminOrSecretary } from '@/lib/auth/roles'
import { NuevoVehiculoForm } from './NuevoVehiculoForm'

export default async function NuevoVehiculoPage() {
  await requireAdminOrSecretary()
  const admin = await isAdmin()

  return <NuevoVehiculoForm canSeePrecioCompra={admin} />
}
