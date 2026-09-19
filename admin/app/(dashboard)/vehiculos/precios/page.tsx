import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getVehiclesWithMainPhoto } from '@/lib/actions/vehicles'
import { requireAdminOrSecretary } from '@/lib/auth/roles'
import { Button } from '@/components/ui/Button'
import { PreciosEditor } from './PreciosEditor'

export default async function PreciosVehiculosPage() {
  await requireAdminOrSecretary()
  const vehicles = await getVehiclesWithMainPhoto()

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/vehiculos">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Actualizar precios</h1>
          <p className="text-sm text-textsec mt-0.5">
            Editá el precio de venta de cada vehículo — se guarda solo al salir del campo, sin abrir el formulario completo.
          </p>
        </div>
      </div>

      <PreciosEditor vehicles={vehicles} />
    </div>
  )
}
