'use client'

import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import type { ConnectionStatus } from '@/types/session'

interface WaitingScreenProps {
  status: ConnectionStatus
  code: string | null
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  idle: 'Sin sesión',
  waiting: 'Esperando pantalla',
  connecting: 'Conectando…',
  connected: 'Conectado',
  disconnected: 'Pantalla desconectada',
}

export function WaitingScreen({ status, code }: WaitingScreenProps) {
  // URL para abrir la pantalla de proyección en otro dispositivo con esta sesión.
  const displayUrl =
    code && typeof window !== 'undefined'
      ? `${window.location.origin}/display?code=${code}`
      : null

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-md py-xl">
      <div className="w-full max-w-md flex flex-col items-center text-center gap-lg">
        {/* Indicador animado de espera */}
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-20 w-20 rounded-full bg-primary-container opacity-20 animate-ping" />
          <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary-container opacity-30 animate-pulse" />
          <span className="relative flex items-center justify-center h-14 w-14 rounded-full bg-primary-container">
            <CastIcon className="w-7 h-7 text-on-primary-container" />
          </span>
        </div>

        <div>
          <h1 className="font-headline text-headline-md text-on-surface">
            Esperando pantalla de proyección
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-sm">
            Abre la pantalla de visualización en otro dispositivo para comenzar.
          </p>
        </div>

        {/* Estado de conexión en vivo */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="font-label text-label-sm uppercase text-on-surface-variant tracking-wider">
            {STATUS_LABEL[status]}
          </span>
        </div>

        {/* Emparejamiento: QR + código si hay sesión */}
        {code ? (
          <div className="flex flex-col items-center gap-md mt-sm">
            {displayUrl && (
              <div className="bg-white p-md rounded-xl shadow-active">
                <QRCodeSVG value={displayUrl} size={200} level="M" bgColor="#ffffff" fgColor="#131b2e" />
              </div>
            )}
            <div>
              <p className="font-label text-label-sm text-on-surface-variant uppercase mb-xs">
                Código de sesión
              </p>
              <p className="font-body text-4xl font-bold text-on-surface tracking-[0.3em]">
                {code}
              </p>
            </div>
            <p className="font-body text-sm text-on-surface-variant max-w-xs">
              Escanea el código desde la pantalla del proyector o abre{' '}
              <span className="font-medium text-on-surface">/display?code={code}</span>.
            </p>
          </div>
        ) : (
          <Link
            href="/"
            className="font-label text-label-sm uppercase tracking-wider px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity"
          >
            Iniciar una sesión de proyección
          </Link>
        )}
      </div>
    </div>
  )
}

function CastIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 14a5 5 0 015 5" />
      <path d="M2 10a9 9 0 019 9" />
      <path d="M2 6a13 13 0 0113 13" />
      <circle cx="2.5" cy="18.5" r="1" fill="currentColor" />
    </svg>
  )
}
