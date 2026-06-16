'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { VerseAutocomplete } from '@/components/ui/VerseAutocomplete'
import { fetchVerse } from '@/features/bible/BibleService'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import { cn } from '@/lib/utils'

interface TopBarProps {
  searchPlaceholder?: string
}

export function TopBar({ searchPlaceholder = 'Buscar versículo (ej. Juan 3:16)...' }: TopBarProps) {
  const { showVerse, addToPlaylist, hideVerse } = useBibleCastStore()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleSearch = useCallback(
    async (reference: string) => {
      setLoading(true)
      setFeedback(null)

      const verse = await fetchVerse(reference)

      if (verse) {
        showVerse(verse)
        addToPlaylist(verse)
        setFeedback({ type: 'success', text: `Mostrando ${verse.reference}` })
      } else {
        setFeedback({ type: 'error', text: `No se encontró "${reference}". Revisa la referencia.` })
      }

      setLoading(false)
      window.setTimeout(() => setFeedback(null), 3000)
    },
    [showVerse, addToPlaylist],
  )

  return (
    <header className="relative flex items-center gap-4 px-lg py-md border-b border-outline-variant bg-surface-container-lowest">
      <div className="flex-1 max-w-2xl">
        <VerseAutocomplete
          onSubmit={handleSearch}
          placeholder={searchPlaceholder}
          loading={loading}
          clearOnSubmit
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
          aria-label="Transmitir"
        >
          <CastIcon className="w-5 h-5" />
        </button>
        <Button variant="ghost" size="sm" onClick={hideVerse}>
          Limpiar Proyección
        </Button>
      </div>

      {feedback && (
        <div
          className={cn(
            'absolute left-lg top-full mt-1 z-40 px-3 py-1.5 rounded-lg font-body text-sm shadow-active',
            feedback.type === 'success'
              ? 'bg-primary-container text-white'
              : 'bg-error-container text-on-error-container',
          )}
        >
          {feedback.text}
        </div>
      )}
    </header>
  )
}

function CastIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 14a5 5 0 015 5" /><path d="M2 10a9 9 0 019 9" /><path d="M2 6a13 13 0 0113 13" />
      <circle cx="2.5" cy="18.5" r="1" fill="currentColor" />
    </svg>
  )
}
