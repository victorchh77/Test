import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LandingFooter } from './LandingFooter'

interface Props {
  title: string
  updated: string
  children: React.ReactNode
}

export function LegalPageShell({ title, updated, children }: Props) {
  return (
    <div className="relative min-h-screen bg-bg text-textprim overflow-x-hidden flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      {/* Header */}
      <header className="glass border-b border-border/70 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="VH Group — Inicio">
            <Image src="/logo.png" alt="VH Group" width={36} height={36}
                   className="w-9 h-9 object-contain transition-transform group-hover:scale-105" />
            <span className="font-display font-bold text-textprim tracking-tight text-lg leading-none">
              VH <span className="text-orange">Group</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                         text-textsec hover:text-textprim hover:bg-white/[0.04] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-textprim tracking-tight">{title}</h1>
        <p className="text-sm text-textmuted mt-2">Última actualización: {updated}</p>
        <div className="mt-8 flex flex-col gap-6 text-sm sm:text-base text-textsec leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-textprim [&_h2]:mt-4 [&_h2]:mb-1 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_li]:leading-relaxed [&_strong]:text-textprim [&_strong]:font-semibold [&_a]:text-orange [&_a]:hover:underline">
          {children}
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
