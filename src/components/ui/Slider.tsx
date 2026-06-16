'use client'

import { cn } from '@/lib/utils'

interface SliderProps {
  label?: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  className?: string
}

function Slider({ label, value, min = 0, max = 100, step = 1, onChange, className }: SliderProps) {
  return (
    <div className={cn('flex flex-col gap-xs', className)}>
      {label && (
        <label className="font-label text-label-sm uppercase text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  )
}

export { Slider }
export type { SliderProps }
