/**
 * DESIGN-BRIEF §6: "Every input has a persistent visible label. No
 * placeholder-as-label anywhere." The label is a real <label>, always
 * rendered, never a placeholder standing in for one.
 *
 * Error text is amber (--attention), never red — §1.1 lists "red validation"
 * as an anti-pattern by name, and --critical is reserved for allergy and
 * custody flags (globals.css §2.3). A wrong password is not that kind of
 * emergency and must not look like one.
 */

import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, id, className, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-[length:var(--text-body)] font-medium text-text">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={cn(
          'min-h-[var(--tap-min)] rounded-sm border border-border-strong bg-surface px-3 text-[length:var(--text-body-lg)] text-text',
          error && 'border-attention',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-[length:var(--text-small)] text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-[length:var(--text-small)] text-attention">
          {error}
        </p>
      )}
    </div>
  )
})
