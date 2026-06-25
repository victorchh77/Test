import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-orange/20 blur-lg animate-glow-pulse" />
        <Loader2 className="relative w-8 h-8 text-orange animate-spin" />
      </div>
      <p className="text-sm text-textsec font-medium">{message}</p>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-orange/20 blur-xl animate-glow-pulse" />
        <Loader2 className="relative w-10 h-10 text-orange animate-spin" />
      </div>
    </div>
  )
}
