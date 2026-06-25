import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="section-label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={`input-base resize-none ${error ? 'border-error/60 focus:border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
