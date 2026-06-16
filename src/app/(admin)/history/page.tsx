'use client'

import { useBibleCastStore } from '@/store/useBibleCastStore'
import { Button } from '@/components/ui/Button'

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDay(at: number): string {
  const d = new Date(at)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) return 'Hoy'
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function HistoryPage() {
  const history = useBibleCastStore((s) => s.history)
  const clearHistory = useBibleCastStore((s) => s.clearHistory)
  const showVerse = useBibleCastStore((s) => s.showVerse)
  const addToPlaylist = useBibleCastStore((s) => s.addToPlaylist)
  const showToast = useBibleCastStore((s) => s.showToast)

  function handleProject(index: number) {
    showVerse(history[index].verse)
    showToast(`Proyectando ${history[index].verse.reference}`)
  }

  function handleAdd(index: number) {
    const verse = history[index].verse
    const added = addToPlaylist(verse)
    showToast(
      added ? `Añadido a la lista: ${verse.reference}` : `${verse.reference} ya está en la lista`,
      added ? 'success' : 'info',
    )
  }

  return (
    <div>
      <p className="font-body text-sm text-on-surface-variant mb-xs">
        Historial &rsaquo; Sesión actual
      </p>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-lg">
        <h1 className="font-headline text-headline-lg text-on-surface min-w-0">Historial</h1>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            Limpiar historial
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 px-md border border-dashed border-outline-variant rounded-xl">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-md">
            <ClockIcon className="w-6 h-6 text-on-surface-variant" />
          </div>
          <h2 className="font-body text-body-lg font-semibold text-on-surface mb-1">
            Aún no hay historial
          </h2>
          <p className="font-body text-body-md text-on-surface-variant max-w-sm">
            Los versículos que proyectes aparecerán aquí para que puedas volver a usarlos
            rápidamente.
          </p>
        </div>
      ) : (
        <div className="space-y-md">
          {history.map((entry, i) => {
            const showDayHeader = i === 0 || formatDay(entry.at) !== formatDay(history[i - 1].at)
            return (
              <div key={`${entry.verse.reference}-${entry.at}`}>
                {showDayHeader && (
                  <div className="flex items-center gap-4 mb-md mt-lg first:mt-0">
                    <h2 className="font-label text-label-sm uppercase text-on-surface-variant">
                      {formatDay(entry.at)}
                    </h2>
                    <div className="flex-1 h-px bg-outline-variant" />
                  </div>
                )}
                <div className="group flex items-start gap-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-md hover:shadow-active transition-shadow">
                  <span className="font-label text-label-sm text-on-surface-variant tabular-nums pt-0.5 w-12 shrink-0">
                    {formatTime(entry.at)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-body-md font-semibold text-on-surface">
                      {entry.verse.reference}
                    </p>
                    <p className="font-body text-sm text-on-surface-variant line-clamp-2 mt-0.5">
                      {entry.verse.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleAdd(i)}>
                      + Lista
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleProject(i)}>
                      Proyectar
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" />
    </svg>
  )
}
