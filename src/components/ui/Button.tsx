'use client'

import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-primary text-on-primary hover:bg-inverse-surface',
  secondary: 'bg-secondary-container text-on-secondary-container hover:brightness-95',
  ghost:     'bg-transparent text-on-surface border border-outline-variant hover:bg-surface-container-low',
  danger:    'bg-error text-on-error hover:brightness-90',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-label-sm font-label',
  md: 'px-4 py-2 text-body-md font-label text-label-sm',
  lg: 'px-6 py-3 text-body-md font-label',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide uppercase transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button }
export type { ButtonProps, ButtonVariant }
