'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={profile?.role} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
          title={getTitle(pathname)}
        />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 bg-grid"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
