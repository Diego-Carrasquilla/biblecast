'use client'

import { useState } from 'react'
import { ScriptureGrid, type TestamentFilter } from '@/components/library/ScriptureGrid'
import { cn } from '@/lib/utils'

const tabs = ['Biblioteca', 'Borradores', 'Recursos']

const FILTERS: { value: TestamentFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'AT', label: 'Antiguo Testamento' },
  { value: 'NT', label: 'Nuevo Testamento' },
]

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('Biblioteca')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [testamentFilter, setTestamentFilter] = useState<TestamentFilter>('all')

  return (
    <div>
      <p className="font-body text-sm text-on-surface-variant mb-xs">
        Biblioteca Bíblica &rsaquo; Reina Valera 1960
      </p>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-lg">
        <h1 className="font-headline text-headline-lg text-on-surface min-w-0">
          Biblioteca Bíblica
        </h1>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex border border-outline-variant rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors cursor-pointer',
                viewMode === 'grid' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low',
              )}
              aria-label="Vista cuadrícula"
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors cursor-pointer',
                viewMode === 'list' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low',
              )}
              aria-label="Vista lista"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 border rounded-lg font-label text-label-sm uppercase transition-colors cursor-pointer',
              showFilters || testamentFilter !== 'all'
                ? 'border-primary text-primary bg-primary-container/10'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low',
            )}
          >
            <FilterIcon className="w-4 h-4" />
            Filtros
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-2 mb-lg p-sm bg-surface-container-low rounded-lg">
          <span className="font-label text-label-sm uppercase text-on-surface-variant mr-1">
            Testamento
          </span>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setTestamentFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full font-label text-label-sm uppercase transition-colors cursor-pointer',
                testamentFilter === f.value
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container text-on-surface-variant hover:brightness-95',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-lg border-b border-outline-variant">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 font-body text-body-md transition-colors relative cursor-pointer',
              activeTab === tab
                ? 'text-on-surface font-medium'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Biblioteca' ? (
        <ScriptureGrid viewMode={viewMode} testamentFilter={testamentFilter} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-24 px-md border border-dashed border-outline-variant rounded-xl">
          <h2 className="font-body text-body-lg font-semibold text-on-surface mb-1">
            {activeTab} próximamente
          </h2>
          <p className="font-body text-body-md text-on-surface-variant max-w-sm">
            Esta sección estará disponible en una próxima versión.
          </p>
        </div>
      )}
    </div>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 2h14v2H1V2zm0 5h14v2H1V7zm0 5h14v2H1v-2z" />
    </svg>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 3h13M4 8h8M6 13h4" />
    </svg>
  )
}
