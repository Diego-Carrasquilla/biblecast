'use client'

import { useState, useCallback } from 'react'
import { fetchVerse } from '@/features/bible/BibleService'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import type { BibleVersion } from '@/types/bible'

export function useBibleVerse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showVerse, addToPlaylist, currentVerse } = useBibleCastStore()

  const searchVerse = useCallback(
    async (reference: string, version: BibleVersion = 'RVR1960') => {
      setLoading(true)
      setError(null)

      const verse = await fetchVerse(reference, version)

      if (verse) {
        showVerse(verse)
        setError(null)
      } else {
        setError('No se encontró el versículo. Verifica la referencia.')
      }

      setLoading(false)
      return verse
    },
    [showVerse],
  )

  const searchAndAddToPlaylist = useCallback(
    async (reference: string, version: BibleVersion = 'RVR1960') => {
      const verse = await searchVerse(reference, version)
      if (verse) {
        addToPlaylist(verse)
      }
      return verse
    },
    [searchVerse, addToPlaylist],
  )

  return {
    currentVerse,
    loading,
    error,
    searchVerse,
    searchAndAddToPlaylist,
  }
}
