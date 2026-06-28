'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Search, ChevronDown, ShieldCheck, Sparkles } from 'lucide-react'

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

export function Hero() {
  return (
    <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-28 px-5 sm:px-8 overflow-hidden">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto text-center"
      >
        {/* Eyebrow badge */}
        <motion.div variants={item} className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold
                           bg-orange/10 border border-orange/25 text-orange shadow-orange-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Concesionaria en Encarnación, Paraguay
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="mt-6 font-display font-bold tracking-tight text-textprim
                     text-4xl sm:text-6xl lg:text-7xl leading-[1.05]"
        >
          Tu próximo vehículo,
          <br className="hidden sm:block" />{' '}
          <span className="text-orange glow-text-orange">elegido con confianza</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={item}
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-textsec leading-relaxed"
        >
          Vehículos seleccionados, financiación a tu medida y transferencia sin complicaciones.
          En VH Group acompañamos cada paso hasta que las llaves estén en tus manos.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#vehiculos"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold
                       bg-orange hover:bg-orange-hover text-white shadow-orange hover:shadow-orange-lg
                       transition-all duration-200 active:scale-95"
          >
            Ver vehículos disponibles
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold
                       bg-card-elevated hover:bg-border text-textprim border border-border hover:border-border-bright
                       transition-all duration-200 active:scale-95"
          >
            Hablar con un asesor
          </a>
        </motion.div>

        {/* Trust note */}
        <motion.div variants={item} className="mt-6 flex items-center justify-center gap-2 text-xs text-textmuted">
          <ShieldCheck className="w-4 h-4 text-success" />
          Garantía mecánica · Documentación al día · Permutas
        </motion.div>

        {/* Search bar */}
        <motion.div variants={item} className="mt-12">
          <div className="relative max-w-3xl mx-auto">
            {/* Glow behind the bar */}
            <div className="absolute -inset-4 bg-orange/10 blur-2xl rounded-full pointer-events-none" aria-hidden />
            <form
              action="#vehiculos"
              className="relative glass border border-border-bright rounded-2xl p-2.5 shadow-card-lg
                         flex flex-col md:flex-row items-stretch gap-2"
            >
              <SelectField label="Marca" options={['Todas las marcas', 'Toyota', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Chevrolet']} />
              <div className="hidden md:block w-px bg-border my-2" aria-hidden />
              <SelectField label="Tipo" options={['Todos los tipos', 'SUV', 'Sedán', 'Pick-up', 'Hatchback']} />
              <div className="hidden md:block w-px bg-border my-2" aria-hidden />
              <SelectField label="Presupuesto" options={['Sin límite', 'Hasta $15.000', '$15.000 – $30.000', 'Más de $30.000']} />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                           bg-orange hover:bg-orange-hover text-white shadow-orange-sm hover:shadow-orange
                           transition-all duration-200 active:scale-95 md:flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* Subtle logo watermark glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1.2, ease }}
        className="pointer-events-none absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <Image src="/logo.png" alt="" width={520} height={520} className="w-[520px] max-w-none select-none" />
      </motion.div>
    </section>
  )
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="flex-1 group cursor-pointer">
      <span className="block text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-textsec px-3 pt-1.5">
        {label}
      </span>
      <div className="relative">
        <select
          className="w-full appearance-none bg-transparent text-textprim text-sm font-medium
                     px-3 pb-1.5 pr-8 focus:outline-none cursor-pointer rounded-lg"
        >
          {options.map((o) => (
            <option key={o} className="bg-card text-textprim">{o}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textsec pointer-events-none
                                transition-colors group-hover:text-orange" />
      </div>
    </label>
  )
}
