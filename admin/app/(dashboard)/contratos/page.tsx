import { redirect } from 'next/navigation'
import { FileSignature } from 'lucide-react'
import { getVehiclesWithMainPhoto } from '@/lib/actions/vehicles'
import { getClients } from '@/lib/actions/clients'
import { isAdminOrSecretary } from '@/lib/auth/roles'
import { ContractForm } from './ContractForm'

export default async function ContratosPage() {
  if (!(await isAdminOrSecretary())) redirect('/dashboard')

  const [vehicles, clients] = await Promise.all([
    getVehiclesWithMainPhoto({ estado: 'Disponible' }),
    getClients(),
  ])

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-orange/15 text-orange flex items-center justify-center flex-shrink-0">
          <FileSignature className="w-5 h-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-textprim tracking-tight">Creación de Contratos</h1>
          <p className="text-sm text-textsec mt-0.5">
            Generá el contrato privado de compraventa de vehículo listo para firmar — al contado, financiado o con permuta.
          </p>
        </div>
      </div>

      <ContractForm vehicles={vehicles} clients={clients} />
    </div>
  )
}
