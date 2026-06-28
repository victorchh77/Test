import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "VH Group S.R.L. – Panel de Gestión",
  description: "Panel administrativo para VH Group S.R.L. – Concesionaria Encarnación",
}

// Aplica el tema guardado antes de pintar (evita parpadeo). Sin clase => :root
// provee el tema oscuro por defecto, así el SSR ya es oscuro.
const themeScript = `(function(){try{var t=localStorage.getItem('vh-theme');if(t!=='light'&&t!=='dark')t='dark';var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(t);d.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  )
}
