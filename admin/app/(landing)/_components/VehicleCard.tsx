'use client'

import { useState } from 'react'
import { Car, Gauge, Calendar, Palette, ChevronRight, Loader2 } from 'lucide-react'
import { formatCurrency, formatKm } from '@/lib/utils/format'
import type { FeaturedVehicle } from '@/lib/actions/vehicles'
import { VehicleDetailModal } from './VehicleDetailModal'

export function VehicleCard({ v }: { v: FeaturedVehicle }) {
  const [showDetail, setShowDetail] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const available = v.estado === 'Disponible'
  const km = v.ocultar_km ? null : (v.km_publico?.trim() || formatKm(v.km))

  return (
    <article className="group relative h-full bg-card border border-border rounded-2xl overflow-hidden
                        shadow-card hover:border-orange/30 hover:shadow-[0_0_40px_rgba(255,140,0,0.12)]
                        hover:-translate-y-1 transition-all duration-300">
      <button
        type="button"
        onClick={() => setShowDetail(true)}
        className="block w-full text-left"
        aria-label={`Ver detalles de ${v.marca} ${v.modelo} ${v.anio}`}
      >
        {/* Visual header: foto real si existe, si no degradado + ícono */}
        <div className="relative h-44 bg-gradient-to-br from-card-elevated to-bg flex items-center justify-center overflow-hidden">
          {v.fotoUrl && !photoError ? (
            <>
              {!photoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-orange/40 animate-spin" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => { if (el?.complete && el.naturalWidth > 0) setPhotoLoaded(true) }}
                src={v.fotoUrl}
                alt={`${v.marca} ${v.modelo} ${v.anio}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${photoLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setPhotoLoaded(true)}
                onError={() => setPhotoError(true)}
              />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
              <Car className="w-20 h-20 text-orange/30 transition-transform duration-500 group-hover:scale-110" />
            </>
          )}
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border z-10
            ${available
              ? 'bg-success/10 text-success border-success/30'
              : 'bg-warning/10 text-warning border-warning/30'}`}>
            {v.estado}
          </span>
        </div>

        <div className="p-5 pb-0">
          <p className="text-xs text-textsec">{v.marca} · {v.anio}</p>
          <h3 className="font-display text-lg font-semibold text-textprim group-hover:text-orange transition-colors">
            {v.modelo}
          </h3>

          <div className={`mt-4 grid ${km ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-center`}>
            <Spec icon={Calendar} label={String(v.anio)} />
            {km && <Spec icon={Gauge} label={km} />}
            <Spec icon={Palette}  label={v.color ?? '—'} />
          </div>
        </div>
      </button>

      <div className="p-5">
        <div className="mt-5 pt-4 border-t border-border/60 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-textmuted">Precio</p>
            <p className="font-display text-lg font-bold text-orange glow-text-orange tabular">
              {formatCurrency(v.precio_venta)}
            </p>
          </div>
          <a
            href="/#contacto"
            className="inline-flex items-center gap-1 text-sm font-semibold text-textprim hover:text-orange
                       transition-colors group/link"
          >
            Consultar
            <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5" />
          </a>
        </div>
      </div>

      {showDetail && <VehicleDetailModal vehicle={v} onClose={() => setShowDetail(false)} />}
    </article>
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
