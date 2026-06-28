import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Wallet, FileText, RefreshCw, KeyRound,
  ShieldCheck, BadgeCheck, MapPin, Phone, Clock, Star, ArrowRight,
  CheckCircle2, MessageCircle,
} from 'lucide-react'
import { LandingNav } from './_components/LandingNav'
import { Hero } from './_components/Hero'
import { ContactForm } from './_components/ContactForm'
import { Reveal, RevealGroup, RevealItem } from './_components/Reveal'
import { VehicleCard } from './_components/VehicleCard'
import { getFeaturedVehicles, type FeaturedVehicle } from '@/lib/actions/vehicles'

export const metadata: Metadata = {
  title: 'VH Group S.R.L. — Concesionaria en Encarnación',
  description:
    'Compra de vehículos seleccionados con garantía, financiación a medida y transferencia sin complicaciones. VH Group, tu concesionaria de confianza en Encarnación, Paraguay.',
}

// Refresca el stock público cada 10 minutos (ISR).
export const revalidate = 600

/* ── Fallback: solo se usa si no hay stock real disponible todavía ────── */

const fallbackVehicles: FeaturedVehicle[] = [
  { id: 'demo-1', marca: 'Toyota',     modelo: 'Hilux SRV 4x4',  anio: 2021, km: 48000, color: 'Gris',   precio_venta: 245000000, estado: 'Disponible', km_publico: null, fotoUrl: null },
  { id: 'demo-2', marca: 'Volkswagen', modelo: 'T-Cross Comfort', anio: 2022, km: 22000, color: 'Blanco', precio_venta: 185000000, estado: 'Disponible', km_publico: null, fotoUrl: null },
  { id: 'demo-3', marca: 'Hyundai',    modelo: 'Tucson Limited',  anio: 2021, km: 38000, color: 'Negro',  precio_venta: 205000000, estado: 'Disponible', km_publico: null, fotoUrl: null },
  { id: 'demo-4', marca: 'Nissan',     modelo: 'Frontier XE',     anio: 2020, km: 65000, color: 'Plata',  precio_venta: 218000000, estado: 'Reservado',  km_publico: null, fotoUrl: null },
  { id: 'demo-5', marca: 'Kia',        modelo: 'Cerato EX',       anio: 2019, km: 55000, color: 'Rojo',    precio_venta: 122000000, estado: 'Disponible', km_publico: null, fotoUrl: null },
  { id: 'demo-6', marca: 'Chevrolet',  modelo: 'Onix Premier',    anio: 2022, km: 18000, color: 'Azul',   precio_venta: 118000000, estado: 'Disponible', km_publico: null, fotoUrl: null },
]

const stats = [
  { value: '+15', label: 'Años de trayectoria' },
  { value: '+500', label: 'Vehículos entregados' },
  { value: '100%', label: 'Documentación al día' },
  { value: '4.9', label: 'Satisfacción de clientes' },
]

const services = [
  { icon: Wallet,      title: 'Financiación propia y con otras entidades', desc: 'Planes propios y con entidades financieras aliadas. Cuotas en guaraníes o dólares, ajustadas a tu presupuesto con aprobación ágil.' },
  { icon: ShieldCheck, title: 'Garantía mecánica',     desc: 'Cada vehículo pasa una inspección de varios puntos antes de salir de nuestro local.' },
  { icon: FileText,    title: 'Transferencia y gestoría', desc: 'Nos ocupamos de toda la documentación. Vos retirás el auto con los papeles en regla.' },
  { icon: RefreshCw,   title: 'Tomamos tu usado',      desc: 'Entregá tu vehículo actual como parte de pago. Tasación justa y en el día.' },
  { icon: KeyRound,    title: 'Entrega inmediata',     desc: 'Stock disponible para retirar. Sin esperas largas ni sorpresas de última hora.' },
]

const steps = [
  { n: '01', title: 'Elegí tu vehículo', desc: 'Explorá nuestro stock o contanos qué buscás y te armamos una selección.' },
  { n: '02', title: 'Financiá a tu medida', desc: 'Diseñamos un plan de pago realista, con o sin entrega de tu usado.' },
  { n: '03', title: 'Retirá con todo en regla', desc: 'Gestionamos la transferencia y te entregamos las llaves listo para circular.' },
]

const testimonials = [
  { name: 'María González', role: 'Compró un Hyundai Tucson', quote: 'Me explicaron cada paso de la financiación sin letra chica. Retiré el auto con todos los papeles listos.' },
  { name: 'Carlos Benítez',  role: 'Permutó su pick-up',       quote: 'Tomaron mi camioneta a un precio justo y la diferencia la pagué en cuotas cómodas. Muy recomendable.' },
  { name: 'Lucía Ramírez',   role: 'Primera compra',           quote: 'Es mi primer auto y me sentí acompañada en todo momento. Cero presión, mucha claridad.' },
]

const brands = ['Toyota', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Chevrolet', 'Ford', 'Honda']

/* ── Page ─────────────────────────────────────────────────────────────── */

export default async function LandingPage() {
  // Stock real desde Supabase (vista pública). Si todavía no hay stock o no se
  // aplicó la migración, mostramos unidades de ejemplo para no dejar la sección vacía.
  const featured = await getFeaturedVehicles(6)
  const vehicles = featured.length ? featured : fallbackVehicles
  const usingFallback = featured.length === 0

  return (
    <div className="relative min-h-screen bg-bg text-textprim overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <LandingNav />
      <Hero />

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 -mt-6">
        <Reveal className="max-w-5xl mx-auto">
          <div className="glass border border-border-bright rounded-2xl shadow-card-lg
                          grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border/70">
            {stats.map((s) => (
              <div key={s.label} className="p-6 text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-orange glow-text-orange tabular">
                  {s.value}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-textsec">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Vehículos destacados ───────────────────────────────────── */}
      <section id="vehiculos" className="px-5 sm:px-8 py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Stock destacado"
              title={<>Vehículos listos para <span className="text-orange">entregar</span></>}
              subtitle="Una selección de nuestras unidades disponibles. Cada una inspeccionada y con documentación verificada."
            />
          </Reveal>

          <RevealGroup className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <RevealItem key={v.id}>
                <VehicleCard v={v} />
              </RevealItem>
            ))}
          </RevealGroup>

          {usingFallback && (
            <Reveal delay={0.05} className="mt-6 text-center">
              <p className="text-xs text-textmuted">
                Mostrando unidades de ejemplo. El stock real aparece automáticamente al cargar vehículos en el panel.
              </p>
            </Reveal>
          )}

          <Reveal delay={0.1} className="mt-10 text-center">
            <Link
              href="/catalogo"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                         bg-card-elevated hover:bg-border text-textprim border border-border hover:border-border-bright
                         transition-all duration-200 active:scale-95"
            >
              Ver todo el catálogo
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Marcas ─────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-8">
        <Reveal className="max-w-5xl mx-auto">
          <p className="text-center section-label mb-6">Trabajamos con las principales marcas</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {brands.map((b) => (
              <span
                key={b}
                className="font-display text-lg sm:text-xl font-bold text-textsec/60 hover:text-textprim
                           transition-colors duration-300 tracking-tight"
              >
                {b}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Servicios ──────────────────────────────────────────────── */}
      <section id="servicios" className="px-5 sm:px-8 py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Por qué VH Group"
              title={<>Todo resuelto, <span className="text-orange">en un solo lugar</span></>}
              subtitle="No vendemos autos y desaparecemos. Acompañamos la compra de principio a fin."
            />
          </Reveal>

          <RevealGroup className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => {
              const Icon = s.icon
              return (
                <RevealItem key={s.title}>
                  <div className="group relative h-full card-base overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-orange/[0.06] blur-2xl
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-orange/15 text-orange flex items-center justify-center
                                      shadow-[0_0_22px_rgba(255,140,0,0.35)] mb-4
                                      transition-transform duration-300 group-hover:scale-110">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-textprim mb-2">{s.title}</h3>
                      <p className="text-sm text-textsec leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </RevealItem>
              )
            })}
          </RevealGroup>
        </div>
      </section>

      {/* ── Proceso ────────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Cómo funciona"
              title={<>Tres pasos hasta las <span className="text-orange">llaves</span></>}
            />
          </Reveal>
          <RevealGroup className="mt-12 grid md:grid-cols-3 gap-6">
            {steps.map((st) => (
              <RevealItem key={st.n}>
                <div className="relative card-base h-full">
                  <span className="font-display text-5xl font-bold text-orange/15 leading-none">{st.n}</span>
                  <h3 className="font-display text-lg font-semibold text-textprim mt-3 mb-2">{st.title}</h3>
                  <p className="text-sm text-textsec leading-relaxed">{st.desc}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Nosotros ───────────────────────────────────────────────── */}
      <section id="nosotros" className="px-5 sm:px-8 py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="section-label">Nuestra historia</span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-textprim">
              Una concesionaria <span className="text-orange">de Encarnación</span>, con visión global
            </h2>
            <p className="mt-5 text-textsec leading-relaxed">
              VH Group nació con una idea simple: que comprar un vehículo en Paraguay sea una experiencia
              transparente, rápida y confiable. Seleccionamos cada unidad con criterio, cuidamos la
              documentación y tratamos a cada cliente como nos gustaría que nos traten a nosotros.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Vehículos inspeccionados y con historial verificado',
                'Asesores que explican, no que presionan',
                'Financiación propia y con otras entidades',
                'Posventa y respaldo después de la entrega',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-textprim">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <div className="absolute -inset-4 bg-orange/10 blur-3xl rounded-full pointer-events-none" aria-hidden />
              <div className="relative glass border border-border-bright rounded-3xl p-8 shadow-card-lg
                              flex flex-col items-center text-center">
                <Image src="/logo.png" alt="VH Group" width={120} height={120}
                       className="w-24 h-24 object-contain mb-5 drop-shadow-[0_0_24px_rgba(255,140,0,0.3)]" />
                <p className="font-display text-2xl font-bold text-textprim">VH Group S.R.L.</p>
                <p className="text-sm text-textsec mt-1">Encarnación · Itapúa · Paraguay</p>
                <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                  {stats.slice(0, 2).map((s) => (
                    <div key={s.label} className="bg-card/60 border border-border rounded-2xl p-4">
                      <p className="font-display text-2xl font-bold text-orange tabular">{s.value}</p>
                      <p className="text-xs text-textsec mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonios ────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Clientes"
              title={<>Lo que dicen quienes ya <span className="text-orange">manejan</span></>}
            />
          </Reveal>
          <RevealGroup className="mt-12 grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <RevealItem key={t.name}>
                <figure className="card-base h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4" aria-label="5 de 5 estrellas">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-orange fill-orange" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-textprim leading-relaxed flex-1">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 pt-4 border-t border-border/60">
                    <p className="font-semibold text-textprim text-sm">{t.name}</p>
                    <p className="text-xs text-textsec">{t.role}</p>
                  </figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Contacto ───────────────────────────────────────────────── */}
      <section id="contacto" className="px-5 sm:px-8 py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10">
          <Reveal>
            <span className="section-label">Contacto</span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-textprim">
              Hablemos de tu <span className="text-orange">próximo vehículo</span>
            </h2>
            <p className="mt-4 text-textsec leading-relaxed">
              Escribinos y un asesor te responde a la brevedad. Sin compromiso, sin vueltas.
            </p>

            <ul className="mt-8 space-y-4">
              <ContactRow icon={MapPin}  label="Dirección" value="Encarnación, Itapúa, Paraguay" href="https://maps.app.goo.gl/XC2eS6XB3pDt8J1i9?g_st=ic" />
              <ContactRow icon={Phone}   label="WhatsApp"  value="+595 0995 368 724" href="https://wa.me/5950995368724" />
              <ContactRow icon={Clock}   label="Horario"   value="Lun a Vie 7:30–18:00 · Sáb 7:30–13:00" />
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card-elevated">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-20 sm:pb-28">
        <Reveal className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-orange/30 shadow-orange-lg
                          bg-gradient-to-br from-orange/15 via-card to-card p-10 sm:p-14 text-center">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange/20 blur-3xl pointer-events-none" aria-hidden />
            <h2 className="relative font-display text-3xl sm:text-4xl font-bold tracking-tight text-textprim">
              ¿Listo para estrenar?
            </h2>
            <p className="relative mt-3 text-textsec max-w-xl mx-auto">
              Contanos qué buscás y te ayudamos a encontrarlo. La compra de tu próximo vehículo empieza con un mensaje.
            </p>
            <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#contacto"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold
                           bg-orange hover:bg-orange-hover text-white shadow-orange hover:shadow-orange-lg
                           transition-all duration-200 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                Quiero que me contacten
              </a>
              <a
                href="#vehiculos"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold
                           bg-card-elevated hover:bg-border text-textprim border border-border hover:border-border-bright
                           transition-all duration-200 active:scale-95"
              >
                Explorar vehículos
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <LandingFooter />
    </div>
  )
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function SectionHeading({
  eyebrow, title, subtitle,
}: {
  eyebrow: string
  title: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <span className="section-label">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-textprim">{title}</h2>
      {subtitle && <p className="mt-4 text-textsec leading-relaxed">{subtitle}</p>}
    </div>
  )
}

function ContactRow({ icon: Icon, label, value, href }: { icon: typeof MapPin; label: string; value: string; href?: string }) {
  return (
    <li className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-orange/10 text-orange flex items-center justify-center flex-shrink-0 border border-orange/20">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-textmuted">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
             className="text-sm text-textprim mt-0.5 hover:text-orange transition-colors block">
            {value}
          </a>
        ) : (
          <p className="text-sm text-textprim mt-0.5">{value}</p>
        )}
      </div>
    </li>
  )
}

function LandingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-sidebar/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="VH Group" width={36} height={36} className="w-9 h-9 object-contain" />
              <span className="font-display font-bold text-textprim text-lg">
                VH <span className="text-orange">Group</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-textsec max-w-xs leading-relaxed">
              Concesionaria de vehículos en Encarnación. Comprá con confianza, financiá a tu medida y
              retirá con todo en regla.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Social label="WhatsApp" href="https://wa.me/5950995368724">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.06c-.25.69-1.45 1.32-1.99 1.36-.53.05-1.02.24-3.44-.72-2.9-1.14-4.74-4.1-4.88-4.29-.14-.19-1.17-1.55-1.17-2.96 0-1.41.74-2.1 1-2.39.25-.29.54-.36.72-.36.18 0 .36 0 .52.01.17.01.39-.06.61.47.25.6.83 2.05.9 2.2.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.18-.21.69-.81.88-1.09.18-.28.37-.23.61-.14.25.09 1.57.74 1.84.87.28.14.46.21.53.32.07.12.07.66-.18 1.35Z"/>
              </Social>
              <Social label="Instagram" href="https://www.instagram.com/vhgroupsrl">
                <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.5.01-4.74.07-.89.04-1.37.19-1.69.31-.43.17-.73.36-1.05.68-.32.32-.51.62-.68 1.05-.12.32-.27.8-.31 1.69-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.04.89.19 1.37.31 1.69.17.43.36.73.68 1.05.32.32.62.51 1.05.68.32.12.8.27 1.69.31 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.89-.04 1.37-.19 1.69-.31.43-.17.73-.36 1.05-.68.32-.32.51-.62.68-1.05.12-.32.27-.8.31-1.69.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.89-.19-1.37-.31-1.69a2.8 2.8 0 0 0-.68-1.05 2.8 2.8 0 0 0-1.05-.68c-.32-.12-.8-.27-1.69-.31C15.5 4.01 15.15 4 12 4Zm0 3.06A4.94 4.94 0 1 0 16.94 12 4.94 4.94 0 0 0 12 7.06Zm0 8.14A3.2 3.2 0 1 1 15.2 12 3.2 3.2 0 0 1 12 15.2Zm5.14-8.34a1.15 1.15 0 1 1-1.15-1.15 1.15 1.15 0 0 1 1.15 1.15Z"/>
              </Social>
              <Social label="Facebook" href="https://www.facebook.com/share/1EMYyueneL/?mibextid=wwXIfr">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.57v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/>
              </Social>
            </div>
          </div>

          <FooterCol title="Explorar" links={[
            { label: 'Vehículos', href: '#vehiculos' },
            { label: 'Servicios', href: '#servicios' },
            { label: 'Nosotros', href: '#nosotros' },
            { label: 'Contacto', href: '#contacto' },
          ]} />

          <FooterCol title="Empresa" links={[
            { label: 'Acceder al panel', href: '/login' },
            { label: 'WhatsApp', href: 'https://wa.me/5950995368724' },
            { label: 'Instagram', href: 'https://www.instagram.com/vhgroupsrl' },
            { label: 'Facebook', href: 'https://www.facebook.com/share/1EMYyueneL/?mibextid=wwXIfr' },
          ]} />
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-textmuted">© {year} VH Group S.R.L. — Todos los derechos reservados.</p>
          <p className="text-xs text-textmuted flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 text-orange" />
            Encarnación · Itapúa · Paraguay
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="section-label mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-sm text-textsec hover:text-orange transition-colors">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Social({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-xl bg-card border border-border hover:border-orange/40 hover:text-orange
                 text-textsec flex items-center justify-center transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden>{children}</svg>
    </a>
  )
}
