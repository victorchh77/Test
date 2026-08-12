import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '../_components/LegalPageShell'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — VH Group',
  description: 'Condiciones de uso del sitio web de VH Group S.R.L.',
}

export default function TerminosPage() {
  return (
    <LegalPageShell title="Términos y Condiciones de Uso" updated="12 de agosto de 2026">
      <p>
        Estos términos regulan el uso del sitio web de <strong>VH Group S.R.L.</strong> (&quot;VH Group&quot;,
        &quot;el sitio&quot;). Al navegar el sitio, aceptás estas condiciones. Si no estás de acuerdo, te
        pedimos que no lo uses.
      </p>

      <h2>1. Objeto del sitio</h2>
      <p>
        El sitio es un catálogo informativo de los vehículos disponibles en VH Group. No es una
        tienda en línea: acá no se realizan compras ni pagos. Toda operación de compraventa se
        cierra de forma presencial o mediante contacto directo (WhatsApp, teléfono) con nuestro
        equipo, y se formaliza en un contrato aparte.
      </p>

      <h2>2. Precios y disponibilidad</h2>
      <p>
        Los precios, el estado y la disponibilidad de los vehículos que se muestran en el catálogo
        son referenciales y pueden cambiar sin previo aviso. Nada de lo publicado en el sitio
        constituye una oferta vinculante de venta: el precio y las condiciones finales se confirman
        siempre con un asesor antes de cerrar cualquier operación.
      </p>

      <h2>3. Uso permitido</h2>
      <p>Al usar el sitio, te comprometés a:</p>
      <ul>
        <li>Usarlo únicamente con fines lícitos y acordes a su propósito informativo.</li>
        <li>No intentar acceder sin autorización a áreas restringidas (por ejemplo, el panel interno).</li>
        <li>No usar el sitio para enviar contenido dañino, ni intentar vulnerar su funcionamiento o seguridad.</li>
      </ul>

      <h2>4. Propiedad intelectual</h2>
      <p>
        El contenido del sitio (textos, fotos, logo, diseño) es propiedad de VH Group S.R.L. o se
        usa con la debida autorización. No está permitida su reproducción o uso comercial sin
        nuestro consentimiento previo por escrito.
      </p>

      <h2>5. Enlaces a terceros</h2>
      <p>
        El sitio incluye enlaces a WhatsApp, Instagram y Facebook. Esas plataformas son operadas por
        terceros y se rigen por sus propios términos y políticas de privacidad, que no controlamos.
      </p>

      <h2>6. Limitación de responsabilidad</h2>
      <p>
        Hacemos un esfuerzo razonable para que la información del catálogo sea precisa y esté
        actualizada, pero no garantizamos que esté siempre libre de errores. VH Group no se
        responsabiliza por decisiones tomadas únicamente en base a la información del sitio sin
        confirmarla con un asesor.
      </p>

      <h2>7. Legislación aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República del Paraguay. Cualquier controversia
        relacionada con el uso del sitio se somete a la jurisdicción de los tribunales de
        Encarnación, Itapúa.
      </p>

      <h2>8. Modificaciones</h2>
      <p>
        Podemos actualizar estos términos en cualquier momento. La fecha de &quot;última actualización&quot;
        en la parte superior de esta página refleja la versión vigente.
      </p>

      <h2>9. Contacto</h2>
      <p>
        Para consultas sobre estos términos, escribinos a{' '}
        <a href="mailto:privacidad@vhgroup.com.py">privacidad@vhgroup.com.py</a> o por{' '}
        <a href="https://wa.me/5950995368724" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
        Ver también nuestra <Link href="/privacidad">Política de Privacidad</Link> y nuestro{' '}
        <Link href="/cookies">Aviso de Cookies</Link>.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-card-elevated/40 px-4 py-3 text-xs text-textmuted">
        Este documento fue redactado como guía general y no reemplaza el asesoramiento de un
        abogado. Recomendamos su revisión por un profesional matriculado en Paraguay antes de
        considerarlo definitivo.
      </div>
    </LegalPageShell>
  )
}
