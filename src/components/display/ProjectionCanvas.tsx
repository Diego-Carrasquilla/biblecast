'use client'

import { AmbientBackground } from './AmbientBackground'
import { VerseText } from './VerseText'
import type { ProjectionStyle } from '@/types/events'

interface ProjectionCanvasProps {
  text?: string
  reference?: string
  style?: ProjectionStyle
}

// Mapea el "tema" elegido a un color de fondo concreto.
function backgroundColor(bg: ProjectionStyle['background'] | undefined): string {
  switch (bg) {
    case 'solid-navy': return '#131b2e'
    case 'deep-slate': return '#1e293b'
    case 'atmospheric': return '#0f172a'
    default: return '#000000'
  }
}

export function ProjectionCanvas({ text, reference, style }: ProjectionCanvasProps) {
  const accent = style?.accentColor ?? '#fed488'
  const margin = style?.sanctuaryMargin ?? 10
  const verticalPosition = style?.verticalPosition ?? 50

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: backgroundColor(style?.background) }}
    >
      <AmbientBackground />

      <div
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[60px] h-[2px] opacity-50"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />

      {/* Contenedor del contenido: la posición vertical y el margen del
          santuario se controlan desde los ajustes (UPDATE_STYLE). */}
      <div
        className="absolute left-0 right-0 z-10 -translate-y-1/2"
        style={{
          top: `${verticalPosition}%`,
          paddingLeft: `${margin}%`,
          paddingRight: `${margin}%`,
        }}
      >
        {text && reference ? (
          <VerseText text={text} reference={reference} style={style} />
        ) : (
          <div className="text-center">
            <p className="font-display-projection text-display-projection opacity-30" style={{ color: accent }}>
              BibleCast
            </p>
            <div className="w-16 h-px opacity-40 mx-auto mt-6 mb-4" style={{ backgroundColor: accent }} />
            <p
              className="font-label text-label-sm tracking-[0.2em] uppercase opacity-50"
              style={{ color: accent }}
            >
              Esperando versículo...
            </p>
          </div>
        )}
      </div>

      <span
        className="absolute bottom-[3%] right-[3%] font-label text-label-sm opacity-20 select-none"
        style={{ color: accent }}
      >
        ✦ BIBLECAST
      </span>
    </div>
  )
}
