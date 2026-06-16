'use client'

import { Suspense, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { VerseAutocomplete } from '@/components/ui/VerseAutocomplete'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import { fetchVerse } from '@/features/bible/BibleService'
import { cn } from '@/lib/utils'
import type { BibleVerse } from '@/types/bible'

const QUICK_VERSES = [
  'Salmo 23:1',
  'Juan 3:16',
  '1 Pedro 5:4',
  'Filipenses 4:13',
  'Romanos 8:28',
  'Isaías 41:10',
]

function ControlContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''

  const { currentVerse, showVerse, hideVerse, connectionStatus } = useBibleCastStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentVerses, setRecentVerses] = useState<BibleVerse[]>([])

  const isConnected = connectionStatus === 'connected'

  const handleSearch = useCallback(async (ref: string) => {
    if (!ref.trim()) return

    setLoading(true)
    setError(null)

    const verse = await fetchVerse(ref)
    if (verse) {
      showVerse(verse)
      setRecentVerses((prev) => {
        const filtered = prev.filter((v) => v.reference !== verse.reference)
        return [verse, ...filtered].slice(0, 10)
      })
    } else {
      setError(`No se encontró "${ref}"`)
    }

    setLoading(false)
  }, [showVerse])

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-container-lowest border-b border-outline-variant px-md py-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-outline',
              )}
            />
            <span className="font-label text-label-sm uppercase text-on-surface-variant">
              {isConnected ? 'Conectado' : 'Local'}
            </span>
          </div>
          {code && (
            <span className="font-label text-label-sm text-on-surface-variant tracking-widest">
              {code}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-md py-lg space-y-lg">
        <section>
          <label className="font-label text-label-sm uppercase text-on-surface-variant block mb-sm">
            Referencia bíblica
          </label>
          <VerseAutocomplete
            onSubmit={handleSearch}
            loading={loading}
            placeholder="Ej: Juan 3:16"
            clearOnSubmit
          />
          {error && (
            <p className="font-body text-sm text-error mt-xs">{error}</p>
          )}
        </section>

        {currentVerse && (
          <section className="bg-primary-container rounded-xl p-md">
            <p className="font-label text-label-sm text-on-primary-container uppercase mb-xs">
              En pantalla
            </p>
            <p className="font-body text-body-lg font-semibold text-white mb-1">
              {currentVerse.reference}
            </p>
            <p className="font-body text-body-md text-on-primary-container line-clamp-3 mb-md">
              {currentVerse.text}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => showVerse(currentVerse)}>
                Mostrar en Pantalla
              </Button>
              <Button variant="ghost" fullWidth onClick={hideVerse} className="border-on-primary-container text-on-primary-container">
                Ocultar
              </Button>
            </div>
          </section>
        )}

        <section>
          <h2 className="font-label text-label-sm uppercase text-on-surface-variant mb-sm">
            Versículos rápidos
          </h2>
          <div className="grid grid-cols-2 gap-sm">
            {QUICK_VERSES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleSearch(v)}
                className="text-left px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-body-md text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                {v}
              </button>
            ))}
          </div>
        </section>

        {recentVerses.length > 0 && (
          <section>
            <h2 className="font-label text-label-sm uppercase text-on-surface-variant mb-sm">
              Recientes
            </h2>
            <div className="space-y-sm">
              {recentVerses.map((verse) => (
                <button
                  key={verse.reference}
                  type="button"
                  onClick={() => showVerse(verse)}
                  className="w-full text-left px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <p className="font-body text-body-md font-medium text-on-surface">
                    {verse.reference}
                  </p>
                  <p className="font-body text-sm text-on-surface-variant line-clamp-1">
                    {verse.text}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default function ControlPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="font-body text-body-md text-on-surface-variant">Cargando...</p>
      </div>
    }>
      <ControlContent />
    </Suspense>
  )
}
