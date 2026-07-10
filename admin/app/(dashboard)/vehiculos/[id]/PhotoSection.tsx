'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Star, Trash2, Upload } from 'lucide-react'
import { uploadVehiclePhoto, setMainPhoto, deleteVehiclePhoto } from '@/lib/actions/photos'
import { Button } from '@/components/ui/Button'
import type { VehiclePhoto } from '@/types'

interface Props { vehicleId: string; photos: VehiclePhoto[]; canEdit?: boolean }

export function PhotoSection({ vehicleId, photos: initialPhotos, canEdit = false }: Props) {
  const MAX_PHOTOS = 10
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      setError(`Máximo ${MAX_PHOTOS} fotos por vehículo.`)
      return
    }
    const toUpload = files.slice(0, remaining)
    if (files.length > remaining) {
      setError(`Solo se subirán ${remaining} foto(s); el máximo es ${MAX_PHOTOS}.`)
    } else {
      setError('')
    }

    setUploading(true)
    let uploaded = 0
    let firstError = ''
    for (let i = 0; i < toUpload.length; i++) {
      setProgress(`Subiendo ${i + 1} de ${toUpload.length}…`)
      const fd = new FormData()
      fd.append('file', toUpload[i])
      // First photo of an empty gallery becomes the main one.
      fd.append('is_main', photos.length === 0 && i === 0 ? 'true' : 'false')
      const result = await uploadVehiclePhoto(vehicleId, fd)
      if (result.error) { firstError = result.error; break }
      uploaded++
    }
    setUploading(false)
    setProgress('')
    if (firstError) { setError(firstError); return }
    if (fileRef.current) fileRef.current.value = ''
    if (uploaded > 0) window.location.reload()
  }

  async function handleSetMain(photoId: string) {
    await setMainPhoto(photoId, vehicleId)
    setPhotos(p => p.map(x => ({ ...x, is_main: x.id === photoId })))
  }

  async function handleDelete(photo: VehiclePhoto) {
    if (!confirm('¿Eliminar esta foto?')) return
    await deleteVehiclePhoto(photo.id, vehicleId)
    setPhotos(p => p.filter(x => x.id !== photo.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-textprim">Fotos del vehículo</h2>
          <p className="text-xs text-textsec">
            {photos.length} de {MAX_PHOTOS} foto{photos.length !== 1 ? 's' : ''}
            {progress && <span className="text-orange ml-2">{progress}</span>}
          </p>
        </div>
        {canEdit && photos.length < MAX_PHOTOS && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              size="sm"
              variant="secondary"
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />Subir fotos
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2 mb-3">{error}</p>
      )}

      {photos.length === 0 ? (
        canEdit ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2
                       hover:border-orange/40 hover:bg-orange/5 transition-all duration-200 group"
          >
            <Camera className="w-8 h-8 text-textsec/40 group-hover:text-orange/60 transition-colors" />
            <p className="text-sm text-textsec">Clic para agregar fotos</p>
          </button>
        ) : (
          <div className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2">
            <Camera className="w-8 h-8 text-textsec/30" />
            <p className="text-sm text-textsec">Este vehículo no tiene fotos</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-card border border-border">
              <Image
                src={photo.url}
                alt="Foto del vehículo"
                fill
                className="object-cover"
                sizes="150px"
              />
              {photo.is_main && (
                <div className="absolute top-1 left-1 bg-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  PRINCIPAL
                </div>
              )}
              {canEdit && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.is_main && (
                    <button
                      onClick={() => handleSetMain(photo.id)}
                      className="p-1.5 bg-orange/80 hover:bg-orange rounded-lg transition-colors"
                      title="Hacer principal"
                    >
                      <Star className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(photo)}
                    className="p-1.5 bg-error/80 hover:bg-error rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {canEdit && (
            <button
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center
                         hover:border-orange/40 hover:bg-orange/5 transition-all duration-200 group"
            >
              <Camera className="w-6 h-6 text-textsec/40 group-hover:text-orange/60 transition-colors" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
