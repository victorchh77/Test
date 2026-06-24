'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Car, Receipt, Users, ShoppingBag,
  History, X, ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/vehiculos',  label: 'Vehículos',  icon: Car },
  { href: '/gastos',     label: 'Gastos',     icon: Receipt },
  { href: '/clientes',   label: 'Clientes',   icon: Users },
  { href: '/ventas',     label: 'Ventas',     icon: ShoppingBag },
]

interface Props { open: boolean; onClose: () => void }

export function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <>
      {/* Mobile overlay */}
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange rounded-xl flex items-center justify-center font-black text-white text-sm">
              VH
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

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <p className="text-[10px] text-textsec uppercase tracking-widest px-3 mb-3 font-medium">Menú</p>
          <ul className="flex flex-col gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                    ${isActive(href)
                      ? 'bg-orange/15 text-orange'
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
          <p className="text-[10px] text-textsec text-center">
            VH Group S.R.L. © 2025
          </p>
          <p className="text-[10px] text-textsec text-center">Encarnación, Paraguay</p>
        </div>
      </aside>
    </>
  )
}
