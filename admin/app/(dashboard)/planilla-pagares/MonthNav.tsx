'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

interface Props { anio: number; mes: number }

export function MonthNav({ anio, mes }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function go(newAnio: number, newMes: number) {
    const p = new URLSearchParams(params.toString())
    p.set('anio', String(newAnio))
    p.set('mes', String(newMes))
    router.push(`${pathname}?${p.toString()}`)
  }

  function prev() {
    if (mes === 1) go(anio - 1, 12)
    else go(anio, mes - 1)
  }

  function next() {
    if (mes === 12) go(anio + 1, 1)
    else go(anio, mes + 1)
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={prev} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-textsec hover:text-textprim transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="font-display font-bold text-textprim text-sm min-w-[130px] text-center">
        {MESES[mes - 1]} {anio}
      </span>
      <button onClick={next} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-textsec hover:text-textprim transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
