'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Star, Trash2, Upload } from 'lucide-react'
import { uploadVehiclePhoto, setMainPhoto, deleteVehiclePhoto } from '@/lib/actions/photos'
import { Button } from '@/components/ui/Button'
import type { VehiclePhoto } from '@/types'

interface Props { vehicleId: string; photos: VehiclePhoto[] }

export function PhotoSection({ vehicleId, photos: initialPhotos }: Props) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('is_main', photos.length === 0 ? 'true' : 'false')
    const result = await uploadVehiclePhoto(vehicleId, fd)
    setUploading(false)
    if (result.error) { setError(result.error); return }
    window.location.reload()
  }

  async function handleSetMain(photoId: string) {
    await setMainPhoto(photoId, vehicleId)
    setPhotos(p => p.map(x => ({ ...x, is_main: x.id === photoId })))
  }

  async function handleDelete(photo: VehiclePhoto) {
    if (!confirm('¿Eliminar esta foto?')) return
    await deleteVehiclePhoto(photo.id, photo.storage_path, vehicleId)
    setPhotos(p => p.filter(x => x.id !== photo.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-textprim">Fotos del vehículo</h2>
          <p className="text-xs text-textsec">{photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            size="sm"
            variant="secondary"
            loading={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />Subir foto
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2 mb-3">{error}</p>
      )}

      {photos.length === 0 ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2
                     hover:border-orange/40 hover:bg-orange/5 transition-all duration-200 group"
        >
          <Camera className="w-8 h-8 text-textsec/40 group-hover:text-orange/60 transition-colors" />
          <p className="text-sm text-textsec">Clic para agregar fotos</p>
        </button>
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
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center
                       hover:border-orange/40 hover:bg-orange/5 transition-all duration-200 group"
          >
            <Camera className="w-6 h-6 text-textsec/40 group-hover:text-orange/60 transition-colors" />
          </button>
        </div>
      )}
    </div>
  )
}
