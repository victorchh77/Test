import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  size?: 'sm' | 'md'
}

const classes: Record<Variant, string> = {
  primary: `
    bg-orange hover:bg-orange-hover text-white font-semibold
    shadow-orange-sm hover:shadow-orange
    border border-orange/0 hover:border-orange/20
  `,
  secondary: `
    bg-card-elevated hover:bg-border text-textprim font-medium
    border border-border hover:border-border-bright
  `,
  danger: `
    bg-error/10 hover:bg-error/20 text-error font-medium
    border border-error/20 hover:border-error/40
  `,
  ghost: `
    hover:bg-white/5 text-textsec hover:text-textprim font-medium
    border border-transparent
  `,
}

const sizes: Record<'sm' | 'md', string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', loading, size = 'md', children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizes[size]} ${classes[variant]} ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
