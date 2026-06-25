import { forwardRef, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="section-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`input-base ${error ? 'border-error/60 focus:border-error focus:ring-error/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-textsec">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'
