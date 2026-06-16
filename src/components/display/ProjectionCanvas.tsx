'use client'

import { AmbientBackground } from './AmbientBackground'
import { VerseText } from './VerseText'

interface ProjectionCanvasProps {
  text?: string
  reference?: string
}

export function ProjectionCanvas({ text, reference }: ProjectionCanvasProps) {
  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <AmbientBackground />

      <div
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[60px] h-[2px] bg-[#fed488] opacity-50"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full projection-margin">
        {text && reference ? (
          <VerseText text={text} reference={reference} />
        ) : (
          <div className="text-center">
            <p className="font-display-projection text-display-projection text-[#ffdea5] opacity-30">
              BibleCast
            </p>
            <div className="w-16 h-px bg-[#e9c176] opacity-40 mx-auto mt-6 mb-4" />
            <p className="font-label text-label-sm text-[#fed488] tracking-[0.2em] uppercase opacity-50">
              Esperando versículo...
            </p>
          </div>
        )}
      </div>

      <span className="absolute bottom-[3%] right-[3%] font-label text-label-sm text-[#ffdea5] opacity-20 select-none">
        ✦ BIBLECAST
      </span>
    </div>
  )
}
