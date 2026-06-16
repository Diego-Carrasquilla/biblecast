'use client'

interface VerseTextProps {
  text: string
  reference: string
}

export function VerseText({ text, reference }: VerseTextProps) {
  return (
    <div className="relative text-center max-w-4xl mx-auto">
      <span
        className="absolute -top-16 -left-4 font-display-projection text-[120px] text-[#fed488] opacity-10 select-none leading-none pointer-events-none"
        aria-hidden="true"
      >
        {'“'}
      </span>

      <p className="font-display-projection text-display-projection text-[#ffdea5] relative z-10">
        {text}
      </p>

      <span
        className="absolute -bottom-20 -right-4 font-display-projection text-[120px] text-[#fed488] opacity-10 select-none leading-none pointer-events-none"
        aria-hidden="true"
      >
        {'”'}
      </span>

      <div className="w-16 h-px bg-[#e9c176] opacity-40 mx-auto mt-8 mb-4" />

      <p className="font-label text-2xl text-[#fed488] tracking-[0.2em] uppercase">
        {reference}
      </p>
    </div>
  )
}
