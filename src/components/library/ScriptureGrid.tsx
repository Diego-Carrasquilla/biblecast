'use client'

import { useState, useCallback } from 'react'
import { BookCard } from './BookCard'
import { ChapterPicker } from './ChapterPicker'
import { Chip } from '@/components/ui/Chip'
import { BOOK_CATEGORY_STYLES } from '@/types/bible'
import type { BookCategory } from '@/types/bible'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import { fetchVerse } from '@/features/bible/BibleService'
import { findBook, type BibleBookData } from '@/lib/bible-books'
import { cn } from '@/lib/utils'

interface BookEntry {
  name: string
  chapters: number
  category: BookCategory
  testament: 'AT' | 'NT'
  isExpanded?: boolean
  quote?: string
}

const OLD_TESTAMENT: BookEntry[] = [
  { name: 'Génesis', chapters: 50, category: 'torah', testament: 'AT' },
  { name: 'Éxodo', chapters: 40, category: 'torah', testament: 'AT' },
  { name: 'Levítico', chapters: 27, category: 'torah', testament: 'AT' },
  { name: 'Salmos', chapters: 150, category: 'wisdom', testament: 'AT', isExpanded: true, quote: 'El Señor es mi pastor...' },
  { name: 'Números', chapters: 36, category: 'torah', testament: 'AT' },
]

const NEW_TESTAMENT: BookEntry[] = [
  { name: 'Mateo', chapters: 28, category: 'gospel', testament: 'NT' },
  { name: 'Marcos', chapters: 16, category: 'gospel', testament: 'NT' },
  { name: 'Romanos', chapters: 16, category: 'epistle', testament: 'NT' },
]

const QUICK_VERSES = ['Salmo 23', 'Juan 3:16', 'Hebreos 11']

export type TestamentFilter = 'all' | 'AT' | 'NT'

interface ScriptureGridProps {
  viewMode?: 'grid' | 'list'
  testamentFilter?: TestamentFilter
}

export function ScriptureGrid({ viewMode = 'grid', testamentFilter = 'all' }: ScriptureGridProps) {
  const addToPlaylist = useBibleCastStore((s) => s.addToPlaylist)
  const showToast = useBibleCastStore((s) => s.showToast)
  const [loadingRef, setLoadingRef] = useState<string | null>(null)
  const [pickerBook, setPickerBook] = useState<BibleBookData | null>(null)

  const addReference = useCallback(
    async (reference: string) => {
      setLoadingRef(reference)
      const verse = await fetchVerse(reference)
      setLoadingRef(null)
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

  const showAT = testamentFilter !== 'NT'
  const showNT = testamentFilter !== 'AT'

  const gridClasses =
    viewMode === 'grid'
      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md'
      : 'flex flex-col gap-sm'

  function renderBooks(books: BookEntry[]) {
    return books.map((book) => (
      <BookCard
        key={book.name}
        name={book.name}
        chapters={book.chapters}
        category={book.category}
        categoryStyles={BOOK_CATEGORY_STYLES[book.category]}
        isExpanded={viewMode === 'grid' ? book.isExpanded : false}
        quote={book.quote}
        onClick={() => setPickerBook(findBook(book.name))}
      />
    ))
  }

  return (
    <>
    <div className="space-y-xl">
      {showAT && (
        <section>
          <div className="flex items-center gap-4 mb-md">
            <h2 className="font-body text-body-lg font-semibold text-on-surface">Antiguo Testamento</h2>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>
          <div className={gridClasses}>{renderBooks(OLD_TESTAMENT)}</div>
        </section>
      )}

      {showNT && (
        <section>
          <div className="flex items-center gap-4 mb-md">
            <h2 className="font-body text-body-lg font-semibold text-on-surface">Nuevo Testamento</h2>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>
          <div className={gridClasses}>
            {renderBooks(NEW_TESTAMENT)}

            <div
              className={cn(
                'bg-surface-container-lowest border border-outline-variant rounded-xl p-md',
                viewMode === 'grid' && 'col-span-2',
              )}
            >
              <h3 className="font-body text-body-md font-semibold text-on-surface mb-1">
                Selección Rápida: Set de Adoración
              </h3>
              <p className="font-body text-sm text-on-surface-variant mb-3">
                Accede rápidamente a las escrituras más usadas en los servicios dominicales.
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_VERSES.map((v) => (
                  <Chip
                    key={v}
                    label={loadingRef === v ? 'Añadiendo…' : v}
                    bgColor="bg-surface-container"
                    textColor="text-on-surface-variant"
                    onClick={() => addReference(v)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>

    {pickerBook && (
      <ChapterPicker book={pickerBook} onClose={() => setPickerBook(null)} />
    )}
    </>
  )
}
