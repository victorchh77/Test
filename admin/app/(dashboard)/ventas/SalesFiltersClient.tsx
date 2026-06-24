'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

export function SalesFiltersClient({ current }: { current: { from?: string; to?: string } }) {
  const router = useRouter()
  const pathname = usePathname()

  function update(key: string, value: string) {
    const params = new URLSearchParams(current as Record<string, string>)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  function clear() { router.push(pathname) }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-36">
        <Input
          label="Desde"
          type="date"
          value={current.from ?? ''}
          onChange={e => update('from', e.target.value)}
        />
      </div>
      <div className="flex-1 min-w-36">
        <Input
          label="Hasta"
          type="date"
          value={current.to ?? ''}
          onChange={e => update('to', e.target.value)}
        />
      </div>
      {(current.from || current.to) && (
        <Button variant="secondary" size="sm" onClick={clear}>
          <X className="w-3.5 h-3.5" /> Limpiar
        </Button>
      )}
    </div>
  )
}
