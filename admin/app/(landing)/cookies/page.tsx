import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '../_components/LegalPageShell'

export const metadata: Metadata = {
  title: 'Aviso de Cookies — VH Group',
  description: 'Qué cookies y tecnologías similares usa el sitio de VH Group.',
}

export default function CookiesPage() {
  return (
    <LegalPageShell title="Aviso de Cookies" updated="12 de agosto de 2026">
      <p>
        Preferimos ser directos: <strong>el catálogo público de VH Group no usa cookies de
        seguimiento, analítica ni publicidad.</strong> No tenemos instalado Google Analytics,
        Facebook Pixel ni ninguna herramienta similar. Si navegás la página de inicio o el catálogo
        sin iniciar sesión, no se guarda ninguna cookie para identificarte ni para rastrear tu
        actividad entre sitios.
      </p>

      <h2>1. ¿Qué es una cookie?</h2>
      <p>
        Es un pequeño archivo que un sitio web puede guardar en tu navegador para recordar
        información entre visitas (por ejemplo, mantenerte con la sesión iniciada).
      </p>

      <h2>2. Lo único que usamos: cookies esenciales de sesión</h2>
      <p>
        Si sos parte del equipo de VH Group y accedés al <strong>panel administrativo</strong>{' '}
        (<code>/login</code>), el sitio guarda una cookie técnica necesaria para mantener tu sesión
        iniciada. Sin ella, el panel no podría funcionar. No se usa para publicidad ni se comparte
        con terceros, y no se instala mientras navegás el catálogo público sin haber iniciado
        sesión.
      </p>

      <h2>3. Monitoreo de errores (Sentry)</h2>
      <p>
        Usamos Sentry para detectar errores técnicos del sitio y del panel. Solo se activa en
        producción y solo captura información cuando ocurre un error — no monitorea la navegación
        normal. Cualquier texto que pudiera registrar se enmascara automáticamente y no se graba
        contenido multimedia. Esta herramienta puede guardar información técnica en tu navegador
        (por ejemplo, en almacenamiento local) exclusivamente para ese fin de diagnóstico, nunca
        para publicidad ni perfilado.
      </p>

      <h2>4. Cómo administrar las cookies</h2>
      <p>
        Podés borrar o bloquear cookies desde la configuración de tu navegador en cualquier
        momento. Tené en cuenta que si bloqueás la cookie de sesión del panel, no vas a poder
        mantener la sesión iniciada como usuario interno — esto no afecta la navegación del
        catálogo público.
      </p>

      <p>
        Para más información sobre cómo tratamos tus datos en general, mirá nuestra{' '}
        <Link href="/privacidad">Política de Privacidad</Link>.
      </p>

    </LegalPageShell>
  )
}
