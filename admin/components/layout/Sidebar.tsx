'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Car, Receipt, Users, ShoppingBag,
  X, ChevronRight, UserCog, ListOrdered,
} from 'lucide-react'
import type { Profile } from '@/types'

const adminNav = [
  { href: '/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/vehiculos',     label: 'Vehículos',      icon: Car },
  { href: '/gastos',        label: 'Gastos',         icon: Receipt },
  { href: '/clientes',      label: 'Clientes',       icon: Users },
  { href: '/ventas',        label: 'Ventas',         icon: ShoppingBag },
  { href: '/empleados',     label: 'Empleados',      icon: UserCog },
  { href: '/lista-precios', label: 'Lista de Precios', icon: ListOrdered },
]

const vendedorNav = [
  { href: '/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/vehiculos',     label: 'Vehículos',      icon: Car },
  { href: '/clientes',      label: 'Clientes',       icon: Users },
  { href: '/ventas',        label: 'Mis Ventas',     icon: ShoppingBag },
  { href: '/lista-precios', label: 'Lista de Precios', icon: ListOrdered },
]

interface Props { open: boolean; onClose: () => void; role?: string }

export function Sidebar({ open, onClose, role }: Props) {
  const pathname = usePathname()
  const navItems = role === 'admin' ? adminNav : vendedorNav

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-border flex flex-col z-30
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="VH Group"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-textprim leading-tight">VH Group</p>
              <p className="text-[10px] text-textsec">Panel de Gestión</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/5 rounded-lg">
            <X className="w-4 h-4 text-textsec" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-2.5 border-b border-border/50">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest
            ${role === 'admin' ? 'bg-orange/20 text-orange' : 'bg-blue-500/20 text-blue-400'}`}>
            {role === 'admin' ? 'Administrador' : 'Vendedor'}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] text-textsec uppercase tracking-widest px-3 mb-2 font-medium">Menú</p>
          <ul className="flex flex-col gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive(href)
                      ? 'bg-orange/15 text-orange border border-orange/20'
                      : 'text-textsec hover:text-textprim hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive(href) && <ChevronRight className="w-3 h-3 opacity-60" />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[10px] text-textsec text-center">VH Group S.R.L. © 2025</p>
          <p className="text-[10px] text-textsec text-center">Encarnación, Paraguay</p>
        </div>
      </aside>
    </>
  )
}
