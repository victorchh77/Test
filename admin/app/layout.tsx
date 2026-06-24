import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "VH Group S.R.L. – Panel de Gestión",
  description: "Panel administrativo para VH Group S.R.L. – Concesionaria Encarnación",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
