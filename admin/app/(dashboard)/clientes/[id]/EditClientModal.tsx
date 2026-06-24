'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ClientForm } from '@/components/vehicles/ClientForm'
import { updateClient } from '@/lib/actions/clients'
import type { Client } from '@/types'
import type { ClientFormData } from '@/lib/validations/client'

export function EditClientModal({ client }: { client: Client }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(data: ClientFormData) {
    setLoading(true)
    setError('')
    const result = await updateClient(client.id, data)
    setLoading(false)
    if (result.error) setError(result.error)
    else { setOpen(false); router.refresh() }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Edit className="w-3.5 h-3.5" /> Editar
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar cliente" size="md">
        <ClientForm onSubmit={handleSubmit} defaultValues={client} isEdit loading={loading} error={error} />
      </Modal>
    </>
  )
}
