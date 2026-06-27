'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  { href: '/dashboard',     label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/vehiculos',     label: 'Vehículos',        icon: Car },
  { href: '/clientes',      label: 'Clientes',         icon: Users },
  { href: '/ventas',        label: 'Mis Ventas',       icon: ShoppingBag },
  { href: '/lista-precios', label: 'Lista de Precios',    icon: ListOrdered },
  { href: '/flyers',        label: 'Generador de Flyers', icon: Wand2 },
  { href: '/settings',      label: 'Configuración',       icon: Settings },
]

const secretariaNav = [
  { href: '/dashboard',        label: 'Dashboard',           icon: LayoutDashboard },
  { href: '/transferencias',   label: 'Transferencias',      icon: ArrowDownCircle },
  { href: '/planilla-pagares', label: 'Planilla de Pagarés', icon: FileText },
  { href: '/settings',         label: 'Configuración',       icon: Settings },
]

interface Props { open: boolean; onClose: () => void; role?: string }

export function Sidebar({ open, onClose, role }: Props) {
  const pathname = usePathname()
  const navItems = role === 'admin' ? adminNav : role === 'secretaria' ? secretariaNav : vendedorNav

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 flex flex-col z-30
        transition-transform duration-300 ease-out
        bg-sidebar border-r border-border
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo area */}
        <div className="relative px-5 pt-6 pb-5 border-b border-border overflow-hidden">
          {/* Subtle orange radial glow behind logo */}
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: 'radial-gradient(ellipse 120% 80% at 30% 50%, rgba(255,140,0,0.07) 0%, transparent 70%)' }} />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Logo with glow ring */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-xl bg-orange/20 blur-md" />
                <div className="relative w-12 h-12 bg-[#0B1220] border border-orange/30 rounded-xl
                                flex items-center justify-center shadow-orange-sm">
                  <Image
                    src="/logo.png"
                    alt="VH Group"
                    width={38}
                    height={38}
                    className="object-contain"
                  />
                </div>
              </div>

              <div>
                <p className="font-display text-base font-bold text-textprim tracking-tight leading-none">
                  VH Group
                </p>
                <p className="text-[10px] text-orange/80 font-medium tracking-widest uppercase mt-0.5">
                  S.R.L.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors text-textsec hover:text-textprim"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Orange gradient divider line */}
          <div className="absolute bottom-0 left-5 right-5 h-px"
               style={{ background: 'linear-gradient(90deg, transparent, rgba(255,140,0,0.4), transparent)' }} />
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-border/50">
          <span className={`
            inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full
            uppercase tracking-widest
            ${role === 'admin'
              ? 'bg-orange/15 text-orange border border-orange/25'
              : role === 'secretaria'
              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
              : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              role === 'admin' ? 'bg-orange' : role === 'secretaria' ? 'bg-purple-400' : 'bg-blue-400'
            } animate-pulse`} />
            {role === 'admin' ? 'Administrador' : role === 'secretaria' ? 'Secretaría' : 'Vendedor'}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <p className="section-label px-3 mb-3">Navegación</p>
          <ul className="flex flex-col gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 group overflow-hidden
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/60
                      ${active
                        ? 'bg-orange/12 text-orange'
                        : 'text-textsec hover:text-textprim hover:bg-white/[0.04]'
                      }
                    `}
                  >
                    {/* Active left indicator */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange rounded-r-full
                                       shadow-[0_0_8px_rgba(255,140,0,0.6)]" />
                    )}

                    {/* Icon container */}
                    <span className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                      ${active
                        ? 'bg-orange/20 text-orange'
                        : 'bg-white/[0.03] text-textsec group-hover:bg-white/[0.06] group-hover:text-textprim'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                    </span>

                    <span className="flex-1 truncate">{label}</span>

                    {active && (
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[10px] text-textmuted text-center font-medium tracking-wider uppercase">
            Encarnación, Paraguay
          </p>
          <p className="text-[10px] text-textmuted/60 text-center mt-0.5">
            © 2025 VH Group S.R.L.
          </p>
        </div>
      </aside>
    </>
  )
}
