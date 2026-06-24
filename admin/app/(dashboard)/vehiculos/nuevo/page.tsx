'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { VehicleForm } from '@/components/vehicles/VehicleForm'
import { createVehicle } from '@/lib/actions/vehicles'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { VehicleFormData } from '@/lib/validations/vehicle'

export default function NuevoVehiculoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(data: VehicleFormData) {
    setLoading(true)
    setError('')
    const result = await createVehicle(data)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      router.push(`/vehiculos/${result.data?.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/vehiculos">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-textprim">Nuevo vehículo</h1>
          <p className="text-sm text-textsec">Completá los datos del vehículo</p>
        </div>
      </div>

      <Card>
        <VehicleForm onSubmit={handleSubmit} loading={loading} error={error} />
      </Card>
    </div>
  )
}
