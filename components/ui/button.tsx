/**
 * DESIGN-BRIEF §3: primary / secondary / quiet. No destructive/red variant —
 * deletes use a quiet button plus an undo toast (BUILD-INSTRUCTIONS §7.3),
 * never a red confirm button. First real usage is the auth forms (T-0.5);
 * built to the spec now rather than as an auth-only throwaway, since Phase 1
 * needs the exact same three variants.
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'border border-border-strong bg-surface text-text hover:bg-surface-sunk',
  quiet: 'text-accent-text hover:bg-accent-soft',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex min-h-[var(--tap-primary)] items-center justify-center gap-2 rounded-sm px-6 text-[length:var(--text-body-lg)] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  )
})
