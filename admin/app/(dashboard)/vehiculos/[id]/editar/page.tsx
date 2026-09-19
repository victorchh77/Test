import { isAdmin, requireAdminOrSecretary } from '@/lib/auth/roles'
import { EditarVehiculoForm } from './EditarVehiculoForm'

export default async function EditarVehiculoPage({ params }: { params: { id: string } }) {
  await requireAdminOrSecretary()
  const admin = await isAdmin()

  return <EditarVehiculoForm id={params.id} canSeePrecioCompra={admin} />
}
