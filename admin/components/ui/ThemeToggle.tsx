'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

type Theme = 'dark' | 'light'

/**
 * Botón para alternar tema claro/oscuro. Persiste en localStorage ('vh-theme')
 * y aplica la clase en <html>. El tema oscuro es el predeterminado.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    const d = document.documentElement
    d.classList.remove('light', 'dark')
    d.classList.add(next)
    d.style.colorScheme = next
    try { localStorage.setItem('vh-theme', next) } catch {}
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border border-border
                  text-textsec hover:text-orange hover:border-orange/40 hover:bg-orange/5
                  transition-colors ${className}`}
    >
      {/* Antes de montar mostramos el ícono coherente con el default oscuro */}
      {mounted && !isDark
        ? <Moon className="w-4 h-4" />
        : <Sun className="w-4 h-4" />}
    </button>
  )
}
