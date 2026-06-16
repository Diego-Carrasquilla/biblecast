'use client'

import { cn } from '@/lib/utils'
import { Chip } from '@/components/ui/Chip'
import type { BookCategory, BOOK_CATEGORY_STYLES } from '@/types/bible'

interface BookCardProps {
  name: string
  chapters: number
  category: BookCategory
  categoryStyles: (typeof BOOK_CATEGORY_STYLES)[BookCategory]
  isExpanded?: boolean
  quote?: string
  loading?: boolean
  onClick?: () => void
}

export function BookCard({ name, chapters, category, categoryStyles, isExpanded, quote, loading, onClick }: BookCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'relative text-left rounded-xl border transition-all duration-200 cursor-pointer disabled:cursor-wait',
        isExpanded
          ? 'bg-primary-container border-primary-container p-lg col-span-2 row-span-1'
          : 'bg-surface-container-lowest border-outline-variant p-md hover:shadow-active',
      )}
    >
      {loading && (
        <span className="absolute top-3 right-3 block w-4 h-4 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
      )}
      <Chip
        label={categoryStyles.label}
        bgColor={isExpanded ? 'bg-secondary-container' : categoryStyles.bg}
        textColor={isExpanded ? 'text-on-secondary-container' : categoryStyles.text}
        className="mb-3"
      />

      <h3
        className={cn(
          'font-body font-semibold',
          isExpanded ? 'text-body-lg text-white' : 'text-body-md text-on-surface',
        )}
      >
        {name}
      </h3>

      <p
        className={cn(
          'font-body text-sm mt-0.5',
          isExpanded ? 'text-on-primary-container' : 'text-on-surface-variant',
        )}
      >
        {chapters} Capítulos
      </p>

      {isExpanded && quote && (
        <p className="font-body text-sm italic text-[#ffdea5] mt-4 leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>
      )}
    </button>
  )
}
