'use client'

import { cn } from '@/lib/utils'
import { Chip } from '@/components/ui/Chip'
import type { BibleVerse } from '@/types/bible'

interface PlaylistItemProps {
  verse: BibleVerse
  index: number
  isActive: boolean
  onClick: () => void
}

export function PlaylistItem({ verse, index, isActive, onClick }: PlaylistItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-md relative border-b border-outline-variant transition-colors duration-200 cursor-pointer',
        isActive
          ? 'bg-primary-container'
          : 'bg-surface-container-lowest hover:bg-surface-container-low',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container" />
      )}

      <div className="flex items-center gap-2 mb-1">
        {isActive ? (
          <Chip
            label="ACTUAL"
            bgColor="bg-secondary-container"
            textColor="text-on-secondary-container"
          />
        ) : (
          <span className="font-label text-label-sm text-on-surface-variant uppercase">
            Cola #{index}
          </span>
        )}
      </div>

      <p
        className={cn(
          'font-body text-body-lg font-semibold mb-0.5',
          isActive ? 'text-white' : 'text-on-surface',
        )}
      >
        {verse.reference}
      </p>

      <p
        className={cn(
          'font-body text-body-md line-clamp-2',
          isActive ? 'text-on-primary-container' : 'text-on-surface-variant',
        )}
      >
        {verse.text}
      </p>
    </button>
  )
}
