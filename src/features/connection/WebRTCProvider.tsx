'use client'

import { createContext, useContext, useRef, useCallback } from 'react'
import { useWebRTC } from '@/hooks/useWebRTC'
import type { SessionRole } from '@/types/session'

const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL ?? 'http://localhost:3001'

type WebRTCContextValue = ReturnType<typeof useWebRTC> & {
  /**
   * Conecta una sola vez por sesión (code + role). Es idempotente: si ya hay
   * una conexión activa para esa sesión, no hace nada. Pensado para llamarse
   * desde el useEffect de cada página sin que un remount (al navegar de vuelta)
   * vuelva a abrir otra conexión.
   */
  ensureConnected: (code: string, role: SessionRole) => void
}

const WebRTCContext = createContext<WebRTCContextValue | null>(null)

/**
 * Provee la conexión WebRTC a TODA la app desde el layout raíz. Al vivir aquí
 * (y no en una página), la conexión sobrevive a la navegación entre rutas
 * —p. ej. del control al panel de administración— sin desconectarse. Solo se
 * cierra cuando se cierra la pestaña (desmontaje del layout raíz) o si se llama
 * explícitamente a disconnect().
 */
export function WebRTCProvider({ children }: { children: React.ReactNode }) {
  const webrtc = useWebRTC(SIGNALING_URL)
  const startedRef = useRef<string | null>(null)

  const ensureConnected = useCallback(
    (code: string, role: SessionRole) => {
      const key = `${role}:${code}`
      if (startedRef.current === key) return
      startedRef.current = key
      webrtc.connect(code, role)
    },
    [webrtc],
  )

  return (
    <WebRTCContext.Provider value={{ ...webrtc, ensureConnected }}>
      {children}
    </WebRTCContext.Provider>
  )
}

export function useWebRTCConnection(): WebRTCContextValue {
  const ctx = useContext(WebRTCContext)
  if (!ctx) {
    throw new Error('useWebRTCConnection debe usarse dentro de <WebRTCProvider>')
  }
  return ctx
}
