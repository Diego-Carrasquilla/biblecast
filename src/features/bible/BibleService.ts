import type { BibleVerse, BibleVersion } from '@/types/bible'
import { findBook, type BibleBookData } from '@/lib/bible-books'

/**
 * API de la Biblia en español (Reina Valera 1960).
 * https://bible-api.deno.dev
 *   - Versículo:        /api/read/rv1960/{slug}/{cap}/{ver}        → objeto
 *   - Rango:            /api/read/rv1960/{slug}/{cap}/{ini}-{fin}  → array
 *   - Capítulo entero:  /api/read/rv1960/{slug}/{cap}              → { vers: [] }
 */
const API_BASE = 'https://bible-api.deno.dev/api/read'

const VERSION_MAP: Record<BibleVersion, string> = {
  RVR1960: 'rv1960',
  NVI: 'nvi',
  ESV: 'rv1960', // fallback: la API solo tiene versiones en español
  KJV: 'rv1960',
}

interface ApiVerse {
  verse: string
  number: number
  study?: string | null
  id: number
}

interface ApiChapter {
  name: string
  chapter: number
  num_chapters: number
  vers: ApiVerse[]
}

interface ParsedReference {
  book: BibleBookData
  chapter: number
  verseStart?: number
  verseEnd?: number
}

/**
 * Interpreta una referencia como "Juan 3:16", "1 Pedro 5:4", "Salmo 23:1-3"
 * o "Salmos 23" (capítulo completo). Devuelve null si no se reconoce el libro.
 */
export function parseReference(input: string): ParsedReference | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Captura: (nombre del libro) (capítulo)[:(versículo)[-(versículo fin)]]
  const match = trimmed.match(/^(.+?)\s+(\d+)(?::(\d+)(?:\s*-\s*(\d+))?)?$/)
  if (!match) {
    // Solo el nombre del libro → capítulo 1
    const onlyBook = findBook(trimmed)
    if (onlyBook) return { book: onlyBook, chapter: 1 }
    return null
  }

  const book = findBook(match[1])
  if (!book) return null

  const chapter = parseInt(match[2], 10)
  if (chapter < 1 || chapter > book.chapters) return null

  const verseStart = match[3] ? parseInt(match[3], 10) : undefined
  const verseEnd = match[4] ? parseInt(match[4], 10) : undefined

  return { book, chapter, verseStart, verseEnd }
}

/** Construye la referencia legible canónica ("Juan 3:16", "Salmo 23:1-3") */
function formatReference(parsed: ParsedReference): string {
  const { book, chapter, verseStart, verseEnd } = parsed
  if (verseStart === undefined) return `${book.name} ${chapter}`
  if (verseEnd !== undefined && verseEnd !== verseStart) {
    return `${book.name} ${chapter}:${verseStart}-${verseEnd}`
  }
  return `${book.name} ${chapter}:${verseStart}`
}

async function apiFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/**
 * Busca un versículo, rango o capítulo a partir de una referencia en español.
 */
export async function fetchVerse(
  reference: string,
  version: BibleVersion = 'RVR1960',
): Promise<BibleVerse | null> {
  const parsed = parseReference(reference)
  if (!parsed) return null

  const ver = VERSION_MAP[version]
  const { book, chapter, verseStart, verseEnd } = parsed
  const base = `${API_BASE}/${ver}/${book.slug}/${chapter}`

  // Capítulo completo
  if (verseStart === undefined) {
    const data = await apiFetch<ApiChapter>(base)
    if (!data?.vers?.length) return null
    return {
      book: book.name,
      chapter,
      verse: 1,
      text: data.vers.map((v) => v.verse.trim()).join(' '),
      reference: formatReference(parsed),
      version,
    }
  }

  // Rango de versículos
  if (verseEnd !== undefined && verseEnd !== verseStart) {
    const data = await apiFetch<ApiVerse[]>(`${base}/${verseStart}-${verseEnd}`)
    if (!data?.length) return null
    return {
      book: book.name,
      chapter,
      verse: verseStart,
      text: data.map((v) => v.verse.trim()).join(' '),
      reference: formatReference(parsed),
      version,
    }
  }

  // Versículo individual
  const data = await apiFetch<ApiVerse>(`${base}/${verseStart}`)
  if (!data?.verse) return null
  return {
    book: book.name,
    chapter,
    verse: verseStart,
    text: data.verse.trim(),
    reference: formatReference(parsed),
    version,
  }
}

/**
 * Devuelve los números de versículo disponibles en un capítulo, para poder
 * construir un selector sin adivinar cuántos versículos tiene.
 */
export async function fetchChapterVerseNumbers(
  slug: string,
  chapter: number,
  version: BibleVersion = 'RVR1960',
): Promise<number[]> {
  const ver = VERSION_MAP[version]
  const data = await apiFetch<ApiChapter>(`${API_BASE}/${ver}/${slug}/${chapter}`)
  if (!data?.vers?.length) return []
  return data.vers.map((v) => v.number).sort((a, b) => a - b)
}

export async function fetchMultipleVerses(
  references: string[],
  version: BibleVersion = 'RVR1960',
): Promise<BibleVerse[]> {
  const results = await Promise.allSettled(
    references.map((ref) => fetchVerse(ref, version)),
  )

  return results
    .filter((r): r is PromiseFulfilledResult<BibleVerse | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((v): v is BibleVerse => v !== null)
}
