import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  size?: 'sm' | 'md'
}

const classes: Record<Variant, string> = {
  primary:   'bg-orange hover:bg-orange-hover text-white',
  secondary: 'bg-card hover:bg-border text-textprim border border-border',
  danger:    'bg-error/10 hover:bg-error/20 text-error border border-error/30',
  ghost:     'hover:bg-white/5 text-textsec hover:text-textprim',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', loading, size = 'md', children, className = '', disabled, ...props }, ref) => {
    const sz = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed ${sz} ${classes[variant]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
