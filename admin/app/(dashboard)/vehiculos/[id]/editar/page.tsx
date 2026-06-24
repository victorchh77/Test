'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { VehicleForm } from '@/components/vehicles/VehicleForm'
import { updateVehicle, getVehicle } from '@/lib/actions/vehicles'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { VehicleFormData } from '@/lib/validations/vehicle'
import type { Vehicle } from '@/types'

export default function EditarVehiculoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getVehicle(id).then(setVehicle)
  }, [id])

  async function handleSubmit(data: VehicleFormData) {
    setLoading(true)
    setError('')
    const result = await updateVehicle(id, data)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      router.push(`/vehiculos/${id}`)
    }
  }

  if (!vehicle) return <PageLoader />

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/vehiculos/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-textprim">Editar vehículo</h1>
          <p className="text-sm text-textsec">{vehicle.marca} {vehicle.modelo} {vehicle.anio}</p>
        </div>
      </div>

      <Card>
        <VehicleForm
          onSubmit={handleSubmit}
          defaultValues={vehicle}
          isEdit
          loading={loading}
          error={error}
        />
      </Card>
    </div>
  )
}
