'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EmployeeForm } from '@/components/vehicles/EmployeeForm'
import { getEmployee, updateEmployee } from '@/lib/actions/employees'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { EmployeeFormData } from '@/lib/validations/employee'
import type { Employee } from '@/types'

export default function EditarEmpleadoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getEmployee(id).then(setEmployee)
  }, [id])

  async function handleSubmit(data: EmployeeFormData) {
    setLoading(true)
    setError('')
    const result = await updateEmployee(id, data)
    setLoading(false)
    if (result.error) setError(result.error)
    else router.push(`/empleados/${id}`)
  }

  if (!employee) return <PageLoader />

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/empleados/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-textprim">Editar empleado</h1>
          <p className="text-sm text-textsec">{employee.nombre}</p>
        </div>
      </div>

      <Card>
        <EmployeeForm onSubmit={handleSubmit} defaultValues={employee} isEdit loading={loading} error={error} />
      </Card>
    </div>
  )
}
