'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Car, Receipt, Users, ShoppingBag,
  X, UserCog, ListOrdered, ChevronRight, Settings,
  ArrowDownCircle, FileText, ShieldCheck, Wand2,
} from 'lucide-react'
import type { Profile } from '@/types'

const adminNav = [
  { href: '/dashboard',         label: 'Dashboard',           icon: LayoutDashboard },
  { href: '/vehiculos',         label: 'Vehículos',           icon: Car },
  { href: '/gastos',            label: 'Gastos',              icon: Receipt },
  { href: '/clientes',          label: 'Clientes',            icon: Users },
  { href: '/ventas',            label: 'Ventas',              icon: ShoppingBag },
  { href: '/empleados',         label: 'Empleados',           icon: UserCog },
  { href: '/lista-precios',     label: 'Lista de Precios',    icon: ListOrdered },
  { href: '/transferencias',    label: 'Transferencias',      icon: ArrowDownCircle },
  { href: '/planilla-pagares',  label: 'Planilla de Pagarés', icon: FileText },
  { href: '/usuarios',          label: 'Usuarios',            icon: ShieldCheck },
  { href: '/flyers',            label: 'Generador de Flyers', icon: Wand2 },
  { href: '/settings',          label: 'Configuración',       icon: Settings },
]

const vendedorNav = [
  { href: '/dashboard',     label: 'Dashboard',           icon: LayoutDashboard },
  { href: '/vehiculos',     label: 'Vehículos',           icon: Car },
  { href: '/clientes',      label: 'Clientes',            icon: Users },
  { href: '/ventas',        label: 'Mis Ventas',          icon: ShoppingBag },
  { href: '/lista-precios', label: 'Lista de Precios',    icon: ListOrdered },
  { href: '/flyers',        label: 'Generador de Flyers', icon: Wand2 },
  { href: '/settings',      label: 'Configuración',       icon: Settings },
]

const secretariaNav = [
  { href: '/dashboard',        label: 'Dashboard',           icon: LayoutDashboard },
  { href: '/clientes',         label: 'Clientes',            icon: Users },
  { href: '/empleados',        label: 'Empleados',           icon: UserCog },
  { href: '/lista-precios',    label: 'Lista de Precios',    icon: ListOrdered },
  { href: '/transferencias',   label: 'Transferencias',      icon: ArrowDownCircle },
  { href: '/planilla-pagares', label: 'Planilla de Pagarés', icon: FileText },
  { href: '/settings',         label: 'Configuración',       icon: Settings },
]

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden:   { opacity: 0, x: -14 },
  visible:  { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] } },
}

interface Props { open: boolean; onClose: () => void; role?: string }

export function Sidebar({ open, onClose, role }: Props) {
  const pathname = usePathname()
  const navItems = role === 'admin' ? adminNav : role === 'secretaria' ? secretariaNav : vendedorNav

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const roleLabel    = role === 'admin' ? 'Administrador' : role === 'secretaria' ? 'Secretaría' : 'Vendedor'
  const roleColor    = role === 'admin' ? 'bg-orange/15 text-orange border-orange/25'
                     : role === 'secretaria' ? 'bg-purple-500/15 text-purple-400 border-purple-500/25'
                     : 'bg-blue-500/15 text-blue-400 border-blue-500/25'
  const roleDotColor = role === 'admin' ? 'bg-orange' : role === 'secretaria' ? 'bg-purple-400' : 'bg-blue-400'

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-20 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-0 left-0 h-full w-64 flex flex-col z-30
        transition-transform duration-300 ease-out
        bg-sidebar border-r border-border
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo area */}
        <div className="relative px-5 pt-6 pb-5 border-b border-border overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 140% 90% at 25% 50%, rgba(255,140,0,0.09) 0%, transparent 65%)' }}
          />

          <div className="relative flex items-center justify-between">
            {/* El logo lleva a la landing page pública */}
            <Link href="/" onClick={onClose} className="flex items-center gap-3.5 group" title="Ir a la página principal">
              <div className="relative flex-shrink-0">
                {/* Breathing glow behind logo */}
                <div className="absolute inset-0 rounded-xl bg-orange/25 blur-lg ring-glow-breath pointer-events-none" />
                <div className="relative w-12 h-12 bg-card-elevated border border-orange/35 rounded-xl
                                flex items-center justify-center shadow-orange transition-transform group-hover:scale-105">
                  <Image src="/logo.png" alt="VH Group" width={38} height={38} className="object-contain" />
                </div>
              </div>

              <div>
                <p className="font-display text-base font-bold text-textprim tracking-tight leading-none">
                  VH Group
                </p>
                <p className="text-[10px] text-orange/85 font-semibold tracking-[0.2em] uppercase mt-0.5">
                  S.R.L.
                </p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors text-textsec hover:text-textprim"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Gradient divider */}
          <div
            className="absolute bottom-0 left-5 right-5 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,140,0,0.5), transparent)' }}
          />
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-border/50">
          <span className={`
            inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full
            uppercase tracking-widest border ${roleColor}
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${roleDotColor} animate-pulse`} />
            {roleLabel}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <p className="section-label px-3 mb-3">Navegación</p>
          <motion.ul
            className="flex flex-col gap-0.5"
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <motion.li key={href} variants={itemVariants}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-colors duration-150 group overflow-hidden
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/60
                      ${active ? 'text-orange' : 'text-textsec hover:text-textprim'}
                    `}
                  >
                    {/* Active background pill — shared layout animation */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active-bg"
                        className="absolute inset-0 bg-orange/[0.11] rounded-xl"
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      />
                    )}

                    {/* Hover background (inactive only) */}
                    {!active && (
                      <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-150" />
                    )}

                    {/* Active left indicator — shared layout animation */}
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-orange rounded-r-full"
                        style={{ boxShadow: '0 0 10px rgba(255,140,0,0.8), 0 0 20px rgba(255,140,0,0.35)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      />
                    )}

                    {/* Icon */}
                    <span className={`
                      relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                      transition-all duration-200
                      ${active
                        ? 'bg-orange/20 text-orange shadow-orange-sm'
                        : 'bg-white/[0.03] text-textsec group-hover:bg-white/[0.07] group-hover:text-textprim'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                    </span>

                    <span className="relative flex-1 truncate">{label}</span>

                    {active && (
                      <ChevronRight className="relative w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                    )}
                  </Link>
                </motion.li>
              )
            })}
          </motion.ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border/60">
          <div
            className="h-px mb-3 mx-auto w-2/3"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,140,0,0.2), transparent)' }}
          />
          <p className="text-[10px] text-textmuted text-center font-medium tracking-wider uppercase">
            Encarnación, Paraguay
          </p>
          <p className="text-[10px] text-textmuted/50 text-center mt-0.5">
            © 2025 VH Group S.R.L.
          </p>
        </div>
      </aside>
    </>
  )
}
