'use client'

import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/Slider'
import type { ProjectionStyle } from '@/types/events'

interface TypographyControlsProps {
  style: ProjectionStyle
  onChange: (updates: Partial<ProjectionStyle>) => void
}

// Los valores apuntan a las variables CSS que next/font define en <html>
// (ver tailwind.config y layout). Usar el nombre literal ("Playfair Display")
// NO funciona: next/font registra la fuente con un nombre generado, así que el
// navegador buscaría una fuente del sistema con ese nombre y caería al serif por
// defecto en máquinas donde no exista. Con la variable, la fuente cargada se
// aplica siempre, de forma determinista.
const fonts = [
  { value: 'var(--font-playfair), serif', label: 'Playfair Display (Clásica)' },
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: 'var(--font-inter), sans-serif', label: 'Inter (Sans Serif)' },
]

const alignments: { value: ProjectionStyle['textAlign']; label: string; icon: string }[] = [
  { value: 'left', label: 'Izquierda', icon: '≡' },
  { value: 'center', label: 'Centro', icon: '≡' },
  { value: 'justify', label: 'Justificar', icon: '≡' },
]

export function TypographyControls({ style, onChange }: TypographyControlsProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
      <div className="flex items-center gap-2 mb-lg">
        <span className="font-body text-lg font-bold">Tt</span>
        <h2 className="font-body text-body-lg font-semibold text-on-surface">
          Tipografía Bíblica
        </h2>
      </div>

      <div className="mb-lg">
        <label className="font-label text-label-sm uppercase text-on-surface-variant block mb-sm">
          Familia Tipográfica
        </label>
        <select
          value={style.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full border border-outline-variant rounded-lg px-3 py-2 font-body text-body-md text-on-surface bg-surface-container-lowest focus:border-primary focus:outline-none cursor-pointer"
        >
          {fonts.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-lg">
        <Slider
          label="Tamaño Base"
          value={style.fontSize}
          min={36}
          max={120}
          step={2}
          onChange={(v) => onChange({ fontSize: v })}
        />
      </div>

      <div>
        <label className="font-label text-label-sm uppercase text-on-surface-variant block mb-sm">
          Alineación del Texto
        </label>
        <div className="flex gap-sm">
          {alignments.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => onChange({ textAlign: a.value })}
              className={cn(
                'flex-1 py-2 rounded-lg border font-label text-label-sm transition-all cursor-pointer',
                style.textAlign === a.value
                  ? 'border-primary bg-surface-container-low text-on-surface'
                  : 'border-outline-variant text-on-surface-variant hover:border-outline',
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
