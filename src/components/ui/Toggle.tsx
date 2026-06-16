'use client'

import { cn } from '@/lib/utils'

interface ToggleProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

function Toggle({ label, checked, onChange, className }: ToggleProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer', className)}>
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer',
          checked ? 'bg-primary' : 'bg-surface-container-highest',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
      {label && (
        <span className="font-label text-label-sm uppercase text-on-surface-variant">
          {label}
        </span>
      )}
    </label>
  )
}

export { Toggle }
export type { ToggleProps }
