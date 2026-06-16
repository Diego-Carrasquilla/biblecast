'use client'

import { Button } from '@/components/ui/Button'
import type { BibleVerse } from '@/types/bible'

interface LiveOutputPreviewProps {
  currentVerse: BibleVerse | null
  playlist: BibleVerse[]
  currentIndex: number
  onPrevious: () => void
  onNext: () => void
}

export function LiveOutputPreview({
  currentVerse,
  playlist,
  currentIndex,
  onPrevious,
  onNext,
}: LiveOutputPreviewProps) {
  const nextVerse = playlist[currentIndex + 1]
  const followingVerse = playlist[currentIndex + 2]

  return (
    <div className="space-y-md">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span className="font-label text-label-sm uppercase text-on-surface-variant tracking-wider">
          Salida en Vivo
        </span>
      </div>

      <div className="aspect-video bg-primary-container rounded-xl overflow-hidden relative flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(119,90,25,0.2) 0%, transparent 70%)',
          }}
        />
        {currentVerse ? (
          <div className="relative z-10 text-center px-[10%]">
            <p className="font-display-projection text-2xl md:text-3xl lg:text-4xl font-bold text-[#ffdea5] leading-tight">
              {currentVerse.text}
            </p>
            <div className="w-10 h-px bg-[#e9c176] opacity-40 mx-auto mt-4 mb-2" />
            <p className="font-label text-sm text-[#fed488] tracking-[0.15em] uppercase">
              {currentVerse.reference}
            </p>
          </div>
        ) : (
          <p className="font-display-projection text-2xl text-[#ffdea5] opacity-40">
            Sin versículo activo
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onPrevious} disabled={currentIndex <= 0}>
          Anterior
        </Button>
        <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary-container rounded-full transition-all duration-300"
            style={{
              width: playlist.length > 0
                ? `${((currentIndex + 1) / playlist.length) * 100}%`
                : '0%',
            }}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onNext} disabled={currentIndex >= playlist.length - 1}>
          Siguiente
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-md">
        <PreviewCard label="Siguiente" verse={nextVerse} />
        <PreviewCard label="Después" verse={followingVerse} />
      </div>
    </div>
  )
}

function PreviewCard({ label, verse }: { label: string; verse?: BibleVerse }) {
  return (
    <div className="bg-primary-container rounded-lg p-md min-h-[80px]">
      <span className="font-label text-label-sm text-on-primary-container uppercase block mb-1">
        {label}
      </span>
      {verse ? (
        <>
          <p className="font-body text-sm text-[#ffdea5] font-medium">{verse.reference}</p>
          <p className="font-body text-xs text-on-primary-container line-clamp-2 mt-0.5">
            {verse.text}
          </p>
        </>
      ) : (
        <p className="font-body text-xs text-on-primary-container opacity-50">—</p>
      )}
    </div>
  )
}
