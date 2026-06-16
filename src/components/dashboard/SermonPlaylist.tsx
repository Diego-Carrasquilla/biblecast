'use client'

import { useState, useCallback } from 'react'
import { PlaylistItem } from './PlaylistItem'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { VerseAutocomplete } from '@/components/ui/VerseAutocomplete'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import { fetchVerse } from '@/features/bible/BibleService'
import type { BibleVerse } from '@/types/bible'

interface SermonPlaylistProps {
  playlist: BibleVerse[]
  currentIndex: number
  onSelectItem: (index: number) => void
}

export function SermonPlaylist({ playlist, currentIndex, onSelectItem }: SermonPlaylistProps) {
  const addToPlaylist = useBibleCastStore((s) => s.addToPlaylist)
  const showToast = useBibleCastStore((s) => s.showToast)
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAdd = useCallback(
    async (reference: string) => {
      setLoading(true)
      const verse = await fetchVerse(reference)
      setLoading(false)
      if (!verse) {
        showToast(`No se encontró "${reference}"`, 'error')
        return
      }
      const added = addToPlaylist(verse)
      showToast(
        added ? `Añadido a la lista: ${verse.reference}` : `${verse.reference} ya está en la lista`,
        added ? 'success' : 'info',
      )
    },
    [addToPlaylist, showToast],
  )

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between p-md border-b border-outline-variant">
        <h2 className="font-body text-body-lg font-semibold text-on-surface">
          Lista del Sermón
        </h2>
        <span className="font-label text-label-sm text-on-surface-variant">
          {playlist.length} {playlist.length === 1 ? 'elemento' : 'elementos'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {playlist.map((verse, i) => (
          <PlaylistItem
            key={`${verse.reference}-${i}`}
            verse={verse}
            index={i + 1}
            isActive={i === currentIndex}
            onClick={() => onSelectItem(i)}
          />
        ))}
      </div>

      <div className="p-md border-t border-outline-variant">
        <div className="flex gap-2 mb-md">
          <Chip label="Salmos" bgColor="bg-primary-fixed" textColor="text-on-primary-fixed-variant" />
          <Chip label="Evangelios" bgColor="bg-primary-fixed" textColor="text-on-primary-fixed-variant" />
          <Chip label="Nuevo Test." bgColor="bg-secondary-container" textColor="text-on-secondary-container" />
        </div>

        {adding ? (
          <div className="space-y-sm">
            <VerseAutocomplete
              onSubmit={handleAdd}
              variant="default"
              loading={loading}
              autoFocus
              clearOnSubmit
              placeholder="Ej: Juan 3:16"
            />
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="w-full text-center font-label text-label-sm uppercase text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer py-1"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <Button variant="ghost" fullWidth size="sm" onClick={() => setAdding(true)}>
            + Añadir Versículos
          </Button>
        )}
      </div>
    </div>
  )
}
