'use client'

import { useEffect, useState } from 'react'
import { Car, ChevronLeft, ChevronRight, Gauge, Calendar, Palette, MessageCircle, Loader2, ImageOff } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatKm } from '@/lib/utils/format'
import { getVehiclePublicDetail, type FeaturedVehicle, type VehiclePublicDetail } from '@/lib/actions/vehicles'

interface Props {
  vehicle: FeaturedVehicle
  onClose: () => void
}

export function VehicleDetailModal({ vehicle, onClose }: Props) {
  const [detail, setDetail] = useState<VehiclePublicDetail | null | undefined>(undefined)
  const [activePhoto, setActivePhoto] = useState(0)
  const [photoStatus, setPhotoStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    getVehiclePublicDetail(vehicle.id)
      .then((d) => { if (!cancelled) setDetail(d ?? null) })
      .catch(() => { if (!cancelled) setDetail(null) })
    return () => { cancelled = true }
  }, [vehicle.id])

  const photos = detail?.photos ?? (vehicle.fotoUrl ? [vehicle.fotoUrl] : [])
  const currentPhotoUrl = photos[activePhoto]

  // Cada vez que cambia la foto activa (o llegan las fotos reales del
  // detalle), hay que volver a mostrar el estado de carga para esa imagen.
  useEffect(() => {
    setPhotoStatus('loading')
  }, [currentPhotoUrl])
  const km = vehicle.ocultar_km ? null : (vehicle.km_publico?.trim() || formatKm(vehicle.km))

  return (
    <Modal open onClose={onClose} title={`${vehicle.marca} ${vehicle.modelo}`} subtitle={String(vehicle.anio)} size="lg">
      {/* Galería */}
      <div className="relative rounded-xl overflow-hidden bg-bg/60 aspect-video mb-5">
        {photos.length > 0 ? (
          <>
            {photoStatus === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange/50 animate-spin" />
              </div>
            )}
            {photoStatus === 'error' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <ImageOff className="w-10 h-10 text-textmuted/50" />
                <span className="text-xs text-textmuted">No se pudo cargar la foto</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={(el) => { if (el?.complete && el.naturalWidth > 0) setPhotoStatus('loaded') }}
                src={currentPhotoUrl}
                alt={`${vehicle.marca} ${vehicle.modelo} ${vehicle.anio} — foto ${activePhoto + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${photoStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setPhotoStatus('loaded')}
                onError={() => setPhotoStatus('error')}
              />
            )}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={() => setActivePhoto((i) => (i === 0 ? photos.length - 1 : i - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Foto siguiente"
                  onClick={() => setActivePhoto((i) => (i === photos.length - 1 ? 0 : i + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Ver foto ${i + 1}`}
                      onClick={() => setActivePhoto(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activePhoto ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="w-16 h-16 text-orange/30" />
          </div>
        )}
      </div>

      {/* Specs */}
      <div className={`grid ${km ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-center mb-5`}>
        <Spec icon={Calendar} label={String(vehicle.anio)} />
        {km && <Spec icon={Gauge} label={km} />}
        <Spec icon={Palette} label={vehicle.color ?? '—'} />
      </div>

      {/* Descripción (sin precio) */}
      {detail === undefined ? (
        <p className="text-sm text-textsec mb-5">Cargando descripción…</p>
      ) : detail?.descripcion ? (
        <p className="text-sm text-textsec whitespace-pre-wrap leading-relaxed mb-5">{detail.descripcion}</p>
      ) : null}

      {/* Precio + CTA */}
      <div className="flex items-end justify-between pt-4 border-t border-border/60">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-textmuted">Precio</p>
          <p className="font-display text-xl font-bold text-orange glow-text-orange tabular">
            {formatCurrency(vehicle.precio_venta)}
          </p>
        </div>
        <a
          href="/#contacto"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                     bg-orange hover:bg-orange-hover text-white shadow-orange-sm transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          Consultar
        </a>
      </div>
    </Modal>
  )
}

function Spec({ icon: Icon, label }: { icon: typeof Gauge; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-bg/40 rounded-lg py-2 px-1">
      <Icon className="w-4 h-4 text-textsec" />
      <span className="text-[11px] text-textsec leading-tight truncate w-full">{label}</span>
    </div>
  )
}
