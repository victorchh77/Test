import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Car } from 'lucide-react'
import { getFeaturedVehicles } from '@/lib/actions/vehicles'
import { VehicleCard } from '../_components/VehicleCard'
import { RevealGroup, RevealItem } from '../_components/Reveal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export const metadata: Metadata = {
  title: 'Catálogo de vehículos — VH Group',
  description: 'Todos los vehículos disponibles en VH Group, concesionaria en Encarnación. Precios, año, kilometraje y financiación.',
}

export const revalidate = 600

export default async function CatalogoPage() {
  const vehicles = await getFeaturedVehicles(200)

  return (
    <div className="relative min-h-screen bg-bg text-textprim overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      {/* Header */}
      <header className="glass border-b border-border/70 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="VH Group — Inicio">
            <Image src="/logo.png" alt="VH Group" width={36} height={36}
                   className="w-9 h-9 object-contain transition-transform group-hover:scale-105" />
            <span className="font-display font-bold text-textprim tracking-tight text-lg leading-none">
              VH <span className="text-orange">Group</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                         text-textsec hover:text-textprim hover:bg-white/[0.04] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Title */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-6">
        <span className="section-label">Stock completo</span>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-textprim">
          Nuestro <span className="text-orange">catálogo</span>
        </h1>
        <p className="mt-3 text-textsec">
          {vehicles.length > 0
            ? `${vehicles.length} ${vehicles.length === 1 ? 'vehículo disponible' : 'vehículos disponibles'} para entrega.`
            : 'Pronto cargaremos nuevas unidades. Escribinos y te avisamos.'}
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Car className="w-10 h-10 text-textsec/30" />
            <p className="text-textsec">No hay vehículos disponibles en este momento.</p>
            <Link
              href="/#contacto"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         bg-orange hover:bg-orange-hover text-white shadow-orange-sm transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar a un asesor
            </Link>
          </div>
        ) : (
          <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.05}>
            {vehicles.map((v) => (
              <RevealItem key={v.id}>
                <VehicleCard v={v} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>

      {/* CTA */}
      {vehicles.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20 text-center">
          <p className="text-textsec mb-4">¿Te interesó alguno? Coordinamos una visita o te enviamos más fotos.</p>
          <Link
            href="/#contacto"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold
                       bg-orange hover:bg-orange-hover text-white shadow-orange hover:shadow-orange-lg
                       transition-all duration-200 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            Hablar con un asesor
          </Link>
        </section>
      )}
    </div>
  )
}
