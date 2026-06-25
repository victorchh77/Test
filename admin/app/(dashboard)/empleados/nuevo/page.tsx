'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EmployeeForm } from '@/components/vehicles/EmployeeForm'
import { createEmployee } from '@/lib/actions/employees'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { EmployeeFormData } from '@/lib/validations/employee'

export default function NuevoEmpleadoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(data: EmployeeFormData) {
    setLoading(true)
    setError('')
    const result = await createEmployee(data)
    setLoading(false)
    if (result.error) setError(result.error)
    else router.push('/empleados')
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/empleados">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-textprim">Nuevo empleado</h1>
          <p className="text-sm text-textsec">Completá los datos del empleado</p>
        </div>
      </div>

      <Card>
        <EmployeeForm onSubmit={handleSubmit} loading={loading} error={error} />
      </Card>
    </div>
  )
}
