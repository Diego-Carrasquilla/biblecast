'use client'

import { useBibleCastStore } from '@/store/useBibleCastStore'
import { cn } from '@/lib/utils'

const TOAST_STYLES = {
  success: 'bg-primary-container text-white',
  error: 'bg-error-container text-on-error-container',
  info: 'bg-surface-container-high text-on-surface',
} as const

export function Toaster() {
  const toast = useBibleCastStore((s) => s.toast)
  const dismissToast = useBibleCastStore((s) => s.dismissToast)

  if (!toast) return null

  return (
    <div className="fixed bottom-lg right-lg z-[60] pointer-events-none">
      <button
        type="button"
        onClick={dismissToast}
        className={cn(
          'pointer-events-auto px-4 py-2.5 rounded-xl shadow-active font-body text-body-md max-w-sm text-left cursor-pointer',
          TOAST_STYLES[toast.type],
        )}
      >
        {toast.text}
      </button>
    </div>
  )
}
