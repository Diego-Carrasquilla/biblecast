'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useBibleCastStore } from '@/store/useBibleCastStore'

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: DashboardIcon },
  { href: '/library',   label: 'Biblioteca', icon: LibraryIcon },
  { href: '/history',   label: 'Historial',  icon: HistoryIcon },
  { href: '/settings',  label: 'Ajustes',    icon: SettingsIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  // Indicador real: depende del estado de conexión del store, que el heartbeat
  // mantiene al día. Antes estaba hardcodeado a "Sin pantalla conectada".
  const connected = useBibleCastStore((s) => s.connectionStatus === 'connected')

  return (
    <aside className="sticky top-0 h-screen w-sidebar shrink-0 bg-surface-container-lowest border-r border-outline-variant flex flex-col z-40">
      <div className="p-lg">
        <h1 className="font-body text-headline-md font-bold text-on-surface">
          BibleCast
        </h1>
        <p className="font-label text-label-sm text-on-surface-variant mt-xs">
          Iglesia Comunidad de Gracia
        </p>
      </div>

      <nav className="flex-1 mt-sm">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-lg py-2.5 font-label text-label-sm uppercase transition-colors duration-200 relative',
                isActive
                  ? 'text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-secondary-container rounded-r" />
              )}
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-md mt-auto">
        <Button variant="secondary" fullWidth className="mb-md">
          <CastIcon className="w-4 h-4" />
          En Vivo
        </Button>
        <div className="flex items-center gap-2 px-xs py-2 rounded-lg bg-surface-container-low">
          <span className="relative flex h-2 w-2">
            {connected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                connected ? 'bg-green-500' : 'bg-outline',
              )}
            />
          </span>
          <p className="font-label text-label-sm text-on-surface-variant uppercase">
            {connected ? 'Pantalla conectada' : 'Sin pantalla conectada'}
          </p>
        </div>
      </div>
    </aside>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
    </svg>
  )
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
      <path d="M7 2v16M10 5h4M10 8h4" />
    </svg>
  )
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M3.4 3.4l1.4 1.4M15.2 15.2l1.4 1.4M3.4 16.6l1.4-1.4M15.2 4.8l1.4-1.4" />
    </svg>
  )
}

function CastIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 14a5 5 0 015 5" /><path d="M2 10a9 9 0 019 9" /><path d="M2 6a13 13 0 0113 13" />
      <circle cx="2.5" cy="18.5" r="1" fill="currentColor" />
    </svg>
  )
}
