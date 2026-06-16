'use client'

import { cn } from '@/lib/utils'
import type { ProjectionStyle } from '@/types/events'

interface VisualAtmosphereProps {
  style: ProjectionStyle
  onChange: (updates: Partial<ProjectionStyle>) => void
}

const backgrounds: { value: ProjectionStyle['background']; label: string; icon: string }[] = [
  { value: 'solid-navy', label: 'Navy Sólido', icon: '◻' },
  { value: 'deep-slate', label: 'Slate Oscuro', icon: '◼' },
  { value: 'atmospheric', label: 'Atmosférico', icon: '≋' },
]

const accents = [
  { color: '#fed488', label: 'Dorado' },
  { color: '#7c9cc5', label: 'Azul' },
  { color: '#9ca3af', label: 'Gris' },
  { color: '#c47070', label: 'Rojo' },
]

export function VisualAtmosphere({ style, onChange }: VisualAtmosphereProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
      <div className="flex items-center gap-2 mb-lg">
        <span className="text-lg">✦</span>
        <h2 className="font-body text-body-lg font-semibold text-on-surface">
          Atmósfera Visual
        </h2>
      </div>

      <div className="mb-lg">
        <label className="font-label text-label-sm uppercase text-on-surface-variant block mb-sm">
          Motor de Fondo
        </label>
        <div className="grid grid-cols-3 gap-sm">
          {backgrounds.map((bg) => (
            <button
              key={bg.value}
              type="button"
              onClick={() => onChange({ background: bg.value })}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all cursor-pointer',
                style.background === bg.value
                  ? 'border-primary bg-surface-container-low'
                  : 'border-outline-variant hover:border-outline',
              )}
            >
              <span className="text-2xl">{bg.icon}</span>
              <span className="font-label text-label-sm text-on-surface-variant">{bg.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-label text-label-sm uppercase text-on-surface-variant block mb-sm">
          Color de Acento
        </label>
        <div className="flex gap-3">
          {accents.map((accent) => (
            <button
              key={accent.color}
              type="button"
              onClick={() => onChange({ accentColor: accent.color })}
              className={cn(
                'w-9 h-9 rounded-full border-2 transition-all cursor-pointer',
                style.accentColor === accent.color
                  ? 'border-primary scale-110'
                  : 'border-transparent hover:scale-105',
              )}
              style={{ backgroundColor: accent.color }}
              aria-label={accent.label}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
