'use client'

import { Chip } from '@/components/ui/Chip'
import type { ProjectionStyle } from '@/types/events'

interface ProjectionPreviewProps {
  style: ProjectionStyle
}

const PREVIEW_TEXT = '"El Señor es mi pastor; nada me faltará."'
const PREVIEW_REF = 'Salmo 23:1'

export function ProjectionPreview({ style }: ProjectionPreviewProps) {
  const bgColor =
    style.background === 'solid-navy'
      ? '#131b2e'
      : style.background === 'deep-slate'
        ? '#1e293b'
        : '#0f172a'

  return (
    <div>
      <div className="flex items-center gap-2 mb-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="font-label text-label-sm uppercase text-on-surface-variant tracking-wider">
          Vista Previa de Proyección
        </span>
        <Chip label="16:9" bgColor="bg-surface-container" textColor="text-on-surface-variant" />
        <Chip label="Vista Previa" bgColor="bg-surface-container" textColor="text-on-surface-variant" />
      </div>

      <div
        className="aspect-video rounded-xl overflow-hidden relative flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {style.background === 'atmospheric' && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${style.accentColor}1a 0%, transparent 70%)`,
            }}
          />
        )}

        <div
          className="relative z-10 w-full"
          style={{ padding: `${style.sanctuaryMargin}%` }}
        >
          <div
            style={{
              textAlign: style.textAlign,
              position: 'relative',
              top: `${(style.verticalPosition - 50) * 0.5}%`,
            }}
          >
            <p
              style={{
                fontFamily: style.fontFamily,
                fontSize: `${Math.min(style.fontSize * 0.4, 36)}px`,
                fontWeight: 700,
                lineHeight: 1.1,
                color: style.accentColor === '#fed488' ? '#ffdea5' : style.accentColor,
              }}
            >
              {PREVIEW_TEXT}
            </p>
            <div
              className="h-px mx-auto mt-3 mb-2 opacity-40"
              style={{
                width: '40px',
                backgroundColor: style.accentColor,
                marginLeft: style.textAlign === 'left' ? 0 : undefined,
                marginRight: style.textAlign === 'left' ? 'auto' : undefined,
              }}
            />
            <p
              className="font-label tracking-[0.15em] uppercase"
              style={{
                fontSize: '10px',
                color: style.accentColor,
              }}
            >
              {PREVIEW_REF}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
