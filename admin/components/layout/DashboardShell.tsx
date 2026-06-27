'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/types'

const pageTitles: Record<string, string> = {
  '/dashboard':        'Dashboard',
  '/vehiculos':        'Vehículos',
  '/gastos':           'Gastos',
  '/clientes':         'Clientes',
  '/ventas':           'Ventas',
  '/empleados':        'Empleados',
  '/lista-precios':    'Lista de Precios',
  '/transferencias':   'Transferencias',
  '/planilla-pagares': 'Planilla de Pagarés',
  '/usuarios':         'Usuarios',
  '/flyers':           'Generador de Flyers',
  '/settings':         'Configuración',
}

function getTitle(pathname: string) {
  for (const [key, val] of Object.entries(pageTitles)) {
    if (pathname.startsWith(key)) return val
  }
  return 'VH Group'
}

export function DashboardShell({ children, profile }: { children: React.ReactNode; profile: Profile | null }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={profile?.role} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
          title={getTitle(pathname)}
        />
        {/* Main content with subtle grid background */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 bg-grid">
          {children}
        </main>
      </div>
    </div>
  )
}
