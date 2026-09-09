import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'

export function LandingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-sidebar/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="VH Group" width={36} height={36} className="w-9 h-9 object-contain" />
              <span className="font-display font-bold text-textprim text-lg">
                VH <span className="text-orange">Group</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-textsec max-w-xs leading-relaxed">
              Concesionaria de vehículos en Encarnación. Comprá con confianza, financiá a tu medida y
              retirá con todo en regla.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Social label="WhatsApp" href="https://wa.me/5950995368724">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.06c-.25.69-1.45 1.32-1.99 1.36-.53.05-1.02.24-3.44-.72-2.9-1.14-4.74-4.1-4.88-4.29-.14-.19-1.17-1.55-1.17-2.96 0-1.41.74-2.1 1-2.39.25-.29.54-.36.72-.36.18 0 .36 0 .52.01.17.01.39-.06.61.47.25.6.83 2.05.9 2.2.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.18-.21.69-.81.88-1.09.18-.28.37-.23.61-.14.25.09 1.57.74 1.84.87.28.14.46.21.53.32.07.12.07.66-.18 1.35Z"/>
              </Social>
              <Social label="Instagram" href="https://www.instagram.com/vhgroupsrl">
                <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.5.01-4.74.07-.89.04-1.37.19-1.69.31-.43.17-.73.36-1.05.68-.32.32-.51.62-.68 1.05-.12.32-.27.8-.31 1.69-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.04.89.19 1.37.31 1.69.17.43.36.73.68 1.05.32.32.62.51 1.05.68.32.12.8.27 1.69.31 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.89-.04 1.37-.19 1.69-.31.43-.17.73-.36 1.05-.68.32-.32.51-.62.68-1.05.12-.32.27-.8.31-1.69.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.89-.19-1.37-.31-1.69a2.8 2.8 0 0 0-.68-1.05 2.8 2.8 0 0 0-1.05-.68c-.32-.12-.8-.27-1.69-.31C15.5 4.01 15.15 4 12 4Zm0 3.06A4.94 4.94 0 1 0 16.94 12 4.94 4.94 0 0 0 12 7.06Zm0 8.14A3.2 3.2 0 1 1 15.2 12 3.2 3.2 0 0 1 12 15.2Zm5.14-8.34a1.15 1.15 0 1 1-1.15-1.15 1.15 1.15 0 0 1 1.15 1.15Z"/>
              </Social>
              <Social label="Facebook" href="https://www.facebook.com/share/1EMYyueneL/?mibextid=wwXIfr">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.57v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/>
              </Social>
            </div>
          </div>

          <FooterCol title="Explorar" links={[
            { label: 'Vehículos', href: '/#vehiculos' },
            { label: 'Servicios', href: '/#servicios' },
            { label: 'Nosotros', href: '/#nosotros' },
            { label: 'Contacto', href: '/#contacto' },
          ]} />

          <FooterCol title="Empresa" links={[
            { label: 'Acceder al panel', href: '/login' },
            { label: 'WhatsApp', href: 'https://wa.me/5950995368724' },
            { label: 'Instagram', href: 'https://www.instagram.com/vhgroupsrl' },
            { label: 'Facebook', href: 'https://www.facebook.com/share/1EMYyueneL/?mibextid=wwXIfr' },
          ]} />

          <FooterCol title="Legal" links={[
            { label: 'Política de privacidad', href: '/privacidad' },
            { label: 'Términos y condiciones', href: '/terminos' },
            { label: 'Aviso de cookies', href: '/cookies' },
          ]} />
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-textmuted">© {year} VH Group S.R.L. — Todos los derechos reservados.</p>
          <p className="text-xs text-textmuted flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 text-orange" />
            Encarnación · Itapúa · Paraguay
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="section-label mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-sm text-textsec hover:text-orange transition-colors">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Social({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-xl bg-card border border-border hover:border-orange/40 hover:text-orange
                 text-textsec flex items-center justify-center transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden>{children}</svg>
    </a>
  )
}
