'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { deleteVehicle } from '@/lib/actions/vehicles'

export function DeleteVehicleBtn({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await deleteVehicle(vehicleId)
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="w-3.5 h-3.5" /> Eliminar
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Eliminar vehículo" size="sm">
        <p className="text-sm text-textsec mb-5">
          ¿Estás seguro que querés eliminar este vehículo? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="danger" loading={loading} onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </>
  )
}
