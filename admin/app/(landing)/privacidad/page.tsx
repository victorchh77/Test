import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '../_components/LegalPageShell'

export const metadata: Metadata = {
  title: 'Política de Privacidad — VH Group',
  description: 'Cómo VH Group S.R.L. recolecta, usa y protege tus datos personales.',
}

export default function PrivacidadPage() {
  return (
    <LegalPageShell title="Política de Privacidad" updated="12 de agosto de 2026">
      <p>
        En VH Group S.R.L. (&quot;VH Group&quot;, &quot;nosotros&quot;) respetamos tu privacidad. Esta política explica
        qué datos personales recolectamos, para qué los usamos, con quién los compartimos y qué
        derechos tenés sobre ellos, tanto si visitás nuestro sitio web como si sos cliente o
        colaborador de la empresa.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        <strong>VH Group S.R.L.</strong>, concesionaria de vehículos con domicilio en Ruta Sexta Km. 3,
        Encarnación, Itapúa, Paraguay. Para cualquier consulta sobre esta política o tus datos
        personales, podés escribirnos a{' '}
        <a href="mailto:privacidad@vhgroup.com.py">privacidad@vhgroup.com.py</a> o por{' '}
        <a href="https://wa.me/5950995368724" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
      </p>

      <h2>2. Qué datos recolectamos</h2>
      <p><strong>Si solo navegás el catálogo público (sin iniciar sesión):</strong></p>
      <ul>
        <li>
          No recolectamos ningún dato personal de forma automática. El sitio no usa cookies de
          seguimiento ni herramientas de analítica o publicidad (Google Analytics, Facebook Pixel,
          etc.) — no tenemos ninguna instalada.
        </li>
        <li>
          El formulario de contacto de la página <strong>no envía tus datos a nuestros
          servidores</strong>: arma un mensaje de WhatsApp prellenado y lo abre en tu propia cuenta
          de WhatsApp. Sos vos quien decide efectivamente enviarlo. A partir de ahí, tu número de
          teléfono y la conversación quedan sujetos a las políticas de WhatsApp / Meta Platforms,
          Inc., no a las nuestras.
        </li>
      </ul>
      <p><strong>Si nos comprás un vehículo o gestionamos un contrato con vos:</strong></p>
      <ul>
        <li>Nombre completo, número de cédula de identidad, teléfono, email y ciudad.</li>
        <li>
          Datos del vehículo y de la operación (precio, forma de pago, financiación, pagarés,
          transferencias) necesarios para el contrato de compraventa y su seguimiento.
        </li>
      </ul>
      <p><strong>Si sos empleado o usuario del panel administrativo interno:</strong></p>
      <ul>
        <li>Nombre, usuario y rol dentro del sistema.</li>
        <li>
          Registro de auditoría de acciones sensibles (por ejemplo, verificar una transferencia o
          eliminar un registro): qué se hizo, cuándo y desde qué dirección IP, para la seguridad del
          sistema.
        </li>
      </ul>

      <h2>3. Para qué usamos tus datos</h2>
      <ul>
        <li>Gestionar la compraventa de vehículos y el cumplimiento del contrato correspondiente.</li>
        <li>Responder consultas y brindar atención al cliente.</li>
        <li>Cumplir obligaciones legales, contables e impositivas.</li>
        <li>Administrar el acceso y la seguridad de nuestro panel interno.</li>
      </ul>
      <p>
        No usamos tus datos personales con fines publicitarios ni los vendemos a terceros.
      </p>

      <h2>4. Con quién compartimos datos</h2>
      <p>
        Usamos algunos proveedores tecnológicos para operar el sistema, que procesan datos en
        nuestro nombre bajo sus propias medidas de seguridad:
      </p>
      <ul>
        <li><strong>Supabase</strong> — base de datos y autenticación.</li>
        <li><strong>Vercel</strong> — hospedaje del sitio y del panel.</li>
        <li>
          <strong>Sentry</strong> — monitoreo técnico de errores del sistema (no se usa con fines
          publicitarios). Ver más detalle en nuestro{' '}
          <Link href="/cookies">Aviso de Cookies</Link>.
        </li>
      </ul>
      <p>
        No compartimos tus datos con terceros para fines comerciales o publicitarios, salvo que la
        ley nos obligue a hacerlo (por ejemplo, ante un requerimiento judicial o administrativo).
      </p>

      <h2>5. Cuánto tiempo conservamos tus datos</h2>
      <p>
        Conservamos los datos de clientes y operaciones mientras dure la relación comercial y,
        después, durante el plazo que exige la legislación paraguaya en materia contable e
        impositiva. Los registros de auditoría del sistema se conservan de forma indefinida como
        medida de seguridad y trazabilidad.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        De acuerdo con el derecho de autodeterminación informativa reconocido en la Constitución
        Nacional del Paraguay (habeas data, art. 135) y demás normativa aplicable, podés pedirnos en
        cualquier momento:
      </p>
      <ul>
        <li>Acceder a los datos personales que tenemos sobre vos.</li>
        <li>Pedir que corrijamos datos incorrectos o desactualizados.</li>
        <li>Pedir que eliminemos tus datos, cuando no exista una obligación legal de conservarlos.</li>
        <li>Oponerte a un uso específico de tus datos.</li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, escribinos a{' '}
        <a href="mailto:privacidad@vhgroup.com.py">privacidad@vhgroup.com.py</a>.
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas razonables para proteger tus datos: acceso restringido por rol
        dentro del panel, contraseñas cifradas, conexiones seguras (HTTPS) y un registro de
        auditoría de acciones sensibles sobre datos de clientes y operaciones.
      </p>

      <h2>8. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política en caso de cambios en el sitio o en la normativa aplicable.
        La fecha de &quot;última actualización&quot; en la parte superior siempre va a reflejar la versión
        vigente.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-card-elevated/40 px-4 py-3 text-xs text-textmuted">
        Este documento fue redactado como guía general y no reemplaza el asesoramiento de un
        abogado. Recomendamos su revisión por un profesional matriculado en Paraguay antes de
        considerarlo definitivo.
      </div>
    </LegalPageShell>
  )
}
