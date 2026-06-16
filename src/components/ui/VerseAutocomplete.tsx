'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { searchBooks, findBook, type BibleBookData } from '@/lib/bible-books'
import { parseReference } from '@/features/bible/BibleService'

interface VerseAutocompleteProps {
  onSubmit: (reference: string) => void | Promise<void>
  placeholder?: string
  variant?: 'search' | 'default'
  loading?: boolean
  autoFocus?: boolean
  clearOnSubmit?: boolean
  className?: string
}

type Suggestion =
  | { kind: 'book'; book: BibleBookData }
  | { kind: 'chapter'; book: BibleBookData; chapter: number }

/**
 * Separa la entrada en el nombre del libro y lo que el usuario escribió después
 * (capítulo/versículo). "rest" solo contiene la parte que arranca con un dígito
 * tras un espacio, de modo que "1 Juan" no se confunde con un capítulo.
 */
function splitReference(value: string): { bookName: string; rest: string } {
  const m = value.match(/^(.*?\S)\s+(\d.*)$/)
  if (m) return { bookName: m[1], rest: m[2] }
  return { bookName: value.trim(), rest: '' }
}

export function VerseAutocomplete({
  onSubmit,
  placeholder = 'Buscar versículo (ej. Juan 3:16)...',
  variant = 'search',
  loading = false,
  autoFocus = false,
  clearOnSubmit = false,
  className,
}: VerseAutocompleteProps) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!value.trim()) return []
    const { bookName, rest } = splitReference(value)
    const knownBook = findBook(bookName)
    const hasTrailingSpace = /\s$/.test(value)
    const inChapterStage = !!knownBook && (rest !== '' || hasTrailingSpace) && !rest.includes(':')

    if (inChapterStage && knownBook) {
      const digits = rest.replace(/\D.*$/, '')
      const candidates: Suggestion[] = []
      for (let ch = 1; ch <= knownBook.chapters && candidates.length < 8; ch++) {
        if (!digits || String(ch).startsWith(digits)) {
          candidates.push({ kind: 'chapter', book: knownBook, chapter: ch })
        }
      }
      // Si ya hay un único capítulo que coincide exactamente, no hace falta sugerirlo
      if (candidates.length === 1 && String(candidates[0].chapter) === digits) return []
      return candidates
    }

    return searchBooks(bookName).map((book) => ({ kind: 'book' as const, book }))
  }, [value])

  const isValidRef = useMemo(() => parseReference(value) !== null, [value])

  useEffect(() => {
    setActiveIndex(-1)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectSuggestion = useCallback((s: Suggestion) => {
    if (s.kind === 'book') {
      setValue(`${s.book.name} `)
    } else {
      setValue(`${s.book.name} ${s.chapter}:`)
    }
    setOpen(true)
    inputRef.current?.focus()
  }, [])

  const submit = useCallback(async () => {
    if (!value.trim()) return
    setOpen(false)
    await onSubmit(value.trim())
    if (clearOnSubmit) setValue('')
  }, [value, onSubmit, clearOnSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (open && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setActiveIndex((i) => (i + 1) % suggestions.length)
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
          return
        }
        if (e.key === 'Tab' && activeIndex >= 0) {
          e.preventDefault()
          selectSuggestion(suggestions[activeIndex])
          return
        }
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (open && activeIndex >= 0 && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex])
        } else {
          void submit()
        }
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    },
    [open, suggestions, activeIndex, selectSuggestion, submit],
  )

  const isSearch = variant === 'search'

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
          {loading ? (
            <span className="block w-4 h-4 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
          ) : (
            <SearchIcon className="w-4 h-4" />
          )}
        </div>
        <input
          ref={inputRef}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Buscar versículo"
          className={cn(
            'w-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body text-body-md placeholder:text-outline transition-colors duration-200 focus:border-primary focus:outline-none',
            isSearch ? 'rounded-full py-2.5 pl-10 pr-12' : 'rounded-lg py-2 pl-10 pr-12',
          )}
        />
        {isValidRef && !loading && (
          <button
            type="button"
            onClick={() => void submit()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label text-label-sm uppercase hover:brightness-95 transition cursor-pointer"
          >
            Ir
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-surface-container-lowest border border-outline-variant rounded-lg shadow-active overflow-hidden max-h-80 overflow-y-auto scrollbar-thin"
        >
          {suggestions.map((s, i) => (
            <li key={s.kind === 'book' ? s.book.slug : `${s.book.slug}-${s.chapter}`}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => selectSuggestion(s)}
                className={cn(
                  'w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors cursor-pointer',
                  i === activeIndex ? 'bg-surface-container-low' : 'hover:bg-surface-container-low',
                )}
              >
                {s.kind === 'book' ? (
                  <>
                    <span className="font-body text-body-md text-on-surface">{s.book.name}</span>
                    <span className="font-label text-label-sm text-on-surface-variant uppercase">
                      {s.book.chapters} cap · {s.book.testament}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-body text-body-md text-on-surface">
                      {s.book.name} {s.chapter}
                    </span>
                    <span className="font-label text-label-sm text-on-surface-variant uppercase">
                      Capítulo
                    </span>
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13 13l4 4" />
    </svg>
  )
}
