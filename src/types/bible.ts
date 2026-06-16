export type BibleVersion = 'RVR1960' | 'NVI' | 'ESV' | 'KJV'

export interface BibleVerse {
  book: string
  chapter: number
  verse: number
  text: string
  reference: string
  version: BibleVersion
}

export interface BibleBook {
  name: string
  chapters: number
  category: BookCategory
}

export type BookCategory = 'torah' | 'wisdom' | 'gospel' | 'epistle' | 'prophecy' | 'history'

export const BOOK_CATEGORY_STYLES: Record<BookCategory, { bg: string; text: string; label: string }> = {
  torah:    { bg: 'bg-primary-container', text: 'text-on-primary', label: 'Torah' },
  wisdom:   { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Wisdom' },
  gospel:   { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Gospel' },
  epistle:  { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed-variant', label: 'Epistle' },
  prophecy: { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', label: 'Prophecy' },
  history:  { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: 'History' },
}
