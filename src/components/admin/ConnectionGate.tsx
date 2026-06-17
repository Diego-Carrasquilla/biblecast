'use client'

import { useBibleCastStore } from '@/store/useBibleCastStore'
import { useWebRTCConnection } from '@/features/connection/WebRTCProvider'
import { WaitingScreen } from './WaitingScreen'

/**
 * Bloquea el panel de administración hasta que haya una pantalla realmente
 * conectada (según connectionStatus, que mantiene el heartbeat). Mientras no la
 * haya, muestra la pantalla de espera con el estado y el emparejamiento.
 */
export function ConnectionGate({ children }: { children: React.ReactNode }) {
  const status = useBibleCastStore((s) => s.connectionStatus)
  const { sessionCode } = useWebRTCConnection()

  if (status === 'connected') return <>{children}</>

  return <WaitingScreen status={status} code={sessionCode} />
}
