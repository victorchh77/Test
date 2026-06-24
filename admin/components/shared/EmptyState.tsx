import { type LucideIcon, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Props {
  title?: string
  description?: string
  icon?: LucideIcon
  action?: { label: string; href: string }
}

export function EmptyState({ title = 'Sin datos', description, icon: Icon = Inbox, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
        <Icon className="w-7 h-7 text-textsec" />
      </div>
      <h3 className="text-base font-semibold text-textprim">{title}</h3>
      {description && <p className="text-sm text-textsec max-w-xs">{description}</p>}
      {action && (
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
