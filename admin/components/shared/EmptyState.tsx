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
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-orange/5 blur-xl" />
        <div className="relative w-16 h-16 bg-card-elevated border border-border rounded-2xl
                        flex items-center justify-center">
          <Icon className="w-7 h-7 text-textsec" />
        </div>
      </div>
      <div>
        <h3 className="font-display text-base font-semibold text-textprim">{title}</h3>
        {description && (
          <p className="text-sm text-textsec max-w-xs mt-1.5 leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
