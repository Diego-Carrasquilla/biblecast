'use client'

import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  variant?: 'default' | 'search'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, variant = 'default', className, ...props }, ref) => {
    const isSearch = variant === 'search'

    return (
      <div className={cn('flex flex-col gap-xs', isSearch && 'w-full')}>
        {label && (
          <label className="font-label text-label-sm uppercase text-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body text-body-md placeholder:text-outline transition-colors duration-200 focus:border-primary focus:outline-none',
              isSearch ? 'rounded-full py-2.5 pl-10 pr-4' : 'rounded-lg py-2 px-3',
              !icon && !isSearch && 'pl-3',
              className,
            )}
            {...props}
          />
        </div>
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
export type { InputProps }
