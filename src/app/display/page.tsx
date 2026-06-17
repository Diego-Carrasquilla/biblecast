'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProjectionCanvas } from '@/components/display/ProjectionCanvas'
import { QRGenerator } from '@/features/session/QRGenerator'
import { useWebRTCConnection } from '@/features/connection/WebRTCProvider'
import { useBibleCastStore } from '@/store/useBibleCastStore'
import { generateSessionCode } from '@/lib/utils'

function DisplayContent() {
  const searchParams = useSearchParams()
  const currentVerse = useBibleCastStore((s) => s.currentVerse)
  const connectionStatus = useBibleCastStore((s) => s.connectionStatus)
  const { ensureConnected } = useWebRTCConnection()

  // El código se fija una sola vez al abrir la pantalla (de la URL o generado).
  const [code] = useState(
    () => searchParams.get('code')?.toUpperCase() || generateSessionCode(),
  )

  useEffect(() => {
    ensureConnected(code, 'display')
  }, [code, ensureConnected])

  // Mientras no haya un control conectado, mostramos el código y el QR.
  if (connectionStatus !== 'connected') {
    return (
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center gap-xl px-md">
        <div className="text-center">
          <h1 className="font-headline text-headline-lg text-on-surface">BibleCast</h1>
          <p className="font-body text-body-md text-on-surface-variant mt-sm max-w-sm">
            {connectionStatus === 'connecting'
              ? 'Conectando con el control…'
              : 'Escanea el código o ingrésalo en tu celular para controlar la proyección'}
          </p>
        </div>
        <QRGenerator code={code} size={240} />
      </main>
    )
  }

  return <ProjectionCanvas text={currentVerse?.text} reference={currentVerse?.reference} />
}

export default function DisplayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <DisplayContent />
    </Suspense>
  )
}
