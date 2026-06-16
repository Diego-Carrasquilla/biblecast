'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { BibleBookData } from '@/lib/bible-books'
import { fetchVerse, fetchChapterVerseNumbers } from '@/features/bible/BibleService'
import { useBibleCastStore } from '@/store/useBibleCastStore'

type Mode = 'add' | 'project'

interface ChapterPickerProps {
  book: BibleBookData
  onClose: () => void
}

export function ChapterPicker({ book, onClose }: ChapterPickerProps) {
  const addToPlaylist = useBibleCastStore((s) => s.addToPlaylist)
  const showVerse = useBibleCastStore((s) => s.showVerse)
  const showToast = useBibleCastStore((s) => s.showToast)

  const [mode, setMode] = useState<Mode>('add')
  const [chapter, setChapter] = useState<number | null>(null)
  const [verses, setVerses] = useState<number[]>([])
  const [loadingVerses, setLoadingVerses] = useState(false)
  const [busyRef, setBusyRef] = useState<string | null>(null)

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Al elegir capítulo, cargar sus versículos
  useEffect(() => {
    if (chapter === null) return
    let cancelled = false
    setLoadingVerses(true)
    setVerses([])
    fetchChapterVerseNumbers(book.slug, chapter).then((nums) => {
      if (!cancelled) {
        setVerses(nums)
        setLoadingVerses(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [chapter, book.slug])

  const perform = useCallback(
    async (reference: string) => {
      setBusyRef(reference)
      const verse = await fetchVerse(reference)
      setBusyRef(null)
      if (!verse) {
        showToast(`No se encontró "${reference}"`, 'error')
        return
      }
      if (mode === 'project') {
        showVerse(verse)
        showToast(`Proyectando ${verse.reference}`)
      } else {
        const added = addToPlaylist(verse)
        showToast(
          added ? `Añadido a la lista: ${verse.reference}` : `${verse.reference} ya está en la lista`,
          added ? 'success' : 'info',
        )
      }
    },
    [mode, addToPlaylist, showVerse, showToast],
  )

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-md bg-black/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Seleccionar capítulo y versículo de ${book.name}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-active overflow-hidden"
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between p-md border-b border-outline-variant">
          <div className="flex items-center gap-3 min-w-0">
            {chapter !== null && (
              <button
                type="button"
                onClick={() => setChapter(null)}
                className="p-1.5 -ml-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                aria-label="Volver a capítulos"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="font-body text-body-lg font-semibold text-on-surface truncate">
                {book.name}
                {chapter !== null && ` ${chapter}`}
              </h2>
              <p className="font-label text-label-sm text-on-surface-variant uppercase">
                {chapter === null
                  ? `${book.chapters} capítulos`
                  : 'Elige un versículo'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de modo */}
        <div className="px-md pt-md">
          <div className="flex p-0.5 bg-surface-container-low rounded-lg w-fit">
            {(['add', 'project'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'px-3 py-1.5 rounded-md font-label text-label-sm uppercase transition-colors cursor-pointer',
                  mode === m
                    ? 'bg-surface-container-high text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface',
                )}
              >
                {m === 'add' ? 'Añadir a lista' : 'Proyectar'}
              </button>
            ))}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-md">
          {chapter === null ? (
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChapter(ch)}
                  className="aspect-square flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body text-body-md hover:bg-surface-container-low hover:border-primary transition-colors cursor-pointer"
                >
                  {ch}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-md">
              <button
                type="button"
                onClick={() => perform(`${book.name} ${chapter}`)}
                disabled={busyRef === `${book.name} ${chapter}`}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low hover:border-primary transition-colors cursor-pointer disabled:cursor-wait"
              >
                <span className="font-body text-body-md font-medium text-on-surface">
                  Capítulo {chapter} completo
                </span>
                <span className="font-label text-label-sm uppercase text-on-surface-variant">
                  {busyRef === `${book.name} ${chapter}` ? '…' : mode === 'add' ? 'Añadir' : 'Proyectar'}
                </span>
              </button>

              {loadingVerses ? (
                <div className="flex items-center justify-center py-8 text-on-surface-variant">
                  <span className="block w-5 h-5 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
                </div>
              ) : verses.length > 0 ? (
                <div>
                  <p className="font-label text-label-sm uppercase text-on-surface-variant mb-2">
                    Versículos
                  </p>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {verses.map((v) => {
                      const ref = `${book.name} ${chapter}:${v}`
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => perform(ref)}
                          disabled={busyRef === ref}
                          className="aspect-square flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body text-body-md hover:bg-surface-container-low hover:border-primary transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-50"
                        >
                          {v}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="font-body text-sm text-on-surface-variant text-center py-4">
                  No se pudieron cargar los versículos.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5l-5 5 5 5" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}
