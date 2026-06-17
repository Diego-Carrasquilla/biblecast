'use client'

import type { ProjectionStyle } from '@/types/events'

interface VerseTextProps {
  text: string
  reference: string
  style?: ProjectionStyle
}

export function VerseText({ text, reference, style }: VerseTextProps) {
  const fontSize = style?.fontSize ?? 72
  const textAlign = style?.textAlign ?? 'center'
  const fontFamily = style?.fontFamily
  const accent = style?.accentColor ?? '#fed488'

  return (
    <div className="relative max-w-4xl mx-auto" style={{ textAlign }}>
      <span
        className="absolute -top-16 -left-4 font-display-projection text-[120px] opacity-10 select-none leading-none pointer-events-none"
        style={{ color: accent }}
        aria-hidden="true"
      >
        {'“'}
      </span>

      <p
        className="font-display-projection text-[#ffdea5] relative z-10 leading-tight"
        style={{ fontSize: `${fontSize}px`, fontFamily }}
      >
        {text}
      </p>

      <span
        className="absolute -bottom-20 -right-4 font-display-projection text-[120px] opacity-10 select-none leading-none pointer-events-none"
        style={{ color: accent }}
        aria-hidden="true"
      >
        {'”'}
      </span>

      <div
        className="w-16 h-px opacity-40 mt-8 mb-4"
        style={{ backgroundColor: accent, marginLeft: textAlign === 'center' ? 'auto' : 0, marginRight: textAlign === 'center' ? 'auto' : 0 }}
      />

      <p
        className="font-label text-2xl tracking-[0.2em] uppercase"
        style={{ color: accent }}
      >
        {reference}
      </p>
    </div>
  )
}
