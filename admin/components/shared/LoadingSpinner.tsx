import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-orange animate-spin" />
      <p className="text-sm text-textsec">{message}</p>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="w-10 h-10 text-orange animate-spin" />
    </div>
  )
}
