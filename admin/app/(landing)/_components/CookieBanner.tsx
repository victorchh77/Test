'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'vhgroup_cookie_notice_ack_v1'

/**
 * Aviso informativo, no un gestor de consentimiento granular: el catálogo
 * público no usa cookies de seguimiento ni publicidad (ver /cookies), así
 * que no hay categorías reales para aceptar/rechazar — solo confirmar que
 * lo leíste. Se monta únicamente en el grupo de rutas (landing), nunca en
 * el panel autenticado.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // Almacenamiento no disponible (modo privado, etc.) — no bloquea la navegación.
    }
  }, [])

  function dismiss() {
    setVisible(false)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-5 animate-fade-in">
      <div className="max-w-3xl mx-auto glass border border-border/70 rounded-2xl shadow-card-lg px-5 py-4
                       flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <Cookie className="w-5 h-5 text-orange flex-shrink-0 hidden sm:block" />
        <p className="text-xs sm:text-sm text-textsec leading-relaxed flex-1">
          Este sitio no usa cookies de seguimiento ni publicidad — solo una cookie técnica
          necesaria si iniciás sesión en el panel interno.{' '}
          <Link href="/cookies" className="text-orange hover:underline">Más información</Link>
        </p>
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          <button
            onClick={dismiss}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-orange hover:bg-orange-hover
                       text-white shadow-orange-sm transition-all active:scale-95"
          >
            Entendido
          </button>
          <button
            onClick={dismiss}
            aria-label="Cerrar aviso"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-textmuted hover:text-textprim
                       hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
